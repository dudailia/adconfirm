import type { Database } from "@adconfirm/db";
import { logger } from "./logger";
import { selectAd } from "./adEngine";
import { sendAdReceipt } from "./mailer";
import { insertReceipt, insertPlacement, logAdEvent } from "./db";

type Channel = Database["public"]["Tables"]["receipts"]["Row"]["channel"];
type DocumentType = Database["public"]["Tables"]["receipts"]["Row"]["document_type"];

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
