"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      dot.style.display = "none";
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "white",
        pointerEvents: "none",
        zIndex: 99999,
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    />
  );
}
