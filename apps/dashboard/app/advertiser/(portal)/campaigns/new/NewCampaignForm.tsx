"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createCampaignAction, type CampaignActionState } from "./actions";

const CATEGORIES = [
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other", label: "Other" },
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
  const [dailyBudget, setDailyBudget] = useState("");

  useEffect(() => {
    if (state?.href) {
      window.location.href = state.href;
    }
  }, [state]);

  const budgetNum = parseFloat(dailyBudget);
  const impressionsPerDay =
    Number.isFinite(budgetNum) && budgetNum > 0
      ? Math.round((budgetNum / 2) * 1000).toLocaleString()
      : null;

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-border bg-surface p-6">
      {/* Campaign title */}
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

      {/* Daily budget */}
      <div>
        <label htmlFor="daily_budget_pounds" className="mb-1 block text-sm font-medium text-muted-fg">
          Daily budget (£) — minimum £5/day
        </label>
        <input
          id="daily_budget_pounds"
          name="daily_budget_pounds"
          type="number"
          min={5}
          step="0.01"
          required
          value={dailyBudget}
          onChange={(e) => setDailyBudget(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
        {impressionsPerDay ? (
          <p className="mt-1 text-xs text-muted-fg">
            ≈ {impressionsPerDay} impressions/day at £2 CPM
          </p>
        ) : null}
      </div>

      {/* Dates */}
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

      {/* Target categories */}
      <fieldset>
        <legend className="text-sm font-medium text-muted-fg">Target categories</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                name="industries"
                value={value}
                className="rounded border-border"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Target regions */}
      <fieldset>
        <legend className="text-sm font-medium text-muted-fg">Target regions</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {REGIONS.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                name="regions"
                value={id}
                className="rounded border-border"
              />
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
