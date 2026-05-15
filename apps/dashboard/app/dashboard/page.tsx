import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";

type PlacementListRow = {
  id: string;
  injected_at: string;
  delivered: boolean;
  receipts: { external_id: string } | null;
  ad_creatives: { headline: string } | null;
};

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getBusinessForUser(user);
  if (!business) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        No business is linked to this login. Your Supabase user email must match a row in{" "}
        <code className="text-accent">businesses.email</code>, or your user id must match{" "}
        <code className="text-accent">businesses.id</code>.
      </div>
    );
  }

  const { count: receiptTotal } = await supabase
    .from("receipts")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  const { data: receiptRows } = await supabase.from("receipts").select("id").eq("business_id", business.id);
  const receiptIds = receiptRows?.map((r) => r.id) ?? [];

  let placementTotal = 0;
  let deliveredTotal = 0;
  if (receiptIds.length > 0) {
    const { count: p } = await supabase
      .from("receipt_ad_placements")
      .select("*", { count: "exact", head: true })
      .in("receipt_id", receiptIds);
    placementTotal = p ?? 0;
    const { count: d } = await supabase
      .from("receipt_ad_placements")
      .select("*", { count: "exact", head: true })
      .in("receipt_id", receiptIds)
      .eq("delivered", true);
    deliveredTotal = d ?? 0;
  }

  const { data: placementRows } = await supabase
    .from("receipt_ad_placements")
    .select(
      `
      id,
      injected_at,
      delivered,
      receipts!inner ( external_id, business_id ),
      ad_creatives ( headline )
    `
    )
    .eq("receipts.business_id", business.id)
    .order("injected_at", { ascending: false })
    .limit(10);

  const placements = (placementRows ?? []) as unknown as PlacementListRow[];

  const xeroConnected = Boolean(business.xero_tenant_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {business.name}</h1>
        <p className="mt-1 text-sm text-muted-fg">Business overview</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">Xero</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              xeroConnected ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
            }`}
          >
            {xeroConnected ? "Connected" : "Not connected"}
          </span>
          <Link
            href="/dashboard/connect-xero"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Connect Xero
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Receipts processed" value={receiptTotal ?? 0} />
        <StatCard label="Ad placements" value={placementTotal} />
        <StatCard label="Ads delivered" value={deliveredTotal} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-white">Recent placements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-fg">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Invoice #</th>
                <th className="pb-2 pr-4 font-medium">Ad headline</th>
                <th className="pb-2 font-medium">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-muted-fg">
                    No placements yet.
                  </td>
                </tr>
              ) : (
                placements.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 text-muted-fg">
                      {new Date(row.injected_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-white">{row.receipts?.external_id ?? "—"}</td>
                    <td className="py-3 pr-4 text-white">{row.ad_creatives?.headline ?? "—"}</td>
                    <td className="py-3">
                      <span className={row.delivered ? "text-success" : "text-danger"}>
                        {row.delivered ? "Yes" : "No"}
                      </span>
                    </td>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted-fg">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
