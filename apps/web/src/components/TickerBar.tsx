"use client";

const ITEMS = [
  "✦ 847,291 ads served today",
  "✦ £0.08 avg CPM",
  "✦ 2.1ms avg injection time",
  "✦ 12,400 invoices processed this week",
  "✦ 94 businesses connected",
  "✦ Zero changes to your workflow",
  "✦ 40%+ average open rate",
];

// Triple the items for seamless loop
const TICKERS = [...ITEMS, ...ITEMS, ...ITEMS];

export function TickerBar() {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
        position: "relative",
        height: 40,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Left fade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to right, var(--bg-2), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {/* Right fade */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to left, var(--bg-2), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div
        className="ticker-inner"
        style={{
          display: "flex",
          whiteSpace: "nowrap" as const,
          animation: "marquee 35s linear infinite",
          willChange: "transform",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = "running";
        }}
      >
        {TICKERS.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-2)",
              padding: "0 32px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {item.startsWith("✦") ? (
              <>
                <span style={{ color: "var(--accent)" }}>✦</span>
                {item.slice(2)}
              </>
            ) : (
              item
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
