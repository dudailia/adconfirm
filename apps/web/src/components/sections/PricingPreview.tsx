"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    audience: "For Businesses",
    price: "Free to join",
    model: "Revenue share",
    description: "Start earning from your invoices with zero upfront cost.",
    features: [
      "Xero native integration",
      "Unlimited invoice volume",
      "Advertiser controls",
      "Real-time earnings dashboard",
      "Monthly payouts",
    ],
    cta: "Start Free",
    href: "http://localhost:4000/auth/xero/connect",
    highlight: false,
  },
  {
    audience: "For Advertisers",
    price: "CPM pricing",
    model: "Pay as you go",
    description: "Reach high-intent B2B buyers at the moment of purchase.",
    features: [
      "No minimum spend",
      "Verified B2B audience",
      "Category targeting",
      "Real-time performance data",
      "Self-serve dashboard",
    ],
    cta: "Launch Campaign",
    href: "/for-advertisers",
    highlight: true,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "rgba(13,22,41,0.4)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-3">Pricing</div>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-[#9AA5B4]">No hidden fees. No lock-in.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.audience}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`bg-[#0D1629] rounded-2xl p-6 border ${
                plan.highlight ? "border-[#0066FF]/40" : "border-white/[0.08]"
              }`}
            >
              {plan.highlight && (
                <div className="text-[10px] font-mono text-[#0066FF] uppercase tracking-wider mb-2">Popular</div>
              )}
              <div className="text-xs text-[#9AA5B4] mb-1">{plan.audience}</div>
              <div className="font-serif text-2xl text-white mb-0.5">{plan.price}</div>
              <div className="text-xs text-[#9AA5B4] mb-4">{plan.model}</div>
              <p className="text-sm text-[#9AA5B4] mb-5 leading-relaxed">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9AA5B4]">
                    <Check className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a
                href={plan.href}
                whileHover={{ scale: 1.02 }}
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-[#0066FF] text-white"
                    : "border border-white/[0.08] text-white hover:border-white/20"
                }`}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
