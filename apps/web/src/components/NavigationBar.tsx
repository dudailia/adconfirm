"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GlowButton } from "./ui/GlowButton";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Businesses", href: "#for-businesses" },
  { label: "For Advertisers", href: "#for-advertisers" },
  { label: "Pricing", href: "#pricing" },
];

export function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-section") ?? "");
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
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
          padding: "0 clamp(20px, 4vw, 48px)",
          background: scrolled ? "rgba(4,7,15,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
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

        {/* Desktop nav links */}
        <nav
          style={{ display: "flex", gap: 28, alignItems: "center" }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: isActive ? "var(--text-1)" : "var(--text-2)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  position: "relative",
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 1,
                      background: "var(--accent)",
                      borderRadius: 1,
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div
          style={{ display: "flex", gap: 10, alignItems: "center" }}
          className="hidden md:flex"
        >
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--text-2)",
              textDecoration: "none",
              padding: "8px 16px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
          >
            Log In
          </Link>
          <GlowButton href="http://localhost:4000/auth/xero/connect" variant="primary">
            Connect Xero →
          </GlowButton>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex md:hidden"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-1)",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
              background: "rgba(4,7,15,0.97)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontStyle: "italic",
                  color: "var(--text-1)",
                  textDecoration: "none",
                  lineHeight: 1,
                }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <GlowButton
                href="http://localhost:4000/auth/xero/connect"
                variant="primary"
              >
                Connect Xero →
              </GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
