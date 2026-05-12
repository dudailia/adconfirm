"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { GlowButton } from "../../components/ui/GlowButton";
import { SectionReveal } from "../../components/ui/SectionReveal";
import { Accordion } from "../../components/ui/Accordion";
import type { AccordionItem } from "../../components/ui/Accordion";

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: "When do businesses get paid?",
    answer:
      "Revenue is calculated daily and paid monthly via bank transfer. There is no minimum payout threshold — even £1 in earnings is transferred. Payouts are processed on the 1st of each calendar month for the previous month's earnings.",
  },
  {
    question: "What's the minimum budget for advertisers?",
    answer:
      "There is no minimum budget. You can start a campaign with £10. Your budget depletes as placements are served, and you can add funds, pause, or stop at any time. There are no setup fees and no monthly minimums.",
  },
  {
    question: "Can businesses reject specific ads?",
    answer:
      "Yes, with granular control. You can block individual advertisers by name, block entire industry categories (e.g. 'Financial Services', 'Alcohol'), and set a maximum number of ads per invoice. Your preferences apply to all future placements immediately — not at the next billing cycle.",
  },
  {
    question: "How is revenue calculated for businesses?",
    answer:
      "Businesses receive 70% of the CPM revenue generated from their invoices. If an advertiser bids £0.10 CPM, a business with 1,000 invoice impressions earns £0.07 × 1,000 = £70. The average CPM across all advertisers is approximately £0.08–0.12. Higher-value invoice audiences (e.g. law firms, accountancies) attract premium CPMs.",
  },
  {
    question: "How does CPM pricing work for advertisers?",
    answer:
      "CPM (cost per mille) means you pay per 1,000 impressions. An impression is counted when your ad is included in a delivered invoice email. You set a CPM bid and a total budget. When the budget is exhausted, the campaign pauses. You are only charged for actual impressions served, never for estimated or projected reach.",
  },
  {
    question: "What happens if a business disconnects from Xero?",
    answer:
      "AdConfirm immediately stops intercepting that business's invoices. Any pending placements are cancelled. The business retains access to their earnings history and any accrued revenue is still paid in the next monthly payout cycle.",
  },
  {
    question: "Is AdConfirm GDPR compliant?",
    answer:
      "Yes. AdConfirm operates as a data processor for businesses (data controllers). We process invoice metadata only to the extent necessary for ad delivery. We do not store customer financial data beyond what is required for placement records. Customer opt-out is technically enforced — we do not serve ads to opted-out email addresses. Our full DPA is available on request.",
  },
];

// ─── Comparison table data ────────────────────────────────────────────────
type CellValue = boolean | string | null;

const COMPARISON_ROWS: Array<{
  feature: string;
  adconfirm: CellValue;
  traditional: CellValue;
  social: CellValue;
}> = [
  {
    feature: "Avg open rate",
    adconfirm: "40%+",
    traditional: "3%",
    social: "0.5%",
  },
  {
    feature: "Targeting",
    adconfirm: "Industry + region",
    traditional: "Demo only",
    social: "Broad demo",
  },
  {
    feature: "Minimum spend",
    adconfirm: "None",
    traditional: "£500+/mo",
    social: "£10/day",
  },
  {
    feature: "Intent signal",
    adconfirm: "Purchase moment",
    traditional: "Email open",
    social: "Scroll",
  },
  {
    feature: "Ad blocker bypass",
    adconfirm: true,
    traditional: false,
    social: false,
  },
  {
    feature: "QR code tracking",
    adconfirm: true,
    traditional: false,
    social: false,
  },
  {
    feature: "Pay per impression",
    adconfirm: true,
    traditional: true,
    social: true,
  },
  {
    feature: "Self-serve",
    adconfirm: true,
    traditional: null,
    social: true,
  },
  {
    feature: "B2B audience verified",
    adconfirm: true,
    traditional: false,
    social: false,
  },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === true)
    return <Check size={16} color="var(--success)" />;
  if (value === false)
    return <X size={16} color="var(--danger)" />;
  if (value === null)
    return <Minus size={16} color="var(--text-3)" />;
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--text-1)",
      }}
    >
      {value}
    </span>
  );
}

export function PricingPageContent() {
  return (
    <div>
      {/* ── HEADER ── */}
      <section
        style={{
          padding: "140px clamp(20px, 4vw, 80px) 72px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "var(--accent)",
            textTransform: "uppercase" as const,
            marginBottom: 20,
          }}
        >
          Pricing
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5vw, 64px)",
            color: "var(--text-1)",
            lineHeight: 1.05,
            marginBottom: 20,
          }}
        >
          Simple. Aligned with your success.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            color: "var(--text-2)",
            maxWidth: 540,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Free for businesses — we earn when you earn. Advertisers pay exactly
          what they consume, with no minimums and no lock-in.
        </motion.p>
      </section>

      {/* ── PRICING CARDS ── */}
      <section
        style={{ padding: "72px clamp(20px, 4vw, 80px)", background: "var(--bg)" }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
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
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "var(--text-3)",
                textTransform: "uppercase" as const,
                marginBottom: 12,
              }}
            >
              For Businesses
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 72,
                fontWeight: 700,
                color: "var(--text-1)",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              £0
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                color: "var(--text-3)",
                marginBottom: 28,
              }}
            >
              We only earn when you earn — 30% revenue share
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 13,
                marginBottom: 32,
              }}
            >
              {[
                "Connect unlimited Xero accounts",
                "Full advertiser marketplace access",
                "Real-time earnings dashboard",
                "70% revenue share on all placements",
                "Monthly bank transfer payouts",
                "No monthly fee, ever",
                "Cancel and disconnect instantly",
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
            <GlowButton
              href="http://localhost:4000/auth/xero/connect"
              variant="gold"
              className="w-full justify-center"
            >
              Join Free →
            </GlowButton>
          </motion.div>

          {/* Advertiser card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            style={{
              background: "var(--bg-2)",
              border: "1px solid rgba(0,82,255,0.45)",
              borderRadius: 16,
              padding: "36px 32px",
              boxShadow: "0 0 50px rgba(0,82,255,0.07)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -1,
                left: 32,
                right: 32,
                height: 2,
                background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "var(--accent)",
                textTransform: "uppercase" as const,
                marginBottom: 12,
              }}
            >
              For Advertisers
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 72,
                fontWeight: 700,
                color: "var(--text-1)",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              £0.10
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                color: "var(--text-3)",
                marginBottom: 28,
              }}
            >
              Per 1,000 invoice impressions (CPM)
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 13,
                marginBottom: 32,
              }}
            >
              {[
                "No minimum spend, no setup fee",
                "Industry and region targeting",
                "QR code + UTM link tracking",
                "Real-time campaign analytics",
                "Self-serve campaign builder",
                "Launch in under 5 minutes",
                "Pause or cancel at any time",
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
            <GlowButton
              href="/for-advertisers"
              variant="primary"
              className="w-full justify-center"
            >
              Launch Campaign →
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section
        style={{
          padding: "72px clamp(20px, 4vw, 80px)",
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                AdConfirm vs. traditional ad networks.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "var(--text-3)",
                }}
              >
                Invoice advertising is a fundamentally different channel.
              </p>
            </div>
          </SectionReveal>

          <div style={{ overflowX: "auto" as const }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-sans)",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "14px 20px",
                      textAlign: "left",
                      fontSize: 12,
                      color: "var(--text-3)",
                      fontWeight: 500,
                      borderBottom: "1px solid var(--border)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    Feature
                  </th>
                  {[
                    { label: "AdConfirm", highlight: true },
                    { label: "Email Marketing", highlight: false },
                    { label: "Social / Display", highlight: false },
                  ].map((col) => (
                    <th
                      key={col.label}
                      style={{
                        padding: "14px 20px",
                        textAlign: "center",
                        fontSize: 13,
                        color: col.highlight ? "var(--accent)" : "var(--text-2)",
                        fontWeight: col.highlight ? 600 : 400,
                        borderBottom: "1px solid var(--border)",
                        background: col.highlight
                          ? "rgba(0,82,255,0.04)"
                          : "transparent",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: 14,
                        color: "var(--text-2)",
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        textAlign: "center",
                        background: "rgba(0,82,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CellIcon value={row.adconfirm} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CellIcon value={row.traditional} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CellIcon value={row.social} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{ padding: "72px clamp(20px, 4vw, 80px) 100px", background: "var(--bg)" }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                Common questions.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "var(--text-3)",
                }}
              >
                Everything you need to know before committing to nothing.
              </p>
            </div>
          </SectionReveal>
          <Accordion items={FAQ_ITEMS} />

          <div
            style={{ marginTop: 52, display: "flex", gap: 12, flexWrap: "wrap" as const }}
          >
            <GlowButton href="http://localhost:4000/auth/xero/connect" variant="primary">
              Connect Xero Free →
            </GlowButton>
            <GlowButton href="/for-businesses" variant="ghost">
              Learn About Businesses
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}
