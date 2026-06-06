# Advertiser Self-Serve Signup Design

**Date:** 2026-06-06  
**Status:** Approved

## Goal

Add self-serve advertiser signup at `/advertiser/signup`, extend the campaign creation form with a daily budget field and simplified target categories, and add a payment-interest modal on the advertiser dashboard backed by a new `advertiser_billing_interest` table.

---

## Architecture Overview

| Area | Files touched |
|---|---|
| Signup page | `app/advertiser/signup/page.tsx` (new) |
| Campaign form | `app/advertiser/(portal)/campaigns/new/NewCampaignForm.tsx` (modify) |
| Campaign action | `app/advertiser/(portal)/campaigns/new/actions.ts` (modify) |
| Dashboard | `app/advertiser/(portal)/dashboard/page.tsx` (modify) |
| Billing modal | `app/advertiser/(portal)/dashboard/BillingModal.tsx` (new) |
| Billing action | `app/advertiser/(portal)/dashboard/billingActions.ts` (new) |
| DB types | `packages/db/src/types.ts` (add `advertiser_billing_interest`) |
| Migration | `supabase/migrations/002_advertiser_billing.sql` (new) |

No new routes are needed beyond `/advertiser/signup`. No middleware changes — the existing advertiser portal layout handles auth redirects.

---

## 1. Advertiser Signup (`/advertiser/signup`)

**File:** `app/advertiser/signup/page.tsx`  
**Type:** `"use client"`

### Form fields
| Field | Input type | Validation |
|---|---|---|
| Company name | text | required, non-empty |
| Email | email | required, valid email |
| Password | password | required, ≥ 8 chars |
| Website URL | url | required, valid URL |

### Flow
1. User submits form.
2. Call `supabase.auth.signUp({ email, password })` via anon client (`@/lib/supabase/client`).
3. If auth error → show inline error message (e.g. "Email already registered").
4. On success (`user.id` available) → insert into `advertisers`:
   ```ts
   { id: user.id, name, email, website_url, logo_url: "" }
   ```
   Using the same anon client (RLS must allow `INSERT WHERE id = auth.uid()` — this is the existing pattern used by the business signup; if RLS blocks it, use a service-role server action instead, but try client-side first).
5. On insert error → show inline error, do not redirect.
6. On success → `window.location.replace('/advertiser/dashboard')`.

### Styling
Matches `/advertiser/login` exactly: dark card on `#04070F` bg, same input and button styles.

Add a "Already have an account? Sign in" link to `/advertiser/login` below the form.

---

## 2. Campaign Form Changes

**File:** `app/advertiser/(portal)/campaigns/new/NewCampaignForm.tsx`  
**File:** `app/advertiser/(portal)/campaigns/new/actions.ts`

### Daily budget field (replaces existing `budget_pounds`)

- Field name: `daily_budget_pounds`
- Input: `type="number"`, `min="5"`, `step="0.01"`
- Label: "Daily budget (£) — minimum £5/day"
- Below input, live-calculated hint: `≈ {Math.round((value / 2) * 1000).toLocaleString()} impressions/day at £2 CPM`
  - Formula: impressions = (daily_budget_£ / 2) × 1000
- Requires `useState` for live update — field becomes a controlled input.

### Target categories (replaces existing 7-industry list)

Replace `INDUSTRIES` constant with exactly 4 values:
```ts
const CATEGORIES = ["retail", "hospitality", "professional_services", "other"] as const;
```
Display labels: "Retail", "Hospitality", "Professional Services", "Other".  
Still submitted as `formData.getAll("industries")` and stored in `target_industries`.

### Start/end dates
Already present — no change.

### `createCampaignAction` changes
- Read `daily_budget_pounds` instead of `budget_pounds`.
- Minimum validation: `dailyBudget < 5` → redirect to `?error=budget`.
- Store as `daily_budget_cents = Math.round(dailyBudget * 100)` in new `ad_campaigns.daily_budget_cents` column.
- Keep `budget_cents` insert; set it to `daily_budget_cents` (single source of truth for now — can diverge later when lifetime budget concept is needed).
- Add error branch for `error=budget` in `page.tsx` error display.

---

## 3. Payment Modal on Advertiser Dashboard

**Button location:** Advertiser dashboard page header — alongside the existing title/actions area.  
**Button style:** Yellow (`#FFB800` bg, dark text), label "Add Payment Method".

### `BillingModal.tsx` (`"use client"`)

State: `open: boolean`, `submitted: boolean`, `loading: boolean`, `error: string | null`.

Modal content:
- Heading: "Set up billing"
- Body: "We'll contact you within 24 hours to set up your payment method and activate your campaigns."
- Pre-filled email input (read from a prop `contactEmail`) — editable in case they want a different contact.
- "Submit request" button → calls `submitBillingInterestAction(email)`.
- On success → show "✓ Request received. We'll be in touch shortly." and a "Close" button.
- On error → show error message inline.
- Backdrop click closes modal (unless submitted).

### `billingActions.ts` (`"use server"`)

```ts
export async function submitBillingInterestAction(
  contactEmail: string
): Promise<{ ok: boolean; message?: string }>
```

1. Get session via `createClient()` (server).
2. Resolve advertiser via `getSessionAndAdvertiser()`.
3. If no advertiser → `{ ok: false, message: "Not signed in" }`.
4. Insert into `advertiser_billing_interest`:
   ```ts
   { advertiser_id: advertiser.id, contact_email: contactEmail }
   ```
5. Return `{ ok: true }` or `{ ok: false, message: error.message }`.

### Dashboard page change

`app/advertiser/(portal)/dashboard/page.tsx` — import `BillingModal`, pass `advertiser.email` as `contactEmail` prop. Render the trigger button and modal in the header row.

---

## 4. Database Migration

**File:** `supabase/migrations/002_advertiser_billing.sql`

```sql
-- Add daily budget column to ad_campaigns
ALTER TABLE ad_campaigns
  ADD COLUMN IF NOT EXISTS daily_budget_cents integer NOT NULL DEFAULT 0;

-- Billing interest table
CREATE TABLE IF NOT EXISTS advertiser_billing_interest (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid       NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  contact_email text       NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: service role only (no anon read/write needed)
ALTER TABLE advertiser_billing_interest ENABLE ROW LEVEL SECURITY;
```

### DB types update (`packages/db/src/types.ts`)

Add `advertiser_billing_interest` table type:
```ts
advertiser_billing_interest: {
  Row: {
    id: string;
    advertiser_id: string;
    contact_email: string;
    submitted_at: string;
  };
  Insert: {
    id?: string;
    advertiser_id: string;
    contact_email: string;
    submitted_at?: string;
  };
  Update: {
    id?: string;
    advertiser_id?: string;
    contact_email?: string;
    submitted_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "advertiser_billing_interest_advertiser_id_fkey";
      columns: ["advertiser_id"];
      isOneToOne: false;
      referencedRelation: "advertisers";
      referencedColumns: ["id"];
    }
  ];
};
```

---

## 5. Deployment

- Migration runs manually against the Supabase project using the Supabase CLI: `supabase db push` or applied via the Supabase dashboard SQL editor.
- Dashboard: `git push origin main` → Vercel auto-deploys.
- No backend (Render) changes needed.

---

## Spec Self-Review

| Check | Result |
|---|---|
| Placeholders | None |
| Internal consistency | `daily_budget_cents` used in both migration and action; `target_industries` field name unchanged |
| Scope | Single cohesive advertiser onboarding feature — appropriate for one plan |
| Ambiguity | `logo_url` defaults to `""` — explicit. RLS fallback documented. Daily budget = lifetime budget for now — explicit. |
