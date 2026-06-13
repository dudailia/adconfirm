import crypto from "crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ZETTLE_TOKEN_URL = "https://oauth.zettle.com/token";
const ZETTLE_PURCHASE_API = "https://purchase.izettle.com";
const ZETTLE_PUSHER_API = "https://pusher.izettle.com";

// ─── Token helpers ────────────────────────────────────────────────────────────

function zettleTokenIsExpired(business: BusinessRow): boolean {
  if (!business.zettle_access_token) return true;
  if (!business.zettle_token_expiry) return false;
  return new Date(business.zettle_token_expiry).getTime() < Date.now() + FIVE_MINUTES_MS;
}

async function exchangeZettleRefreshToken(refreshToken: string): Promise<Record<string, unknown>> {
  const res = await fetch(ZETTLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env["ZETTLE_CLIENT_ID"]!,
      client_secret: process.env["ZETTLE_CLIENT_SECRET"]!,
    }).toString(),
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok || !body["access_token"]) {
    logger.error({ status: res.status, body }, "Zettle refresh token exchange failed");
    throw new Error(String(body["error_description"] ?? body["error"] ?? "Zettle token refresh failed"));
  }
  return body;
}

async function persistZettleTokens(
  businessId: string,
  tokens: Record<string, unknown>,
  fallbackRefresh: string | null
): Promise<void> {
  const { error } = await db
    .from("businesses")
    .update({
      zettle_access_token: typeof tokens["access_token"] === "string" ? tokens["access_token"] : null,
      zettle_refresh_token:
        typeof tokens["refresh_token"] === "string" ? tokens["refresh_token"] : fallbackRefresh ?? null,
      zettle_token_expiry:
        typeof tokens["expires_in"] === "number"
          ? new Date(Date.now() + (tokens["expires_in"] as number) * 1000).toISOString()
          : null,
    })
    .eq("id", businessId);
  if (error) {
    logger.error({ err: error, businessId }, "failed to persist Zettle tokens");
    throw new Error(`persist Zettle tokens: ${error.message}`);
  }
}

export async function resolveZettleToken(business: BusinessRow): Promise<string | null> {
  if (!zettleTokenIsExpired(business)) return business.zettle_access_token!;
  if (!business.zettle_refresh_token) {
    logger.error({ businessId: business.id }, "Zettle token expired and no refresh token");
    return null;
  }
  const tokens = await exchangeZettleRefreshToken(business.zettle_refresh_token);
  await persistZettleTokens(business.id, tokens, business.zettle_refresh_token);
  return typeof tokens["access_token"] === "string" ? tokens["access_token"] : null;
}

// ─── Webhook registration ─────────────────────────────────────────────────────

export async function registerZettleWebhook(
  accessToken: string,
  businessId: string
): Promise<string | null> {
  // Zettle requires a stable UUID per subscription; derive from businessId
  const subUuid = crypto
    .createHash("sha256")
    .update(`adconfirm-${businessId}`)
    .digest("hex")
    .slice(0, 8)
    .padEnd(8, "0");
  const subscriptionUuid = [
    subUuid.slice(0, 8),
    subUuid.slice(0, 4),
    "4" + subUuid.slice(1, 4),
    "8" + subUuid.slice(1, 4),
    subUuid.padEnd(12, "0").slice(0, 12),
  ].join("-");

  const res = await fetch(`${ZETTLE_PUSHER_API}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uuid: subscriptionUuid,
      transportName: "WEBHOOK",
      eventNames: ["PurchaseCreated"],
      destination: `${process.env["BACKEND_URL"] ?? "https://adconfirm-api.onrender.com"}/webhooks/zettle`,
      contactEmail: process.env["ZETTLE_CONTACT_EMAIL"] ?? "admin@adconfirm.io",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text, businessId }, "Zettle webhook registration failed");
    return null;
  }
  const body = (await res.json()) as any;
  return body?.uuid ?? body?.signingKey ?? subscriptionUuid;
}

export async function deleteZettleWebhook(
  accessToken: string,
  webhookId: string
): Promise<void> {
  const res = await fetch(`${ZETTLE_PUSHER_API}/subscriptions/${webhookId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    logger.warn({ status: res.status, webhookId }, "Zettle webhook deletion failed (non-fatal)");
  }
}

// ─── Purchase fetch ───────────────────────────────────────────────────────────

async function fetchZettlePurchase(
  accessToken: string,
  purchaseUuid: string
): Promise<{ status: number; purchase: unknown }> {
  const res = await fetch(`${ZETTLE_PURCHASE_API}/purchases/v2/${purchaseUuid}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const body = await res.json();
  return { status: res.status, purchase: body };
}

// ─── Webhook schema ───────────────────────────────────────────────────────────

const ZettleWebhookSchema = z.object({
  eventName: z.string(),
  organizationUuid: z.string().optional(),
  payload: z.object({
    purchaseUUID: z.string(),
  }),
});

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function zettleWebhookHandler(req: Request, res: Response): Promise<void> {
  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("zettle", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for Zettle — continuing");
    return null;
  });

  res.status(200).send();

  const parsed = ZettleWebhookSchema.safeParse(payloadObj);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "invalid Zettle webhook body");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "schema validation failed").catch(() => {});
    }
    return;
  }

  const { eventName, organizationUuid, payload } = parsed.data;
  if (eventName !== "PurchaseCreated") {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "processed", `skipped event: ${eventName}`).catch(() => {});
    }
    return;
  }

  const { data: businesses, error: bizError } = await db
    .from("businesses")
    .select("*")
    .not("zettle_access_token", "is", null);

  if (bizError || !businesses?.length) {
    logger.warn("no businesses with zettle_access_token found");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "no businesses found").catch(() => {});
    }
    return;
  }

  let errorMsg: string | undefined;
  let processed = false;

  for (const business of businesses) {
    try {
      const accessToken = await resolveZettleToken(business);
      if (!accessToken) continue;

      const { status, purchase } = await fetchZettlePurchase(accessToken, payload.purchaseUUID);
      if (status === 404) continue;

      const p = purchase as any;
      if (organizationUuid && p?.organizationUuid && p.organizationUuid !== organizationUuid) continue;

      await handleZettlePurchaseCreated(business, payload.purchaseUUID, p);
      processed = true;
      break;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      logger.error({ err, businessId: business.id }, "handleZettlePurchaseCreated failed");
    }
  }

  if (!processed && !errorMsg) errorMsg = "no matching business found for purchase";

  if (webhookEvent) {
    const status = errorMsg ? "failed" : "processed";
    await resolveWebhookEvent(webhookEvent.id, status, errorMsg).catch(() => {});
  }
}

async function handleZettlePurchaseCreated(
  business: BusinessRow,
  purchaseUuid: string,
  p: any
): Promise<void> {
  if (!p) {
    logger.warn({ purchaseUuid }, "Zettle purchase not found");
    return;
  }

  // Zettle amounts are in minor units (e.g. pence/cents)
  const totalMinorUnits: number = p.gratuityAmount != null
    ? (p.gratuityAmount + (p.products ?? []).reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0))
    : (p.amount ?? 0);

  const invoiceData: InvoiceData = {
    invoiceId: p.purchaseUUID ?? purchaseUuid,
    tenantId: p.organizationUuid ?? business.id,
    invoiceNumber: p.purchaseNumber != null ? String(p.purchaseNumber) : purchaseUuid,
    total: totalMinorUnits / 100,
    currency: p.currency ?? "GBP",
    date: p.timestamp
      ? (new Date(p.timestamp).toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10))
      : new Date().toISOString().slice(0, 10),
    customerEmail: null,
    contactName: "",
    lineItems: (p.products ?? []).map((item: any) => ({
      description: item.name ?? "",
      quantity: item.quantity ?? 1,
      unitPrice: (item.unitPrice ?? 0) / 100,
      lineAmount: ((item.quantity ?? 1) * (item.unitPrice ?? 0)) / 100,
    })),
  };

  await processInvoice(business, invoiceData, "zettle");
}

// ─── Signature validation ─────────────────────────────────────────────────────

export function validateZettleSignature(
  rawBody: Buffer,
  signature: string | undefined
): boolean {
  const secret = process.env["ZETTLE_CLIENT_SECRET"];
  if (!secret || !signature) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}
