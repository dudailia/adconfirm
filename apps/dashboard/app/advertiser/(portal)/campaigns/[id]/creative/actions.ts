"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndAdvertiser } from "@/lib/advertiser";

export async function createCreativeAction(formData: FormData): Promise<void> {
  const campaignId = String(formData.get("campaign_id") ?? "").trim();
  if (!campaignId) {
    redirect("/advertiser/dashboard");
  }

  const { user, advertiser } = await getSessionAndAdvertiser();
  if (!user || !advertiser) {
    redirect("/advertiser/login");
  }

  const supabase = createClient();
  const { data: camp, error: campErr } = await supabase
    .from("ad_campaigns")
    .select("id, advertiser_id")
    .eq("id", campaignId)
    .single();

  if (campErr || !camp || camp.advertiser_id !== advertiser.id) {
    redirect("/advertiser/dashboard");
  }

  const headline = String(formData.get("headline") ?? "")
    .trim()
    .slice(0, 60);
  const body_text = String(formData.get("body_text") ?? "").trim().slice(0, 120);
  const cta_text = String(formData.get("cta_text") ?? "").trim() || "Learn More";
  const cta_url = String(formData.get("cta_url") ?? "").trim();

  if (!headline || !cta_url) {
    redirect(`/advertiser/campaigns/${campaignId}/creative?error=invalid`);
  }

  const { error } = await supabase.from("ad_creatives").insert({
    campaign_id: campaignId,
    headline,
    body_text: body_text.length > 0 ? body_text : null,
    cta_text,
    cta_url,
  });

  if (error) {
    redirect(`/advertiser/campaigns/${campaignId}/creative?error=save`);
  }

  revalidatePath("/advertiser/dashboard");
  revalidatePath(`/advertiser/campaigns/${campaignId}`);
  redirect(`/advertiser/campaigns/${campaignId}`);
}
