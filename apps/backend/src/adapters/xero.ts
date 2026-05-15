import type { Request, Response } from "express";
import cron from "node-cron";
import { z } from "zod";
import { logger } from "../modules/logger";
import { findBusinessByXeroTenantId, db } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type BusinessRow = Awaited<ReturnType<typeof findBusinessByXeroTenantId>>;

type XeroTokenJson = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type XeroInvoiceDto = {
  InvoiceNumber?: string;
  Contact?: {
    EmailAddress?: string;
    Name?: string;
  };
  Total?: number;
  CurrencyCode?: string;
  Date?: string;
  LineItems?: Array<{
    Description?: string;
    Quantity?: number;
    UnitAmount?: number;
    LineAmount?: number;
  }>;
};

type XeroInvoicesResponse = {
  Invoices?: XeroInvoiceDto[];
  Message?: string;
};

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

function xeroBusinessNeedsTokenRefresh(business: NonNullable<BusinessRow>): boolean {
  if (!business.xero_access_token) return true;
  if (!business.xero_token_expiry) return false;
  const expiryMs = new Date(business.xero_token_expiry).getTime();
  return expiryMs < Date.now() + FIVE_MINUTES_MS;
}

async function exchangeXeroRefreshToken(refreshToken: string): Promise<XeroTokenJson> {
  const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env["XERO_CLIENT_ID"]!}:${process.env["XERO_CLIENT_SECRET"]!}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  const body = (await tokenResponse.json()) as XeroTokenJson;
  if (!tokenResponse.ok) {
    logger.error(
      { status: tokenResponse.status, body },
      "Xero refresh token exchange failed"
    );
    throw new Error(body.error_description ?? body.error ?? "Xero token refresh failed");
  }
  if (!body.access_token) {
    logger.error({ body }, "Xero refresh response missing access_token");
    throw new Error("Xero token refresh missing access_token");
  }
  return body;
}

async function persistBusinessXeroTokens(
  businessId: string,
  tokens: XeroTokenJson,
  existingRefreshFallback: string | null
): Promise<void> {
  const refreshToken = tokens.refresh_token ?? existingRefreshFallback;
  const expiryIso = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const { error } = await db
    .from("businesses")
    .update({
      xero_access_token: tokens.access_token ?? null,
      xero_refresh_token: refreshToken ?? null,
      xero_token_expiry: expiryIso,
    })
    .eq("id", businessId);

  if (error) {
    logger.error({ err: error, businessId }, "failed to persist Xero tokens");
    throw new Error(`persist Xero tokens: ${error.message}`);
  }
}

/** Returns a usable access token, refreshing via HTTP when missing or near expiry. */
async function resolveXeroAccessToken(
  business: NonNullable<BusinessRow>
): Promise<string | null> {
  if (!xeroBusinessNeedsTokenRefresh(business)) {
    return business.xero_access_token!;
  }

  if (!business.xero_refresh_token) {
    logger.error(
      { businessId: business.id },
      "Xero access token missing and no refresh token stored"
    );
    return null;
  }

  const newTokens = await exchangeXeroRefreshToken(business.xero_refresh_token);
  await persistBusinessXeroTokens(business.id, newTokens, business.xero_refresh_token);
  return newTokens.access_token ?? null;
}

async function fetchXeroInvoice(
  accessToken: string,
  tenantId: string,
  invoiceId: string
): Promise<{ status: number; invoice: XeroInvoiceDto | null }> {
  const invoiceResp = await fetch(
    `https://api.xero.com/api.xro/2.0/Invoices/${encodeURIComponent(invoiceId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-tenant-id": tenantId,
        Accept: "application/json",
      },
    }
  );

  const invoiceData = (await invoiceResp.json()) as XeroInvoicesResponse;
  const invoice = invoiceData.Invoices?.[0] ?? null;

  if (!invoiceResp.ok) {
    logger.warn(
      {
        status: invoiceResp.status,
        tenantId,
        invoiceId,
        message: invoiceData.Message,
      },
      "Xero invoice API error"
    );
  }

  return { status: invoiceResp.status, invoice };
}

function parseXeroDate(dateStr: unknown): string {
  if (!dateStr) return new Date().toISOString().split("T")[0]!;
  // Handle Xero's /Date(timestamp)/ format
  const match = String(dateStr).match(/\/Date\((\d+)/);
  if (match) {
    return new Date(parseInt(match[1]!, 10)).toISOString().split("T")[0]!;
  }
  // Try regular date string
  const d = new Date(String(dateStr));
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]!;
  return new Date().toISOString().split("T")[0]!;
}

function mapXeroInvoiceToInvoiceData(
  invoice: XeroInvoiceDto,
  invoiceId: string,
  tenantId: string
): InvoiceData {
  const contact = invoice.Contact ?? {};
  const email = contact.EmailAddress ?? null;
  const name = contact.Name ?? "Customer";
  const lineItems = invoice.LineItems ?? [];

  return {
    invoiceId,
    tenantId,
    invoiceNumber: invoice.InvoiceNumber ?? invoiceId,
    customerEmail: email,
    contactName: name,
    total: invoice.Total ?? 0,
    currency: String(invoice.CurrencyCode ?? "USD"),
    date: parseXeroDate(invoice.Date),
    lineItems: lineItems.map((li) => ({
      description: li.Description ?? "",
      quantity: li.Quantity ?? 1,
      unitAmount: li.UnitAmount ?? 0,
      lineAmount: li.LineAmount ?? 0,
    })),
  };
}

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

async function handleInvoiceCreated(tenantId: string, invoiceId: string): Promise<void> {
  const business = await findBusinessByXeroTenantId(tenantId);
  if (!business) {
    logger.warn({ tenantId }, "no business found for xero tenant");
    return;
  }

  const accessToken = await resolveXeroAccessToken(business);
  if (!accessToken) {
    return;
  }

  let { status, invoice } = await fetchXeroInvoice(accessToken, tenantId, invoiceId);

  if (status === 401) {
    const latest = (await findBusinessByXeroTenantId(tenantId)) ?? business;
    if (!latest.xero_refresh_token) {
      logger.warn({ businessId: business.id, tenantId }, "Xero invoice 401 and no refresh token");
      return;
    }
    const retried = await exchangeXeroRefreshToken(latest.xero_refresh_token);
    await persistBusinessXeroTokens(latest.id, retried, latest.xero_refresh_token);
    if (!retried.access_token) {
      return;
    }
    ({ status, invoice } = await fetchXeroInvoice(retried.access_token, tenantId, invoiceId));
  }

  if (!invoice) {
    logger.warn({ invoiceId, tenantId, status }, "invoice not found via Xero API");
    return;
  }

  const invoiceData = mapXeroInvoiceToInvoiceData(invoice, invoiceId, tenantId);
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
      const row = biz as NonNullable<BusinessRow>;
      if (!xeroBusinessNeedsTokenRefresh(row)) {
        continue;
      }
      const tokens = await exchangeXeroRefreshToken(biz.xero_refresh_token);
      await persistBusinessXeroTokens(biz.id, tokens, biz.xero_refresh_token);
      logger.info({ businessId: biz.id }, "nightly Xero token refreshed");
    } catch (err) {
      logger.error({ err, businessId: biz.id }, "nightly token refresh failed");
    }
  }
});
