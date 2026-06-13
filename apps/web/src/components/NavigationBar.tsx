"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GlowButton } from "./ui/GlowButton";
import { SIGNUP_URL, LOGIN_URL } from "../lib/config";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Businesses", href: "/for-businesses" },
  { label: "For Advertisers", href: "/for-advertisers" },
  { label: "Pricing", href: "/pricing" },
];

export function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 3vw, 48px)",
          background: scrolled ? "rgba(4,7,15,0.97)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontStyle: "italic",
            color: "var(--text-1)",
            textDecoration: "none",
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          AdConfirm
          <sup
            style={{
              fontSize: 8,
              color: "var(--text-3)",
              fontStyle: "normal",
              fontFamily: "var(--font-sans)",
              marginTop: 4,
              marginLeft: 1,
            }}
          >
            ™
          </sup>
        </Link>

        {/* Desktop nav links — only at lg (1024px+) to prevent crowding */}
        <nav
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
          className="hidden lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--text-2)",
                textDecoration: "none",
                transition: "color 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-1)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-2)")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA — lg+ only */}
        <div
          style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}
          className="hidden lg:flex"
        >
          <Link
            href={LOGIN_URL}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--text-2)",
              textDecoration: "none",
              padding: "8px 16px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              transition: "color 0.2s ease, border-color 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            Log In
          </Link>
          <GlowButton href={SIGNUP_URL} variant="primary">
            Get Started →
          </GlowButton>
        </div>

        {/* Hamburger — visible below lg */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex lg:hidden"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-1)",
            cursor: "pointer",
            padding: 8,
            flexShrink: 0,
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
              background: "rgba(4,7,15,0.98)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(28px, 8vw, 42px)",
                    fontStyle: "italic",
                    color: "var(--text-1)",
                    textDecoration: "none",
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
            >
              <GlowButton href="/for-businesses" variant="primary">
                Get Started →
              </GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
