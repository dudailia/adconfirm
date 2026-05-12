"use client";

import { motion } from "framer-motion";
import { Plug, Zap, Coins } from "lucide-react";

const steps = [
  {
    Icon: Plug,
    number: "01",
    title: "Connect Xero",
    description:
      "Connect your Xero account in 60 seconds. AdConfirm intercepts your invoices before they're sent.",
  },
  {
    Icon: Zap,
    number: "02",
    title: "We inject the ad",
    description:
      "At the exact moment your invoice is generated, we place a relevant ad below your fiscal close line. Timestamped to the millisecond.",
  },
  {
    Icon: Coins,
    number: "03",
    title: "You earn",
    description:
      "Every time your invoice is opened, you earn. No invoice redesign. No extra work. Same invoice, new revenue.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-3">Process</div>
          <h2 className="font-serif text-4xl md:text-5xl text-white">How it works</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection line desktop */}
          <div className="hidden md:block absolute top-[2.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-white/[0.08]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative bg-[#0D1629] border border-white/[0.08] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center flex-shrink-0">
                  <step.Icon className="w-5 h-5 text-[#0066FF]" />
                </div>
                <span className="font-mono text-xs text-[#9AA5B4]">{step.number}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">{step.title}</h3>
              <p className="text-sm text-[#9AA5B4] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
