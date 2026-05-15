import type { Database } from "../../../../packages/db/dist/index";
import { logger } from "./logger";
import { selectAd } from "./adEngine";
import { sendAdReceipt, sendInvoiceWithAd } from "./mailer";
import { insertReceipt, insertPlacement, logAdEvent, getBusinessAdSettings, createReceipt, createPlacement, markPlacementDelivered } from "./db";

type Channel = Database["public"]["Tables"]["receipts"]["Row"]["channel"];
type DocumentType = Database["public"]["Tables"]["receipts"]["Row"]["document_type"];

/** Allowed `channel` when {@link processInvoice} creates a receipt (matches DB check constraint). */
export type ProcessInvoiceChannel = Channel;

export interface ProcessorInput {
  businessId: string;
  businessIndustries: string[];
  businessRegions: string[];
  externalId: string;
  channel: Channel;
  documentType: DocumentType;
  customerEmail: string | null;
  totalCents: number;
  currency: string;
  issuedAt: Date;
  htmlContent?: string;
  fromEmail?: string;
}

export async function processReceiptEvent(input: ProcessorInput): Promise<void> {
  // CRITICAL: capture both timestamps before any async operation
  const injected_at = new Date();
  const injection_unix_ms = Date.now();

  logger.info(
    {
      injected_at: injected_at.toISOString(),
      injection_unix_ms,
      businessId: input.businessId,
      channel: input.channel,
    },
    "processing receipt event"
  );

  const receipt = await insertReceipt({
    business_id: input.businessId,
    external_id: input.externalId,
    channel: input.channel,
    document_type: input.documentType,
    customer_email: input.customerEmail,
    total_cents: input.totalCents,
    currency: input.currency,
    issued_at: input.issuedAt.toISOString(),
  });

  const selected = await selectAd(input.businessIndustries, input.businessRegions);

  if (!selected) {
    logger.info({ receiptId: receipt.id }, "no ad selected — skipping placement");
    return;
  }

  const placement = await insertPlacement({
    receipt_id: receipt.id,
    ad_creative_id: selected.creative.id,
    injected_at: injected_at.toISOString(),
    injection_unix_ms,
    position_index: 0,
    delivered: false,
    delivery_channel: input.customerEmail ? "email" : null,
  });

  await logAdEvent({
    placement_id: placement.id,
    event_type: "impression",
  });

  if (input.customerEmail && input.htmlContent) {
    await sendAdReceipt({
      to: input.customerEmail,
      fromEmail: input.fromEmail,
      subject: "Your receipt from AdConfirm",
      htmlContent: input.htmlContent,
      creative: selected.creative,
      placementId: placement.id,
    });
  }

  logger.info(
    {
      receiptId: receipt.id,
      placementId: placement.id,
      campaignId: selected.campaign.id,
      delivered: Boolean(input.customerEmail && input.htmlContent),
    },
    "receipt event complete"
  );
}

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

export interface InvoiceData {
  invoiceId: string;
  tenantId: string;
  invoiceNumber: string;
  customerEmail: string | null;
  contactName: string;
  total: number;
  currency: string;
  date: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
  }>;
}

export async function processInvoice(
  business: BusinessRow,
  invoiceData: InvoiceData,
  channel: ProcessInvoiceChannel = "xero"
): Promise<void> {
  // PATENT-CRITICAL: These two lines must execute first, before any async calls
  const injected_at = new Date();
  const injection_unix_ms = Date.now();
  logger.info(
    { injected_at: injected_at.toISOString(), injection_unix_ms, businessId: business.id },
    "processInvoice: timestamps captured"
  );

  const settings = await getBusinessAdSettings(business.id);
  if (settings && !settings.enabled) {
    logger.info({ businessId: business.id }, "ad settings disabled — skipping ad injection");
    return;
  }

  const ad = await selectAd([], [], []);

  const totalCents = Math.round(invoiceData.total * 100);
  const receipt = await createReceipt(
    business.id,
    invoiceData.invoiceId,
    channel,
    "invoice",
    invoiceData.customerEmail,
    totalCents,
    invoiceData.currency,
    new Date(invoiceData.date)
  );

  if (!ad) {
    logger.warn({ receiptId: receipt.id }, "no ad available — delivering without ad");
    if (invoiceData.customerEmail) {
      await sendInvoiceWithAd(invoiceData, null, business);
    }
    return;
  }

  const placement = await createPlacement(
    receipt.id,
    ad.creative.id,
    injected_at,
    injection_unix_ms
  );

  await logAdEvent({ placement_id: placement.id, event_type: "impression" });

  if (invoiceData.customerEmail) {
    await sendInvoiceWithAd(invoiceData, ad.creative, business);
    logger.info(
      { businessId: business.id, customerEmail: invoiceData.customerEmail },
      "ad-injected email sent"
    );
    await markPlacementDelivered(placement.id);
    logger.info(
      {
        receipt_id: receipt.id,
        placement_id: placement.id,
        business_id: business.id,
        ad_id: ad.creative.id,
        injection_unix_ms,
      },
      "processInvoice: complete"
    );
  } else {
    logger.info(
      { businessId: business.id, invoiceNumber: invoiceData.invoiceNumber },
      "processInvoice: ad injected but email skipped — no customer email on invoice contact"
    );
  }
}
