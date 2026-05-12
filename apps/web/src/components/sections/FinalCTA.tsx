"use client";

import { motion } from "framer-motion";
import { XERO_CONNECT_URL } from '../../lib/config';

export function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative bg-[#0D1629] border border-white/[0.08] rounded-3xl p-12 md:p-16 text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,102,255,0.12) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-4">Get Started</div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
              Ready to monetise your invoices?
            </h2>
            <p className="text-[#9AA5B4] mb-8 max-w-md mx-auto leading-relaxed">
              Connect Xero in 60 seconds. First placement free. No credit card required.
            </p>
            <motion.a
              href={XERO_CONNECT_URL}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0066FF] text-white font-medium rounded-xl text-lg animate-glow-pulse"
            >
              Connect Your Xero →
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
