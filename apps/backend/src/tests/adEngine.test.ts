import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CampaignWithCreatives } from "../modules/db";

vi.mock("../modules/db", () => ({
  getActiveCampaignsWithCreatives: vi.fn(),
}));
vi.mock("../modules/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { selectAd } from "../modules/adEngine";
import * as db from "../modules/db";

const creative = {
  id: "cr-1",
  campaign_id: "camp-1",
  headline: "Great Deal",
  body_text: "Buy now",
  cta_text: "Shop",
  cta_url: "https://example.com",
  qr_code_url: null,
  image_url: null,
  created_at: "2026-01-01T00:00:00Z",
};

const activeCampaign: CampaignWithCreatives = {
  id: "camp-1",
  advertiser_id: "adv-1",
  title: "Test",
  status: "active",
  budget_cents: 10000,
  spent_cents: 5000,
  start_date: "2020-01-01",
  end_date: null,
  target_industries: ["retail"],
  target_regions: ["US"],
  created_at: "2026-01-01T00:00:00Z",
  ad_creatives: [creative],
};

beforeEach(() => vi.clearAllMocks());

describe("selectAd", () => {
  it("returns null when no campaigns exist", async () => {
    vi.mocked(db.getActiveCampaignsWithCreatives).mockResolvedValue([]);
    expect(await selectAd(["retail"], ["US"])).toBeNull();
  });

  it("returns ad when campaign matches industry and region", async () => {
    vi.mocked(db.getActiveCampaignsWithCreatives).mockResolvedValue([activeCampaign]);
    const result = await selectAd(["retail"], ["US"]);
    expect(result).not.toBeNull();
    expect(result!.creative.headline).toBe("Great Deal");
    expect(result!.campaign.id).toBe("camp-1");
  });

  it("returns null when budget is exhausted (spent >= budget)", async () => {
    const exhausted = { ...activeCampaign, spent_cents: 10000 };
    vi.mocked(db.getActiveCampaignsWithCreatives).mockResolvedValue([exhausted]);
    expect(await selectAd(["retail"], ["US"])).toBeNull();
  });

  it("matches when business has no industry/region filter (empty arrays = all)", async () => {
    vi.mocked(db.getActiveCampaignsWithCreatives).mockResolvedValue([activeCampaign]);
    const result = await selectAd([], []);
    expect(result).not.toBeNull();
  });

  it("returns null when business region does not overlap campaign regions", async () => {
    vi.mocked(db.getActiveCampaignsWithCreatives).mockResolvedValue([activeCampaign]);
    expect(await selectAd(["retail"], ["EU"])).toBeNull();
  });
});
