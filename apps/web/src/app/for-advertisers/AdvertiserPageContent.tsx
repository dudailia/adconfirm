"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, DollarSign, Eye } from "lucide-react";

const advantages = [
  {
    Icon: Eye,
    title: "40%+ open rates",
    description:
      "Invoices are among the most-read documents in B2B. Your customer opens it to verify the amount. They linger. Your ad is there.",
  },
  {
    Icon: Target,
    title: "Purchase moment targeting",
    description:
      "The customer just spent money. Their card is warm. They're in buying mode. No other ad format puts you at this exact moment.",
  },
  {
    Icon: TrendingUp,
    title: "Verified business audience",
    description:
      "Every invoice recipient is a verified business. No bots. No incentivized traffic. Real companies, real decision-makers.",
  },
  {
    Icon: DollarSign,
    title: "CPM with no minimums",
    description:
      "Pay only for placements. No commitments, no setup fees. Start with £100 or scale to £100,000. Your budget, your pace.",
  },
];

export function AdvertiserPageContent() {
  return (
    <>
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 70% 0%, rgba(0,102,255,0.1) 0%, transparent 60%)" }}
        />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-4">For Advertisers</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 max-w-3xl leading-tight">
              The highest-intent ad slot in B2B.
            </h1>
            <p className="text-lg text-[#9AA5B4] max-w-xl leading-relaxed mb-8">
              Your brand appears on a real business invoice. Not a banner. Not a pop-up. The document your customer opens to pay their bills.
            </p>
            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] text-white font-medium rounded-xl"
            >
              View Pricing →
            </motion.a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {advantages.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#0D1629] border border-white/[0.08] rounded-2xl p-6 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center flex-shrink-0">
                <a.Icon className="w-5 h-5 text-[#0066FF]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">{a.title}</h3>
                <p className="text-sm text-[#9AA5B4] leading-relaxed">{a.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-12 px-6" style={{ background: "rgba(13,22,41,0.5)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0D1629] border border-white/[0.08] rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-white/[0.08] text-center">
              {[
                { value: "40%+", label: "Average open rate" },
                { value: "£0.08", label: "Avg CPM per invoice" },
                { value: "B2B only", label: "Verified business audience" },
              ].map((s) => (
                <div key={s.label} className="md:px-6">
                  <div className="font-mono text-3xl font-medium text-white mb-1">{s.value}</div>
                  <div className="text-sm text-[#9AA5B4]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
