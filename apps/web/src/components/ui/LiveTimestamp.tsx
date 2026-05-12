"use client";

import { useEffect, useRef } from "react";

export function LiveTimestamp({ className }: { className?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId: number;
    let nextFlicker = Date.now() + 2000 + Math.random() * 2000;

    const update = () => {
      const now = Date.now();
      if (spanRef.current) {
        spanRef.current.textContent = now.toString();

        if (now >= nextFlicker) {
          spanRef.current.style.opacity = "0.2";
          setTimeout(() => {
            if (spanRef.current) spanRef.current.style.opacity = "1";
          }, 50);
          nextFlicker = now + 2000 + Math.random() * 2000;
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <span
      ref={spanRef}
      className={className}
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--accent-2)",
        fontSize: "12px",
        letterSpacing: "0.1em",
        transition: "opacity 0.05s",
        userSelect: "none",
      }}
    />
  );
}
