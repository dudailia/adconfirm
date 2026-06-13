"use client";

import { MotionConfig } from "framer-motion";

// Native scroll — the OS handles this at 120fps with zero JS overhead.
// Lenis was intercepting scroll events and re-implementing them in JS,
// which caps the feel at ~60fps regardless of display refresh rate.
//
// MotionConfig(reducedMotion="user") makes EVERY Framer Motion component on
// every route automatically honour `prefers-reduced-motion` — transforms and
// layout animations collapse to instant, opacity is preserved. CSS keyframes
// and GSAP/RAF effects are guarded separately (globals.css + per-component).
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
