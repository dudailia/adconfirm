import type { Request, Response } from "express";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SQUARE_API_BASE = "https://connect.squareup.com";

// ─── Token refresh ────────────────────────────────────────────────────────────

function squareTokenIsExpired(business: BusinessRow): boolean {
  if (!business.square_access_token) return true;
  if (!business.square_token_expiry) return false;
  return new Date(business.square_token_expiry).getTime() < Date.now() + FIVE_MINUTES_MS;
}

function squareBasicAuth(): string {
  return (
    "Basic " +
    Buffer.from(
      `${process.env["SQUARE_APP_ID"]!}:${process.env["SQUARE_APP_SECRET"]!}`
    ).toString("base64")
  );
}

export async function resolveSquareToken(business: BusinessRow): Promise<string | null> {
  if (!squareTokenIsExpired(business)) return business.square_access_token!;
  if (!business.square_refresh_token) {
    logger.error({ businessId: business.id }, "Square token expired and no refresh token");
    return null;
  }

  const res = await fetch(`${SQUARE_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: squareBasicAuth(),
    },
    body: JSON.stringify({
      client_id: process.env["SQUARE_APP_ID"]!,
      client_secret: process.env["SQUARE_APP_SECRET"]!,
      grant_type: "refresh_token",
      refresh_token: business.square_refresh_token,
    }),
  });

  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok || !body["access_token"]) {
    logger.error({ status: res.status, body, businessId: business.id }, "Square token refresh failed");
    return null;
  }

  const accessToken = String(body["access_token"]);
  const { error } = await db
    .from("businesses")
    .update({
      square_access_token: accessToken,
      square_refresh_token:
        typeof body["refresh_token"] === "string" ? body["refresh_token"] : business.square_refresh_token,
      square_token_expiry:
        typeof body["expires_at"] === "string"
          ? body["expires_at"]
          : typeof body["expires_in"] === "number"
            ? new Date(Date.now() + (body["expires_in"] as number) * 1000).toISOString()
            : null,
    })
    .eq("id", business.id);

  if (error) {
    logger.error({ err: error, businessId: business.id }, "failed to persist Square tokens");
  }

  return accessToken;
}

// ─── Webhook subscription ─────────────────────────────────────────────────────

export async function registerSquareWebhook(
  accessToken: string,
  _businessId: string
): Promise<string | null> {
  const notificationUrl =
    process.env["SQUARE_WEBHOOK_NOTIFICATION_URL"] ??
    "https://adconfirm-api.onrender.com/webhooks/square";

  const res = await fetch(`${SQUARE_API_BASE}/v2/webhooks/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-01-18",
    },
    body: JSON.stringify({
      subscription: {
        name: "AdConfirm",
        enabled: true,
        notification_url: notificationUrl,
        event_types: ["payment.completed"],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text }, "Square webhook registration failed");
    return null;
  }

  const body = (await res.json()) as { subscription?: { id?: string } };
  return body.subscription?.id ?? null;
}

export async function deleteSquareWebhook(
  accessToken: string,
  subscriptionId: string
): Promise<void> {
  const res = await fetch(`${SQUARE_API_BASE}/v2/webhooks/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
  });
  if (!res.ok) {
    logger.warn({ status: res.status, subscriptionId }, "Square webhook deletion failed (non-fatal)");
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function squareWebhookHandler(req: Request, res: Response): Promise<void> {
  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("square", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for Square — continuing");
    return null;
  });

  res.status(200).send();

  const payload = payloadObj as Record<string, unknown>;
  const eventType = payload["type"] as string | undefined;

  if (eventType !== "payment.completed") {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "processed", `skipped event: ${eventType}`).catch(() => {});
    }
    return;
  }

  const merchantId = payload["merchant_id"] as string | undefined;
  if (!merchantId) {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "missing merchant_id").catch(() => {});
    }
    return;
  }

  const { data: business, error: bizError } = await db
    .from("businesses")
    .select("*")
    .eq("square_merchant_id", merchantId)
    .single();

  if (bizError || !business) {
    logger.warn({ merchantId }, "no business found for Square merchant_id");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "unknown merchant").catch(() => {});
    }
    return;
  }

  const dataObj = (payload["data"] as Record<string, unknown> | undefined) ?? {};
  const objectObj = (dataObj["object"] as Record<string, unknown> | undefined) ?? {};
  const payment = (objectObj["payment"] as Record<string, unknown> | undefined) ?? {};

  let errorMsg: string | undefined;
  try {
    const amountMoney = (payment["amount_money"] as Record<string, unknown> | undefined) ?? {};
    await processInvoice(
      business,
      {
        invoiceId: (payment["id"] as string | undefined) ?? "unknown",
        tenantId: (payment["location_id"] as string | undefined) ?? "unknown",
        invoiceNumber: (payment["receipt_number"] as string | undefined) ?? (payment["id"] as string | undefined) ?? "unknown",
        total: typeof amountMoney["amount"] === "number" ? (amountMoney["amount"] as number) / 100 : 0,
        currency: (amountMoney["currency"] as string | undefined) ?? "USD",
        date: new Date().toISOString().split("T")[0] ?? new Date().toISOString(),
        customerEmail: (payment["buyer_email_address"] as string | undefined) ?? null,
        contactName: "",
        lineItems: [],
      },
      "square"
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ err, merchantId }, "Square processInvoice failed");
  }

  if (webhookEvent) {
    await resolveWebhookEvent(webhookEvent.id, errorMsg ? "failed" : "processed", errorMsg).catch(() => {});
  }
}
