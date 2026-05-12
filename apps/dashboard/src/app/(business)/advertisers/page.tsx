import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { Badge } from "../../../components/ui/Badge";

export const metadata: Metadata = { title: "Advertisers" };

export default async function AdvertisersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: advertisers } = await supabase
    .from("advertisers")
    .select("id, name, website_url, created_at");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Advertisers</h1>
        <p className="text-sm text-muted-fg mt-1">Browse advertisers in the AdConfirm network</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-white">Active Advertisers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Advertiser</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Website</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-xs text-muted-fg font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(advertisers ?? []).map((adv) => (
                <tr key={adv.id} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="px-5 py-3 font-medium text-white">{adv.name}</td>
                  <td className="px-5 py-3 text-xs text-muted-fg">
                    <a href={adv.website_url} target="_blank" rel="noopener noreferrer"
                       className="hover:text-white transition-colors">{adv.website_url}</a>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-fg">
                    {new Date(adv.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="active">Active</Badge>
                  </td>
                </tr>
              ))}
              {(!advertisers || advertisers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-fg">No advertisers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
