"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndBusiness } from "@/lib/business";

export async function saveEposNowKeyAction(
  apiKey: string
): Promise<{ ok: boolean; message?: string }> {
  const { user, business } = await getSessionAndBusiness();
  if (!user || !business) return { ok: false, message: "Not signed in." };

  const { error } = await createClient()
    .from("businesses")
    .update({ eposnow_api_key: apiKey.trim() || null })
    .eq("id", business.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setEposNowEnabledAction(
  enabled: boolean
): Promise<{ ok: boolean; message?: string }> {
  const { user, business } = await getSessionAndBusiness();
  if (!user || !business) return { ok: false, message: "Not signed in." };

  const { error } = await createClient()
    .from("businesses")
    .update({ eposnow_enabled: enabled })
    .eq("id", business.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
