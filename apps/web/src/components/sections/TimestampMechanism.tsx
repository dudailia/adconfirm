"use client";

import { motion } from "framer-motion";
import { SectionReveal } from "../ui/SectionReveal";
import { LiveTimestamp } from "../ui/LiveTimestamp";

// The patent-critical differentiator: every ad placement is logged with a
// millisecond Unix timestamp, simultaneous with document generation.
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

const STATS = [
  { value: "< 2ms", label: "avg injection latency", color: "var(--accent)" },
  { value: "100%", label: "of placements timestamped", color: "var(--success)" },
  { value: "∞", label: "audit trail retention", color: "var(--gold)" },
];

export default function TimestampMechanism() {
  return (
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
        style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
        className="timestamp-section-grid grid grid-cols-1 lg:grid-cols-2"
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
                textTransform: "uppercase",
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
              The moment an ad is injected is captured as a Unix timestamp with millisecond
              precision — simultaneous with document generation. This creates an immutable,
              verifiable record linking every placement to every document.
            </p>
            <CodeBlock />
          </div>
        </SectionReveal>

        {/* Right — stat cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STATS.map((stat, i) => (
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
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-2)" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
