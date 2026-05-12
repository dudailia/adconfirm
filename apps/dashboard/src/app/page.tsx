import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", user.id)
    .single();

  if (business) redirect("/dashboard");

  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id")
    .eq("id", user.id)
    .single();

  if (advertiser) redirect("/advertiser/dashboard");

  redirect("/login");
}
