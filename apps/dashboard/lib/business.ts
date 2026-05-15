import type { User } from "@supabase/supabase-js";
import type { Database } from "@adconfirm/db";
import { createClient } from "./supabase/server";

export type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

/**
 * Resolve the signed-in user's business row.
 * Prefer matching `businesses.email` to `auth.user.email` (per product model);
 * fall back to `businesses.id === auth.user.id` when the row id is the auth UUID.
 */
export async function getBusinessForUser(user: User): Promise<BusinessRow | null> {
  const supabase = createClient();
  const email = user.email?.trim();
  if (email) {
    const { data: byEmail } = await supabase
      .from("businesses")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (byEmail) return byEmail;
  }
  const { data: byId } = await supabase.from("businesses").select("*").eq("id", user.id).maybeSingle();
  return byId;
}

export async function getSessionAndBusiness(): Promise<{
  user: User | null;
  business: BusinessRow | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, business: null };
  const business = await getBusinessForUser(user);
  return { user, business };
}
