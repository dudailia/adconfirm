import { Resend } from "resend";
import type { Database } from "../../../../packages/db/dist/index";
import type { InvoiceData } from "./processor";
import { logger } from "./logger";
import { markPlacementDelivered } from "./db";

type AdCreativeRow = Database["public"]["Tables"]["ad_creatives"]["Row"];

const FROM_FALLBACK = process.env["RESEND_FROM_EMAIL"] ?? "invoices@adconfirm.io";

function getResend(): Resend {
  const key = process.env["RESEND_API_KEY"];
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

export function buildReceiptHtml(baseHtml: string, creative: AdCreativeRow): string {
  const qrBlock = creative.qr_code_url
    ? `<img src="${creative.qr_code_url}" alt="Scan QR code" width="80" height="80" style="display:block;margin-top:8px;" />`
    : "";

  const adBlock =
    `<div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-family:sans-serif;">` +
    `<p style="font-size:11px;color:#9ca3af;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.05em;">Sponsored</p>` +
    `<h3 style="margin:0 0 4px 0;font-size:16px;color:#111827;">${creative.headline}</h3>` +
    (creative.body_text
      ? `<p style="margin:0 0 8px 0;font-size:14px;color:#374151;">${creative.body_text}</p>`
      : "") +
    `<a href="${creative.cta_url}" style="display:inline-block;padding:8px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;">${creative.cta_text ?? "Learn more"}</a>` +
    qrBlock +
    `</div>`;

  const MARKER = "<!-- FISCAL_CLOSE -->";
  const idx = baseHtml.indexOf(MARKER);

  if (idx === -1) {
    return baseHtml + adBlock;
  }

  const insertAt = idx + MARKER.length;
  return baseHtml.slice(0, insertAt) + adBlock + baseHtml.slice(insertAt);
}

export interface MailerOptions {
  to: string;
  fromEmail?: string;
  subject: string;
  htmlContent: string;
  creative: AdCreativeRow;
  placementId: string;
}

export async function sendAdReceipt(opts: MailerOptions): Promise<void> {
  const resend = getResend();
  const html = buildReceiptHtml(opts.htmlContent, opts.creative);

  const { error } = await resend.emails.send({
    from: opts.fromEmail ?? FROM_FALLBACK,
    to: opts.to,
    subject: opts.subject,
    html,
  });

  if (error) {
    logger.error({ err: error, placementId: opts.placementId, to: opts.to }, "email send failed");
    return;
  }

  await markPlacementDelivered(opts.placementId);
  logger.info({ placementId: opts.placementId, to: opts.to }, "receipt email delivered");
}

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function buildInvoiceHtml(
  invoiceData: InvoiceData,
  creative: AdCreativeRow | null
): string {
  const lineItemsHtml = invoiceData.lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.description}</td>
          <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;">${item.quantity}</td>
          <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;">${formatCurrency(item.unitAmount, invoiceData.currency)}</td>
          <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:500;">${formatCurrency(item.lineAmount, invoiceData.currency)}</td>
        </tr>`
    )
    .join("");

  const adBlock = creative
    ? `<!-- FISCAL_CLOSE -->
<div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:20px;">
  <p style="font-size:10px;color:#9ca3af;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.06em;font-family:sans-serif;">Sponsored</p>
  <h3 style="margin:0 0 6px 0;font-size:16px;color:#111827;font-weight:700;font-family:sans-serif;">${creative.headline}</h3>
  ${creative.body_text ? `<p style="margin:0 0 12px 0;font-size:14px;color:#374151;font-family:sans-serif;">${creative.body_text}</p>` : ""}
  <a href="${creative.cta_url}?utm_source=adconfirm&utm_medium=invoice&utm_campaign=${creative.campaign_id}"
     style="display:inline-block;padding:9px 20px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:5px;font-size:14px;font-weight:500;font-family:sans-serif;">${creative.cta_text ?? "Learn more"}</a>
  ${creative.qr_code_url ? `<br><img src="${creative.qr_code_url}" alt="Scan to learn more" width="80" height="80" style="display:block;margin-top:14px;" />` : ""}
  <p style="font-size:9px;color:#d1d5db;margin:16px 0 0 0;font-family:sans-serif;">Delivered by <a href="https://adconfirm.io" style="color:#d1d5db;text-decoration:none;">AdConfirm</a></p>
</div>`
    : `<!-- FISCAL_CLOSE -->`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;color:#111827;background:#ffffff;">
  <div style="margin-bottom:28px;">
    <h2 style="font-size:22px;font-weight:700;margin:0 0 4px 0;">Invoice #${invoiceData.invoiceNumber}</h2>
    <p style="font-size:13px;color:#6b7280;margin:0;">Date: ${invoiceData.date}</p>
  </div>
  <div style="margin-bottom:24px;">
    <p style="font-size:11px;color:#6b7280;margin:0 0 3px 0;text-transform:uppercase;letter-spacing:0.05em;">Bill To</p>
    <p style="font-size:15px;font-weight:600;margin:0;">${invoiceData.contactName}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Unit Price</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
      </tr>
    </thead>
    <tbody>${lineItemsHtml}</tbody>
  </table>
  <div style="text-align:right;padding:12px 0;border-top:2px solid #111827;">
    <span style="font-size:18px;font-weight:700;">Total: ${formatCurrency(invoiceData.total, invoiceData.currency)}</span>
  </div>
  ${adBlock}
</body>
</html>`;
}

export interface SendInvoiceResult {
  placementId: string | null;
  emailOk: boolean;
}

export async function sendInvoiceWithAd(
  invoiceData: InvoiceData,
  creative: AdCreativeRow | null,
  business: BusinessRow
): Promise<SendInvoiceResult> {
  if (!invoiceData.customerEmail) {
    logger.info({ invoiceId: invoiceData.invoiceId }, "no customer email — skipping send");
    return { placementId: null, emailOk: false };
  }

  const resend = getResend();
  const html = buildInvoiceHtml(invoiceData, creative);
  const from =
    (business as BusinessRow & { from_email?: string }).from_email ??
    process.env["RESEND_FROM_EMAIL"] ??
    FROM_FALLBACK;

  const { error } = await resend.emails.send({
    from,
    to: invoiceData.customerEmail,
    subject: `Invoice ${invoiceData.invoiceNumber} from ${business.name}`,
    html,
    replyTo: business.email,
  });

  if (error) {
    logger.error(
      { err: error, invoiceId: invoiceData.invoiceId, to: invoiceData.customerEmail },
      "sendInvoiceWithAd failed"
    );
    return { placementId: null, emailOk: false };
  }

  logger.info(
    { invoiceId: invoiceData.invoiceId, to: invoiceData.customerEmail, hasAd: !!creative },
    "invoice email sent"
  );
  return { placementId: null, emailOk: true };
}
