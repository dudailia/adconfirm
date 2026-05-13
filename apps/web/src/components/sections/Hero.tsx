"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { InvoiceMockup } from "../InvoiceMockup";
import { XERO_CONNECT_URL } from '../../lib/config';

const LINES = ["Your invoices.", "Now generating", "revenue."];

// Zero React re-renders — writes directly to DOM nodes every 60ms
function TypewriterHeadline() {
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const line3 = useRef<HTMLSpanElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const refs = [line1, line2, line3];
    let lineIdx = 0;
    let charIdx = 0;

    const tick = setInterval(() => {
      const line = LINES[lineIdx];
      if (!line) { clearInterval(tick); cursor.current && (cursor.current.style.display = "none"); return; }

      charIdx++;
      const ref = refs[lineIdx];
      if (ref?.current) ref.current.textContent = line.slice(0, charIdx);

      if (charIdx >= line.length) {
        lineIdx++;
        charIdx = 0;
      }
    }, 60);

    return () => clearInterval(tick);
  }, []);

  return (
    <h1
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(48px, 6vw, 80px)",
        lineHeight: 1.05,
      }}
    >
      <span ref={line1} style={{ display: "block", color: "var(--text-1)", fontStyle: "italic" }} />
      <span ref={line2} style={{ display: "block", color: "var(--text-1)" }} />
      <span
        ref={line3}
        style={{ display: "block", color: "var(--gold)", fontStyle: "italic" }}
      />
      <span
        ref={cursor}
        style={{ color: "var(--accent)", animation: "pulse 1s step-end infinite" }}
      >
        |
      </span>
    </h1>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 px-6 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Top radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,102,255,0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-6"
            >
              The Invoice Advertising Network
            </motion.div>

            <TypewriterHeadline />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-6 text-lg text-[#9AA5B4] leading-relaxed max-w-lg"
            >
              AdConfirm places targeted ads on the invoices you already send. Your customers see offers from brands they care about. You earn per placement. Zero friction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <motion.a
                href={XERO_CONNECT_URL}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] text-white font-medium rounded-xl animate-glow-pulse"
              >
                Start Earning Free
              </motion.a>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/[0.1] text-white font-medium rounded-xl hover:border-white/20 transition-colors"
              >
                See How It Works
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["#0066FF", "#0052CC", "#3385FF"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#050A14]"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className="text-sm text-[#9AA5B4]">
                Trusted by businesses sending{" "}
                <span className="text-white font-medium">10,000+ invoices/month</span>
              </span>
            </motion.div>
          </div>

          {/* Right — invoice mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <InvoiceMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
