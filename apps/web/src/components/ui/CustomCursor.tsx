"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Skip entirely on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      dot.style.display = "none";
      ring.style.display = "none";
      return;
    }

    // Current positions — stored outside React, no state triggers
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let rafId: number;
    let isHovering = false;
    let isOnCTA = false;

    // Dot follows cursor instantly — direct DOM mutation, zero React involvement
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    // Hover detection via event delegation — one listener on document
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isCTA = !!target.closest("[data-cta]");
      const isLink = !!target.closest('a, button, [role="button"]');

      if (isCTA && !isOnCTA) {
        isOnCTA = true;
        isHovering = true;
        ring.style.width = "60px";
        ring.style.height = "60px";
        ring.style.borderColor = "var(--gold)";
        ring.style.backgroundColor = "rgba(201, 168, 76, 0.08)";
      } else if (isLink && !isHovering) {
        isHovering = true;
        ring.style.width = "44px";
        ring.style.height = "44px";
        ring.style.borderColor = "var(--accent)";
        ring.style.backgroundColor = "transparent";
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = !!target.closest('a, button, [role="button"]');
      if (isLink) {
        isHovering = false;
        isOnCTA = false;
        ring.style.width = "36px";
        ring.style.height = "36px";
        ring.style.borderColor = "rgba(240, 244, 255, 0.35)";
        ring.style.backgroundColor = "transparent";
      }
    };

    // Ring lerps toward cursor at true 60/120fps — bypasses React entirely
    const LERP = 0.14;

    const tick = () => {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      // Direct style mutation — no setState, no re-render
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <>
      {/* Dot — 8px, instant position via RAF, mix-blend-mode: difference */}
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
          backgroundColor: "var(--text-1)",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      {/* Ring — 36px default, lerp trails behind cursor */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid rgba(240, 244, 255, 0.35)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform",
          // Transitions ONLY for size/color — never for position (that's the RAF's job)
          transition:
            "width 0.2s cubic-bezier(0.4,0,0.2,1), height 0.2s cubic-bezier(0.4,0,0.2,1), border-color 0.2s ease, background-color 0.2s ease",
        }}
      />
    </>
  );
}
