-- Zettle OAuth columns
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS zettle_access_token  TEXT,
  ADD COLUMN IF NOT EXISTS zettle_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS zettle_token_expiry  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zettle_webhook_id    TEXT;

-- Add zettle to the channel constraint
ALTER TABLE receipts
  DROP CONSTRAINT IF EXISTS receipts_channel_check;

ALTER TABLE receipts
  ADD CONSTRAINT receipts_channel_check
  CHECK (channel IN (
    'xero','eposnow','shopify','manual','quickbooks','freeagent','square','sage','zettle'
  ));
