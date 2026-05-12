import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { StatCard } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import type { Campaign } from "../../../../lib/types";

export const metadata: Metadata = { title: "Advertiser Dashboard" };

function formatGBP(cents: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);
}

export default async function AdvertiserDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("advertiser_id", user.id)
    .order("created_at", { ascending: false });

  const { data: impressions } = await supabase
    .from("ad_events")
    .select("id")
    .eq("event_type", "impression")
    .gte("occurred_at", startOfMonth);

  const { data: clicks } = await supabase
    .from("ad_events")
    .select("id")
    .eq("event_type", "click")
    .gte("occurred_at", startOfMonth);

  const totalSpentCents = (campaigns ?? []).reduce((sum, c) => sum + c.spent_cents, 0);
  const impressionCount = impressions?.length ?? 0;
  const clickCount = clicks?.length ?? 0;
  const ctr = impressionCount > 0 ? ((clickCount / impressionCount) * 100).toFixed(2) : "0.00";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-muted-fg mt-1">
            {now.toLocaleString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/advertiser/campaigns/new"
          className="px-4 py-2 bg-accent hover:bg-accent-dim text-white text-sm font-medium rounded-lg transition-colors"
        >
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Spend this month" value={formatGBP(totalSpentCents)} />
        <StatCard label="Impressions" value={impressionCount.toLocaleString()} />
        <StatCard label="Clicks" value={clickCount.toLocaleString()} />
        <StatCard label="CTR" value={ctr} suffix="%" />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-white">Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Campaign</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Status</th>
                <th className="text-right px-5 py-3 text-xs text-muted-fg font-medium">Budget</th>
                <th className="text-right px-5 py-3 text-xs text-muted-fg font-medium">Spent</th>
                <th className="text-right px-5 py-3 text-xs text-muted-fg font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(campaigns ?? []).map((c: Campaign) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="px-5 py-3 font-medium text-white">{c.title}</td>
                  <td className="px-5 py-3">
                    <Badge variant={c.status as "active" | "draft" | "paused" | "ended"}>{c.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-muted-fg">{formatGBP(c.budget_cents)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-white">{formatGBP(c.spent_cents)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/advertiser/campaigns/${c.id}`} className="text-xs text-accent hover:underline">View →</Link>
                  </td>
                </tr>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-fg">
                    No campaigns yet.{" "}
                    <Link href="/advertiser/campaigns/new" className="text-accent hover:underline">
                      Create your first campaign
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
