import crypto from "crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SAGE_API_BASE = "https://api.accounting.sage.com/v3.1";
const SAGE_TOKEN_URL = "https://oauth.accounting.sage.com/token";

// ─── Token helpers ────────────────────────────────────────────────────────────

function sageTokenIsExpired(business: BusinessRow): boolean {
  if (!business.sage_access_token) return true;
  if (!business.sage_token_expiry) return false;
  return new Date(business.sage_token_expiry).getTime() < Date.now() + FIVE_MINUTES_MS;
}

async function exchangeSageRefreshToken(refreshToken: string): Promise<Record<string, unknown>> {
  const res = await fetch(SAGE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env["SAGE_CLIENT_ID"]!,
      client_secret: process.env["SAGE_CLIENT_SECRET"]!,
    }).toString(),
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok || !body["access_token"]) {
    logger.error({ status: res.status, body }, "Sage refresh token exchange failed");
    throw new Error(String(body["error_description"] ?? body["error"] ?? "Sage token refresh failed"));
  }
  return body;
}

async function persistSageTokens(
  businessId: string,
  tokens: Record<string, unknown>,
  fallbackRefresh: string | null
): Promise<void> {
  const { error } = await db
    .from("businesses")
    .update({
      sage_access_token: typeof tokens["access_token"] === "string" ? tokens["access_token"] : null,
      sage_refresh_token:
        typeof tokens["refresh_token"] === "string" ? tokens["refresh_token"] : fallbackRefresh ?? null,
      sage_token_expiry:
        typeof tokens["expires_in"] === "number"
          ? new Date(Date.now() + (tokens["expires_in"] as number) * 1000).toISOString()
          : null,
    })
    .eq("id", businessId);
  if (error) {
    logger.error({ err: error, businessId }, "failed to persist Sage tokens");
    throw new Error(`persist Sage tokens: ${error.message}`);
  }
}

export async function resolveSageToken(business: BusinessRow): Promise<string | null> {
  if (!sageTokenIsExpired(business)) return business.sage_access_token!;
  if (!business.sage_refresh_token) {
    logger.error({ businessId: business.id }, "Sage token expired and no refresh token");
    return null;
  }
  const tokens = await exchangeSageRefreshToken(business.sage_refresh_token);
  await persistSageTokens(business.id, tokens, business.sage_refresh_token);
  return typeof tokens["access_token"] === "string" ? tokens["access_token"] : null;
}

// ─── Webhook registration ─────────────────────────────────────────────────────

export async function registerSageWebhook(
  accessToken: string,
  businessId: string
): Promise<string | null> {
  const res = await fetch(`${SAGE_API_BASE}/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      webhook: {
        event: "sales_invoice.created",
        active: true,
        payload_url: `${process.env["BACKEND_URL"] ?? "https://adconfirm-api.onrender.com"}/webhooks/sage`,
        signing_key: process.env["SAGE_WEBHOOK_SECRET"] ?? process.env["SAGE_CLIENT_SECRET"],
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text, businessId }, "Sage webhook registration failed");
    return null;
  }
  const body = (await res.json()) as any;
  return body?.webhook?.id ?? body?.id ?? null;
}

export async function deleteSageWebhook(
  accessToken: string,
  webhookId: string
): Promise<void> {
  const res = await fetch(`${SAGE_API_BASE}/webhooks/${webhookId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    logger.warn({ status: res.status, webhookId }, "Sage webhook deletion failed (non-fatal)");
  }
}

// ─── Invoice fetch ────────────────────────────────────────────────────────────

async function fetchSageInvoice(
  accessToken: string,
  invoiceId: string
): Promise<{ status: number; invoice: unknown }> {
  const res = await fetch(`${SAGE_API_BASE}/sales_invoices/${invoiceId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const body = await res.json();
  return { status: res.status, invoice: body };
}

// ─── Webhook schema ───────────────────────────────────────────────────────────

const SageWebhookSchema = z.object({
  event_type: z.string(),
  entity: z.object({
    id: z.string(),
  }),
});

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function sageWebhookHandler(req: Request, res: Response): Promise<void> {
  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("sage", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for Sage — continuing");
    return null;
  });

  res.status(200).send();

  const parsed = SageWebhookSchema.safeParse(payloadObj);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "invalid Sage webhook body");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "schema validation failed").catch(() => {});
    }
    return;
  }

  const { event_type, entity } = parsed.data;
  if (event_type !== "sales_invoice.created") {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "processed", `skipped event: ${event_type}`).catch(() => {});
    }
    return;
  }

  // Fetch invoice to get business id
  const { data: businesses, error: bizError } = await db
    .from("businesses")
    .select("*")
    .not("sage_business_id", "is", null);

  if (bizError || !businesses?.length) {
    logger.warn("no businesses with sage_business_id found");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "no businesses found").catch(() => {});
    }
    return;
  }

  // We'll try to find the right business after fetching the invoice
  // Use first business with a token to fetch (webhook doesn't carry business info directly)
  let errorMsg: string | undefined;
  let processed = false;

  for (const business of businesses) {
    try {
      const accessToken = await resolveSageToken(business);
      if (!accessToken) continue;

      const { status, invoice } = await fetchSageInvoice(accessToken, entity.id);
      if (status === 404) continue;

      const inv = invoice as any;
      const invoiceBizId = inv?.business?.id ?? inv?.company?.id;
      if (invoiceBizId && invoiceBizId !== business.sage_business_id) continue;

      await handleSageInvoiceCreated(business, entity.id, inv, accessToken);
      processed = true;
      break;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      logger.error({ err, businessId: business.id }, "handleSageInvoiceCreated failed");
    }
  }

  if (!processed && !errorMsg) errorMsg = "no matching business found for invoice";

  if (webhookEvent) {
    const status = errorMsg ? "failed" : "processed";
    await resolveWebhookEvent(webhookEvent.id, status, errorMsg).catch(() => {});
  }
}

async function handleSageInvoiceCreated(
  business: BusinessRow,
  invoiceId: string,
  inv: any,
  accessToken: string
): Promise<void> {
  // Retry with fresh token if needed
  if (!inv || inv.status_code === 401) {
    const tokens = await exchangeSageRefreshToken(business.sage_refresh_token!);
    await persistSageTokens(business.id, tokens, business.sage_refresh_token);
    const freshToken = typeof tokens["access_token"] === "string" ? tokens["access_token"] : null;
    if (!freshToken) return;
    const { invoice: retried } = await fetchSageInvoice(freshToken, invoiceId);
    inv = retried;
  }

  if (!inv) {
    logger.warn({ invoiceId }, "Sage invoice not found");
    return;
  }

  const invoiceData: InvoiceData = {
    invoiceId: inv.id ?? invoiceId,
    tenantId: inv.business?.id ?? business.sage_business_id ?? business.id,
    invoiceNumber: inv.reference ?? inv.id ?? invoiceId,
    total: parseFloat(String(inv.total_amount ?? "0")) || 0,
    currency: inv.currency?.symbol ?? "GBP",
    date: inv.date ?? new Date().toISOString().split("T")[0],
    customerEmail: inv.contact?.email ?? null,
    contactName: inv.contact?.name ?? "",
    lineItems: [],
  };

  await processInvoice(business, invoiceData, "sage");
}

// ─── Signature validation ─────────────────────────────────────────────────────

export function validateSageSignature(
  rawBody: Buffer,
  signature: string | undefined
): boolean {
  const secret = process.env["SAGE_WEBHOOK_SECRET"] ?? process.env["SAGE_CLIENT_SECRET"];
  if (!secret || !signature) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
