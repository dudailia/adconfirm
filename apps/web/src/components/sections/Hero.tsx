"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { InvoiceMockup } from "../InvoiceMockup";
import { XERO_CONNECT_URL } from '../../lib/config';

const HEADLINE = "Your invoices.\nNow generating revenue.";

function TypewriterHeadline() {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (displayed < HEADLINE.length) {
      const t = setTimeout(() => setDisplayed((n) => n + 1), 60);
      return () => clearTimeout(t);
    }
  }, [displayed]);

  return (
    <h1 className="font-serif text-5xl md:text-[72px] lg:text-[80px] leading-[1.05] text-white whitespace-pre-line">
      {HEADLINE.slice(0, displayed)}
      {displayed < HEADLINE.length && (
        <span className="animate-pulse text-[#0066FF]">|</span>
      )}
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
