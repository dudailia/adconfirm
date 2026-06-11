# Environment Variable Setup

## Backend (`apps/backend/.env`)

### Required

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (bypasses RLS) |
| `XERO_CLIENT_ID` | Xero OAuth2 app client ID |
| `XERO_CLIENT_SECRET` | Xero OAuth2 app client secret |
| `XERO_WEBHOOK_KEY` | Xero webhook HMAC key (from Xero developer portal) |
| `RESEND_API_KEY` | Resend email API key |

### Optional

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | HTTP server port |
| `XERO_REDIRECT_URI` | `http://localhost:4000/auth/xero/callback` | Xero OAuth redirect URL |
| `DASHBOARD_URL` | `http://localhost:3001` | Dashboard base URL for post-OAuth redirects |
| `RESEND_FROM_EMAIL` | `invoices@adconfirm.io` | Sender address for invoice emails |
| `LOG_LEVEL` | `info` | Pino log level |
| `EPOSNOW_POLLING_INTERVAL_MS` | `60000` | Epos Now polling interval in ms |

### QuickBooks Online

| Variable | Description |
|---|---|
| `QBO_CLIENT_ID` | QuickBooks OAuth2 app client ID — from [Intuit Developer Portal](https://developer.intuit.com/) |
| `QBO_CLIENT_SECRET` | QuickBooks OAuth2 app client secret |
| `QBO_REDIRECT_URI` | Must match exactly what's registered in Intuit portal. Production: `https://adconfirm-api.onrender.com/auth/qbo/callback` |
| `INTUIT_WEBHOOK_VERIFIER_TOKEN` | Webhook verifier token from Intuit Developer Portal → Webhooks section |

**Setting up QuickBooks integration:**

1. Go to [developer.intuit.com](https://developer.intuit.com/) and create an app
2. Set OAuth 2.0 redirect URI to `https://adconfirm-api.onrender.com/auth/qbo/callback`
3. Copy client ID + secret to the env vars above
4. Under Webhooks, add `https://adconfirm-api.onrender.com/webhooks/quickbooks`
   - Subscribe to: `Invoice` entity, `Create` operation
   - Copy the verifier token to `INTUIT_WEBHOOK_VERIFIER_TOKEN`
5. Add all env vars to Render dashboard under Environment

---

## Dashboard (`apps/dashboard/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `https://adconfirm-api.onrender.com`) |
