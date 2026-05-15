"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndBusiness } from "@/lib/business";

export async function updateAdsEnabled(
  enabled: boolean
): Promise<{ ok: boolean; message?: string }> {
  const supabase = createClient();
  const { user, business } = await getSessionAndBusiness();
  if (!user || !business) {
    return { ok: false, message: "Not signed in or no business linked." };
  }

  const { error } = await supabase.from("business_ad_settings").upsert(
    {
      business_id: business.id,
      enabled,
      placement: "after_total",
      max_ads_per_receipt: 1,
      allowed_categories: [],
    },
    { onConflict: "business_id" }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
