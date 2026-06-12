import { createServerClient } from "../../../../packages/db/dist/index";
import type { Database } from "../../../../packages/db/dist/index";
import { logger } from "./logger";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];
type ReceiptInsert = Database["public"]["Tables"]["receipts"]["Insert"];
type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];
type WebhookEventRow = Database["public"]["Tables"]["webhook_events"]["Row"];
type AdSpendDailyRow = Database["public"]["Tables"]["ad_spend_daily"]["Row"];
type PlacementInsert = Database["public"]["Tables"]["receipt_ad_placements"]["Insert"];
type PlacementRow = Database["public"]["Tables"]["receipt_ad_placements"]["Row"];
type AdEventInsert = Database["public"]["Tables"]["ad_events"]["Insert"];
type AdSettingsRow = Database["public"]["Tables"]["business_ad_settings"]["Row"];
type CampaignRow = Database["public"]["Tables"]["ad_campaigns"]["Row"];
type CreativeRow = Database["public"]["Tables"]["ad_creatives"]["Row"];

export type CampaignWithCreatives = CampaignRow & { ad_creatives: CreativeRow[] };

export const db = createServerClient(
  process.env["SUPABASE_URL"]!,
  process.env["SUPABASE_SERVICE_KEY"]!
);

export async function findBusinessByXeroTenantId(
  tenantId: string
): Promise<BusinessRow | null> {
  const { data, error } = await db
    .from("businesses")
    .select("*")
    .eq("xero_tenant_id", tenantId)
    .single();
  if (error) {
    logger.error({ err: error, tenantId }, "findBusinessByXeroTenantId failed");
    return null;
  }
  return data;
}

export async function getActiveCampaignsWithCreatives(): Promise<CampaignWithCreatives[]> {
  const today = new Date().toISOString().split("T")[0]!;
  const { data, error } = await db
    .from("ad_campaigns")
    .select(
      "id, advertiser_id, title, status, budget_cents, spent_cents, daily_budget_cents, start_date, end_date, target_industries, target_regions, created_at, ad_creatives(id, campaign_id, headline, body_text, cta_text, cta_url, qr_code_url, image_url, created_at)"
    )
    .eq("status", "active")
    .gt("daily_budget_cents", 0)
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`);
  if (error) throw new Error(`getActiveCampaignsWithCreatives: ${error.message}`);
  return (data ?? []) as CampaignWithCreatives[];
}

export async function insertReceipt(payload: ReceiptInsert): Promise<ReceiptRow> {
  const { data, error } = await db
    .from("receipts")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`insertReceipt: ${error.message}`);
  return data;
}

export async function insertPlacement(
  payload: PlacementInsert
): Promise<PlacementRow> {
  const { data, error } = await db
    .from("receipt_ad_placements")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`insertPlacement: ${error.message}`);
  return data;
}

export async function markPlacementDelivered(placementId: string): Promise<void> {
  const { error } = await db
    .from("receipt_ad_placements")
    .update({ delivered: true })
    .eq("id", placementId);
  if (error) {
    logger.error({ err: error, placementId }, "markPlacementDelivered failed");
  }
}

export async function logAdEvent(payload: AdEventInsert): Promise<void> {
  const { error } = await db.from("ad_events").insert(payload);
  if (error) {
    logger.error({ err: error }, "logAdEvent failed");
  }
}

export async function getBusinessAdSettings(
  businessId: string
): Promise<AdSettingsRow | null> {
  const { data, error } = await db
    .from("business_ad_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();
  if (error) {
    logger.error({ err: error, businessId }, "getBusinessAdSettings failed");
    return null;
  }
  return data;
}

export async function createReceipt(
  businessId: string,
  externalId: string,
  channel: ReceiptInsert["channel"],
  documentType: ReceiptInsert["document_type"],
  customerEmail: string | null,
  totalCents: number,
  currency: string,
  issuedAt: Date
): Promise<ReceiptRow> {
  return insertReceipt({
    business_id: businessId,
    external_id: externalId,
    channel,
    document_type: documentType,
    customer_email: customerEmail,
    total_cents: totalCents,
    currency,
    issued_at: issuedAt.toISOString(),
  });
}

export async function createPlacement(
  receiptId: string,
  adCreativeId: string,
  injectedAt: Date,
  injectionUnixMs: number
): Promise<PlacementRow> {
  return insertPlacement({
    receipt_id: receiptId,
    ad_creative_id: adCreativeId,
    injected_at: injectedAt.toISOString(),
    injection_unix_ms: injectionUnixMs,
    position_index: 0,
    delivered: false,
    delivery_channel: "email",
  });
}

export async function markReceiptEmailFailed(receiptId: string): Promise<void> {
  const { error } = await db
    .from("receipts")
    .update({ email_failed: true })
    .eq("id", receiptId);
  if (error) {
    logger.error({ err: error, receiptId }, "markReceiptEmailFailed db error");
  }
}

// ─── Webhook events ───────────────────────────────────────────────────────────

export async function insertWebhookEvent(
  source: string,
  payload: unknown
): Promise<WebhookEventRow | null> {
  const { data, error } = await db
    .from("webhook_events")
    .insert({ source, payload: payload as any, status: "pending" })
    .select()
    .single();
  if (error) {
    logger.error({ err: error, source }, "insertWebhookEvent failed");
    return null;
  }
  return data;
}

export async function resolveWebhookEvent(
  id: string,
  status: "processed" | "failed",
  error?: string
): Promise<void> {
  const { error: dbError } = await db
    .from("webhook_events")
    .update({
      status,
      error: error ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (dbError) {
    logger.error({ err: dbError, id, status }, "resolveWebhookEvent failed");
  }
}

export async function getFailedWebhookEvents(): Promise<WebhookEventRow[]> {
  const { data, error } = await db
    .from("webhook_events")
    .select("*")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    logger.error({ err: error }, "getFailedWebhookEvents failed");
    return [];
  }
  return data ?? [];
}

// ─── Daily ad spend ───────────────────────────────────────────────────────────

export async function getTodaySpendForCampaigns(
  campaignIds: string[]
): Promise<Map<string, AdSpendDailyRow>> {
  if (campaignIds.length === 0) return new Map();
  const today = new Date().toISOString().split("T")[0]!;
  const { data, error } = await db
    .from("ad_spend_daily")
    .select("*")
    .in("campaign_id", campaignIds)
    .eq("date", today);
  if (error) {
    logger.error({ err: error }, "getTodaySpendForCampaigns failed");
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.campaign_id, r]));
}

/**
 * Upsert ad_spend_daily for today: increment impressions by 1 and update
 * spend_cents using integer math for $2 CPM (0.2 cents/impression).
 * spend_cents = floor(new_impressions * 2 / 10)
 */
export async function incrementDailySpend(campaignId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0]!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db as any).rpc("upsert_ad_spend_daily", {
    p_campaign_id: campaignId,
    p_date: today,
  });
  if (error) {
    // Fallback: plain upsert if RPC not available
    const { data: existing } = await db
      .from("ad_spend_daily")
      .select("impressions")
      .eq("campaign_id", campaignId)
      .eq("date", today)
      .maybeSingle();
    const newImpressions = (existing?.impressions ?? 0) + 1;
    const newSpendCents = Math.floor((newImpressions * 2) / 10);
    await db.from("ad_spend_daily").upsert(
      { campaign_id: campaignId, date: today, impressions: newImpressions, spend_cents: newSpendCents },
      { onConflict: "campaign_id,date" }
    );
  }
}
