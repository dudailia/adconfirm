"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGold, setIsGold] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setIsVisible(true);

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const isInteractive = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "A" || tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA") return true;
      if ((el as HTMLElement).getAttribute("role") === "button") return true;
      return false;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const interactive =
        isInteractive(target) ||
        !!target.closest("a") ||
        !!target.closest("button");
      setIsHovered(interactive);
      if (interactive) {
        const el = target.closest("[data-cursor-gold]");
        setIsGold(!!el);
      } else {
        setIsGold(false);
      }
    };

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      }
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringWrapRef.current) {
        ringWrapRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Solid dot — instant tracking */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "white",
          zIndex: 99999,
          pointerEvents: "none",
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      {/* Ring wrapper — lerp-tracked */}
      <div
        ref={ringWrapRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <div
          ref={ringRef}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid ${isGold ? "var(--gold)" : "rgba(255,255,255,0.5)"}`,
            transform: isHovered ? "scale(1.5)" : "scale(1)",
            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1), border-color 0.2s ease",
          }}
        />
      </div>
    </>
  );
}
