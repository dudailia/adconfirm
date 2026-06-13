import type { CSSProperties } from "react";

// Animated hero backdrop: three slow-drifting radial blobs (blue / cyan / gold)
// + a faint set of horizontal lines drifting left→right, over the brand grid.
// Pure CSS animation — zero JS, GPU-composited, paused under prefers-reduced-motion
// (see globals.css). Purely decorative, so aria-hidden.

const blob = (s: CSSProperties): CSSProperties => ({
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(64px)",
  ...s,
});

export default function MeshBackground() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
    >
      {/* Brand grid */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mesh-grid-fade" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="78%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="mesh-grid-mask">
            <rect width="100%" height="100%" fill="url(#mesh-grid-fade)" />
          </mask>
          <pattern id="mesh-grid-pat" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#1A2540" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh-grid-pat)" mask="url(#mesh-grid-mask)" />
      </svg>

      {/* Drifting mesh blobs */}
      <div
        className="mesh-blob"
        style={{ ...blob({ top: "-12%", left: "-6%", width: 640, height: 640, background: "radial-gradient(circle, rgba(0,82,255,0.30) 0%, transparent 68%)" }), animation: "meshDriftA 19s ease-in-out infinite" }}
      />
      <div
        className="mesh-blob"
        style={{ ...blob({ top: "-4%", right: "-12%", width: 580, height: 580, background: "radial-gradient(circle, rgba(0,194,255,0.18) 0%, transparent 70%)" }), animation: "meshDriftB 23s ease-in-out infinite" }}
      />
      <div
        className="mesh-blob"
        style={{ ...blob({ bottom: "-24%", left: "32%", width: 520, height: 520, background: "radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 72%)" }), animation: "meshDriftC 27s ease-in-out infinite" }}
      />

      {/* Drifting horizontal lines */}
      <svg
        className="hero-lines"
        width="120%"
        height="100%"
        style={{ position: "absolute", inset: 0, left: "-10%", opacity: 0.45 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mesh-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0052FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00C2FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="100%"
            y1={`${10 + i * 13}%`}
            y2={`${10 + i * 13}%`}
            stroke="url(#mesh-line-grad)"
            strokeWidth="1"
            style={{
              transformBox: "fill-box",
              animation: `lineDrift ${16 + i * 2}s ease-in-out ${i * -1.5}s infinite alternate`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
