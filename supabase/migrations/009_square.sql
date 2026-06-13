ALTER TABLE businesses ADD COLUMN IF NOT EXISTS square_merchant_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS square_access_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS square_refresh_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS square_token_expiry timestamptz;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS square_webhook_id text;

ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_channel_check;
ALTER TABLE receipts ADD CONSTRAINT receipts_channel_check
  CHECK (channel IN ('xero','eposnow','shopify','manual','quickbooks','freeagent','square'));
