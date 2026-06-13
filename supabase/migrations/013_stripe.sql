ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS stripe_plan text;
ALTER TABLE ad_campaigns ADD COLUMN IF NOT EXISTS stripe_payment_status text DEFAULT 'unpaid';
