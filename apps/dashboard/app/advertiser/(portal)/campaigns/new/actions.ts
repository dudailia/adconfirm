"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndAdvertiser } from "@/lib/advertiser";

export async function createCampaignAction(formData: FormData): Promise<void> {
  const { user, advertiser } = await getSessionAndAdvertiser();
  if (!user || !advertiser) {
    redirect("/advertiser/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const budgetRaw = Number(formData.get("budget_pounds"));
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDateRaw = String(formData.get("end_date") ?? "").trim();
  const industries = formData.getAll("industries").map(String);
  const regions = formData.getAll("regions").map(String);

  if (!title || !Number.isFinite(budgetRaw) || budgetRaw < 0 || !startDate) {
    redirect("/advertiser/campaigns/new?error=invalid");
  }

  const endDate = endDateRaw.length > 0 ? endDateRaw : null;
  if (endDate && endDate < startDate) {
    redirect("/advertiser/campaigns/new?error=dates");
  }

  const budget_cents = Math.round(budgetRaw * 100);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .insert({
      advertiser_id: advertiser.id,
      title,
      status: "draft",
      budget_cents,
      spent_cents: 0,
      start_date: startDate,
      end_date: endDate,
      target_industries: industries,
      target_regions: regions,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect("/advertiser/campaigns/new?error=save");
  }

  revalidatePath("/advertiser/dashboard");
  redirect(`/advertiser/campaigns/${data.id}/creative`);
}
