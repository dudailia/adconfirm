import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export async function getBusinessesWithEposNow(
  supabase: SupabaseClient<Database>
): Promise<Database["public"]["Tables"]["businesses"]["Row"][]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .not("eposnow_api_key", "is", null)
    .neq("eposnow_api_key", "")
    .eq("eposnow_enabled", true);

  if (error) {
    throw new Error(`getBusinessesWithEposNow: ${error.message}`);
  }

  return data ?? [];
}
