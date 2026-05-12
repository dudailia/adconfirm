"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plug, Zap, TrendingUp, Check, ArrowRight } from "lucide-react";
import { NavigationBar } from "../components/NavigationBar";
import { InvoiceMockup } from "../components/InvoiceMockup";
import { EarningsCalculator } from "../components/EarningsCalculator";
import { TickerBar } from "../components/TickerBar";
import { FooterBar } from "../components/FooterBar";
import { GlowButton } from "../components/ui/GlowButton";
import { SectionReveal } from "../components/ui/SectionReveal";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { LiveTimestamp } from "../components/ui/LiveTimestamp";

// ─── SVG Grid Background ─────────────────────────────────────────────────
function GridBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.4 }}
      >
        <defs>
          <radialGradient id="grid-fade" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
          <pattern id="grid-pat" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A2540" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pat)" mask="url(#grid-mask)" />
      </svg>
    </div>
  );
}

// ─── Animated connecting line between How-It-Works cards ─────────────────
function FlowLine() {
  return (
    <div
      style={{
        position: "absolute",
        top: "28px",
        left: "calc(33.33% - 20px)",
        width: "calc(33.33% + 40px)",
        height: "2px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
      className="hidden lg:block"
    >
      <svg width="100%" height="2" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="#0052FF"
          strokeWidth="1"
          strokeDasharray="6 6"
          opacity="0.4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-12"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
    </div>
  );
}

// ─── Inline code block for the Timestamp section ─────────────────────────
function CodeBlock() {
  return (
    <div
      style={{
        background: "#02040A",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "20px 24px",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        lineHeight: 1.8,
        overflowX: "auto",
      }}
    >
      <div style={{ color: "var(--text-3)" }}>{"// processor.ts — AdConfirm core"}</div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "#569CD6" }}>const</span>
        <span style={{ color: "var(--text-1)" }}> injected_at</span>
        <span style={{ color: "#9CDCFE" }}> = </span>
        <span style={{ color: "#569CD6" }}>new </span>
        <span style={{ color: "#4EC9B0" }}>Date</span>
        <span style={{ color: "var(--text-2)" }}>();</span>
        <span style={{ color: "var(--text-3)" }}>{"         // ← FISCAL DOCUMENT MOMENT"}</span>
      </div>
      <div>
        <span style={{ color: "#569CD6" }}>const</span>
        <span style={{ color: "var(--text-1)" }}> injection_unix_ms</span>
        <span style={{ color: "#9CDCFE" }}> = </span>
        <span style={{ color: "#4EC9B0" }}>Date</span>
        <span style={{ color: "var(--text-2)" }}>.now();</span>
        <span style={{ color: "var(--text-3)" }}>{"  // "}</span>
        <LiveTimestamp />
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ color: "#C8C8C8" }}>{"await "}</span>
        <span style={{ color: "var(--text-1)" }}>db</span>
        <span style={{ color: "#9CDCFE" }}>.createPlacement({"{"}</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: "#9CDCFE" }}>receipt_id,</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: "#9CDCFE" }}>ad_creative_id,</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: "#9CDCFE" }}>injected_at,</span>
        <span style={{ color: "var(--text-3)" }}>{"        // ISO timestamp"}</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: "#9CDCFE" }}>injection_unix_ms,</span>
        <span style={{ color: "var(--text-3)" }}>{"  // ms precision"}</span>
      </div>
      <div>
        <span style={{ color: "var(--text-2)" }}>{"})"}</span>
        <span style={{ color: "var(--text-3)" }}>;</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)", overflowX: "hidden" }}>
      <NavigationBar />

      {/* ══════════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════════ */}
      <section
        data-section="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          padding: "120px clamp(20px, 4vw, 80px) 80px",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, #0A1020 0%, var(--bg) 70%)",
        }}
      >
        <GridBackground />

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "55fr 45fr",
            gap: 64,
            alignItems: "center",
          }}
          className="grid-cols-1 lg:grid-cols-[55fr_45fr]"
        >
          {/* LEFT */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
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
                  textTransform: "uppercase" as const,
                }}
              >
                ⬡ Invoice Advertising Network
              </span>
            </motion.div>

            {/* H1 */}
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 6vw, 80px)",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              {[
                { text: "Your invoices.", italic: true, color: "var(--text-1)" },
                { text: "Now generating", italic: false, color: "var(--text-1)" },
                { text: "revenue.", italic: true, color: "var(--gold)" },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    display: "block",
                    fontStyle: line.italic ? "italic" : "normal",
                    color: line.color,
                  }}
                >
                  {line.text}
                </motion.div>
              ))}
            </div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 28 }}
            >
              <GlowButton href="http://localhost:4000/auth/xero/connect" variant="primary">
                Connect Xero — Start Earning
              </GlowButton>
              <GlowButton href="#how-it-works" variant="ghost">
                See How It Works ↓
              </GlowButton>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
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
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--text-3)",
                }}
              >
                Join 94 businesses earning from invoices
              </span>
            </motion.div>

            {/* Ambient timestamp */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: 48 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--text-3)",
                  marginBottom: 4,
                  textTransform: "uppercase" as const,
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

          {/* RIGHT — Invoice mockup */}
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            className="hidden lg:flex"
          >
            <InvoiceMockup />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2: TICKER BAR
      ══════════════════════════════════════════ */}
      <TickerBar />

      {/* ══════════════════════════════════════════
          SECTION 3: HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        data-section="how-it-works"
        style={{
          padding: "120px clamp(20px, 4vw, 80px)",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <SectionReveal>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "var(--accent)",
                textTransform: "uppercase" as const,
              }}
            >
              How It Works
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 4vw, 52px)",
              color: "var(--text-1)",
              marginBottom: 56,
              lineHeight: 1.1,
            }}
          >
            Three steps. Zero friction.
          </h2>
        </SectionReveal>

        <div style={{ position: "relative" }}>
          <FlowLine />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
            className="grid grid-cols-1 lg:grid-cols-3"
          >
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Plug size={22} color="var(--accent)" />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                01 —
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: 12,
                }}
              >
                Connect
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Connect your Xero account. Takes 60 seconds. AdConfirm registers
                as a delivery agent for your invoices.
              </p>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--accent-2)",
                  letterSpacing: "0.05em",
                }}
              >
                OAuth 2.0 secure
              </span>
            </motion.div>

            {/* Card 2 — FEATURED */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                background: "var(--bg-2)",
                border: "1px solid rgba(0,82,255,0.5)",
                borderRadius: 12,
                padding: 28,
                boxShadow: "0 0 30px rgba(0,82,255,0.1)",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,82,255,0.3)",
                  background: "rgba(0,82,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Zap size={22} color="var(--accent)" />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--accent)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                02 —
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: 12,
                }}
              >
                Ad injected at the millisecond
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                At the instant your invoice is generated, AdConfirm injects a
                relevant ad below your fiscal close line. The timestamp is logged
                permanently.
              </p>
              <LiveTimestamp />
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <TrendingUp size={22} color="var(--success)" />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                03 —
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: 12,
                }}
              >
                Earn
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Every successful placement earns you money. View real-time
                earnings in your dashboard. Monthly payouts, no minimums.
              </p>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--success)",
                }}
              >
                500 invoices/mo →{" "}
                <AnimatedCounter from={0} to={40} duration={1.5} prefix="£" suffix="/mo avg" />
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4: THE TIMESTAMP SECTION
      ══════════════════════════════════════════ */}
      <section
        id="timestamp"
        data-section="timestamp"
        style={{
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "120px clamp(20px, 4vw, 80px)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left */}
          <SectionReveal>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "var(--accent)",
                  textTransform: "uppercase" as const,
                  marginBottom: 16,
                }}
              >
                The Patent-Critical Mechanism
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 3.5vw, 48px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                Logged at the millisecond. Every time.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                The moment an ad is injected is captured as a Unix timestamp with
                millisecond precision — simultaneous with document generation. This
                creates an immutable, verifiable record linking every placement to
                every document.
              </p>
              <CodeBlock />
            </div>
          </SectionReveal>

          {/* Right — stat cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                value: "< 2ms",
                label: "avg injection latency",
                color: "var(--accent)",
                mono: true,
              },
              {
                value: "100%",
                label: "of placements timestamped",
                color: "var(--success)",
                mono: true,
              },
              {
                value: "∞",
                label: "audit trail retention",
                color: "var(--gold)",
                mono: true,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 40,
                    fontWeight: 700,
                    color: stat.color,
                    lineHeight: 1,
                    minWidth: 100,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    color: "var(--text-2)",
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5: FOR BUSINESSES
      ══════════════════════════════════════════ */}
      <section
        id="for-businesses"
        data-section="for-businesses"
        style={{
          background: "var(--bg-2)",
          padding: "120px clamp(20px, 4vw, 80px)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "start",
          }}
          className="grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left — Calculator */}
          <EarningsCalculator />

          {/* Right */}
          <SectionReveal>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "var(--accent)",
                  textTransform: "uppercase" as const,
                  marginBottom: 16,
                }}
              >
                For Businesses
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3vw, 42px)",
                  color: "var(--text-1)",
                  lineHeight: 1.15,
                  marginBottom: 20,
                }}
              >
                Your invoice stack is a media channel. It just doesn&apos;t know it yet.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                Every invoice you send is opened. The total is read. The payment
                is made. That moment of financial attention — that&apos;s where
                AdConfirm lives.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {[
                  "Xero-native — no new software, no new workflow",
                  "Choose your advertisers — approve or block any brand",
                  "Real-time dashboard — see earnings as placements happen",
                  "Cancel anytime — disconnect in one click",
                ].map((feat) => (
                  <div key={feat} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={16} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--text-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
              <GlowButton href="http://localhost:4000/auth/xero/connect" variant="gold">
                Start Earning From Your Invoices →
              </GlowButton>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6: FOR ADVERTISERS
      ══════════════════════════════════════════ */}
      <section
        id="for-advertisers"
        data-section="for-advertisers"
        style={{
          background: "var(--bg)",
          padding: "120px clamp(20px, 4vw, 80px)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionReveal>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 5vw, 60px)",
                color: "var(--text-1)",
                lineHeight: 1.1,
                maxWidth: 900,
                margin: "0 auto 64px",
              }}
            >
              Reach buyers at the{" "}
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>exact moment</em>
              {" "}they spend money.
            </h2>
          </SectionReveal>

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 48,
            }}
            className="grid grid-cols-1 lg:grid-cols-3"
          >
            {[
              {
                stat: "40%+",
                label: "Invoice open rates",
                sub: "vs 3% for email marketing",
              },
              {
                stat: "Purchase moment",
                label: "Highest-intent B2B document",
                sub: "After the total. After they&apos;ve committed.",
              },
              {
                stat: "CPM pricing",
                label: "No commitments, no minimums",
                sub: "Launch a campaign in 5 minutes",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "28px 24px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--text-1)",
                    marginBottom: 8,
                    lineHeight: 1.2,
                  }}
                >
                  {item.stat}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    color: "var(--text-1)",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "var(--text-3)",
                  }}
                  dangerouslySetInnerHTML={{ __html: item.sub }}
                />
              </motion.div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              color: "var(--text-2)",
              maxWidth: 600,
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}
          >
            Your ad doesn&apos;t appear in a feed. It appears on a financial document
            — the one document every recipient reads completely. After the total.
            After they&apos;ve committed.
          </p>
          <GlowButton href="/for-advertisers" variant="primary">
            Launch a Campaign →
          </GlowButton>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7: SOCIAL PROOF / INTEGRATIONS
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: "64px clamp(20px, 4vw, 80px)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-2)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "var(--text-3)",
              textTransform: "uppercase" as const,
              marginBottom: 32,
            }}
          >
            Works with the tools you already use
          </p>
          <div
            style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
              flexWrap: "wrap" as const,
              alignItems: "center",
            }}
          >
            {["Xero", "Epos Now", "Stripe", "QuickBooks", "Shopify"].map((brand) => (
              <span
                key={brand}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-3)",
                  letterSpacing: "-0.02em",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-1)";
                  (e.target as HTMLElement).style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-3)";
                  (e.target as HTMLElement).style.transform = "scale(1)";
                }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8: PRICING
      ══════════════════════════════════════════ */}
      <section
        id="pricing"
        data-section="pricing"
        style={{ padding: "120px clamp(20px, 4vw, 80px)" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "var(--accent)",
                  textTransform: "uppercase" as const,
                  marginBottom: 16,
                }}
              >
                Pricing
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 4vw, 52px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                }}
              >
                Simple. Aligned with your success.
              </h2>
            </div>
          </SectionReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              maxWidth: 900,
              margin: "0 auto",
            }}
            className="grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Business card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "36px 32px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--text-3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  marginBottom: 12,
                }}
              >
                For Businesses
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 64,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                £0
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-3)",
                  marginBottom: 28,
                }}
              >
                We earn when you earn
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Connect unlimited Xero accounts",
                  "Full advertiser marketplace access",
                  "Real-time earnings dashboard",
                  "70% revenue share on placements",
                  "No monthly fee, ever",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={14} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--text-2)",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <GlowButton href="http://localhost:4000/auth/xero/connect" variant="gold" className="w-full justify-center">
                Join Free →
              </GlowButton>
            </motion.div>

            {/* Advertiser card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                background: "var(--bg-2)",
                border: "1px solid rgba(0,82,255,0.4)",
                borderRadius: 16,
                padding: "36px 32px",
                boxShadow: "0 0 40px rgba(0,82,255,0.08)",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--accent)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  marginBottom: 12,
                }}
              >
                For Advertisers
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 64,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                £0.10
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-3)",
                  marginBottom: 28,
                }}
              >
                per 1,000 impressions (CPM)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "No minimum spend",
                  "Industry + region targeting",
                  "QR code + link tracking",
                  "Real-time campaign analytics",
                  "Launch in under 5 minutes",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--text-2)",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <GlowButton href="/for-advertisers" variant="primary" className="w-full justify-center">
                Launch Campaign →
              </GlowButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9: FINAL CTA
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 100%, #0A1428 0%, var(--bg) 70%)",
          padding: "120px clamp(20px, 4vw, 80px) 140px",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <SectionReveal>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 5vw, 64px)",
                color: "var(--text-1)",
                lineHeight: 1.05,
                marginBottom: 20,
              }}
            >
              Start earning from your next invoice.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 18,
                color: "var(--text-2)",
                marginBottom: 36,
                lineHeight: 1.6,
              }}
            >
              Connect Xero in 60 seconds. First placement free. No credit card.
            </p>
            <GlowButton
              href="http://localhost:4000/auth/xero/connect"
              variant="primary"
              style={{ padding: "16px 40px", fontSize: 16 }}
            >
              Connect Xero Now →
            </GlowButton>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-3)",
                marginTop: 20,
                letterSpacing: "0.05em",
              }}
            >
              SOC 2 in progress · GDPR compliant · UK-based
            </div>
          </SectionReveal>
        </div>
      </section>

      <FooterBar />
    </main>
  );
}
