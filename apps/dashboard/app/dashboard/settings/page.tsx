import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";
import { AdsToggle } from "./AdsToggle";

export default async function SettingsPage() {
  try {
    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (authErr || !user) {
      redirect("/login");
    }

    const business = await getBusinessForUser(user);
    if (!business?.id) {
      return (
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
          No business profile found for this account. Your email must match{" "}
          <code className="text-accent">businesses.email</code>.
        </div>
      );
    }

    const { data: settings, error: settingsErr } = await supabase
      .from("business_ad_settings")
      .select("enabled")
      .eq("business_id", business.id)
      .maybeSingle();

    if (settingsErr) {
      console.error("settings: business_ad_settings", settingsErr.message);
    }

    const enabled = typeof settings?.enabled === "boolean" ? settings.enabled : true;

    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← Back to overview
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Ad preferences</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Control how ads appear on your outbound invoices.
          </p>
        </div>
        {settingsErr ? (
          <p className="text-sm text-danger">
            Could not load ad settings ({settingsErr.message}). Toggle may not save until this is fixed.
          </p>
        ) : null}
        <AdsToggle initialEnabled={enabled} />
      </div>
    );
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    console.error("settings page fatal", err);
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-white">Something went wrong</p>
        <p className="mt-2 text-sm text-muted-fg">Please try again or return to the dashboard.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-accent hover:underline">
          Back to overview
        </Link>
      </div>
    );
  }
}
