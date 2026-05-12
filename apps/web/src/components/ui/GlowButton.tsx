"use client";

import Link from "next/link";
import clsx from "clsx";
import type { CSSProperties } from "react";

interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "gold";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  "data-cursor-gold"?: string;
}

const BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "14px",
  letterSpacing: "0.02em",
  fontWeight: 500,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  textDecoration: "none",
  outline: "none",
  position: "relative",
  whiteSpace: "nowrap",
};

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "#ffffff",
    border: "none",
    boxShadow:
      "0 0 20px rgba(0,82,255,0.4), 0 0 60px rgba(0,82,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.2)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-1)",
    border: "1px solid var(--border)",
    boxShadow: "none",
  },
  gold: {
    background: "linear-gradient(135deg, #C9A84C 0%, #F5D78E 100%)",
    color: "#04070F",
    border: "none",
    boxShadow:
      "0 0 20px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.1)",
    fontWeight: 600,
  },
};

export function GlowButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: GlowButtonProps) {
  const style = { ...BASE, ...VARIANT_STYLES[variant] };

  const hoverClass = clsx(
    variant === "primary" &&
      "hover:shadow-[0_0_40px_rgba(0,82,255,0.6),_0_0_80px_rgba(0,82,255,0.25),_inset_0_-1px_0_rgba(255,255,255,0.2)] hover:scale-[1.02]",
    variant === "ghost" &&
      "hover:[border-color:var(--accent)] hover:[background:rgba(0,82,255,0.05)]",
    variant === "gold" &&
      "hover:shadow-[0_0_40px_rgba(201,168,76,0.5),_0_0_80px_rgba(201,168,76,0.2)] hover:scale-[1.02]",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        style={style}
        className={hoverClass}
        data-cursor-gold={variant === "gold" ? "true" : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={hoverClass}
      data-cursor-gold={variant === "gold" ? "true" : undefined}
    >
      {children}
    </button>
  );
}
