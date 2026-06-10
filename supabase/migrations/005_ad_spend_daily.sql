CREATE TABLE IF NOT EXISTS ad_spend_daily (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid    NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date         date    NOT NULL DEFAULT CURRENT_DATE,
  impressions  integer NOT NULL DEFAULT 0,
  spend_cents  integer NOT NULL DEFAULT 0,
  UNIQUE (campaign_id, date)
);

CREATE INDEX IF NOT EXISTS ad_spend_daily_campaign_date_idx
  ON ad_spend_daily (campaign_id, date);
