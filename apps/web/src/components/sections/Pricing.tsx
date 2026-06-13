"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionReveal } from "../ui/SectionReveal";
import { GlowButton } from "../ui/GlowButton";
import { SIGNUP_URL } from "../../lib/config";

const BIZ = [
  "Connect unlimited Xero accounts",
  "Full advertiser marketplace access",
  "Real-time earnings dashboard",
  "70% revenue share on placements",
  "No monthly fee, ever",
];

const ADV = [
  "No minimum spend",
  "Industry + region targeting",
  "QR code + link tracking",
  "Real-time campaign analytics",
  "Launch in under 5 minutes",
];

function FeatureList({ items, color }: { items: string[]; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
      {items.map((f) => (
        <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Check size={14} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-2)" }}>{f}</span>
        </div>
      ))}
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" data-section="pricing" style={{ padding: "120px clamp(20px, 4vw, 80px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
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
              Pricing
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 52px)", color: "var(--text-1)", lineHeight: 1.1 }}>
              Simple. Aligned with your success.
            </h2>
          </div>
        </SectionReveal>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900, margin: "0 auto" }}
          className="pricing-cards grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Businesses — Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6, boxShadow: "0 0 40px rgba(201,168,76,0.18)", borderColor: "rgba(201,168,76,0.4)" }}
            style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px" }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              For Businesses
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 64, fontWeight: 700, color: "var(--text-1)", lineHeight: 1, marginBottom: 8 }}>
              £0
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-3)", marginBottom: 28 }}>
              We earn when you earn
            </div>
            <FeatureList items={BIZ} color="var(--success)" />
            <GlowButton href={SIGNUP_URL} variant="gold" className="w-full justify-center">
              Join Free →
            </GlowButton>
          </motion.div>

          {/* Advertisers — from £2 CPM (featured) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, boxShadow: "0 0 50px rgba(0,82,255,0.28)" }}
            style={{
              background: "var(--bg-2)",
              border: "1px solid rgba(0,82,255,0.4)",
              borderRadius: 16,
              padding: "36px 32px",
              boxShadow: "0 0 40px rgba(0,82,255,0.08)",
              position: "relative",
            }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              For Advertisers
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--text-3)" }}>from</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 64, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>£2</span>
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-3)", marginBottom: 28 }}>
              per 1,000 impressions (CPM)
            </div>
            <FeatureList items={ADV} color="var(--accent)" />
            <GlowButton href={SIGNUP_URL} variant="primary" className="w-full justify-center cta-pulse">
              Launch Campaign →
            </GlowButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
