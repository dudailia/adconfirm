import type { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const QBO_API_BASE = "https://quickbooks.api.intuit.com";

// ─── Token types ─────────────────────────────────────────────────────────────

type QBOTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  x_refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
};

// ─── Token refresh ────────────────────────────────────────────────────────────

function qboTokenIsExpired(business: BusinessRow): boolean {
  if (!business.qbo_access_token) return true;
  if (!business.qbo_token_expiry) return false;
  return new Date(business.qbo_token_expiry).getTime() < Date.now() + FIVE_MINUTES_MS;
}

async function exchangeQBORefreshToken(refreshToken: string): Promise<QBOTokenResponse> {
  const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env["QBO_CLIENT_ID"]!}:${process.env["QBO_CLIENT_SECRET"]!}`
        ).toString("base64"),
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  const body = (await res.json()) as QBOTokenResponse;
  if (!res.ok || !body.access_token) {
    logger.error({ status: res.status, body }, "QBO refresh token exchange failed");
    throw new Error(body.error_description ?? body.error ?? "QBO token refresh failed");
  }
  return body;
}

async function persistQBOTokens(
  businessId: string,
  tokens: QBOTokenResponse,
  fallbackRefresh: string | null
): Promise<void> {
  const { error } = await db
    .from("businesses")
    .update({
      qbo_access_token: tokens.access_token ?? null,
      qbo_refresh_token: tokens.refresh_token ?? fallbackRefresh ?? null,
      qbo_token_expiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
    })
    .eq("id", businessId);
  if (error) {
    logger.error({ err: error, businessId }, "failed to persist QBO tokens");
    throw new Error(`persist QBO tokens: ${error.message}`);
  }
}

export async function resolveQBOAccessToken(
  business: BusinessRow
): Promise<string | null> {
  if (!qboTokenIsExpired(business)) return business.qbo_access_token!;
  if (!business.qbo_refresh_token) {
    logger.error({ businessId: business.id }, "QBO token expired and no refresh token");
    return null;
  }
  const tokens = await exchangeQBORefreshToken(business.qbo_refresh_token);
  await persistQBOTokens(business.id, tokens, business.qbo_refresh_token);
  return tokens.access_token ?? null;
}

// ─── Find business by realm ───────────────────────────────────────────────────

async function findBusinessByQBORealmId(realmId: string): Promise<BusinessRow | null> {
  const { data, error } = await db
    .from("businesses")
    .select("*")
    .eq("qbo_realm_id", realmId)
    .single();
  if (error) {
    logger.error({ err: error, realmId }, "findBusinessByQBORealmId failed");
    return null;
  }
  return data;
}

// ─── Invoice fetch ────────────────────────────────────────────────────────────

async function fetchQBOInvoice(
  accessToken: string,
  realmId: string,
  invoiceId: string
): Promise<{ status: number; invoice: unknown }> {
  const url = `${QBO_API_BASE}/v3/company/${realmId}/invoice/${invoiceId}?minorversion=65`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const body = await res.json();
  return { status: res.status, invoice: (body as any)?.Invoice ?? null };
}

function mapQBOInvoiceToInvoiceData(
  invoice: any,
  realmId: string
): InvoiceData {
  const docNumber = String(invoice?.DocNumber ?? invoice?.Id ?? "unknown");
  const txnDate = String(invoice?.TxnDate ?? new Date().toISOString().split("T")[0]);
  const total = Number(invoice?.TotalAmt ?? 0);
  const currency = String(invoice?.CurrencyRef?.value ?? "USD");
  const customerEmail: string | null =
    typeof invoice?.BillEmail?.Address === "string"
      ? invoice.BillEmail.Address
      : null;
  const contactName =
    String(invoice?.CustomerRef?.name ?? invoice?.BillAddr?.Line1 ?? "Customer");

  const lines: any[] = Array.isArray(invoice?.Line) ? invoice.Line : [];
  const lineItems = lines
    .filter((l: any) => l.DetailType === "SalesItemLineDetail" || l.Amount != null)
    .map((l: any) => ({
      description: String(l.Description ?? l.DetailType ?? "Item"),
      quantity: Number(l.SalesItemLineDetail?.Qty ?? 1),
      unitAmount: Number(l.SalesItemLineDetail?.UnitPrice ?? l.Amount ?? 0),
      lineAmount: Number(l.Amount ?? 0),
    }));

  return {
    invoiceId: docNumber,
    tenantId: realmId,
    invoiceNumber: docNumber,
    customerEmail,
    contactName,
    total,
    currency,
    date: txnDate,
    lineItems,
  };
}

// ─── Webhook schema ───────────────────────────────────────────────────────────

const QBOWebhookSchema = z.object({
  eventNotifications: z.array(
    z.object({
      realmId: z.string(),
      dataChangeEvent: z.object({
        entities: z.array(
          z.object({
            name: z.string(),
            id: z.string(),
            operation: z.string(),
            lastUpdated: z.string().optional(),
          })
        ),
      }),
    })
  ),
});

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function qboWebhookHandler(req: Request, res: Response): Promise<void> {
  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("quickbooks", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for QBO — continuing");
    return null;
  });

  // Respond 200 immediately — QBO requires fast acknowledgment
  res.status(200).send();

  const parsed = QBOWebhookSchema.safeParse(payloadObj);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "invalid QBO webhook body");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "schema validation failed").catch(() => {});
    }
    return;
  }

  const errors: string[] = [];

  for (const notification of parsed.data.eventNotifications) {
    const { realmId, dataChangeEvent } = notification;
    const invoiceEntities = dataChangeEvent.entities.filter(
      (e) => e.name === "Invoice" && e.operation === "Create"
    );

    if (invoiceEntities.length === 0) continue;

    const business = await findBusinessByQBORealmId(realmId);
    if (!business) {
      logger.warn({ realmId }, "no business found for QBO realm");
      errors.push(`unknown realm: ${realmId}`);
      continue;
    }

    for (const entity of invoiceEntities) {
      try {
        await handleQBOInvoiceCreated(business, realmId, entity.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`invoice ${entity.id}: ${msg}`);
        logger.error({ err, realmId, invoiceId: entity.id }, "handleQBOInvoiceCreated failed");
      }
    }
  }

  if (webhookEvent) {
    const status = errors.length > 0 ? "failed" : "processed";
    await resolveWebhookEvent(webhookEvent.id, status, errors.join("; ") || undefined).catch(() => {});
  }
}

async function handleQBOInvoiceCreated(
  business: BusinessRow,
  realmId: string,
  invoiceId: string
): Promise<void> {
  const accessToken = await resolveQBOAccessToken(business);
  if (!accessToken) {
    logger.warn({ businessId: business.id }, "no QBO access token — skipping");
    return;
  }

  let { status, invoice } = await fetchQBOInvoice(accessToken, realmId, invoiceId);

  if (status === 401 && business.qbo_refresh_token) {
    const retried = await exchangeQBORefreshToken(business.qbo_refresh_token);
    await persistQBOTokens(business.id, retried, business.qbo_refresh_token);
    if (!retried.access_token) return;
    ({ status, invoice } = await fetchQBOInvoice(retried.access_token, realmId, invoiceId));
  }

  if (!invoice) {
    logger.warn({ invoiceId, realmId, status }, "QBO invoice not found");
    return;
  }

  const invoiceData = mapQBOInvoiceToInvoiceData(invoice, realmId);
  await processInvoice(business, invoiceData, "quickbooks");
}
