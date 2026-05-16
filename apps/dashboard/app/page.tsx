import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!authErr && user) {
    redirect("/dashboard");
  }
  redirect("/login");
}
