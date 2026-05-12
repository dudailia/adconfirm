"use client";

import { motion } from "framer-motion";
import { EarningsCalc } from "../../components/EarningsCalc";
import { Zap, Clock, Shield, BarChart3, Settings, CreditCard } from "lucide-react";

const features = [
  {
    Icon: Zap,
    title: "Xero native integration",
    description:
      "We connect directly to your Xero account via OAuth2. Your invoices are intercepted before they hit your customers, an ad is injected below the fiscal close line, and the invoice is sent as normal. You never touch a template.",
  },
  {
    Icon: Clock,
    title: "Sub-millisecond injection",
    description:
      "Our injection pipeline timestamps every placement to the millisecond — injection_unix_ms — so you always know exactly when an ad ran. Cryptographically verifiable.",
  },
  {
    Icon: Shield,
    title: "Full advertiser control",
    description:
      "Block competitors. Whitelist categories. Set maximum ads per invoice. You decide what your customers see. We enforce it.",
  },
  {
    Icon: BarChart3,
    title: "Real-time earnings dashboard",
    description:
      "See every placement, every impression, every click, every conversion. Revenue updates in real time.",
  },
  {
    Icon: Settings,
    title: "Zero workflow changes",
    description:
      "You keep sending invoices exactly as you do today. AdConfirm operates invisibly between Xero and your customer.",
  },
  {
    Icon: CreditCard,
    title: "Monthly payouts",
    description:
      "Revenue is accumulated and paid monthly via bank transfer. No minimums. No holdbacks.",
  },
];

export function BusinessPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(0,102,255,0.1) 0%, transparent 60%)" }}
        />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-4">For Businesses</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 max-w-3xl leading-tight">
              Your invoices.<br />Your new revenue channel.
            </h1>
            <p className="text-lg text-[#9AA5B4] max-w-xl leading-relaxed mb-8">
              AdConfirm integrates with Xero to place targeted ads on every invoice you send. No redesign. No extra steps. Just revenue.
            </p>
            <motion.a
              href="http://localhost:4000/auth/xero/connect"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] text-white font-medium rounded-xl animate-glow-pulse"
            >
              Connect Your Xero →
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#0D1629] border border-white/[0.08] rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center mb-4">
                  <f.Icon className="w-5 h-5 text-[#0066FF]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#9AA5B4] leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 px-6" style={{ background: "rgba(13,22,41,0.5)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
              How much will you earn?
            </h2>
            <p className="text-[#9AA5B4]">Drag the slider to see your projected revenue.</p>
          </motion.div>
          <div className="max-w-lg mx-auto">
            <EarningsCalc />
          </div>
        </div>
      </section>
    </>
  );
}
