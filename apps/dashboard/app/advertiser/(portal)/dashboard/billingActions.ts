"use server";

import { getSessionAndAdvertiser } from "@/lib/advertiser";
import { createClient } from "@/lib/supabase/server";

export async function submitBillingInterestAction(
  contactEmail: string
): Promise<{ ok: boolean; message?: string }> {
  const { advertiser } = await getSessionAndAdvertiser();
  if (!advertiser) {
    return { ok: false, message: "Not signed in." };
  }

  const email = contactEmail.trim();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("advertiser_billing_interest").insert({
    advertiser_id: advertiser.id,
    contact_email: email,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
