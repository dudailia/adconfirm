"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "../../../../lib/supabase/client";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import type { BusinessAdSettings } from "../../../../lib/types";

export function AdsSettingsClient({
  businessId,
  settings,
}: {
  businessId: string;
  settings: BusinessAdSettings | null;
}) {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [maxAds, setMaxAds] = useState(settings?.max_ads_per_receipt ?? 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const upsertData = {
      business_id: businessId,
      enabled,
      max_ads_per_receipt: maxAds,
      allowed_categories: settings?.allowed_categories ?? [],
      placement: settings?.placement ?? "after_total",
    };
    const { error } = settings
      ? await supabase.from("business_ad_settings").update(upsertData).eq("business_id", businessId)
      : await supabase.from("business_ad_settings").insert(upsertData);
    setSaving(false);
    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Enable ads on invoices</div>
            <div className="text-xs text-muted-fg mt-0.5">Show targeted ads to your invoice recipients</div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-medium text-white mb-1">Max ads per invoice</div>
        <div className="text-xs text-muted-fg mb-4">Limit how many ads can appear on a single invoice</div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={maxAds}
            onChange={(e) => setMaxAds(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #0066FF ${((maxAds - 1) / 2) * 100}%, #1E2D45 0%)` }}
          />
          <span className="font-mono text-white w-4 text-center">{maxAds}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-fg mt-1">
          <span>1</span><span>2</span><span>3</span>
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Save preferences</Button>
    </div>
  );
}
