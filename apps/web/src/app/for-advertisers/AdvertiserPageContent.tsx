"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import dynamic from "next/dynamic";
import { Target, BarChart2, Globe, Zap } from "lucide-react";
import { GlowButton } from "../../components/ui/GlowButton";
import { SectionReveal } from "../../components/ui/SectionReveal";

const InvoiceMockup = dynamic(
  () =>
    import("../../components/InvoiceMockup").then((m) => ({
      default: m.InvoiceMockup,
    })),
  { ssr: false, loading: () => <div style={{ width: 400, height: 560 }} /> }
);

// ── Open rate comparison data ─────────────────────────────────────────────
const OPEN_RATE_DATA = [
  { channel: "AdConfirm", rate: 40, accent: true },
  { channel: "Email", rate: 3, accent: false },
  { channel: "Social", rate: 0.5, accent: false },
  { channel: "Display", rate: 0.1, accent: false },
];

const TARGETING = [
  {
    Icon: Target,
    title: "Industry targeting",
    desc: "Reach businesses in specific sectors — technology, finance, professional services, retail, and more. Your ad only appears on invoices from relevant industries.",
  },
  {
    Icon: Globe,
    title: "Region targeting",
    desc: "Target UK, US, Europe, Australia, or go global. Budget is spent only where you want to be seen.",
  },
  {
    Icon: BarChart2,
    title: "Budget control",
    desc: "Set a total budget. Pause or stop at any time. No minimum commitment. Your spend is exactly what you approve.",
  },
  {
    Icon: Zap,
    title: "QR code tracking",
    desc: "Every placement gets a unique QR code with UTM parameters. Track scans alongside clicks for full attribution.",
  },
];

// Custom recharts tooltip
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { channel: string } }>;
}) {
  if (!active || !payload || !payload[0]) return null;
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "8px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        color: "var(--text-1)",
      }}
    >
      <div style={{ color: "var(--text-3)", fontSize: 11, marginBottom: 2 }}>
        {payload[0].payload.channel}
      </div>
      <div>{payload[0].value}% open rate</div>
    </div>
  );
}

export function AdvertiserPageContent() {
  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{
          padding: "140px clamp(20px, 4vw, 80px) 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 70% 0%, rgba(0,82,255,0.07) 0%, var(--bg) 70%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
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
            For Advertisers
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
              maxWidth: 820,
              marginBottom: 24,
            }}
          >
            The highest-intent ad placement{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>in B2B.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              color: "var(--text-2)",
              maxWidth: 580,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Your ad appears on a business invoice — the document your customer
            opens to verify, approve, and pay. After the total. After they&apos;ve
            committed. That&apos;s the purchase moment.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}
          >
            <GlowButton href="/pricing" variant="primary">
              View Pricing →
            </GlowButton>
            <GlowButton href="/how-it-works" variant="ghost">
              How It Works
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* ── OPEN RATE CHART ── */}
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
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "var(--text-3)",
                textTransform: "uppercase" as const,
                marginBottom: 20,
              }}
            >
              Average Open Rate Comparison
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={OPEN_RATE_DATA}
                margin={{ top: 0, right: 0, bottom: 0, left: -16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="channel"
                  tick={{
                    fill: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {OPEN_RATE_DATA.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.accent ? "#0052FF" : "#1A2540"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--text-3)",
                marginTop: 12,
              }}
            >
              Sources: Mailchimp (email), IAB (display/social), AdConfirm internal data.
            </div>
          </motion.div>

          {/* Copy */}
          <SectionReveal>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                40% open rate.
                <br />
                <span style={{ color: "var(--text-3)" }}>Not 3%.</span>
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Email marketing averages 3% open rates. Display ads get 0.1%.
                Invoices get opened by 40%+ of recipients — because they have to.
                Your customer isn&apos;t scrolling a feed. They&apos;re reviewing a
                financial document with their full attention.
              </p>
              <div
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 8,
                  padding: "14px 18px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                  Purchase moment.{" "}
                </span>
                The customer has just committed to spending money. Their card is
                warm. Your offer arrives at the exact right time.
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── TARGETING OPTIONS ── */}
      <section
        style={{ padding: "80px clamp(20px, 4vw, 80px)", background: "var(--bg)" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <SectionReveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
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
                Targeting
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                }}
              >
                Reach exactly who you want.
              </h2>
            </div>
          </SectionReveal>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TARGETING.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--bg-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <t.Icon size={18} color="var(--accent)" />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    marginBottom: 8,
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "var(--text-2)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {t.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREATIVE PREVIEW ── */}
      <section
        style={{
          padding: "80px clamp(20px, 4vw, 80px) 100px",
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
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
          <SectionReveal>
            <div>
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
                Ad Creative
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  color: "var(--text-1)",
                  lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                See exactly where your ad appears.
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Your creative sits in a clearly marked Sponsored section below
                the fiscal close line. It includes your headline, body copy, a
                CTA button with full UTM tracking, and an optional QR code.
              </p>
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 10,
                  marginBottom: 32,
                }}
              >
                {[
                  "Headline (max 60 chars)",
                  "Body copy (max 120 chars)",
                  "CTA button with UTM params",
                  "Optional QR code for offline tracking",
                  "Auto-resizes across invoice formats",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      color: "var(--text-2)",
                      listStyle: "none",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <GlowButton href="/pricing" variant="primary">
                Launch a Campaign →
              </GlowButton>
            </div>
          </SectionReveal>

          <div
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <InvoiceMockup />
          </div>
        </div>
      </section>
    </div>
  );
}
