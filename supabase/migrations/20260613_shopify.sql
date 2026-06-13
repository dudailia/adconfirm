ALTER TABLE businesses ADD COLUMN IF NOT EXISTS shopify_shop text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS shopify_access_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS shopify_webhook_id text;
