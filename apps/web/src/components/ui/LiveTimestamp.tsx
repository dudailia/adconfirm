"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export function LiveTimestamp({ className, style: styleProp }: { className?: string; style?: CSSProperties }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 100ms interval — 10 updates/second, imperceptible vs 120fps for a timestamp
    const id = setInterval(() => {
      if (spanRef.current) spanRef.current.textContent = Date.now().toString();
    }, 100);
    return () => clearInterval(id);
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
        // Prevent surrounding layout from reflowing as digits change width
        display: "inline-block",
        minWidth: "13ch",
        fontVariantNumeric: "tabular-nums",
        ...styleProp,
      }}
    />
  );
}
