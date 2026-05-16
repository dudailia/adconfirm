"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { InvoiceAdPreview } from "@/lib/invoice-ad-preview";
import { createCreativeAction, type CreativeActionState } from "./actions";

export function CreativeForm({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useFormState(createCreativeAction, null as CreativeActionState);

  useEffect(() => {
    if (state?.href) {
      window.location.href = state.href;
    }
  }, [state]);

  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [ctaText, setCtaText] = useState("Learn More");
  const [ctaUrl, setCtaUrl] = useState("https://");

  const hlLen = headline.length;
  const bodyLen = bodyText.length;

  const preview = useMemo(
    () => ({
      headline: headline || "Your headline",
      bodyText,
      ctaText: ctaText || "Learn more",
      ctaUrl: ctaUrl || "https://",
      campaignId,
    }),
    [headline, bodyText, ctaText, ctaUrl, campaignId]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <form action={formAction} className="space-y-5 rounded-xl border border-border bg-surface p-6">
        <input type="hidden" name="campaign_id" value={campaignId} />
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <label htmlFor="headline" className="font-medium text-muted-fg">
              Headline
            </label>
            <span className={hlLen > 60 ? "text-danger" : "text-muted-fg"}>{hlLen}/60</span>
          </div>
          <input
            id="headline"
            name="headline"
            type="text"
            maxLength={60}
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <label htmlFor="body_text" className="font-medium text-muted-fg">
              Body text
            </label>
            <span className={bodyLen > 120 ? "text-danger" : "text-muted-fg"}>{bodyLen}/120</span>
          </div>
          <textarea
            id="body_text"
            name="body_text"
            rows={4}
            maxLength={120}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="cta_text" className="mb-1 block text-sm font-medium text-muted-fg">
            CTA text
          </label>
          <input
            id="cta_text"
            name="cta_text"
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="cta_url" className="mb-1 block text-sm font-medium text-muted-fg">
            CTA URL
          </label>
          <input
            id="cta_url"
            name="cta_url"
            type="url"
            required
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          Save creative
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">Live preview</h2>
        <p className="mt-1 text-xs text-muted-fg">As shown in invoice emails (light email background)</p>
        <div className="mt-6 flex justify-center rounded-lg bg-[#f9fafb] p-6">
          <InvoiceAdPreview
            headline={preview.headline}
            bodyText={preview.bodyText}
            ctaText={preview.ctaText}
            ctaUrl={preview.ctaUrl}
            campaignId={campaignId}
          />
        </div>
      </div>
    </div>
  );
}
