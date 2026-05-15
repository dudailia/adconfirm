import type { User } from "@supabase/supabase-js";
import type { Database } from "@adconfirm/db";
import { createClient } from "./supabase/server";

export type AdvertiserRow = Database["public"]["Tables"]["advertisers"]["Row"];

export async function getAdvertiserForUser(user: User): Promise<AdvertiserRow | null> {
  const supabase = createClient();
  const email = user.email?.trim();
  if (email) {
    const { data: byEmail } = await supabase
      .from("advertisers")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (byEmail) return byEmail;
  }
  const { data: byId } = await supabase.from("advertisers").select("*").eq("id", user.id).maybeSingle();
  return byId;
}

export async function getSessionAndAdvertiser(): Promise<{
  user: User | null;
  advertiser: AdvertiserRow | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, advertiser: null };
  const advertiser = await getAdvertiserForUser(user);
  return { user, advertiser };
}

/** Placement IDs for all creatives under this advertiser's campaigns. */
export async function getPlacementIdsForAdvertiser(advertiserId: string): Promise<string[]> {
  const supabase = createClient();
  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("id")
    .eq("advertiser_id", advertiserId);
  const cids = campaigns?.map((c) => c.id) ?? [];
  if (!cids.length) return [];
  const { data: creatives } = await supabase.from("ad_creatives").select("id").in("campaign_id", cids);
  const crids = creatives?.map((c) => c.id) ?? [];
  if (!crids.length) return [];
  const { data: placements } = await supabase.from("receipt_ad_placements").select("id").in("ad_creative_id", crids);
  return placements?.map((p) => p.id) ?? [];
}

export async function getPlacementIdsForCampaign(campaignId: string): Promise<string[]> {
  const supabase = createClient();
  const { data: creatives } = await supabase.from("ad_creatives").select("id").eq("campaign_id", campaignId);
  const crids = creatives?.map((c) => c.id) ?? [];
  if (!crids.length) return [];
  const { data: placements } = await supabase.from("receipt_ad_placements").select("id").in("ad_creative_id", crids);
  return placements?.map((p) => p.id) ?? [];
}
