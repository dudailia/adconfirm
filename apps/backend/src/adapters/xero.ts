import type { Request, Response } from "express";
import { XeroClient } from "xero-node";
import cron from "node-cron";
import { z } from "zod";
import { logger } from "../modules/logger";
import { findBusinessByXeroTenantId, db } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";

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
    "accounting.invoices",
    "accounting.invoices.read",
    "accounting.contacts",
    "accounting.contacts.read",
    "accounting.settings",
    "accounting.settings.read",
    "offline_access",
  ],
});

export { xero };

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
    if (event.eventCategory !== "INVOICE" || event.eventType !== "CREATE") {
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

type BusinessRow = Awaited<ReturnType<typeof findBusinessByXeroTenantId>>;

async function ensureFreshTokens(business: NonNullable<BusinessRow>): Promise<void> {
  if (!business.xero_access_token) return;

  const expiryMs = business.xero_token_expiry
    ? new Date(business.xero_token_expiry).getTime()
    : 0;

  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const needsRefresh = expiryMs < Date.now() + FIVE_MINUTES_MS;

  // Hydrate the in-memory singleton from the DB on every request; it does not persist across HTTP handlers.
  xero.setTokenSet({
    access_token: business.xero_access_token,
    refresh_token: business.xero_refresh_token ?? undefined,
    token_type: "Bearer",
    expiry_time: expiryMs ? Math.floor(expiryMs / 1000) : undefined,
  } as Parameters<typeof xero.setTokenSet>[0]);

  if (needsRefresh && business.xero_refresh_token) {
    logger.info({ businessId: business.id }, "proactive token refresh (< 5 min to expiry)");
    const refreshed = await xero.refreshToken();
    const newExpiryMs = Date.now() + (refreshed.expires_in ?? 1800) * 1000;
    await db
      .from("businesses")
      .update({
        xero_access_token: refreshed.access_token,
        xero_refresh_token: refreshed.refresh_token ?? business.xero_refresh_token,
        xero_token_expiry: new Date(newExpiryMs).toISOString(),
      })
      .eq("id", business.id);
    xero.setTokenSet({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? business.xero_refresh_token,
      token_type: "Bearer",
      expiry_time: Math.floor(newExpiryMs / 1000),
    } as Parameters<typeof xero.setTokenSet>[0]);
  }
}

async function handleInvoiceCreated(tenantId: string, invoiceId: string): Promise<void> {
  const business = await findBusinessByXeroTenantId(tenantId);
  if (!business) {
    logger.warn({ tenantId }, "no business found for xero tenant");
    return;
  }

  await ensureFreshTokens(business);

  const invoiceResp = await xero.accountingApi.getInvoice(tenantId, invoiceId);
  const invoice = invoiceResp.body.invoices?.[0];
  if (!invoice) {
    logger.warn({ invoiceId, tenantId }, "invoice not found via Xero API");
    return;
  }

  const invoiceData: InvoiceData = {
    invoiceId,
    tenantId,
    invoiceNumber: invoice.invoiceNumber ?? invoiceId,
    customerEmail: invoice.contact?.emailAddress ?? null,
    contactName: invoice.contact?.name ?? "Customer",
    total: invoice.total ?? 0,
    currency: String(invoice.currencyCode ?? "USD"),
    date: invoice.date
      ? new Date(invoice.date).toISOString().split("T")[0]!
      : new Date().toISOString().split("T")[0]!,
    lineItems: (invoice.lineItems ?? []).map((li) => ({
      description: li.description ?? "",
      quantity: li.quantity ?? 1,
      unitAmount: li.unitAmount ?? 0,
      lineAmount: li.lineAmount ?? 0,
    })),
  };

  await processInvoice(business, invoiceData);
}

// Nightly proactive token refresh at 2 AM for all businesses
cron.schedule("0 2 * * *", async () => {
  logger.info("nightly Xero token refresh starting");
  const { data: businesses } = await db
    .from("businesses")
    .select("id, xero_refresh_token, xero_token_expiry, xero_access_token")
    .not("xero_refresh_token", "is", null);

  for (const biz of businesses ?? []) {
    if (!biz.xero_refresh_token) continue;
    try {
      await ensureFreshTokens(biz as NonNullable<BusinessRow>);
      logger.info({ businessId: biz.id }, "nightly token refreshed");
    } catch (err) {
      logger.error({ err, businessId: biz.id }, "nightly token refresh failed");
    }
  }
});
