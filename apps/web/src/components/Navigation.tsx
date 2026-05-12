"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollBorder } from "../lib/hooks";
import clsx from "clsx";
import { XERO_CONNECT_URL } from '../lib/config';

export function Navigation() {
  const hasBorder = useScrollBorder();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4",
        "backdrop-blur-md bg-[#050A14]/80 transition-all duration-300",
        hasBorder && "border-b border-white/[0.08]"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0066FF] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">AC</span>
          </div>
          <span className="font-semibold text-white tracking-tight">AdConfirm</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How It Works", href: "/#how-it-works" },
            { label: "For Businesses", href: "/for-businesses" },
            { label: "For Advertisers", href: "/for-advertisers" },
            { label: "Pricing", href: "/pricing" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#9AA5B4] hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <a
          href={XERO_CONNECT_URL}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0066FF] text-white text-sm font-medium hover:bg-[#0052CC] transition-colors duration-200 animate-glow-pulse"
        >
          Connect Your Xero
        </a>
      </div>
    </motion.nav>
  );
}
