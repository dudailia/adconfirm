import type { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FA_API_BASE = "https://api.freeagent.com/v2";

// ─── Token types ─────────────────────────────────────────────────────────────

type FATokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

// ─── Token refresh ────────────────────────────────────────────────────────────

function faTokenIsExpired(business: BusinessRow): boolean {
  if (!business.fa_access_token) return true;
  if (!business.fa_token_expiry) return false;
  return new Date(business.fa_token_expiry).getTime() < Date.now() + FIVE_MINUTES_MS;
}

function faBasicAuth(): string {
  return (
    "Basic " +
    Buffer.from(
      `${process.env["FREEAGENT_CLIENT_ID"]!}:${process.env["FREEAGENT_CLIENT_SECRET"]!}`
    ).toString("base64")
  );
}

async function exchangeFARefreshToken(refreshToken: string): Promise<FATokenResponse> {
  const res = await fetch(`${FA_API_BASE}/token_endpoint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: faBasicAuth(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  const body = (await res.json()) as FATokenResponse;
  if (!res.ok || !body.access_token) {
    logger.error({ status: res.status, body }, "FreeAgent refresh token exchange failed");
    throw new Error(body.error_description ?? body.error ?? "FreeAgent token refresh failed");
  }
  return body;
}

async function persistFATokens(
  businessId: string,
  tokens: FATokenResponse,
  fallbackRefresh: string | null
): Promise<void> {
  const { error } = await db
    .from("businesses")
    .update({
      fa_access_token: tokens.access_token ?? null,
      fa_refresh_token: tokens.refresh_token ?? fallbackRefresh ?? null,
      fa_token_expiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
    })
    .eq("id", businessId);
  if (error) {
    logger.error({ err: error, businessId }, "failed to persist FreeAgent tokens");
    throw new Error(`persist FreeAgent tokens: ${error.message}`);
  }
}

export async function resolveFAAccessToken(business: BusinessRow): Promise<string | null> {
  if (!faTokenIsExpired(business)) return business.fa_access_token!;
  if (!business.fa_refresh_token) {
    logger.error({ businessId: business.id }, "FreeAgent token expired and no refresh token");
    return null;
  }
  const tokens = await exchangeFARefreshToken(business.fa_refresh_token);
  await persistFATokens(business.id, tokens, business.fa_refresh_token);
  return tokens.access_token ?? null;
}

// ─── Webhook registration ─────────────────────────────────────────────────────

export async function registerFAWebhook(
  accessToken: string,
  businessId: string
): Promise<string | null> {
  const payloadUrl = `${process.env["BACKEND_URL"] ?? "https://adconfirm-api.onrender.com"}/webhooks/freeagent?business_id=${businessId}`;
  const res = await fetch(`${FA_API_BASE}/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      webhook: {
        event: "invoice.create",
        payload_url: payloadUrl,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text, businessId }, "FreeAgent webhook registration failed");
    return null;
  }
  const body = (await res.json()) as { webhook?: { url?: string } };
  return body.webhook?.url ?? null;
}

export async function deleteFAWebhook(
  accessToken: string,
  webhookUrl: string
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    logger.warn({ status: res.status, webhookUrl }, "FreeAgent webhook deletion failed (non-fatal)");
  }
}

// ─── Invoice fetch ────────────────────────────────────────────────────────────

async function fetchFAInvoice(
  accessToken: string,
  resourceUri: string
): Promise<{ status: number; invoice: unknown }> {
  const res = await fetch(resourceUri, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const body = await res.json();
  return { status: res.status, invoice: (body as any)?.invoice ?? null };
}

async function fetchFAContactEmail(
  accessToken: string,
  contactUri: string
): Promise<string | null> {
  try {
    const res = await fetch(contactUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as any;
    return typeof body?.contact?.email === "string" ? body.contact.email : null;
  } catch {
    return null;
  }
}

function mapFAInvoiceToInvoiceData(invoice: any, customerEmail: string | null): InvoiceData {
  const reference = String(invoice?.reference ?? invoice?.url?.split("/").pop() ?? "unknown");
  const datedOn = String(invoice?.dated_on ?? new Date().toISOString().split("T")[0]);
  const total = parseFloat(String(invoice?.total_value ?? "0")) || 0;
  const currency = String(invoice?.currency ?? "GBP");
  const contactName = String(invoice?.contact_name ?? invoice?.contact ?? "Customer");

  const rawItems: any[] = Array.isArray(invoice?.invoice_items) ? invoice.invoice_items : [];
  const lineItems = rawItems.map((item: any) => ({
    description: String(item.description ?? "Item"),
    quantity: parseFloat(String(item.quantity ?? "1")) || 1,
    unitAmount: parseFloat(String(item.price ?? item.unit_value ?? "0")) || 0,
    lineAmount: parseFloat(String(item.total_value ?? "0")) || 0,
  }));

  // tenantId: derive from invoice URL (e.g. https://api.freeagent.com/v2/invoices/123)
  const invoiceId = String(invoice?.url ?? reference);

  return {
    invoiceId,
    tenantId: invoiceId,
    invoiceNumber: reference,
    customerEmail,
    contactName,
    total,
    currency,
    date: datedOn,
    lineItems,
  };
}

// ─── Webhook schema ───────────────────────────────────────────────────────────

const FAWebhookSchema = z.object({
  webhook: z.object({
    event: z.string(),
    resource_type: z.string().optional(),
    resource_uri: z.string(),
  }),
});

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function faWebhookHandler(req: Request, res: Response): Promise<void> {
  const businessId = req.query["business_id"] as string | undefined;

  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("freeagent", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for FreeAgent — continuing");
    return null;
  });

  res.status(200).send();

  if (!businessId) {
    logger.warn("FreeAgent webhook missing business_id query param");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "missing business_id").catch(() => {});
    }
    return;
  }

  const parsed = FAWebhookSchema.safeParse(payloadObj);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "invalid FreeAgent webhook body");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "schema validation failed").catch(() => {});
    }
    return;
  }

  const { event, resource_uri } = parsed.data.webhook;
  if (event !== "invoice.create") {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "processed", `skipped event: ${event}`).catch(() => {});
    }
    return;
  }

  const { data: business, error: bizError } = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (bizError || !business) {
    logger.warn({ businessId }, "no business found for FreeAgent webhook");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "unknown business").catch(() => {});
    }
    return;
  }

  let errorMsg: string | undefined;
  try {
    await handleFAInvoiceCreated(business, resource_uri);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ err, businessId, resource_uri }, "handleFAInvoiceCreated failed");
  }

  if (webhookEvent) {
    const status = errorMsg ? "failed" : "processed";
    await resolveWebhookEvent(webhookEvent.id, status, errorMsg).catch(() => {});
  }
}

async function handleFAInvoiceCreated(
  business: BusinessRow,
  resourceUri: string
): Promise<void> {
  const accessToken = await resolveFAAccessToken(business);
  if (!accessToken) {
    logger.warn({ businessId: business.id }, "no FreeAgent access token — skipping");
    return;
  }

  let { status, invoice } = await fetchFAInvoice(accessToken, resourceUri);

  if (status === 401 && business.fa_refresh_token) {
    const retried = await exchangeFARefreshToken(business.fa_refresh_token);
    await persistFATokens(business.id, retried, business.fa_refresh_token);
    if (!retried.access_token) return;
    ({ status, invoice } = await fetchFAInvoice(retried.access_token, resourceUri));
  }

  if (!invoice) {
    logger.warn({ resourceUri, status }, "FreeAgent invoice not found");
    return;
  }

  const inv = invoice as any;
  const customerEmail = inv.contact
    ? await fetchFAContactEmail(accessToken, String(inv.contact))
    : null;

  const invoiceData = mapFAInvoiceToInvoiceData(inv, customerEmail);
  await processInvoice(business, invoiceData, "freeagent");
}
