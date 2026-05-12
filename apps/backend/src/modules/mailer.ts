import { Resend } from "resend";
import type { Database } from "@adconfirm/db";
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
