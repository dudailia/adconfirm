ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sage_access_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sage_refresh_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sage_token_expiry timestamptz;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sage_business_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sage_webhook_id text;
