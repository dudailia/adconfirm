import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";

type PlacementListRow = {
  id: string;
  injected_at: string | null;
  delivered: boolean | null;
  receipts: { external_id: string | null } | null;
  ad_creatives: { headline: string } | { headline: string }[] | null;
};

function formatInjectedAt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function placementHeadline(row: PlacementListRow): string {
  const raw = row.ad_creatives;
  if (raw == null) return "—";
  if (Array.isArray(raw)) {
    const first = raw[0];
    const h =
      first && typeof first === "object" && "headline" in first
        ? (first as { headline: string }).headline
        : null;
    return h != null && String(h).length > 0 ? String(h) : "—";
  }
  if (typeof raw === "object" && "headline" in raw) {
    const h = (raw as { headline: string }).headline;
    return h != null && String(h).length > 0 ? String(h) : "—";
  }
  return "—";
}

function safePlacementRows(data: unknown): PlacementListRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter((r): r is PlacementListRow => r != null && typeof r === "object" && "id" in r) as PlacementListRow[];
}

export default async function DashboardOverviewPage() {
  try {
    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (authErr || !user) {
      redirect("/login");
    }

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

    const businessId = business.id;
    const businessName = business.name?.trim() || "Business";

    const { count: receiptTotal, error: receiptCountErr } = await supabase
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);
    if (receiptCountErr) {
      console.error("dashboard: receipt count", receiptCountErr.message);
    }

    const { data: receiptRows, error: receiptListErr } = await supabase
      .from("receipts")
      .select("id")
      .eq("business_id", businessId);
    if (receiptListErr) {
      console.error("dashboard: receipt list", receiptListErr.message);
    }
    const receiptIds = (receiptRows ?? []).map((r) => r?.id).filter((id): id is string => Boolean(id));

    let placementTotal = 0;
    let deliveredTotal = 0;
    if (receiptIds.length > 0) {
      const { count: p, error: pErr } = await supabase
        .from("receipt_ad_placements")
        .select("*", { count: "exact", head: true })
        .in("receipt_id", receiptIds);
      if (pErr) console.error("dashboard: placement count", pErr.message);
      placementTotal = p ?? 0;
      const { count: d, error: dErr } = await supabase
        .from("receipt_ad_placements")
        .select("*", { count: "exact", head: true })
        .in("receipt_id", receiptIds)
        .eq("delivered", true);
      if (dErr) console.error("dashboard: delivered count", dErr.message);
      deliveredTotal = d ?? 0;
    }

    const { data: placementRows, error: placementErr } = await supabase
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
      .eq("receipts.business_id", businessId)
      .order("injected_at", { ascending: false })
      .limit(10);

    if (placementErr) {
      console.error("dashboard: placements query", placementErr.message);
    }

    const placements = safePlacementRows(placementRows ?? []);

    const xeroConnected = Boolean(business.xero_tenant_id);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {businessName}</h1>
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
          {placementErr ? (
            <p className="mt-4 text-sm text-danger">
              Could not load placements. Check Supabase policies and try again.
            </p>
          ) : null}
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
                  placements.map((row, idx) => {
                    const id = typeof row.id === "string" && row.id.length > 0 ? row.id : `row-${idx}`;
                    const delivered = Boolean(row.delivered);
                    return (
                      <tr key={id} className="border-b border-border/60">
                        <td className="py-3 pr-4 text-muted-fg">{formatInjectedAt(row.injected_at)}</td>
                        <td className="py-3 pr-4 text-white">{row.receipts?.external_id ?? "—"}</td>
                        <td className="py-3 pr-4 text-white">{placementHeadline(row)}</td>
                        <td className="py-3">
                          <span className={delivered ? "text-success" : "text-danger"}>
                            {delivered ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    console.error("dashboard overview fatal", err);
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-white">Something went wrong</p>
        <p className="mt-2 text-sm text-muted-fg">
          Please refresh the page or sign out and sign in again. If this continues, contact support.
        </p>
        <Link href="/login" className="mt-6 inline-block text-accent hover:underline">
          Back to login
        </Link>
      </div>
    );
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted-fg">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{safe}</p>
    </div>
  );
}
