import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../../lib/supabase/server";
import { StatCard } from "../../../../../components/ui/Card";
import { Badge } from "../../../../../components/ui/Badge";
import { CampaignChart } from "./CampaignChart";

export const metadata: Metadata = { title: "Campaign Analytics" };

function formatGBP(cents: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("id", params.id)
    .eq("advertiser_id", user.id)
    .single();

  if (!campaign) redirect("/advertiser/dashboard");

  const { data: creatives } = await supabase
    .from("ad_creatives")
    .select("id")
    .eq("campaign_id", params.id);

  const creativeIds = (creatives ?? []).map((c) => c.id);

  const { data: placements } = await supabase
    .from("receipt_ad_placements")
    .select("id, injected_at, delivered, receipts(external_id, issued_at, channel)")
    .in("ad_creative_id", creativeIds.length > 0 ? creativeIds : ["none"])
    .order("injected_at", { ascending: false })
    .limit(50);

  const placementIds = (placements ?? []).map((p) => p.id);

  const { data: events } = await supabase
    .from("ad_events")
    .select("event_type, occurred_at")
    .in("placement_id", placementIds.length > 0 ? placementIds : ["none"]);

  const impressions = (events ?? []).filter((e) => e.event_type === "impression").length;
  const clicks = (events ?? []).filter((e) => e.event_type === "click").length;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
  const budgetPct = campaign.budget_cents > 0
    ? Math.min(100, Math.round((campaign.spent_cents / campaign.budget_cents) * 100))
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-white">{campaign.title}</h1>
            <Badge variant={campaign.status as "active" | "draft" | "paused" | "ended"}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-fg">
            {campaign.start_date}
            {campaign.end_date ? ` → ${campaign.end_date}` : " (no end date)"}
          </p>
        </div>
        <Link
          href={`/advertiser/campaigns/${campaign.id}/creative`}
          className="px-4 py-2 border border-border text-white text-sm rounded-lg hover:border-white/20 transition-colors"
        >
          Add Creative
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Budget" value={formatGBP(campaign.budget_cents)} />
        <StatCard label="Spent" value={formatGBP(campaign.spent_cents)} />
        <StatCard label="Impressions" value={impressions.toLocaleString()} />
        <StatCard label="CTR" value={ctr} suffix="%" />
      </div>

      {/* Budget burn bar */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex justify-between text-xs text-muted-fg mb-2">
          <span>Budget burn rate</span>
          <span>{budgetPct}% used</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-fg mt-1.5">
          <span>{formatGBP(campaign.spent_cents)} spent</span>
          <span>{formatGBP(campaign.budget_cents - campaign.spent_cents)} remaining</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-white mb-4">Impressions &amp; Clicks</h2>
        <CampaignChart events={events ?? []} />
      </div>

      {/* Placements table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-white">Placements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Invoice</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Date</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Channel</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {(placements ?? []).map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-fg">
                    {p.receipts?.external_id ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-fg">
                    {p.injected_at ? new Date(p.injected_at).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-fg">{p.receipts?.channel ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={p.delivered ? "active" : "draft"}>
                      {p.delivered ? "Yes" : "No"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!placements || placements.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-fg">
                    No placements yet.
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
