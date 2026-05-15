"use client";

import { useState, useTransition } from "react";
import { updateAdsEnabled } from "./actions";

export function AdsToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      const res = await updateAdsEnabled(next);
      if (!res.ok) {
        setError(res.message ?? "Save failed");
        setEnabled(!next);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-white">Ads on invoices</h2>
      <p className="mt-1 text-sm text-muted-fg">
        When enabled, AdConfirm can inject sponsored content into invoice emails sent to your customers.
      </p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white">Enable ads on my invoices</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={isPending}
          onClick={toggle}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${
            enabled ? "bg-accent" : "bg-muted"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
