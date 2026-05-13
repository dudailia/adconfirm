# AdConfirm — Final Setup (2 steps remaining)

Supabase is set up. The database schema is live. Vercel env vars are updated.

You only need to do **2 things**:

---

## Step 1 — Xero OAuth app (5 minutes)

1. Go to https://developer.xero.com/app/manage
2. Click **New app**
   - App name: `AdConfirm`
   - Integration type: `Web app`
   - Redirect URI: `https://adconfirm-api.onrender.com/auth/xero/callback`
3. Save — copy **Client ID** and **Client Secret**
4. Go to **Webhooks** tab → Create webhook:
   - URL: `https://adconfirm-api.onrender.com/webhooks/xero`
   - Subscribe to: `Invoice`
   - Copy the **Webhook Signing Key**

---

## Step 2 — Deploy backend to Render (5 minutes)

1. Go to https://render.com → **Sign up with GitHub**
2. Dashboard → **New** → **Web Service**
3. Connect repository: `dudailia/adconfirm`
4. Render auto-detects `render.yaml` — click **Deploy**
5. In the service → **Environment** tab, add these variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://qpfwvoonlrznwuchxjwn.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZnd2b29ubHJ6bnd1Y2h4anduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYyODQ3MywiZXhwIjoyMDk0MjA0NDczfQ.JUIC3OsZ0HnchwdX4879OBXaN59onjMhrpR0NxKn9lU` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZnd2b29ubHJ6bnd1Y2h4anduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Mjg0NzMsImV4cCI6MjA5NDIwNDQ3M30.kizlKHM4NQKkbEe-euoonaWIDM5nk5GSczRCGwYABAM` |
| `XERO_CLIENT_ID` | ← from Step 1 |
| `XERO_CLIENT_SECRET` | ← from Step 1 |
| `XERO_WEBHOOK_KEY` | ← from Step 1 |
| `RESEND_API_KEY` | ← get free key at resend.com (takes 2 min) |

6. Click **Save Changes** — Render will redeploy automatically
7. Test: https://adconfirm-api.onrender.com/health → should return `{"status":"ok"}`

---

## What's already done ✓

| | |
|-|-|
| ✓ | Marketing site live at https://adconfirm.vercel.app |
| ✓ | Dashboard live at https://adconfirm-dashboard.vercel.app |
| ✓ | Supabase project created: `https://qpfwvoonlrznwuchxjwn.supabase.co` |
| ✓ | Database schema applied (8 tables, RLS enabled) |
| ✓ | Vercel env vars updated (both web + dashboard) |
| ✓ | Backend code complete (Xero OAuth, ad injection, email) |
| ✓ | `render.yaml` in repo root (auto-configures Render deploy) |
| ✓ | GitHub: https://github.com/dudailia/adconfirm |

---

## ⚠️ Notes

- **Render free tier**: Service sleeps after 15 min inactivity. First wake = ~30s delay. Fine for demo.
- **Resend free tier**: 100 emails/day, free forever at resend.com
- **Closebooks** (your other Supabase project) is paused — restore it anytime at supabase.com/dashboard
