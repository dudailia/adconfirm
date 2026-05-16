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
  try {
    const supabase = createClient();
    const email = user.email?.trim();
    if (email) {
      const { data: byEmail, error: emailErr } = await supabase
        .from("businesses")
        .select("*")
        .ilike("email", email)
        .maybeSingle();
      if (emailErr) {
        console.error("getBusinessForUser: email lookup failed", emailErr.message);
      } else if (byEmail) {
        return byEmail;
      }
    }
    const { data: byId, error: idErr } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (idErr) {
      console.error("getBusinessForUser: id lookup failed", idErr.message);
      return null;
    }
    return byId ?? null;
  } catch (err) {
    console.error("getBusinessForUser: unexpected error", err);
    return null;
  }
}

export async function getSessionAndBusiness(): Promise<{
  user: User | null;
  business: BusinessRow | null;
}> {
  try {
    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error("getSessionAndBusiness: auth.getUser error", authErr.message);
      return { user: null, business: null };
    }
    const user = authData?.user ?? null;
    if (!user) {
      return { user: null, business: null };
    }
    const business = await getBusinessForUser(user);
    return { user, business };
  } catch (err) {
    console.error("getSessionAndBusiness: unexpected error", err);
    return { user: null, business: null };
  }
}
