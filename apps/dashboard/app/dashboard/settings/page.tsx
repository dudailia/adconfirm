import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";
import { AdsToggle } from "./AdsToggle";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getBusinessForUser(user);
  if (!business) redirect("/login");

  const { data: settings } = await supabase
    .from("business_ad_settings")
    .select("enabled")
    .eq("business_id", business.id)
    .maybeSingle();

  const enabled = settings?.enabled ?? true;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          ← Back to overview
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Ad preferences</h1>
        <p className="mt-1 text-sm text-muted-fg">Control how ads appear on your outbound invoices.</p>
      </div>
      <AdsToggle initialEnabled={enabled} />
    </div>
  );
}
