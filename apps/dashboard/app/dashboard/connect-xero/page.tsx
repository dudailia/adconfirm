import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessForUser } from "@/lib/business";
import { DisconnectXeroButton } from "./DisconnectXeroButton";

function apiBaseUrl(): string {
  return process.env["NEXT_PUBLIC_API_URL"] ?? "https://adconfirm-api.onrender.com";
}

export default async function ConnectXeroPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getBusinessForUser(user);
  if (!business) redirect("/login");

  const connected = Boolean(business.xero_tenant_id);
  const connectHref = `${apiBaseUrl().replace(/\/$/, "")}/auth/xero/connect?business_id=${business.id}`;

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
            <span className="font-mono text-white">{business.xero_tenant_id}</span>
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
}
