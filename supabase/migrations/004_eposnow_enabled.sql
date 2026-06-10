-- eposnow_api_key already exists; add the enabled toggle
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS eposnow_enabled boolean NOT NULL DEFAULT false;
