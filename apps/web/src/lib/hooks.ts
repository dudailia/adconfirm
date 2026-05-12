"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function useMouseParallax(strength = 0.1) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 80, damping: 20 });
  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    },
    [x, y, strength]
  );

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return { x: springX, y: springY };
}

export function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function useScrollBorder() {
  const [hasBorder, setHasBorder] = useState(false);

  useEffect(() => {
    const handler = () => setHasBorder(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return hasBorder;
}
