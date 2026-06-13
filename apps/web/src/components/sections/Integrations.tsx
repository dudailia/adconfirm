import { SectionReveal } from "../ui/SectionReveal";

// CSS/SVG-only brand marks (no images). Each row scrolls on an infinite
// marquee; the two rows run in opposite directions. Pause-on-hover and
// reduced-motion are handled in globals.css.

type Brand = { name: string; mark: string; color: string };

const ROW_A: Brand[] = [
  { name: "Xero", mark: "✕", color: "#13B5EA" },
  { name: "QuickBooks", mark: "qb", color: "#2CA01C" },
  { name: "FreeAgent", mark: "fa", color: "#4895EF" },
  { name: "Sage", mark: "§", color: "#00D639" },
];

const ROW_B: Brand[] = [
  { name: "Shopify", mark: "S", color: "#95BF47" },
  { name: "Square", mark: "▢", color: "#E2E2E2" },
  { name: "Zettle", mark: "Z", color: "#FF5A5F" },
  { name: "Stripe", mark: "S", color: "#635BFF" },
];

function LogoCard({ brand }: { brand: Brand }) {
  return (
    <div
      className="glass"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 24px",
        borderRadius: 12,
        minWidth: 220,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}99 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          fontWeight: 700,
          color: brand.color === "#E2E2E2" ? "#04070F" : "#ffffff",
          boxShadow: `0 0 18px ${brand.color}44`,
          flexShrink: 0,
        }}
      >
        {brand.mark}
      </div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
        {brand.name}
      </span>
    </div>
  );
}

function Row({ brands, reverse }: { brands: Brand[]; reverse?: boolean }) {
  const loop = [...brands, ...brands, ...brands, ...brands];
  return (
    <div className="marquee-row" style={{ overflow: "hidden", position: "relative" }}>
      <div
        className="marquee-track"
        style={{
          display: "flex",
          gap: 18,
          width: "max-content",
          animation: `${reverse ? "marqueeRev" : "marquee"} ${reverse ? 46 : 40}s linear infinite`,
        }}
      >
        {loop.map((b, i) => (
          <LogoCard key={`${b.name}-${i}`} brand={b} />
        ))}
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <section
      data-section="integrations"
      style={{ padding: "100px 0", background: "var(--bg)", overflow: "hidden" }}
    >
      <SectionReveal>
        <div style={{ textAlign: "center", maxWidth: 1280, margin: "0 auto 48px", padding: "0 clamp(20px, 4vw, 80px)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--accent)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Integrations
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 3.6vw, 48px)",
              color: "var(--text-1)",
              lineHeight: 1.12,
            }}
          >
            Works with every system you already use.
          </h2>
        </div>
      </SectionReveal>

      {/* Edge-faded marquee viewport */}
      <div
        style={{
          position: "relative",
          maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Row brands={ROW_A} />
        <Row brands={ROW_B} reverse />
      </div>
    </section>
  );
}
