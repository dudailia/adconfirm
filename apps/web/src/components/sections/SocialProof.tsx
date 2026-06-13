"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionReveal } from "../ui/SectionReveal";

// Illustrative, non-attributed social proof — aggregate counts and real
// product metrics, no fabricated named people or businesses.

function StarRow() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      style={{ display: "flex", gap: 4, marginBottom: 18 }}
      aria-label="five out of five"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, scale: 0.3 }, show: { opacity: 1, scale: 1 } }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          style={{ display: "inline-flex" }}
        >
          <Star size={18} fill="var(--gold)" color="var(--gold)" />
        </motion.span>
      ))}
    </motion.div>
  );
}

const SECTORS = ["Hospitality", "Retail", "Legal", "Accountancy", "Agencies", "Trades"];

export default function SocialProof() {
  return (
    <section
      data-section="social-proof"
      style={{ padding: "120px clamp(20px, 4vw, 80px)", background: "var(--bg)" }}
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
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Social proof
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(30px, 4vw, 52px)",
                color: "var(--text-1)",
                lineHeight: 1.12,
              }}
            >
              Trusted by UK businesses that send invoices.
            </h2>
          </div>
        </SectionReveal>

        <div className="proof-grid">
          {/* Card 1 — early-adopter signal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="glass"
            style={{ borderRadius: 16, padding: 32 }}
          >
            <StarRow />
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "var(--text-1)", fontWeight: 600, marginBottom: 12 }}>
              Loved by early adopters
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>
              94 UK businesses connected in our pilot — earning from the invoices they already
              send, with zero changes to their workflow.
            </p>
          </motion.div>

          {/* Card 2 — open-rate metric */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="glass"
            style={{ borderRadius: 16, padding: 32 }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 700, color: "var(--accent-2)", lineHeight: 1, marginBottom: 14, textShadow: "0 0 40px rgba(0,194,255,0.35)" }}>
              40%+
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "var(--text-1)", fontWeight: 600, marginBottom: 12 }}>
              Average invoice open rate
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>
              Your ad lands on the one document every customer opens completely — over 10× the
              open rate of typical email marketing.
            </p>
          </motion.div>

          {/* Card 3 — revenue share */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="glass"
            style={{ borderRadius: 16, padding: 32 }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 700, color: "var(--gold)", lineHeight: 1, marginBottom: 14, textShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
              70%
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 17, color: "var(--text-1)", fontWeight: 600, marginBottom: 12 }}>
              Revenue share to businesses
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>
              You keep the majority of every placement — monthly payouts, no minimums, and no
              setup fee, ever.
            </p>
          </motion.div>
        </div>

        {/* Sector breadth */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 48 }}>
          {SECTORS.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-3)",
                border: "1px solid var(--border)",
                borderRadius: 100,
                padding: "6px 16px",
                letterSpacing: "0.04em",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
