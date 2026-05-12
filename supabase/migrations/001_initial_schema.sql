-- AdConfirm initial schema
-- Run: supabase db push  (or apply via Supabase dashboard → SQL editor)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

CREATE TABLE businesses (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text        NOT NULL,
  email               text        NOT NULL UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  xero_tenant_id      text        UNIQUE,
  xero_access_token   text,
  xero_refresh_token  text,
  xero_token_expiry   timestamptz,
  eposnow_api_key     text,
  stripe_customer_id  text,
  plan                text        NOT NULL DEFAULT 'free'
);

CREATE TABLE advertisers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text        NOT NULL,
  email               text        NOT NULL UNIQUE,
  website_url         text        NOT NULL,
  logo_url            text        NOT NULL,
  stripe_customer_id  text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ad_campaigns (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id       uuid        NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  title               text        NOT NULL,
  status              text        NOT NULL CHECK (status IN ('draft','active','paused','ended')),
  budget_cents        integer     NOT NULL,
  spent_cents         integer     NOT NULL DEFAULT 0,
  start_date          date        NOT NULL,
  end_date            date,
  target_industries   text[]      NOT NULL DEFAULT '{}',
  target_regions      text[]      NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ad_creatives (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid        NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  headline     text        NOT NULL,
  body_text    text,
  cta_text     text,
  cta_url      text        NOT NULL,
  qr_code_url  text,
  image_url    text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE business_ad_settings (
  id                   uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id          uuid     NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  enabled              boolean  NOT NULL DEFAULT true,
  placement            text     NOT NULL DEFAULT 'after_total',
  max_ads_per_receipt  integer  NOT NULL DEFAULT 1,
  allowed_categories   text[]   NOT NULL DEFAULT '{}'
);

CREATE TABLE receipts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  external_id    text        NOT NULL,
  channel        text        NOT NULL CHECK (channel IN ('xero','eposnow','shopify','manual')),
  document_type  text        NOT NULL CHECK (document_type IN ('invoice','receipt','purchase_order')),
  customer_email text,
  total_cents    integer     NOT NULL,
  currency       char(3)     NOT NULL,
  issued_at      timestamptz NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE receipt_ad_placements (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id        uuid        NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  ad_creative_id    uuid        NOT NULL REFERENCES ad_creatives(id) ON DELETE RESTRICT,
  injected_at       timestamptz NOT NULL,
  injection_unix_ms bigint      NOT NULL,
  position_index    integer     NOT NULL DEFAULT 0,
  delivered         boolean     NOT NULL DEFAULT false,
  delivery_channel  text
);

CREATE TABLE ad_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id  uuid        NOT NULL REFERENCES receipt_ad_placements(id) ON DELETE CASCADE,
  event_type    text        NOT NULL CHECK (event_type IN ('impression','click','scan')),
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  ip_hash       text,
  user_agent    text
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────

-- receipts: primary access patterns are by business and time
CREATE INDEX idx_receipts_business_id     ON receipts(business_id);
CREATE INDEX idx_receipts_issued_at       ON receipts(issued_at DESC);
-- dedup guard: a business should not ingest the same external document twice
CREATE UNIQUE INDEX idx_receipts_business_external ON receipts(business_id, external_id);

-- ad_campaigns: filtered by advertiser and status dashboard views
CREATE INDEX idx_ad_campaigns_advertiser_id ON ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_campaigns_status        ON ad_campaigns(status);

-- ad_creatives: looked up by campaign
CREATE INDEX idx_ad_creatives_campaign_id ON ad_creatives(campaign_id);

-- receipt_ad_placements: queried from both sides of the join
CREATE INDEX idx_receipt_ad_placements_receipt_id     ON receipt_ad_placements(receipt_id);
CREATE INDEX idx_receipt_ad_placements_ad_creative_id ON receipt_ad_placements(ad_creative_id);

-- ad_events: analytics roll-ups by placement and time
CREATE INDEX idx_ad_events_placement_id ON ad_events(placement_id);
CREATE INDEX idx_ad_events_occurred_at  ON ad_events(occurred_at DESC);
-- partial index: fast count of clicks and scans (impressions are the bulk of rows)
CREATE INDEX idx_ad_events_clicks_scans ON ad_events(placement_id, event_type)
  WHERE event_type IN ('click','scan');

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
-- The service role key (used by apps/backend) bypasses RLS automatically.
-- Anon / authenticated keys (used by browser clients) are restricted below.

ALTER TABLE businesses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives           ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ad_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_ad_placements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events              ENABLE ROW LEVEL SECURITY;

-- businesses: a business user can read only their own row
CREATE POLICY "businesses_select_own"
  ON businesses FOR SELECT
  USING (id = auth.uid());

-- advertisers: an advertiser user can read only their own row
CREATE POLICY "advertisers_select_own"
  ON advertisers FOR SELECT
  USING (id = auth.uid());

-- ad_campaigns: an advertiser sees only their own campaigns
CREATE POLICY "ad_campaigns_select_own_advertiser"
  ON ad_campaigns FOR SELECT
  USING (advertiser_id = auth.uid());

-- ad_creatives: an advertiser sees creatives for campaigns they own
CREATE POLICY "ad_creatives_select_own_advertiser"
  ON ad_creatives FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM ad_campaigns WHERE advertiser_id = auth.uid()
    )
  );

-- business_ad_settings: a business sees only their own settings row
CREATE POLICY "business_ad_settings_select_own"
  ON business_ad_settings FOR SELECT
  USING (business_id = auth.uid());

-- receipts: a business sees only their own receipts
CREATE POLICY "receipts_select_own_business"
  ON receipts FOR SELECT
  USING (business_id = auth.uid());

-- receipt_ad_placements: a business sees placements on their receipts;
-- an advertiser sees placements for their creatives
CREATE POLICY "receipt_ad_placements_select_business"
  ON receipt_ad_placements FOR SELECT
  USING (
    receipt_id IN (
      SELECT id FROM receipts WHERE business_id = auth.uid()
    )
  );

CREATE POLICY "receipt_ad_placements_select_advertiser"
  ON receipt_ad_placements FOR SELECT
  USING (
    ad_creative_id IN (
      SELECT ac.id FROM ad_creatives ac
      JOIN ad_campaigns camp ON camp.id = ac.campaign_id
      WHERE camp.advertiser_id = auth.uid()
    )
  );

-- ad_events: an advertiser sees events for placements of their creatives
CREATE POLICY "ad_events_select_advertiser"
  ON ad_events FOR SELECT
  USING (
    placement_id IN (
      SELECT rap.id FROM receipt_ad_placements rap
      JOIN ad_creatives ac    ON ac.id   = rap.ad_creative_id
      JOIN ad_campaigns camp  ON camp.id = ac.campaign_id
      WHERE camp.advertiser_id = auth.uid()
    )
  );
