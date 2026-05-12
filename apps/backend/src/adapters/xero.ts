import type { Request, Response } from "express";
import { XeroClient } from "xero-node";
import cron from "node-cron";
import { z } from "zod";
import { logger } from "../modules/logger";
import { findBusinessByXeroTenantId, db } from "../modules/db";
import { processReceiptEvent } from "../modules/processor";

const xero = new XeroClient({
  clientId: process.env["XERO_CLIENT_ID"]!,
  clientSecret: process.env["XERO_CLIENT_SECRET"]!,
  redirectUris: [
    process.env["XERO_REDIRECT_URI"] ?? "http://localhost:4000/auth/xero/callback",
  ],
  scopes: [
    "openid",
    "profile",
    "email",
    "accounting.transactions.read",
    "offline_access",
  ],
});

const XeroWebhookSchema = z.object({
  events: z.array(
    z.object({
      tenantId: z.string(),
      eventCategory: z.string(),
      eventType: z.string(),
      resourceId: z.string(),
      eventDateUtc: z.string(),
    })
  ),
});

export async function xeroWebhookHandler(req: Request, res: Response): Promise<void> {
  // Respond 200 immediately — Xero requires acknowledgment within 5 seconds
  res.status(200).send();

  const parsed = XeroWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "invalid xero webhook body");
    return;
  }

  for (const event of parsed.data.events) {
    if (event.eventCategory !== "INVOICE" || event.eventType !== "CREATED") {
      continue;
    }
    try {
      await handleInvoiceCreated(event.tenantId, event.resourceId);
    } catch (err) {
      logger.error(
        { err, tenantId: event.tenantId, invoiceId: event.resourceId },
        "handleInvoiceCreated failed"
      );
    }
  }
}

async function handleInvoiceCreated(
  tenantId: string,
  invoiceId: string
): Promise<void> {
  const business = await findBusinessByXeroTenantId(tenantId);
  if (!business) {
    logger.warn({ tenantId }, "no business found for xero tenant");
    return;
  }

  if (business.xero_access_token) {
    xero.setTokenSet({
      access_token: business.xero_access_token,
      refresh_token: business.xero_refresh_token ?? undefined,
      token_type: "Bearer",
      expiry_time: business.xero_token_expiry
        ? Math.floor(new Date(business.xero_token_expiry).getTime() / 1000)
        : undefined,
    } as Parameters<typeof xero.setTokenSet>[0]);
  }

  const invoiceResp = await xero.accountingApi.getInvoice(tenantId, invoiceId);
  const invoice = invoiceResp.body.invoices?.[0];
  if (!invoice) {
    logger.warn({ invoiceId, tenantId }, "invoice not found via Xero API");
    return;
  }

  const totalCents = Math.round((invoice.total ?? 0) * 100);
  const currency = String(invoice.currencyCode ?? "USD");
  const customerEmail = invoice.contact?.emailAddress ?? null;
  const issuedAt = invoice.date ? new Date(invoice.date) : new Date();

  await processReceiptEvent({
    businessId: business.id,
    businessIndustries: [],
    businessRegions: [],
    externalId: invoiceId,
    channel: "xero",
    documentType: "invoice",
    customerEmail,
    totalCents,
    currency,
    issuedAt,
    htmlContent: customerEmail ? buildInvoiceHtml(invoice) : undefined,
  });
}

function buildInvoiceHtml(invoice: {
  invoiceNumber?: string;
  total?: number;
  currencyCode?: unknown;
  dueDate?: string;
}): string {
  return (
    `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">` +
    `<h2>Invoice #${invoice.invoiceNumber ?? ""}</h2>` +
    `<p>Total: ${String(invoice.currencyCode ?? "USD")} ${invoice.total ?? 0}</p>` +
    `<p>Due: ${invoice.dueDate ?? "—"}</p>` +
    `<!-- FISCAL_CLOSE -->` +
    `</body></html>`
  );
}

// Refresh expiring Xero tokens nightly at 2 AM
cron.schedule("0 2 * * *", async () => {
  logger.info("running nightly Xero token refresh");
  const { data: businesses } = await db
    .from("businesses")
    .select("id, xero_refresh_token, xero_token_expiry")
    .not("xero_refresh_token", "is", null);

  for (const biz of businesses ?? []) {
    if (!biz.xero_refresh_token) continue;
    try {
      xero.setTokenSet({
        refresh_token: biz.xero_refresh_token,
        token_type: "Bearer",
      } as Parameters<typeof xero.setTokenSet>[0]);
      const refreshed = await xero.refreshToken();
      await db
        .from("businesses")
        .update({
          xero_access_token: refreshed.access_token,
          xero_refresh_token: refreshed.refresh_token ?? biz.xero_refresh_token,
          xero_token_expiry: new Date(
            Date.now() + (refreshed.expires_in ?? 1800) * 1000
          ).toISOString(),
        })
        .eq("id", biz.id);
      logger.info({ businessId: biz.id }, "xero token refreshed");
    } catch (err) {
      logger.error({ err, businessId: biz.id }, "xero token refresh failed");
    }
  }
});
