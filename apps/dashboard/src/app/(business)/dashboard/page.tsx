import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { StatCard } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export const metadata: Metadata = { title: "Dashboard" };

function formatGBP(cents: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);
}

export default async function BusinessDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, xero_tenant_id")
    .eq("id", user.id)
    .single();

  const { data: receiptsThisMonth } = await supabase
    .from("receipts")
    .select("id")
    .eq("business_id", user.id)
    .gte("created_at", startOfMonth);

  const { data: recentPlacements } = await supabase
    .from("receipt_ad_placements")
    .select(`
      id, injected_at, delivered,
      receipts!inner ( external_id, issued_at, business_id ),
      ad_creatives ( headline )
    `)
    .eq("receipts.business_id", user.id)
    .order("injected_at", { ascending: false })
    .limit(10);

  const invoicesCount = receiptsThisMonth?.length ?? 0;
  const adsServed = (recentPlacements ?? []).filter((p) => p.delivered).length;
  const earningsCents = adsServed * 8;
  const avgPerInvoice = invoicesCount > 0
    ? (earningsCents / invoicesCount / 100).toFixed(2)
    : "0.00";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-muted-fg mt-1">
          Overview for {now.toLocaleString("en-GB", { month: "long", year: "numeric" })}
        </p>
      </div>

      {business && !business.xero_tenant_id && (
        <div className="mb-6 bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Connect your Xero account</div>
            <div className="text-xs text-muted-fg mt-0.5">Start earning from your invoices</div>
          </div>
          <Link
            href="/settings/xero"
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors"
          >
            Connect Xero
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Earnings this month" value={formatGBP(earningsCents)} />
        <StatCard label="Invoices sent" value={invoicesCount} />
        <StatCard label="Ads served" value={adsServed} />
        <StatCard label="Avg / invoice" prefix="£" value={avgPerInvoice} />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-white">Recent Placements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Invoice</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Date</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Ad</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Status</th>
                <th className="text-right px-5 py-3 text-xs text-muted-fg font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {(recentPlacements ?? []).map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-fg">
                    {p.receipts?.external_id ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-fg">
                    {p.receipts?.issued_at
                      ? new Date(p.receipts.issued_at).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-white truncate max-w-[180px]">
                    {p.ad_creatives?.headline ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={p.delivered ? "active" : "draft"}>
                      {p.delivered ? "Delivered" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-success">
                    {p.delivered ? "£0.08" : "—"}
                  </td>
                </tr>
              ))}
              {(!recentPlacements || recentPlacements.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-fg">
                    No placements yet. Connect Xero to start earning.
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
