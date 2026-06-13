"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { SectionReveal } from "../ui/SectionReveal";

type Stat = {
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
  glow: string;
};

const STATS: Stat[] = [
  { to: 0, prefix: "£", label: "setup fee — free to join, forever", glow: "var(--success)" },
  { to: 60, suffix: "s", label: "to connect Xero and go live", glow: "var(--accent-2)" },
  { to: 2, prefix: "£", suffix: " CPM", label: "advertiser entry price — no minimums", glow: "var(--gold)" },
];

export default function Stats() {
  return (
    <section
      data-section="stats"
      style={{
        padding: "110px clamp(20px, 4vw, 80px)",
        background: "radial-gradient(ellipse 70% 80% at 50% 50%, #0A1020 0%, var(--bg) 75%)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
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
              By the numbers
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(30px, 3.6vw, 48px)",
                color: "var(--text-1)",
                lineHeight: 1.12,
              }}
            >
              No fees. No friction. Just revenue.
            </h2>
          </div>
        </SectionReveal>

        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{
                position: "relative",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "44px 28px",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              {/* glow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "50%",
                  width: 200,
                  height: 200,
                  transform: "translateX(-50%)",
                  background: `radial-gradient(circle, ${stat.glow}22 0%, transparent 70%)`,
                  filter: "blur(20px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(48px, 6vw, 72px)",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  lineHeight: 1,
                  marginBottom: 16,
                  textShadow: `0 0 40px ${stat.glow}55`,
                }}
              >
                <AnimatedCounter from={0} to={stat.to} duration={1.8} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div
                style={{
                  position: "relative",
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "var(--text-2)",
                  lineHeight: 1.5,
                  maxWidth: 240,
                  margin: "0 auto",
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
