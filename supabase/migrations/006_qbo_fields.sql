-- QuickBooks Online integration fields
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qbo_tenant_id    text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qbo_access_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qbo_refresh_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qbo_token_expiry timestamptz;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qbo_realm_id     text;

-- Allow 'quickbooks' as a receipt channel
-- If the channel column has a CHECK constraint, add the new value.
-- Run this only if your column uses a check constraint; skip if it's open text.
-- ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_channel_check;
-- ALTER TABLE receipts ADD CONSTRAINT receipts_channel_check
--   CHECK (channel IN ('xero','eposnow','shopify','manual','quickbooks'));
