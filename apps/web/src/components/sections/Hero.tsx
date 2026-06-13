"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { GlowButton } from "../ui/GlowButton";
import { LiveTimestamp } from "../ui/LiveTimestamp";
import { SIGNUP_URL } from "../../lib/config";
import MeshBackground from "./MeshBackground";

const InvoiceMockup = dynamic(
  () => import("../InvoiceMockup").then((m) => ({ default: m.InvoiceMockup })),
  { ssr: false, loading: () => <div style={{ width: 400, height: 560 }} /> }
);

// Kinetic headline — each word fades + slides up, one by one.
type Word = { t: string; italic?: boolean; gold?: boolean };
const LINES: Word[][] = [
  [{ t: "Your", italic: true }, { t: "invoices.", italic: true }],
  [{ t: "Now" }, { t: "generating" }],
  [{ t: "revenue.", italic: true, gold: true }],
];

const EASE: [number, number, number, number] = [0.2, 0.65, 0.3, 0.9];

export default function Hero() {
  let order = 0; // global word index → staggered entrance

  return (
    <section
      data-section="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        padding: "120px clamp(20px, 4vw, 80px) 80px",
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #0A1020 0%, var(--bg) 70%)",
        overflow: "hidden",
      }}
    >
      <MeshBackground />

      <div
        style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1280, margin: "0 auto" }}
        className="hero-grid"
      >
        {/* LEFT */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border-glow)",
              background: "rgba(0,82,255,0.08)",
              borderRadius: 100,
              padding: "6px 14px",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "var(--accent-2)",
                textTransform: "uppercase",
              }}
            >
              ⬡ Invoice Advertising Network
            </span>
          </motion.div>

          {/* Kinetic H1 */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: 1.05,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            {LINES.map((line, li) => (
              <span key={li} style={{ display: "block" }}>
                {line.map((w) => {
                  const delay = 0.18 + order * 0.075;
                  order += 1;
                  return (
                    <motion.span
                      key={w.t + delay}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.6, ease: EASE }}
                      style={{
                        display: "inline-block",
                        marginRight: "0.28em",
                        fontStyle: w.italic ? "italic" : "normal",
                        color: w.gold ? "var(--gold)" : "var(--text-1)",
                        willChange: "transform, opacity",
                      }}
                    >
                      {w.t}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>

          {/* Subheadline — fades in after the headline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              color: "var(--text-2)",
              maxWidth: 480,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            AdConfirm places a targeted ad on every invoice you send — at the exact
            millisecond of document generation. Your customers see offers from relevant
            brands. You earn per placement. Nothing changes in your workflow.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}
          >
            <GlowButton href={SIGNUP_URL} variant="primary">
              Start Free →
            </GlowButton>
            <GlowButton href="#how-it-works" variant="ghost">
              See How It Works ↓
            </GlowButton>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{ display: "flex" }}>
              {["MK", "RS", "TA"].map((initials, i) => (
                <div
                  key={initials}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `hsl(${220 + i * 20}, 60%, 35%)`,
                    border: "2px solid var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "white",
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-3)" }}>
              Join 94 businesses earning from invoices
            </span>
          </motion.div>

          {/* Ambient timestamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            style={{ marginTop: 48 }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--text-3)",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              Last injection at
            </div>
            <LiveTimestamp
              style={{
                fontSize: 32,
                color: "var(--border)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
              }}
            />
          </motion.div>
        </div>

        {/* RIGHT — floating invoice mockup */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          className="hero-mockup-col flex justify-center"
        >
          <InvoiceMockup />
        </div>
      </div>
    </section>
  );
}
