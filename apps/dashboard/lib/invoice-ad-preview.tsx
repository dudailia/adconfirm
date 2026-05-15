/**
 * Visual match for the invoice-email ad block in apps/backend/src/modules/mailer.ts
 * (buildInvoiceHtml sponsored section).
 */
export function InvoiceAdPreview(props: {
  headline: string;
  bodyText: string;
  ctaText: string;
  ctaUrl: string;
  campaignId?: string;
}) {
  const { headline, bodyText, ctaText, ctaUrl, campaignId } = props;
  const href =
    campaignId && ctaUrl
      ? `${ctaUrl}${ctaUrl.includes("?") ? "&" : "?"}utm_source=adconfirm&utm_medium=invoice&utm_campaign=${campaignId}`
      : ctaUrl;

  return (
    <div
      className="rounded-lg border border-[#e5e7eb] bg-white p-5 text-left shadow-sm"
      style={{ fontFamily: "sans-serif", maxWidth: 400 }}
    >
      <div className="border-t border-[#e5e7eb] pt-5">
        <p
          className="mb-2 text-[10px] uppercase tracking-wide text-[#9ca3af]"
          style={{ letterSpacing: "0.06em" }}
        >
          Sponsored
        </p>
        <h3 className="mb-1.5 text-base font-bold text-[#111827]">{headline || "Headline"}</h3>
        {bodyText ? <p className="mb-3 text-sm text-[#374151]">{bodyText}</p> : null}
        <a
          href={href || "#"}
          className="inline-block rounded-md px-5 py-2.5 text-sm font-medium text-white no-underline"
          style={{ background: "#0ea5e9" }}
          onClick={(e) => e.preventDefault()}
        >
          {ctaText || "Learn more"}
        </a>
        <p className="mt-4 text-[9px] text-[#d1d5db]">
          Delivered by{" "}
          <a href="https://adconfirm.io" className="text-[#d1d5db] no-underline">
            AdConfirm
          </a>
        </p>
      </div>
    </div>
  );
}
