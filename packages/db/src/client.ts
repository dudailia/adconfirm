import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createServerClient(
  supabaseUrl: string,
  serviceKey: string
) {
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export function createBrowserClient(
  supabaseUrl: string,
  anonKey: string
) {
  return createClient<Database>(supabaseUrl, anonKey);
}
