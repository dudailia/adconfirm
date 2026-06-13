"use client";

import { motion } from "framer-motion";
import { GlowButton } from "../../components/ui/GlowButton";
import { AnimatedCounter } from "../../components/ui/AnimatedCounter";
import { LiveTimestamp } from "../../components/ui/LiveTimestamp";
import { SectionReveal } from "../../components/ui/SectionReveal";
import { Accordion } from "../../components/ui/Accordion";
import type { AccordionItem } from "../../components/ui/Accordion";

// ─── Flow diagram step data ───────────────────────────────────────────────
const FLOW_STEPS = [
  {
    index: "01",
    label: "Xero Invoice Created",
    desc: "A new invoice is generated in your Xero account — automatically or manually. AdConfirm is registered as an authorised webhook endpoint.",
    time: null,
    color: "var(--text-3)",
    accent: "var(--border)",
  },
  {
    index: "02",
    label: "Webhook Received — T₀",
    desc: "AdConfirm receives the Xero webhook event within milliseconds of the invoice being created. The fiscal close timestamp T₀ is captured instantly.",
    time: "T₀",
    color: "var(--accent-2)",
    accent: "rgba(0,194,255,0.3)",
  },
  {
    index: "03",
    label: "Ad Engine Selects Creative",
    desc: "Our targeting engine matches active campaigns to your business profile — industry, region, budget. Weighted random selection from eligible creatives.",
    time: "T₀ + 0.3ms",
    color: "var(--accent)",
    accent: "rgba(0,82,255,0.3)",
  },
  {
    index: "04",
    label: "Ad Injected Below Fiscal Close",
    desc: "The selected ad creative is injected into the invoice HTML, positioned after the fiscal close comment. Timestamp T₁ logged simultaneously.",
    time: "T₁ < T₀ + 2ms",
    color: "var(--success)",
    accent: "rgba(0,229,160,0.25)",
  },
  {
    index: "05",
    label: "Invoice + Ad Emailed via Resend",
    desc: "The complete invoice — with embedded ad — is delivered to your customer via Resend. The email is identical to your normal invoice email.",
    time: "T₁ + ~50ms",
    color: "var(--text-2)",
    accent: "var(--border)",
  },
  {
    index: "06",
    label: "Impression Logged. Revenue Accrued.",
    desc: "Every placement creates an immutable ad_event record. Clicks are tracked. Revenue is calculated and accumulated for your next monthly payout.",
    time: "Permanent",
    color: "var(--gold)",
    accent: "rgba(201,168,76,0.25)",
  },
];

const OBJECTIONS: AccordionItem[] = [
  {
    question: "Will my customers be annoyed?",
    answer:
      "No. The ad appears below the FISCAL CLOSE line — after your totals, after the financial content. It is clearly labeled 'Sponsored'. You choose which advertisers appear on your invoices. You can block entire categories or specific brands. Most customers never notice it's there; those who do appreciate the relevant offers.",
  },
  {
    question: "Does it change my invoice design?",
    answer:
      "No. AdConfirm injects the ad block after your invoice content closes. Your invoice number, line items, totals, tax — all untouched. Your logo stays where it is. Your branding is unchanged. The ad appears in a visually separated section at the bottom, and only if you have ad delivery enabled.",
  },
  {
    question: "Is this legally compliant?",
    answer:
      "Yes. The ad is placed outside the fiscal data section of the document — after the fiscal close line, in a clearly marked sponsored area. It does not alter the legal content of your invoice. We are GDPR compliant: customer opt-out is honoured, and we do not store or process your customers' financial data. We are registered in England and Wales.",
  },
  {
    question: "What if I want to stop?",
    answer:
      "One click. Go to Settings → Xero → Disconnect. AdConfirm immediately stops intercepting your invoices. Your Xero connection is revoked. Your account and earnings history remain accessible. There is no cancellation fee, no notice period, and no minimum term.",
  },
  {
    question: "How are earnings calculated?",
    answer:
      "You earn a share of the CPM (cost per 1,000 impressions) paid by advertisers. The base rate is approximately £0.08 per placement. Advertisers bidding higher CPMs earn you more. You receive 70% of all placement revenue. Payouts are made monthly via bank transfer with no minimum threshold.",
  },
  {
    question: "What control do I have over advertisers?",
    answer:
      "Full control. From your dashboard you can: approve or block individual advertisers, block entire industry categories (e.g. competitors, sensitive categories), set a maximum number of ads per invoice (1–3), and pause all ads with a single toggle. Your preferences take effect immediately — not at the next billing cycle.",
  },
];

export function HowItWorksContent() {
  return (
    <div>
      {/* ══════════════════ ACT 1: THE PROBLEM ══════════════════ */}
      <section
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          padding: "140px clamp(20px, 4vw, 80px) 100px",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,82,255,0.04) 0%, transparent 70%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
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
              marginBottom: 24,
            }}
          >
            Act I — The Problem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 5.5vw, 72px)",
              lineHeight: 1.05,
              color: "var(--text-1)",
              marginBottom: 32,
            }}
          >
            You send thousands of invoices.
            <br />
            <em style={{ color: "var(--text-3)", fontStyle: "italic" }}>
              You earn £0 from them.
            </em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 18,
                color: "var(--text-2)",
                lineHeight: 1.75,
                maxWidth: 680,
                marginBottom: 48,
              }}
            >
              Invoices are the most-read documents in B2B. Your customer opens
              every single one — they have to, to pay it. They read the line
              items. They verify the total. That moment of undivided financial
              attention is the highest-intent touchpoint in business. And until
              now, it has generated zero advertising value for the sender.
            </p>

            {/* Counter card */}
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "28px 32px",
                maxWidth: 540,
                display: "flex",
                flexDirection: "column" as const,
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color: "var(--text-3)",
                  textTransform: "uppercase" as const,
                }}
              >
                If you send 500 invoices / month, you leave
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 56,
                  fontWeight: 700,
                  color: "var(--danger)",
                  lineHeight: 1,
                }}
              >
                −£
                <AnimatedCounter from={0} to={480} duration={2.2} />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "var(--text-3)",
                }}
              >
                on the table every year. At no fault of your own. Until now.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ ACT 2: THE MECHANISM ══════════════════ */}
      <section
        style={{
          padding: "100px clamp(20px, 4vw, 80px)",
          background: "var(--bg)",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionReveal>
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
              Act II — The Mechanism
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 52px)",
                color: "var(--text-1)",
                marginBottom: 56,
                lineHeight: 1.1,
              }}
            >
              From invoice creation to revenue — in under 2 milliseconds.
            </h2>
          </SectionReveal>

          {/* Flow steps */}
          <div style={{ position: "relative" }}>
            {FLOW_STEPS.map((step, i) => (
              <div key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{ display: "flex", gap: 24, alignItems: "flex-start" }}
                >
                  {/* Left: step number + connector */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      flexShrink: 0,
                      width: 40,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: `1px solid ${step.accent}`,
                        background: "var(--bg-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: step.color,
                        flexShrink: 0,
                      }}
                    >
                      {step.index}
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div style={{ position: "relative", width: 2, flex: 1, minHeight: 48 }}>
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "var(--border)",
                          }}
                        />
                        <motion.div
                          initial={{ height: "0%" }}
                          whileInView={{ height: "100%" }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 + 0.3, duration: 0.5 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            background: `linear-gradient(to bottom, ${step.color}, var(--border))`,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: content card */}
                  <div
                    style={{
                      flex: 1,
                      background: "var(--bg-2)",
                      border: `1px solid ${step.accent}`,
                      borderRadius: 10,
                      padding: "20px 24px",
                      marginBottom: i < FLOW_STEPS.length - 1 ? 0 : 0,
                      marginTop: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        marginBottom: 10,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--text-1)",
                          lineHeight: 1.3,
                        }}
                      >
                        {step.label}
                      </h3>
                      {step.time && (
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: step.color,
                            background: "var(--bg-3)",
                            border: `1px solid ${step.accent}`,
                            borderRadius: 4,
                            padding: "3px 8px",
                            whiteSpace: "nowrap" as const,
                            flexShrink: 0,
                          }}
                        >
                          {step.time === "T₀" || step.time === "T₁ < T₀ + 2ms" ? (
                            <>
                              {step.time.split("T")[0]}T
                              <sub style={{ fontSize: 8 }}>
                                {step.time === "T₀" ? "0" : "1"}
                              </sub>
                              {step.time === "T₁ < T₀ + 2ms" && " < T₀ + 2ms"}
                              {step.time === "T₀" && ": "}
                              {step.time === "T₀" && <LiveTimestamp />}
                            </>
                          ) : (
                            step.time
                          )}
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--text-2)",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{ height: 8 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ ACT 3: TRUST LAYER ══════════════════ */}
      <section
        style={{
          padding: "100px clamp(20px, 4vw, 80px) 120px",
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <SectionReveal>
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
              Act III — The Trust Layer
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "var(--text-1)",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              Every question you&apos;re already thinking.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                color: "var(--text-2)",
                lineHeight: 1.65,
                marginBottom: 48,
              }}
            >
              We&apos;ve built AdConfirm to answer these objections before you ask them.
            </p>
          </SectionReveal>

          <Accordion items={OBJECTIONS} />

          <div style={{ marginTop: 56, display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <GlowButton href="https://adconfirm-dashboard.vercel.app/signup" variant="primary">
              Connect Xero — Start Earning
            </GlowButton>
            <GlowButton href="/for-businesses" variant="ghost">
              Learn More →
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}
