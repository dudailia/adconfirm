import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdvertiserForUser, getPlacementIdsForCampaign } from "@/lib/advertiser";
import type { Database } from "@adconfirm/db";

type CampaignRow = Database["public"]["Tables"]["ad_campaigns"]["Row"];
type EventRow = Database["public"]["Tables"]["ad_events"]["Row"];

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id: campaignId } = params;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/advertiser/login");

  const advertiser = await getAdvertiserForUser(user);
  if (!advertiser) redirect("/advertiser/login");

  const { data: camp, error } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error || !camp || camp.advertiser_id !== advertiser.id) {
    redirect("/advertiser/dashboard");
  }

  const campaign = camp as CampaignRow;
  const placementIds = await getPlacementIdsForCampaign(campaignId);

  let impressions = 0;
  let clicks = 0;
  if (placementIds.length > 0) {
    const { count: i } = await supabase
      .from("ad_events")
      .select("*", { count: "exact", head: true })
      .in("placement_id", placementIds)
      .eq("event_type", "impression");
    impressions = i ?? 0;
    const { count: c } = await supabase
      .from("ad_events")
      .select("*", { count: "exact", head: true })
      .in("placement_id", placementIds)
      .eq("event_type", "click");
    clicks = c ?? 0;
  }

  const ctr =
    impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "—";

  let events: EventRow[] = [];
  if (placementIds.length > 0) {
    const { data: evs } = await supabase
      .from("ad_events")
      .select("*")
      .in("placement_id", placementIds)
      .order("occurred_at", { ascending: false })
      .limit(50);
    events = (evs ?? []) as EventRow[];
  }

  const fmtMoney = (cents: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/advertiser/dashboard" className="text-sm text-accent hover:underline">
          ← Campaigns
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{campaign.title}</h1>
        <p className="mt-1 text-sm capitalize text-muted-fg">Status: {campaign.status}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">Budget</p>
          <p className="mt-2 text-xl font-bold text-white">{fmtMoney(campaign.budget_cents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">Spent</p>
          <p className="mt-2 text-xl font-bold text-white">{fmtMoney(campaign.spent_cents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">Schedule</p>
          <p className="mt-2 text-sm text-white">
            {campaign.start_date}
            {campaign.end_date ? ` → ${campaign.end_date}` : ""}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">Impressions</p>
          <p className="mt-2 text-2xl font-bold text-white">{impressions}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">Clicks</p>
          <p className="mt-2 text-2xl font-bold text-white">{clicks}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-fg">CTR</p>
          <p className="mt-2 text-2xl font-bold text-white">{ctr === "—" ? "—" : `${ctr}%`}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-white">Recent ad events</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-fg">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 font-medium">Placement</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-muted-fg">
                    No events yet for this campaign.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 text-muted-fg">
                      {new Date(ev.occurred_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 capitalize text-white">{ev.event_type}</td>
                    <td className="py-3 font-mono text-xs text-muted-fg">{ev.placement_id}</td>
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
