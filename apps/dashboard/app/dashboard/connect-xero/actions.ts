"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndBusiness } from "@/lib/business";

export async function disconnectXeroAction(): Promise<{ ok: boolean; message?: string }> {
  const supabase = createClient();
  const { user, business } = await getSessionAndBusiness();
  if (!user || !business) {
    return { ok: false, message: "Not signed in or no business linked." };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      xero_tenant_id: null,
      xero_access_token: null,
      xero_refresh_token: null,
      xero_token_expiry: null,
    })
    .eq("id", business.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/connect-xero");
  return { ok: true };
}
