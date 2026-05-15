import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdvertiserForUser } from "@/lib/advertiser";
import { CreativeForm } from "./CreativeForm";

export default async function CampaignCreativePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { id: campaignId } = params;
  const err = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/advertiser/login");

  const advertiser = await getAdvertiserForUser(user);
  if (!advertiser) redirect("/advertiser/login");

  const { data: camp, error } = await supabase
    .from("ad_campaigns")
    .select("id, title, advertiser_id")
    .eq("id", campaignId)
    .single();

  if (error || !camp || camp.advertiser_id !== advertiser.id) {
    redirect("/advertiser/dashboard");
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/advertiser/dashboard" className="text-sm text-accent hover:underline">
          ← Overview
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Campaign creative</h1>
        <p className="mt-1 text-sm text-muted-fg">{camp.title}</p>
      </div>

      {err ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {err === "save" ? "Could not save creative." : "Headline and CTA URL are required."}
        </p>
      ) : null}

      <CreativeForm campaignId={campaignId} />
    </div>
  );
}
