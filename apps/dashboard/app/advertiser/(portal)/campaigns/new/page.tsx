import Link from "next/link";
import { NewCampaignForm } from "./NewCampaignForm";

export default function NewCampaignPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const err = typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/advertiser/dashboard" className="text-sm text-accent hover:underline">
          ← Back to overview
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Create campaign</h1>
        <p className="mt-1 text-sm text-muted-fg">Define targeting and budget, then add your creative.</p>
      </div>

      {err ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {err === "dates"
            ? "End date must be on or after the start date."
            : err === "save"
              ? "Could not save campaign. Check permissions and try again."
              : "Please check all required fields."}
        </p>
      ) : null}

      <NewCampaignForm />
    </div>
  );
}
