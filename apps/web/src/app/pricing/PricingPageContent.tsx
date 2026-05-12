"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const businessFeatures = [
  "Xero OAuth integration",
  "Unlimited invoice volume",
  "Advertiser category controls",
  "Competitor blocking",
  "Real-time earnings dashboard",
  "Monthly bank transfer payouts",
  "Sub-millisecond injection",
  "Full placement audit trail",
];

const advertiserFeatures = [
  "No minimum spend",
  "Self-serve campaign creation",
  "Category and region targeting",
  "Real-time impression tracking",
  "Click and conversion reporting",
  "QR code ad support",
  "A/B creative testing",
  "Dedicated account support (£5k+/mo)",
];

const faq = [
  {
    q: "How much do businesses earn per invoice?",
    a: "The average placement earns £0.08 per invoice. This varies by advertiser, industry, and region. High-value B2B invoices typically attract higher CPMs.",
  },
  {
    q: "When do businesses get paid?",
    a: "Revenue accumulates daily and is paid monthly via bank transfer. There is no minimum payout threshold.",
  },
  {
    q: "How is advertiser CPM calculated?",
    a: "Advertisers pay per 1,000 impressions (invoice views). We track opens, not just sends. Typical CPMs range from £40–£120 depending on targeting.",
  },
  {
    q: "Can businesses reject specific ads?",
    a: "Yes. You can block specific advertisers, block entire categories, and set a maximum number of ads per invoice.",
  },
];

export function PricingPageContent() {
  return (
    <>
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-4">Pricing</div>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-[#9AA5B4] text-lg max-w-xl mx-auto">
              Free for businesses. CPM-based for advertisers. No hidden fees. No lock-in.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#0D1629] border border-white/[0.08] rounded-2xl p-8"
          >
            <div className="text-xs text-[#9AA5B4] uppercase tracking-wider mb-2">For Businesses</div>
            <div className="font-serif text-4xl text-white mb-1">Free</div>
            <div className="text-sm text-[#9AA5B4] mb-6">Revenue share — we only earn when you do</div>
            <ul className="space-y-3 mb-8">
              {businessFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#9AA5B4]">
                  <Check className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="http://localhost:4000/auth/xero/connect"
              whileHover={{ scale: 1.02 }}
              className="block text-center py-3 bg-[#0066FF] text-white rounded-xl font-medium"
            >
              Connect Xero Free →
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#0D1629] border border-[#0066FF]/40 rounded-2xl p-8"
          >
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-wider mb-2">For Advertisers</div>
            <div className="font-serif text-4xl text-white mb-1">CPM</div>
            <div className="text-sm text-[#9AA5B4] mb-6">Pay per 1,000 invoice impressions</div>
            <ul className="space-y-3 mb-8">
              {advertiserFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#9AA5B4]">
                  <Check className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="/for-advertisers"
              whileHover={{ scale: 1.02 }}
              className="block text-center py-3 border border-[#0066FF]/40 text-[#0066FF] rounded-xl font-medium hover:border-[#0066FF]/70 transition-colors"
            >
              Start Advertising →
            </motion.a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: "rgba(13,22,41,0.5)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl text-white mb-8 text-center"
          >
            Common questions
          </motion.h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#0D1629] border border-white/[0.08] rounded-xl p-5"
              >
                <div className="font-medium text-white mb-2">{item.q}</div>
                <div className="text-sm text-[#9AA5B4] leading-relaxed">{item.a}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
