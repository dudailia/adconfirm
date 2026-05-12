import { createServerClient } from "@adconfirm/db";
import type { Database } from "@adconfirm/db";
import { logger } from "./logger";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];
type ReceiptInsert = Database["public"]["Tables"]["receipts"]["Insert"];
type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];
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
      "id, advertiser_id, title, status, budget_cents, spent_cents, start_date, end_date, target_industries, target_regions, created_at, ad_creatives(id, campaign_id, headline, body_text, cta_text, cta_url, qr_code_url, image_url, created_at)"
    )
    .eq("status", "active")
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
