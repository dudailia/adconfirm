import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";
import { DisconnectXeroButton } from "./DisconnectXeroButton";

function apiBaseUrl(): string {
  return process.env["NEXT_PUBLIC_API_URL"] ?? "https://adconfirm-api.onrender.com";
}

export default async function ConnectXeroPage() {
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

    const connected = Boolean(business.xero_tenant_id);
    const base = apiBaseUrl().replace(/\/$/, "");
    const connectHref = `${base}/auth/xero/connect?business_id=${encodeURIComponent(business.id)}`;

    return (
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← Back to overview
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Connect Xero</h1>
          <p className="mt-1 text-sm text-muted-fg">Link your Xero organisation to AdConfirm.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-muted-fg">Status</p>
          <p className={`mt-2 text-lg font-semibold ${connected ? "text-success" : "text-danger"}`}>
            {connected ? "Connected" : "Not connected"}
          </p>
          {connected && business.xero_tenant_id ? (
            <p className="mt-4 break-all text-sm text-muted-fg">
              Tenant ID:{" "}
              <span className="font-mono text-white">{String(business.xero_tenant_id)}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <a
            href={connectHref}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-accent-hover"
          >
            Connect Xero
          </a>
          {connected ? <DisconnectXeroButton /> : null}
        </div>
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
    console.error("connect-xero page fatal", err);
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
