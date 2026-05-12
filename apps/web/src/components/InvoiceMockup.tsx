"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function InvoiceMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [8, -8]), {
    stiffness: 100,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-8, 8]), {
    stiffness: 100,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.3) 0%, transparent 70%)" }}
      />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[340px] sm:w-[380px] bg-white rounded-2xl overflow-hidden text-gray-900 text-xs leading-relaxed"
        whileHover={{ scale: 1.02 }}
      >
        {/* Drop shadow via box-shadow */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.05)" }}
        />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-8 h-8 bg-gray-900 rounded-md mb-2 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">M</span>
              </div>
              <div className="font-semibold text-sm text-gray-900">Meridian Design Studio</div>
              <div className="text-[11px] text-gray-400 mt-0.5">hello@meridiandesign.co</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Invoice</div>
              <div className="font-mono font-semibold text-sm text-gray-900 mt-0.5">#INV-2024-0847</div>
              <div className="text-[11px] text-gray-400 mt-1">Due 30 Nov 2024</div>
            </div>
          </div>
        </div>

        {/* Bill to */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Bill To</div>
          <div className="font-medium text-gray-900 text-[11px]">Acme Technologies Ltd</div>
        </div>

        {/* Line items */}
        <div className="px-6 py-3">
          <div className="grid grid-cols-3 text-[9px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-1.5">
            <span className="col-span-2">Description</span>
            <span className="text-right">Amount</span>
          </div>
          {[
            { item: "Brand Strategy", amount: "£2,400" },
            { item: "Visual Identity", amount: "£1,800" },
            { item: "Web Design", amount: "£3,200" },
          ].map((row) => (
            <div key={row.item} className="grid grid-cols-3 py-1.5 border-b border-gray-50">
              <span className="col-span-2 text-[11px] text-gray-700">{row.item}</span>
              <span className="text-right font-mono text-[11px] text-gray-900">{row.amount}</span>
            </div>
          ))}

          <div className="mt-2 space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Subtotal</span><span className="font-mono">£7,400.00</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>VAT (20%)</span><span className="font-mono">£1,480.00</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-sm pt-1.5 border-t border-gray-200">
              <span>Total Due</span><span className="font-mono">£8,880.00</span>
            </div>
          </div>
        </div>

        {/* Fiscal close */}
        <div className="px-6 py-2 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[8px] font-mono text-gray-300 whitespace-nowrap tracking-widest">─ FISCAL CLOSE ─</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Ad block */}
        <div className="mx-4 mb-4 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
          <div className="text-[8px] font-mono text-blue-400 uppercase tracking-[0.15em] mb-1.5">Sponsored</div>
          <div className="font-semibold text-[11px] text-gray-900 mb-1 leading-tight">
            Save 20% on your next software subscription
          </div>
          <div className="text-[9px] text-gray-500 mb-2 leading-relaxed">
            Exclusive offer for invoice recipients
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[9px] font-semibold px-2.5 py-1 rounded-md cursor-pointer">
              Claim Offer →
            </span>
            {/* QR code placeholder */}
            <div className="w-9 h-9 bg-white rounded border border-gray-200 flex items-center justify-center p-1">
              <div className="w-full h-full grid grid-cols-3 gap-px">
                {[1,1,1,1,0,1,1,1,1].map((v, i) => (
                  <div key={i} className={`rounded-[1px] ${v ? 'bg-gray-800' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AdConfirm badge */}
        <div className="px-4 pb-3 flex justify-end">
          <span className="text-[7px] font-mono text-gray-300 tracking-wider">Powered by AdConfirm</span>
        </div>
      </motion.div>
    </div>
  );
}
