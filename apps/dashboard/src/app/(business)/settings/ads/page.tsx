import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { AdsSettingsClient } from "./AdsSettingsClient";

export const metadata: Metadata = { title: "Ad Preferences" };

export default async function AdsSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("business_ad_settings")
    .select("*")
    .eq("business_id", user.id)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Ad Preferences</h1>
        <p className="text-sm text-muted-fg mt-1">Control how ads appear on your invoices</p>
      </div>
      <AdsSettingsClient businessId={user.id} settings={settings ?? null} />
    </div>
  );
}
