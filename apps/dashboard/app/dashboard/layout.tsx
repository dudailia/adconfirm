import Link from "next/link";

export const dynamic = "force-dynamic";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/connect-xero", label: "Xero" },
  { href: "/dashboard/settings", label: "Ad settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
            AdConfirm
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted-fg transition hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
