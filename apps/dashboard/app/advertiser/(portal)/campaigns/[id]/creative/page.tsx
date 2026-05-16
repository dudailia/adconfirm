import Link from "next/link";
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
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        <p>Sign in to edit campaign creative.</p>
        <Link href="/advertiser/login" className="mt-4 inline-block text-accent hover:underline">
          Advertiser login
        </Link>
      </div>
    );
  }

  const advertiser = await getAdvertiserForUser(user);
  if (!advertiser) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        <p>No advertiser profile for this account.</p>
        <Link href="/advertiser/login" className="mt-4 inline-block text-accent hover:underline">
          Advertiser login
        </Link>
      </div>
    );
  }

  const { data: camp, error } = await supabase
    .from("ad_campaigns")
    .select("id, title, advertiser_id")
    .eq("id", campaignId)
    .single();

  if (error || !camp || camp.advertiser_id !== advertiser.id) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-fg">
        <p>Campaign not found or you do not have access.</p>
        <Link href="/advertiser/dashboard" className="mt-4 inline-block text-accent hover:underline">
          Back to overview
        </Link>
      </div>
    );
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
