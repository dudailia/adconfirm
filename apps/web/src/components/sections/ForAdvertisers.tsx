"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Open rates", value: "40%+", sub: "Average invoice open rate" },
  { label: "Intent signal", value: "Purchase moment", sub: "Highest-intent B2B document" },
  { label: "Pricing model", value: "CPM", sub: "No minimums, pay as you go" },
];

export function ForAdvertisers() {
  return (
    <section id="for-advertisers" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-mono text-[#0066FF] uppercase tracking-[0.2em] mb-3">For Advertisers</div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
              Reach customers at the moment of purchase
            </h2>
            <p className="text-[#9AA5B4] leading-relaxed mb-8">
              Your ad appears on an invoice — the highest-intent document in B2B. The customer just spent money. They&apos;re in buying mode. No banner blindness. No scroll-past. Just your brand, at the right moment.
            </p>
            <motion.a
              href="/for-advertisers"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#0066FF]/30 text-[#0066FF] rounded-xl text-sm font-medium hover:border-[#0066FF]/60 transition-colors"
            >
              Explore Advertiser Options →
            </motion.a>
          </motion.div>

          <div className="space-y-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#0D1629] border border-white/[0.08] rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-[#9AA5B4] mb-0.5">{s.label}</div>
                  <div className="text-xs text-[#9AA5B4]">{s.sub}</div>
                </div>
                <div className="font-mono text-xl font-medium text-white ml-4">{s.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
