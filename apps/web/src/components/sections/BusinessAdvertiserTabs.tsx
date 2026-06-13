"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { EarningsCalculator } from "../EarningsCalculator";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { GlowButton } from "../ui/GlowButton";
import { SIGNUP_URL } from "../../lib/config";

type Tab = "businesses" | "advertisers";

const BIZ_FEATURES = [
  "Xero-native — no new software, no new workflow",
  "Choose your advertisers — approve or block any brand",
  "Real-time dashboard — see earnings as placements happen",
  "Cancel anytime — disconnect in one click",
];

const AD_FEATURES = [
  "Reach buyers at the exact moment they spend",
  "Industry + region targeting — law, accountancy, retail",
  "From £2 CPM — no minimums, pay as you go",
  "Live campaign analytics with QR + link tracking",
];

function AnimatedChecklist({ items, color }: { items: string[]; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
      {items.map((feat, i) => (
        <motion.div
          key={feat}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 + i * 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
        >
          <Check size={16} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
            {feat}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Advertiser campaign-creation mockup (CSS/SVG only) ──
function CampaignMockup() {
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
          New Campaign
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--success)",
            border: "1px solid rgba(0,229,160,0.3)",
            background: "rgba(0,229,160,0.06)",
            padding: "3px 8px",
            borderRadius: 100,
          }}
        >
          ● DRAFT
        </span>
      </div>

      {/* Budget + CPM */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="Monthly budget" value="£500" />
        <Field label="CPM bid" value="£2.00" accent />
      </div>

      {/* Targeting chips */}
      <div style={{ marginBottom: 18 }}>
        <FieldLabel>Targeting</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Legal", "Accountancy", "London", "B2B"].map((chip) => (
            <span
              key={chip}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--accent-2)",
                background: "rgba(0,82,255,0.08)",
                border: "1px solid rgba(0,82,255,0.25)",
                padding: "5px 12px",
                borderRadius: 100,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Estimated reach */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 20 }}>
        <FieldLabel>Estimated reach this month</FieldLabel>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>
          <AnimatedCounter from={0} to={250000} duration={1.6} suffix=" impressions" />
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "var(--bg)", marginTop: 12, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "78%" }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
          />
        </div>
      </div>

      <GlowButton href={SIGNUP_URL} variant="primary" className="w-full justify-center">
        Launch Campaign →
      </GlowButton>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        color: "var(--text-3)",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: accent ? "var(--accent-2)" : "var(--text-1)", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ── Tab panels ──
function PanelHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--accent)",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3vw, 40px)",
          color: "var(--text-1)",
          lineHeight: 1.15,
          marginBottom: 18,
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 28 }}>
        {body}
      </p>
    </>
  );
}

export default function BusinessAdvertiserTabs() {
  const [tab, setTab] = useState<Tab>("businesses");

  return (
    <section
      id="for-businesses"
      data-section="businesses-advertisers"
      style={{ background: "var(--bg-2)", padding: "120px clamp(20px, 4vw, 80px)" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 5,
              borderRadius: 100,
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            {(["businesses", "advertisers"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  position: "relative",
                  padding: "10px 24px",
                  borderRadius: 100,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: tab === t ? "#ffffff" : "var(--text-2)",
                  transition: "color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab === t && (
                  <motion.span
                    layoutId="tab-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 100,
                      background: "var(--accent)",
                      boxShadow: "0 0 20px rgba(0,82,255,0.4)",
                      zIndex: 0,
                    }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {t === "businesses" ? "For Businesses" : "For Advertisers"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Panels — crossfade */}
        <div style={{ position: "relative", minHeight: 520 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              className="tab-grid"
            >
              {tab === "businesses" ? (
                <>
                  <EarningsCalculator />
                  <div>
                    <PanelHeading
                      eyebrow="For Businesses"
                      title="Your invoice stack is a media channel. It just doesn't know it yet."
                      body="Every invoice you send is opened. The total is read. The payment is made. That moment of financial attention — that's where AdConfirm lives."
                    />
                    <AnimatedChecklist items={BIZ_FEATURES} color="var(--success)" />
                    <GlowButton href={SIGNUP_URL} variant="gold">
                      Start Earning From Your Invoices →
                    </GlowButton>
                  </div>
                </>
              ) : (
                <>
                  <CampaignMockup />
                  <div>
                    <PanelHeading
                      eyebrow="For Advertisers"
                      title="Reach buyers at the exact moment they spend money."
                      body="Your ad doesn't appear in a feed. It appears on a financial document — the one document every recipient reads completely. After the total. After they've committed."
                    />
                    <AnimatedChecklist items={AD_FEATURES} color="var(--accent)" />
                    <GlowButton href={SIGNUP_URL} variant="primary">
                      Launch a Campaign →
                    </GlowButton>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
