import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0D1629] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#0066FF] rounded-sm flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">AC</span>
              </div>
              <span className="font-semibold text-white tracking-tight">AdConfirm</span>
            </div>
            <p className="text-sm text-[#9AA5B4] max-w-xs">
              Built for businesses that send invoices.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[#9AA5B4]">
            {[
              { label: "How It Works", href: "/#how-it-works" },
              { label: "For Businesses", href: "/for-businesses" },
              { label: "For Advertisers", href: "/for-advertisers" },
              { label: "Pricing", href: "/pricing" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9AA5B4]">
          <span>© 2024 AdConfirm Ltd. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
