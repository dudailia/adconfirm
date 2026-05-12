"use client";

import { motion } from "framer-motion";
import { Zap, Settings, Shield, BarChart3 } from "lucide-react";
import { EarningsCalc } from "../EarningsCalc";

const features = [
  {
    Icon: Zap,
    title: "Xero native integration",
    description: "Connects directly to Xero via OAuth2. No middleware, no API juggling.",
  },
  {
    Icon: Settings,
    title: "Zero-friction setup",
    description: "OAuth in 60 seconds. We handle the injection. You handle your business.",
  },
  {
    Icon: Shield,
    title: "Choose your advertisers",
    description: "Whitelist categories and block competitors. Full control over what appears.",
  },
  {
    Icon: BarChart3,
    title: "Real-time earnings",
    description: "See every placement, click, and pound earned in real time.",
  },
];

export function ForBusinesses() {
  return (
    <section id="for-businesses" className="py-24 px-6" style={{ background: "rgba(13,22,41,0.4)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-3">For Businesses</div>
          <h2 className="font-serif text-4xl md:text-5xl text-white max-w-2xl">
            Turn your invoice stack into a media channel
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#0D1629] border border-white/[0.08] rounded-xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center mb-3">
                  <f.Icon className="w-4 h-4 text-[#0066FF]" />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-[#9AA5B4] leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EarningsCalc />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
