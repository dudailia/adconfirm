"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

function formatGBP(v: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(v);
}

// Log scale: slider 0–100 → invoices 100–10000
function sliderToInvoices(s: number): number {
  return Math.round(100 * Math.pow(100, s / 100));
}
function invoicesToSlider(inv: number): number {
  return (Math.log10(inv / 100) / Math.log10(100)) * 100;
}

export function EarningsCalculator() {
  const [sliderVal, setSliderVal] = useState(invoicesToSlider(500));
  const invoices = sliderToInvoices(sliderVal);
  const monthly = invoices * 0.08;
  const annual = monthly * 12;

  const springMonthly = useMotionValue(monthly);
  const smoothMonthly = useSpring(springMonthly, { damping: 15, stiffness: 80 });
  const formattedMonthly = useTransform(smoothMonthly, formatGBP);
  const formattedAnnual = useTransform(smoothMonthly, (v) => formatGBP(v * 12));

  useEffect(() => {
    springMonthly.set(monthly);
  }, [monthly, springMonthly]);

  const glowIntensity = Math.min(1, (invoices - 100) / 4900);

  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 32,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.15em",
          color: "var(--text-3)",
          marginBottom: 20,
          textTransform: "uppercase" as const,
        }}
      >
        Revenue Estimator
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-2)",
          }}
        >
          <span>Invoices per month</span>
          <span style={{ color: "var(--text-1)", fontWeight: 500 }}>
            {invoices.toLocaleString()}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            style={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              appearance: "none" as const,
              background: `linear-gradient(to right, var(--accent) ${sliderVal}%, var(--border) ${sliderVal}%)`,
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-3)",
          }}
        >
          <span>100</span>
          <span>1,000</span>
          <span>10,000</span>
        </div>
      </div>

      {/* Earnings display */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--text-3)",
            marginBottom: 6,
            textTransform: "uppercase" as const,
          }}
        >
          Monthly earnings
        </div>
        <motion.div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--success)",
            textShadow: `0 0 ${20 + glowIntensity * 40}px rgba(0,229,160,${0.2 + glowIntensity * 0.6})`,
          }}
        >
          {formattedMonthly}
        </motion.div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            color: "var(--text-2)",
            marginTop: 6,
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <motion.span>{formattedAnnual}</motion.span>
          <span
            style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-3)" }}
          >
            per year
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--text-3)",
          lineHeight: 1.6,
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
        }}
      >
        Based on avg £0.08 CPM rate. Higher-value B2B invoices earn more.
      </div>
    </div>
  );
}
