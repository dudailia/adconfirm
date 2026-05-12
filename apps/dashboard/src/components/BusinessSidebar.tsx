"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Settings, Users, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/advertisers", label: "Advertisers", Icon: Users },
  { href: "/settings/xero", label: "Xero Settings", Icon: Settings },
  { href: "/settings/ads", label: "Ad Preferences", Icon: Settings },
];

export function BusinessSidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface border-r border-border min-h-screen">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">AC</span>
          </div>
          <span className="font-semibold text-white text-sm">AdConfirm</span>
        </div>
        <div className="text-xs text-muted-fg mt-2 truncate">{businessName}</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-accent/10 text-white border border-accent/20"
                  : "text-muted-fg hover:text-white hover:bg-surface-2"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-white w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
