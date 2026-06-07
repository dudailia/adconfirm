-- Webhook event log for idempotency and retry observability
CREATE TABLE IF NOT EXISTS webhook_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source       text        NOT NULL,
  payload      jsonb       NOT NULL,
  status       text        NOT NULL DEFAULT 'pending',
  error        text,
  processed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS: service role only (admin reads via backend)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Index for the failed-webhooks admin query
CREATE INDEX IF NOT EXISTS webhook_events_status_idx ON webhook_events (status);

-- Track whether invoice email delivery succeeded
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS email_failed boolean NOT NULL DEFAULT false;
