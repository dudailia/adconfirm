"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { createCampaignAction, type CampaignActionState } from "./actions";

const INDUSTRIES = [
  "technology",
  "finance",
  "legal",
  "healthcare",
  "retail",
  "hospitality",
  "other",
] as const;

const REGIONS = [
  "UK",
  "London",
  "Manchester",
  "Birmingham",
  "Edinburgh",
  "Dublin",
  "other",
] as const;

export function NewCampaignForm() {
  const [state, formAction] = useFormState(createCampaignAction, null as CampaignActionState);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-border bg-surface p-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-muted-fg">
          Campaign title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="budget_pounds" className="mb-1 block text-sm font-medium text-muted-fg">
          Budget (£)
        </label>
        <input
          id="budget_pounds"
          name="budget_pounds"
          type="number"
          min={0}
          step="0.01"
          required
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="mb-1 block text-sm font-medium text-muted-fg">
            Start date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-muted-fg">
            End date <span className="font-normal">(optional)</span>
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-muted-fg">Target industries</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {INDUSTRIES.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm text-white capitalize">
              <input type="checkbox" name="industries" value={id} className="rounded border-border" />
              {id}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium text-muted-fg">Target regions</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {REGIONS.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" name="regions" value={id} className="rounded border-border" />
              {id}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        Continue to creative
      </button>
    </form>
  );
}
