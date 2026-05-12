import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { XeroSettingsClient } from "./XeroSettingsClient";

export const metadata: Metadata = { title: "Xero Connection" };

export default async function XeroSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, xero_tenant_id, xero_token_expiry")
    .eq("id", user.id)
    .single();

  if (!business) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Xero Connection</h1>
        <p className="text-sm text-muted-fg mt-1">Manage your Xero accounting integration</p>
      </div>
      <XeroSettingsClient business={business} />
    </div>
  );
}
