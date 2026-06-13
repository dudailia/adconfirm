"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plug, Zap, TrendingUp } from "lucide-react";
import { SectionReveal } from "../ui/SectionReveal";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { LiveTimestamp } from "../ui/LiveTimestamp";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();

  // GSAP ScrollTrigger draws the connector line as the section scrolls past.
  useEffect(() => {
    const path = lineRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;

    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len });
    if (reduced) return;

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top 72%",
      end: "bottom 65%",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(path, { strokeDashoffset: len * (1 - self.progress) });
      },
    });
    return () => st.kill();
  }, [reduced]);

  return (
    <section
      id="how-it-works"
      data-section="how-it-works"
      style={{ padding: "120px clamp(20px, 4vw, 80px)", maxWidth: 1280, margin: "0 auto" }}
    >
      <SectionReveal>
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            How It Works
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 4vw, 52px)",
            color: "var(--text-1)",
            marginBottom: 56,
            lineHeight: 1.1,
          }}
        >
          Three steps. Zero friction.
        </h2>
      </SectionReveal>

      <div ref={wrapRef} style={{ position: "relative" }}>
        {/* GSAP-drawn connector — desktop only */}
        <svg
          className="hidden lg:block"
          width="100%"
          height="4"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 28, left: 0, right: 0, overflow: "visible", pointerEvents: "none" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="hiw-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="55%" stopColor="var(--accent-2)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <path
            d="M 17 2 L 83 2"
            fill="none"
            stroke="#1A2540"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            ref={lineRef}
            d="M 17 2 L 83 2"
            fill="none"
            stroke="url(#hiw-line)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          className="hiw-cards grid grid-cols-1 lg:grid-cols-3"
        >
          {/* Step 1 */}
          <Step index={0} reduced={reduced}>
            <IconBubble featured={false}>
              <Plug size={22} color="var(--accent)" />
            </IconBubble>
            <StepNumber color="var(--text-3)">01 —</StepNumber>
            <StepTitle>Connect your system</StepTitle>
            <StepBody>
              Connect Xero in 60 seconds. AdConfirm registers as a delivery agent for your
              invoices — no redesign, no new workflow.
            </StepBody>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-2)", letterSpacing: "0.05em" }}>
              OAuth 2.0 secure
            </span>
          </Step>

          {/* Step 2 — featured */}
          <Step index={1} reduced={reduced} featured>
            <IconBubble featured>
              <Zap size={22} color="var(--accent)" />
            </IconBubble>
            <StepNumber color="var(--accent)">02 —</StepNumber>
            <StepTitle>Invoice is created</StepTitle>
            <StepBody>
              At the instant your invoice is generated, AdConfirm injects a relevant ad below
              your fiscal close line. The timestamp is logged permanently.
            </StepBody>
            <LiveTimestamp />
          </Step>

          {/* Step 3 */}
          <Step index={2} reduced={reduced}>
            <IconBubble featured={false}>
              <TrendingUp size={22} color="var(--success)" />
            </IconBubble>
            <StepNumber color="var(--text-3)">03 —</StepNumber>
            <StepTitle>Ad is injected, you earn</StepTitle>
            <StepBody>
              Every successful placement earns you money. Track real-time earnings in your
              dashboard. Monthly payouts, no minimums.
            </StepBody>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--success)" }}>
              500 invoices/mo →{" "}
              <AnimatedCounter from={0} to={40} duration={1.6} prefix="£" suffix="/mo avg" />
            </span>
          </Step>
        </div>
      </div>
    </section>
  );
}

/* ── Small presentational helpers (keep the section readable) ── */

function Step({
  index,
  featured,
  reduced,
  children,
}: {
  index: number;
  featured?: boolean;
  reduced: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: reduced ? 0 : index * 0.15 }}
      style={{
        position: "relative",
        zIndex: 1,
        background: "var(--bg-2)",
        border: featured ? "1px solid rgba(0,82,255,0.5)" : "1px solid var(--border)",
        borderRadius: 12,
        padding: 28,
        boxShadow: featured ? "0 0 30px rgba(0,82,255,0.1)" : "none",
      }}
    >
      {children}
    </motion.div>
  );
}

function IconBubble({ featured, children }: { featured: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: featured ? "1px solid rgba(0,82,255,0.3)" : "1px solid var(--border)",
        background: featured ? "rgba(0,82,255,0.08)" : "var(--bg-3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

function StepNumber({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color, letterSpacing: "0.1em", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
      {children}
    </h3>
  );
}

function StepBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 16 }}>
      {children}
    </p>
  );
}
