-- FreeAgent integration columns on businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS fa_access_token  TEXT,
  ADD COLUMN IF NOT EXISTS fa_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS fa_token_expiry  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fa_webhook_url   TEXT;

-- Add 'freeagent' to receipts.channel
-- If your channel column uses a CHECK constraint, run this block:
DO $$
BEGIN
  BEGIN
    ALTER TABLE receipts
      DROP CONSTRAINT IF EXISTS receipts_channel_check;
    ALTER TABLE receipts
      ADD CONSTRAINT receipts_channel_check
      CHECK (channel IN ('xero','eposnow','shopify','manual','quickbooks','freeagent'));
  EXCEPTION WHEN others THEN
    -- column is a native enum type; use the ALTER TYPE below instead
    NULL;
  END;
END $$;

-- If your channel column is a PostgreSQL enum type, also run:
-- ALTER TYPE receipts_channel ADD VALUE IF NOT EXISTS 'freeagent';
