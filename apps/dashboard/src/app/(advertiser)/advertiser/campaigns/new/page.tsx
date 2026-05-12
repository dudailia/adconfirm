"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "../../../../../lib/supabase/client";
import { Input } from "../../../../../components/ui/Input";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";

const campaignSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  budget_cents: z.coerce.number().min(100, "Minimum budget is 100 pence (£1)"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});
type CampaignForm = z.infer<typeof campaignSchema>;

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Retail",
  "Manufacturing", "Professional Services", "Media", "Education",
];
const REGIONS = [
  "United Kingdom", "United States", "Europe",
  "Australia", "Canada", "Global",
];

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { start_date: new Date().toISOString().split("T")[0] },
  });

  const toggle = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const onSubmit = async (data: CampaignForm) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not authenticated"); return; }

    setLoading(true);
    const { data: campaign, error } = await supabase
      .from("ad_campaigns")
      .insert({
        advertiser_id: user.id,
        title: data.title,
        status: "draft",
        budget_cents: data.budget_cents,
        spent_cents: 0,
        start_date: data.start_date,
        end_date: data.end_date ?? null,
        target_industries: selectedIndustries,
        target_regions: selectedRegions,
      })
      .select()
      .single();
    setLoading(false);

    if (error || !campaign) {
      toast.error("Failed to create campaign");
      return;
    }
    toast.success("Campaign created");
    router.push(`/advertiser/campaigns/${campaign.id}/creative`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">New Campaign</h1>
        <p className="text-sm text-muted-fg mt-1">Set up your invoice advertising campaign</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
        <Card>
          <h2 className="text-sm font-medium text-white mb-4">Campaign Details</h2>
          <div className="space-y-4">
            <Input
              label="Campaign title"
              placeholder="e.g. Q4 Software Offer"
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Total budget (pence) — e.g. 10000 = £100"
              type="number"
              placeholder="10000"
              error={errors.budget_cents?.message}
              {...register("budget_cents")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start date"
                type="date"
                error={errors.start_date?.message}
                {...register("start_date")}
              />
              <Input
                label="End date (optional)"
                type="date"
                {...register("end_date")}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-white mb-1">Target Industries</h2>
          <p className="text-xs text-muted-fg mb-3">Leave empty to target all industries</p>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => toggle(selectedIndustries, setSelectedIndustries, ind)}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                  selectedIndustries.includes(ind)
                    ? "bg-accent/10 border-accent/40 text-white"
                    : "border-border text-muted-fg hover:border-white/20"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-white mb-1">Target Regions</h2>
          <p className="text-xs text-muted-fg mb-3">Leave empty to target all regions</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => toggle(selectedRegions, setSelectedRegions, reg)}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                  selectedRegions.includes(reg)
                    ? "bg-accent/10 border-accent/40 text-white"
                    : "border-border text-muted-fg hover:border-white/20"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create Campaign &amp; Add Creative →
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
