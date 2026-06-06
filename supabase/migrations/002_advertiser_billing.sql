-- Add daily budget column to ad_campaigns
ALTER TABLE ad_campaigns
  ADD COLUMN IF NOT EXISTS daily_budget_cents integer NOT NULL DEFAULT 0;

-- Allow businesses to insert their own row on signup
CREATE POLICY "businesses_insert_own"
  ON businesses FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow advertisers to insert their own row on signup
CREATE POLICY "advertisers_insert_own"
  ON advertisers FOR INSERT
  WITH CHECK (id = auth.uid());

-- Billing interest table
CREATE TABLE IF NOT EXISTS advertiser_billing_interest (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid        NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  contact_email text        NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE advertiser_billing_interest ENABLE ROW LEVEL SECURITY;

-- Only the owning advertiser can insert; service role reads
CREATE POLICY "billing_interest_insert_own"
  ON advertiser_billing_interest FOR INSERT
  WITH CHECK (advertiser_id = auth.uid());
