# Demo Page Design

**Date:** 2026-06-06  
**Status:** Approved

## Goal

Add a publicly accessible `/demo` page to `apps/dashboard` that shows the dashboard UI with hardcoded realistic data, a yellow "Live demo" banner, and a "Get Started Free" CTA linking to `/signup`. No authentication required.

## Architecture

Two files added to `apps/dashboard/app/demo/`:

| File | Type | Responsibility |
|---|---|---|
| `page.tsx` | Server component (static) | Full page layout, stat cards, banner, table — no Supabase, no auth |
| `DemoChart.tsx` | `"use client"` component | Recharts `LineChart` with 30 days of hardcoded daily ad delivery data |

No middleware change needed — middleware was already removed from this app. `/demo` is accessible to unauthenticated users by default.

## Banner

Yellow bar pinned at the top of the page:

- Text: **"Live demo — connect your Xero to see your real data"**
- CTA button: **"Get Started Free →"** — links to `/signup`
- Background: `#1A1200`, border: `#4D3800`, text: `#FFB800`

## Stat Cards (3-column grid)

| Label | Value |
|---|---|
| Receipts Processed | **47** |
| Ads Delivered | **312** |
| Xero Status | **Connected** (green `#00E5A0`) |

Xero card sub-lines:
- Tenant name: `Acme Supplies Ltd`
- Last sync: `Today at 09:41`

## Line Chart

- Component: `DemoChart.tsx` (`"use client"`)
- Library: `recharts` (already in `node_modules`)
- X-axis: 30 day labels (e.g. "May 8", "May 9" … "Jun 6")
- Y-axis: daily ad delivery count
- Data: hardcoded 30-element array, values ranging 5–18 per day, totalling ~312
- Chart elements: `LineChart`, `Line` (color `#00E5A0`, strokeWidth 2, dot hidden), `CartesianGrid` (stroke `#1A2540`), `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer` (width 100%, height 260)

## Recent Receipts Table

5 fake rows, columns: Business Name | Invoice Amount | Date | Ad Headline

| Business Name | Invoice Amount | Date | Ad Headline |
|---|---|---|---|
| Acme Supplies Ltd | £2,340.00 | 3 Jun 2026 | 50% off Sage subscriptions |
| Harbour Coffee Co | £189.50 | 3 Jun 2026 | Try Xero free for 30 days |
| Nordic Print Studio | £4,120.00 | 2 Jun 2026 | Square POS — no setup fees |
| Greenfield Catering | £876.00 | 2 Jun 2026 | Expensify — smarter receipts |
| Coastal Law LLP | £12,500.00 | 1 Jun 2026 | Shopify for B2B — go live today |

## Styling

Matches existing dashboard inline-style palette — no Tailwind (dashboard pages use inline styles):

- Page background: `#04070F`
- Card background: `#0D1629`
- Card border: `1px solid #1A2540`
- Primary text: `#F0F4FF`
- Muted text: `#8A9BC4`
- Green (connected/chart): `#00E5A0`
- Yellow (banner): `#FFB800`
- Font: `system-ui`

## Public Access

No auth middleware in this app. The `/demo` route requires no changes to routing config — it is publicly accessible as a static server component.

## Files Changed

- **Create:** `apps/dashboard/app/demo/page.tsx`
- **Create:** `apps/dashboard/app/demo/DemoChart.tsx`

No other files touched.
