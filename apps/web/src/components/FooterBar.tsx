import Link from "next/link";
import { LiveTimestamp } from "./ui/LiveTimestamp";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "For Businesses", href: "#for-businesses" },
      { label: "For Advertisers", href: "#for-advertisers" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "GDPR", href: "/gdpr" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function FooterBar() {
  return (
    <footer
      style={{
        background: "#02040A",
        borderTop: "1px solid var(--border)",
        padding: "64px clamp(20px, 4vw, 80px) 0",
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr repeat(3, auto)",
          gap: "clamp(32px, 4vw, 80px)",
          marginBottom: 48,
          flexWrap: "wrap" as const,
        }}
        className="flex flex-col md:grid"
      >
        {/* Logo + tagline */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--text-1)",
              marginBottom: 12,
            }}
          >
            AdConfirm
            <sup style={{ fontSize: 9, fontStyle: "normal", color: "var(--text-3)", marginLeft: 2 }}>™</sup>
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--text-3)",
              lineHeight: 1.6,
              maxWidth: 260,
            }}
          >
            The invoice advertising network. Built for businesses that send invoices and brands that want to reach them.
          </div>
        </div>

        {/* Nav columns */}
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "var(--text-3)",
                textTransform: "uppercase" as const,
                marginBottom: 16,
              }}
            >
              {col.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    color: "var(--text-2)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "20px 0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap" as const,
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--text-3)",
          }}
        >
          © 2024 AdConfirm Ltd. Registered in England and Wales.
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.05em",
            }}
          >
            current unix ms:
          </span>
          <LiveTimestamp />
        </div>
      </div>
    </footer>
  );
}
