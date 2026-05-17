import { describe, it, expect, vi } from "vitest";

vi.mock("../modules/db", () => ({
  markPlacementDelivered: vi.fn(),
}));
vi.mock("../modules/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { buildReceiptHtml } from "../modules/mailer";
import type { Database } from "@adconfirm/db";

type AdCreativeRow = Database["public"]["Tables"]["ad_creatives"]["Row"];

const creative: AdCreativeRow = {
  id: "cr-1",
  campaign_id: "camp-1",
  headline: "Try Our Product",
  body_text: "Amazing deals inside",
  cta_text: "Shop Now",
  cta_url: "https://example.com/offer",
  qr_code_url: null,
  image_url: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("buildReceiptHtml", () => {
  it("injects ad block immediately after <!-- FISCAL_CLOSE -->", () => {
    const base = "<div>Receipt</div><!-- FISCAL_CLOSE --><div>Footer</div>";
    const result = buildReceiptHtml(base, creative);
    const markerEnd = result.indexOf("<!-- FISCAL_CLOSE -->") + "<!-- FISCAL_CLOSE -->".length;
    const sponsoredIdx = result.indexOf("Sponsored");
    expect(sponsoredIdx).toBeGreaterThanOrEqual(markerEnd);
    expect(sponsoredIdx).toBeLessThan(result.indexOf("<div>Footer</div>"));
  });

  it("appends ad block at end when marker is absent", () => {
    const base = "<div>Receipt without marker</div>";
    const result = buildReceiptHtml(base, creative);
    expect(result.startsWith(base)).toBe(true);
    expect(result).toContain("Sponsored");
    expect(result).toContain("Try Our Product");
  });

  it("renders headline, cta_text, and cta_url", () => {
    const result = buildReceiptHtml("<!-- FISCAL_CLOSE -->", creative);
    expect(result).toContain("Try Our Product");
    expect(result).toContain("Shop Now");
    expect(result).toContain("https://example.com/offer");
  });

  it("includes QR img tag when qr_code_url is set", () => {
    const withQr = { ...creative, qr_code_url: "https://qr.example.com/qr.png" };
    const result = buildReceiptHtml("<!-- FISCAL_CLOSE -->", withQr);
    expect(result).toContain('src="https://qr.example.com/qr.png"');
  });

  it("omits img tag when qr_code_url is null", () => {
    const result = buildReceiptHtml("<!-- FISCAL_CLOSE -->", creative);
    expect(result).not.toContain("<img");
  });
});
