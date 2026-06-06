import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getAdvertiserForUser,
  getPlacementIdsForAdvertiser,
} from "@/lib/advertiser";
import { BillingModal } from "./BillingModal";
import type { Database } from "@adconfirm/db";

type CampaignRow = Database["public"]["Tables"]["ad_campaigns"]["Row"];

function statusBadgeClass(status: CampaignRow["status"]): string {
  switch (status) {
    case "active":
      return "bg-success/20 text-success";
    case "draft":
      return "bg-muted text-muted-fg";
    case "paused":
      return "bg-warning/20 text-warning";
    case "ended":
      return "bg-danger/20 text-danger";
    default:
      return "bg-muted text-muted-fg";
  }
}

export default async function AdvertiserDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        <p>Sign in to view your advertiser dashboard.</p>
        <Link href="/advertiser/login" className="mt-4 inline-block text-accent hover:underline">
          Advertiser login
        </Link>
      </div>
    );
  }

  const advertiser = await getAdvertiserForUser(user);
  if (!advertiser) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        No advertiser profile is linked to this account. Your Supabase email should match{" "}
        <code className="text-accent">advertisers.email</code>, or your user id should match{" "}
        <code className="text-accent">advertisers.id</code>.
      </div>
    );
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const firstOfMonth = `${y}-${pad(m + 1)}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const lastOfMonth = `${y}-${pad(m + 1)}-${pad(lastDay)}`;

  const { data: monthCampaigns } = await supabase
    .from("ad_campaigns")
    .select("spent_cents")
    .eq("advertiser_id", advertiser.id)
    .gte("start_date", firstOfMonth)
    .lte("start_date", lastOfMonth);

  const monthSpendCents =
    monthCampaigns?.reduce((sum, row) => sum + (row.spent_cents ?? 0), 0) ?? 0;

  const placementIds = await getPlacementIdsForAdvertiser(advertiser.id);

  let impressionCount = 0;
  let clickCount = 0;
  if (placementIds.length > 0) {
    const { count: imp } = await supabase
      .from("ad_events")
      .select("*", { count: "exact", head: true })
      .in("placement_id", placementIds)
      .eq("event_type", "impression");
    impressionCount = imp ?? 0;
    const { count: clk } = await supabase
      .from("ad_events")
      .select("*", { count: "exact", head: true })
      .in("placement_id", placementIds)
      .eq("event_type", "click");
    clickCount = clk ?? 0;
  }

  const ctr =
    impressionCount > 0 ? ((clickCount / impressionCount) * 100).toFixed(1) : "—";

  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("advertiser_id", advertiser.id)
    .order("created_at", { ascending: false });

  const rows = (campaigns ?? []) as CampaignRow[];

  const fmtMoney = (cents: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign overview</h1>
          <p className="mt-1 text-sm text-muted-fg">{advertiser.name}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <BillingModal contactEmail={advertiser.email} />
          <Link
            href="/advertiser/campaigns/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            New campaign
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total spend this month"
          value={fmtMoney(monthSpendCents)}
          hint="Sum of spent_cents for campaigns with start date in the current month"
        />
        <StatCard label="Total impressions" value={String(impressionCount)} />
        <StatCard label="Total clicks" value={String(clickCount)} />
        <StatCard label="CTR" value={ctr === "—" ? "—" : `${ctr}%`} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-white">Campaigns</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-fg">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Budget</th>
                <th className="pb-2 pr-4 font-medium">Spent</th>
                <th className="pb-2 font-medium">Start date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-muted-fg">
                    No campaigns yet.{" "}
                    <Link href="/advertiser/campaigns/new" className="text-accent hover:underline">
                      Create one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/advertiser/campaigns/${c.id}`}
                        className="font-medium text-white hover:text-accent"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-fg">{fmtMoney(c.budget_cents)}</td>
                    <td className="py-3 pr-4 text-muted-fg">{fmtMoney(c.spent_cents)}</td>
                    <td className="py-3 text-muted-fg">{c.start_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted-fg">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-fg/80">{hint}</p> : null}
    </div>
  );
}
