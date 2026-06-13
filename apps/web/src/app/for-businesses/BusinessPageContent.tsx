"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Plug, UserCheck, Shield, BarChart3 } from "lucide-react";
import { GlowButton } from "../../components/ui/GlowButton";
import { SectionReveal } from "../../components/ui/SectionReveal";

const EarningsCalculator = dynamic(
  () =>
    import("../../components/EarningsCalculator").then((m) => ({
      default: m.EarningsCalculator,
    })),
  { ssr: false, loading: () => <div style={{ height: 320 }} /> }
);

const STEPS = [
  {
    num: "01",
    Icon: Plug,
    title: "Create a free account",
    desc: "Sign up with your business email. Takes 30 seconds. No credit card required.",
    tag: "Free forever",
    tagColor: "var(--success)",
  },
  {
    num: "02",
    Icon: UserCheck,
    title: 'Click "Connect Xero"',
    desc: 'From your dashboard, click the "Connect Xero" button. You\'ll be redirected to Xero\'s authorisation screen.',
    tag: "OAuth 2.0",
    tagColor: "var(--accent-2)",
  },
  {
    num: "03",
    Icon: Shield,
    title: "Authorise in Xero",
    desc: "Grant AdConfirm access to your invoices. We only request read access to invoice data — we cannot modify your Xero records.",
    tag: "Read-only access",
    tagColor: "var(--accent)",
  },
  {
    num: "04",
    Icon: BarChart3,
    title: "Choose advertisers, go live",
    desc: "Browse the advertiser marketplace. Approve categories or specific brands. Your first placement goes live on your next invoice.",
    tag: "Instant activation",
    tagColor: "var(--gold)",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Whitfield",
    company: "Whitfield & Partners Design",
    location: "Manchester, UK",
    quote:
      "We send about 200 invoices a month. AdConfirm adds roughly £20 to that — without us doing anything. Tiny number, but it just works in the background.",
    invoices: "~200/mo",
  },
  {
    name: "James Okoro",
    company: "Okoro Legal Consulting",
    location: "London, UK",
    quote:
      "My clients are CFOs and finance directors. I was worried about how they'd react. Actually, two of them asked me which ad platform I was using. They want to advertise on it.",
    invoices: "~80/mo",
  },
  {
    name: "Rachel Thorn",
    company: "Thorn Marketing Agency",
    location: "Bristol, UK",
    quote:
      "The setup was genuinely 60 seconds. I was sceptical but clicked Connect Xero almost as a test. Saw my first placement the next morning.",
    invoices: "~350/mo",
  },
];

const FEATURES = [
  { icon: "⚡", title: "Xero-native", desc: "No middleware, no additional software. Pure OAuth integration." },
  { icon: "🎯", title: "Choose your advertisers", desc: "Approve or block any advertiser or category at any time." },
  { icon: "📊", title: "Real-time dashboard", desc: "See every placement, click, and earned penny as it happens." },
  { icon: "🔒", title: "You stay in control", desc: "Toggle ads off, set per-invoice limits, disconnect instantly." },
];

export function BusinessPageContent() {
  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          padding: "140px clamp(20px, 4vw, 80px) 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 30% 0%, rgba(0,82,255,0.06) 0%, var(--bg) 70%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--accent)",
              textTransform: "uppercase" as const,
              marginBottom: 20,
            }}
          >
            For Businesses
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(38px, 5vw, 68px)",
              lineHeight: 1.05,
              color: "var(--text-1)",
              maxWidth: 780,
              marginBottom: 24,
            }}
          >
            Your invoices are already doing the hard work.
            <br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Start getting paid for it.
            </em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              color: "var(--text-2)",
              maxWidth: 560,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            AdConfirm connects to Xero in 60 seconds and places a targeted,
            relevant ad on every invoice you send. Your customer sees it. You
            earn. Nothing else changes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}
          >
            <GlowButton href="https://adconfirm-dashboard.vercel.app/signup" variant="primary">
              Connect Xero — It&apos;s Free →
            </GlowButton>
            <GlowButton href="/how-it-works" variant="ghost">
              How It Works
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* ── EARNINGS CALCULATOR ── */}
      <section
        style={{
          padding: "80px clamp(20px, 4vw, 80px)",
          background: "var(--bg-2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="grid grid-cols-1 lg:grid-cols-2"
        >
          <EarningsCalculator />
          <SectionReveal>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  color: "var(--text-1)",
                  lineHeight: 1.15,
                  marginBottom: 20,
                }}
              >
                See what your invoices could earn.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                Every invoice you send is an opportunity. Drag the slider to
                estimate your monthly and annual revenue from AdConfirm placements.
                The more invoices you send, the more you earn.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-1)",
                        }}
                      >
                        {f.title}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "var(--text-3)",
                          marginLeft: 8,
                        }}
                      >
                        {f.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 4-STEP XERO GUIDE ── */}
      <section
        style={{ padding: "80px clamp(20px, 4vw, 80px)", background: "var(--bg)" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "var(--accent)",
                  textTransform: "uppercase" as const,
                  marginBottom: 14,
                }}
              >
                Setup Guide
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                }}
              >
                From signup to first placement in 4 steps.
              </h2>
            </div>
          </SectionReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 24,
                  position: "relative",
                }}
              >
                {/* Step connector (desktop) */}
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 36,
                      right: -12,
                      width: 24,
                      height: 2,
                      background: "var(--border)",
                      zIndex: 1,
                    }}
                    className="hidden lg:block"
                  />
                )}

                {/* Icon circle */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--bg-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <step.Icon size={20} color="var(--accent)" />
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
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                    marginBottom: 14,
                  }}
                >
                  {step.desc}
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: step.tagColor,
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        style={{
          padding: "80px clamp(20px, 4vw, 80px)",
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                }}
              >
                From businesses like yours.
              </h2>
            </div>
          </SectionReveal>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontStyle: "italic",
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                    flex: 1,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-1)",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        color: "var(--text-3)",
                        marginTop: 2,
                      }}
                    >
                      {t.company} · {t.location}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--success)",
                    }}
                  >
                    {t.invoices}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        style={{
          padding: "80px clamp(20px, 4vw, 80px) 100px",
          textAlign: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <SectionReveal>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 52px)",
                color: "var(--text-1)",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              Ready to monetise your invoice stack?
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                color: "var(--text-2)",
                marginBottom: 32,
                lineHeight: 1.65,
              }}
            >
              Connect Xero in 60 seconds. First placement free. Cancel anytime.
            </p>
            <GlowButton href="https://adconfirm-dashboard.vercel.app/signup" variant="gold">
              Connect Xero Free →
            </GlowButton>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
