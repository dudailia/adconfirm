import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AdvertiserSidebar } from "../../components/AdvertiserSidebar";

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id, name")
    .eq("id", user.id)
    .single();

  if (!advertiser) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <AdvertiserSidebar advertiserName={advertiser.name} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
