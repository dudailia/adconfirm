# AdConfirm — Final Setup Checklist

Everything is built and deployed except 3 manual steps that require accounts only you can access.

---

## Step 1 — Supabase project (5 minutes)

You currently have 2 active Supabase projects (`closebooks`, `glacier-delta`).
The free tier allows 2. You need to pause one to create the AdConfirm project.

**1a. Pause an existing project**
- Go to https://supabase.com/dashboard
- Open `closebooks` or `glacier-delta` → Settings → General → Pause Project

**1b. Create AdConfirm project**
- Dashboard → New Project
- Name: `adconfirm`
- Region: West US (Oregon) — matches Render region
- Copy the **Project URL** and **service_role key** (Settings → API)

**1c. Run the migration**
- In the Supabase dashboard → SQL Editor → paste the contents of:
  `supabase/migrations/001_initial_schema.sql`
- Click Run

**1d. Save these values — you'll need them in Step 3:**
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  (service_role key — secret, never expose in frontend)
SUPABASE_ANON_KEY=eyJ...     (anon key — safe for frontend)
```

---

## Step 2 — Xero OAuth app (5 minutes)

**2a. Create a Xero developer app**
- Go to https://developer.xero.com/app/manage
- Click "New app"
- App name: `AdConfirm`
- Integration type: `Web app`
- Company URL: `https://adconfirm.io`
- Redirect URI: `https://adconfirm-api.onrender.com/auth/xero/callback`
- Click Create

**2b. Save these values:**
```
XERO_CLIENT_ID=xxxx
XERO_CLIENT_SECRET=xxxx
XERO_WEBHOOK_KEY=xxxx   (Webhooks tab → Create webhook → copy signing key)
```

For the webhook, go to the **Webhooks** tab in your Xero app:
- URL: `https://adconfirm-api.onrender.com/webhooks/xero`
- Subscribe to: `Invoice`

---

## Step 3 — Deploy backend to Render (5 minutes)

**3a. Create a free Render account**
- Go to https://render.com → Sign up with GitHub

**3b. Deploy from GitHub**
- Dashboard → New → Web Service
- Connect repository: `dudailia/adconfirm`
- Render will auto-detect `render.yaml` and pre-fill settings
- Click **Deploy Web Service**

**3c. Add environment variables**
In the Render service → Environment tab, add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | from Step 1d |
| `SUPABASE_SERVICE_KEY` | from Step 1d |
| `SUPABASE_ANON_KEY` | from Step 1d |
| `XERO_CLIENT_ID` | from Step 2b |
| `XERO_CLIENT_SECRET` | from Step 2b |
| `XERO_WEBHOOK_KEY` | from Step 2b |
| `RESEND_API_KEY` | from resend.com (free account, get API key) |

**3d. Wait for deploy (~3 minutes)**
- Render will clone, build, and start the server
- Health check: `https://adconfirm-api.onrender.com/health` → should return `{"status":"ok"}`

---

## Step 4 — Update Vercel env vars (2 minutes)

Once the backend is live on Render, update the Vercel projects:

**Web app (adconfirm-web):**
- https://vercel.com/dudailias-projects/adconfirm-web/settings/environment-variables
- `NEXT_PUBLIC_API_URL` = `https://adconfirm-api.onrender.com`

**Dashboard (adconfirm-dashboard):**
- https://vercel.com/dudailias-projects/adconfirm-dashboard/settings/environment-variables
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL from Step 1d
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key from Step 1d
- `NEXT_PUBLIC_API_URL` = `https://adconfirm-api.onrender.com`

Trigger a redeploy on both projects after updating env vars.

---

## What's already done ✓

- ✓ Marketing website live at https://adconfirm.vercel.app
- ✓ Dashboard deployed at https://adconfirm-dashboard.vercel.app
- ✓ GitHub repo: https://github.com/dudailia/adconfirm
- ✓ Backend code complete (Express, Xero OAuth, ad injection, Resend email)
- ✓ Database schema written (`supabase/migrations/001_initial_schema.sql`)
- ✓ `render.yaml` in repo root (auto-configures Render deployment)
- ✓ Vercel security headers configured
- ✓ Xero OAuth routes: `/auth/xero/connect` and `/auth/xero/callback`
- ✓ Webhook handler: `/webhooks/xero` (HMAC verified)

---

## ⚠️ Important notes

**Render free tier**: Services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up. Fine for development. Upgrade to Starter ($7/mo) for always-on.

**Resend free tier**: 100 emails/day, 3,000/month. Free account at https://resend.com

**Xero sandbox**: While testing, use Xero's demo company. No real invoices needed.
