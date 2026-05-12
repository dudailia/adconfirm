import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { BusinessSidebar } from "../../components/BusinessSidebar";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  if (!business) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <BusinessSidebar businessName={business.name} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
