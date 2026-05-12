"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;
    let rafId: number;

    const update = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(from + (to - from) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      }
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, from, to, duration]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {prefix}
      {formatNumber(current)}
      {suffix}
    </span>
  );
}
