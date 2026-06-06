"use client";

import { useState } from "react";
import { submitBillingInterestAction } from "./billingActions";

export function BillingModal({ contactEmail }: { contactEmail: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(contactEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitBillingInterestAction(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.message ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setSubmitted(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-4 py-2 text-sm font-semibold transition"
        style={{ background: "#FFB800", color: "#0D0A00" }}
      >
        Add Payment Method
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center">
                <div className="mb-3 text-3xl">✓</div>
                <h2 className="text-lg font-bold text-white">Request received</h2>
                <p className="mt-2 text-sm text-muted-fg">
                  We&apos;ll be in touch within 24 hours to set up your billing.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-2 text-lg font-bold text-white">Set up billing</h2>
                <p className="mb-6 text-sm text-muted-fg">
                  We&apos;ll contact you within 24 hours to set up your payment method and
                  activate your campaigns.
                </p>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="billing-email"
                      className="mb-1 block text-sm font-medium text-muted-fg"
                    >
                      Contact email
                    </label>
                    <input
                      id="billing-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
                    />
                  </div>
                  {error ? <p className="text-sm text-danger">{error}</p> : null}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-fg transition hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
                    >
                      {loading ? "Submitting…" : "Submit request"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
