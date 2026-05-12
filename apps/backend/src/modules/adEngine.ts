import type { Database } from "@adconfirm/db";
import { getActiveCampaignsWithCreatives, type CampaignWithCreatives } from "./db";
import { logger } from "./logger";

type CampaignRow = Database["public"]["Tables"]["ad_campaigns"]["Row"];
type AdCreativeRow = Database["public"]["Tables"]["ad_creatives"]["Row"];

export interface SelectedAd {
  creative: AdCreativeRow;
  campaign: CampaignRow;
}

function hasOverlap(business: string[], campaign: string[]): boolean {
  if (business.length === 0 || campaign.length === 0) return true;
  return business.some((b) => campaign.includes(b));
}

function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

export async function selectAd(
  businessIndustries: string[],
  businessRegions: string[],
  blockedAdvertiserIds: string[] = []
): Promise<SelectedAd | null> {
  const campaigns = await getActiveCampaignsWithCreatives();
  const today = new Date().toISOString().split("T")[0]!;

  const eligible = (campaigns as CampaignWithCreatives[]).filter((c) => {
    if (c.spent_cents >= c.budget_cents) return false;
    if (c.start_date > today) return false;
    if (c.end_date && c.end_date < today) return false;
    if (!hasOverlap(businessIndustries, c.target_industries)) return false;
    if (!hasOverlap(businessRegions, c.target_regions)) return false;
    if (!c.ad_creatives || c.ad_creatives.length === 0) return false;
    if (blockedAdvertiserIds.length > 0 && blockedAdvertiserIds.includes(c.advertiser_id)) return false;
    return true;
  });

  if (eligible.length === 0) {
    logger.debug({ businessIndustries, businessRegions }, "no eligible ads");
    return null;
  }

  const weighted = eligible.map((c) => ({
    campaign: c as unknown as CampaignRow,
    creative: (c.ad_creatives as AdCreativeRow[])[0]!,
    weight: c.budget_cents - c.spent_cents,
  }));

  const picked = weightedRandom(weighted);
  if (!picked) return null;

  logger.debug(
    { campaignId: picked.campaign.id, creativeId: picked.creative.id },
    "ad selected"
  );

  return { creative: picked.creative, campaign: picked.campaign };
}
