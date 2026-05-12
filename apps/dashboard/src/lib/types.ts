export type UserType = "business" | "advertiser";

export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  xero_tenant_id: string | null;
  xero_token_expiry: string | null;
  xero_access_token: string | null;
  plan: string;
  stripe_customer_id: string | null;
}

export interface AdvertiserProfile {
  id: string;
  name: string;
  email: string;
  website_url: string;
  logo_url: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  advertiser_id: string;
  title: string;
  status: "draft" | "active" | "paused" | "ended";
  budget_cents: number;
  spent_cents: number;
  start_date: string;
  end_date: string | null;
  target_industries: string[];
  target_regions: string[];
  created_at: string;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  headline: string;
  body_text: string | null;
  cta_text: string | null;
  cta_url: string;
  qr_code_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface BusinessAdSettings {
  id: string;
  business_id: string;
  enabled: boolean;
  placement: string;
  max_ads_per_receipt: number;
  allowed_categories: string[];
}
