import Link from "next/link";

const links = [
  { href: "/advertiser/dashboard", label: "Overview" },
  { href: "/advertiser/campaigns/new", label: "New campaign" },
];

export default function AdvertiserPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/advertiser/dashboard" className="text-lg font-bold tracking-tight text-white">
            AdConfirm <span className="font-normal text-muted-fg">Advertiser</span>
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
