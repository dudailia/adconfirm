"use client";

import { motion } from "framer-motion";
import { GlowButton } from "../ui/GlowButton";
import { SIGNUP_URL } from "../../lib/config";

const COLORS = ["rgba(0,82,255,0.85)", "rgba(0,194,255,0.7)", "rgba(201,168,76,0.6)"];

// Deterministic pseudo-random so SSR and client markup match (no hydration drift).
const PARTICLES = Array.from({ length: 24 }).map((_, i) => {
  const r = (n: number) => (((i + 1) * n) % 100) / 100;
  return {
    left: Math.round(r(37) * 100),
    top: Math.round(r(83) * 100),
    size: 3 + Math.round(r(53) * 5),
    delay: +(r(71) * 8).toFixed(2),
    dur: +(7 + r(29) * 7).toFixed(2),
    color: COLORS[i % COLORS.length],
  };
});

export default function FinalCTA() {
  return (
    <section
      data-section="final-cta"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "140px clamp(20px, 4vw, 80px) 160px",
        textAlign: "center",
        borderTop: "1px solid var(--border)",
        background: "radial-gradient(ellipse 80% 70% at 50% 100%, #0A1428 0%, var(--bg) 70%)",
      }}
    >
      {/* Animated gradient blobs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          className="mesh-blob"
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "20%",
            width: 560,
            height: 560,
            borderRadius: "50%",
            filter: "blur(70px)",
            background: "radial-gradient(circle, rgba(0,82,255,0.22) 0%, transparent 70%)",
            animation: "meshDriftA 20s ease-in-out infinite",
          }}
        />
        <div
          className="mesh-blob"
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "15%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            filter: "blur(70px)",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 72%)",
            animation: "meshDriftC 26s ease-in-out infinite",
          }}
        />

        {/* Rising particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              animation: `floatUp ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--accent)",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Get Started
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(38px, 5.5vw, 68px)",
              color: "var(--text-1)",
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            Ready to monetize your invoices?
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--text-2)", marginBottom: 36, lineHeight: 1.6 }}>
            Connect Xero in 60 seconds. First placement free. No credit card.
          </p>
          <GlowButton href={SIGNUP_URL} variant="primary" className="cta-pulse" style={{ padding: "16px 40px", fontSize: 16 }}>
            Start earning today →
          </GlowButton>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-3)",
              marginTop: 22,
              letterSpacing: "0.05em",
            }}
          >
            SOC 2 in progress · GDPR compliant · UK-based
          </div>
        </motion.div>
      </div>
    </section>
  );
}
