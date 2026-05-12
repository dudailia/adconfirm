"use client";

import { useState } from "react";
import { motion } from "framer-motion";

function formatGBP(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function EarningsCalc() {
  const [invoices, setInvoices] = useState(500);
  const monthly = invoices * 0.08;
  const annual = monthly * 12;
  const pct = ((invoices - 100) / (10000 - 100)) * 100;

  return (
    <div className="bg-[#162035] border border-white/[0.08] rounded-2xl p-6">
      <h3 className="text-xs font-mono text-[#9AA5B4] uppercase tracking-wider mb-5">
        Earnings Calculator
      </h3>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-[#9AA5B4]">Invoices / month</span>
          <span className="font-mono text-white text-xl">{invoices.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={invoices}
          onChange={(e) => setInvoices(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-transparent"
          style={{
            background: `linear-gradient(to right, #0066FF ${pct}%, #1E2D45 ${pct}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#9AA5B4] mt-1.5">
          <span>100</span>
          <span>10,000</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0D1629] rounded-xl p-4">
          <div className="text-xs text-[#9AA5B4] mb-1.5">Monthly</div>
          <motion.div
            key={monthly}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="font-mono text-lg font-medium text-white"
          >
            {formatGBP(monthly)}
          </motion.div>
        </div>
        <div className="bg-[#0D1629] rounded-xl p-4">
          <div className="text-xs text-[#9AA5B4] mb-1.5">Annual</div>
          <motion.div
            key={annual}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="font-mono text-lg font-medium text-[#0066FF]"
          >
            {formatGBP(annual)}
          </motion.div>
        </div>
      </div>

      <p className="text-[11px] text-[#9AA5B4]">
        Based on £0.08 avg per placement. Actual results vary by industry and advertiser.
      </p>
    </div>
  );
}
