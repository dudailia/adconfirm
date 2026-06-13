"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  advertiserId: string;
  campaignId: string;
  dailyBudgetCents: number;
  paymentStatus: string;
}

export default function FundCampaignButton({
  advertiserId,
  campaignId,
  dailyBudgetCents,
  paymentStatus,
}: Props) {
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get("payment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFund() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_id: campaignId,
            daily_budget_cents: dailyBudgetCents,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Checkout failed");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {paymentResult === "success" && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Payment successful — your campaign has been funded.
        </div>
      )}

      {paymentResult === "cancelled" && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          Payment cancelled. You can try again below.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {paymentStatus === "unpaid" && (
          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
            Payment Required
          </span>
        )}
        {paymentStatus === "paid" && (
          <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
            Funded
          </span>
        )}

        <button
          onClick={handleFund}
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting to Stripe…" : "Fund Campaign"}
        </button>
      </div>
    </div>
  );
}
