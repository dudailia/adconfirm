import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:            "#04070F",
        "bg-2":        "#080D1A",
        "bg-3":        "#0C1222",
        border:        "#1A2540",
        "border-glow": "#0047CC",
        accent:        "#0052FF",
        "accent-2":    "#00C2FF",
        gold:          "#C9A84C",
        "text-1":      "#F0F4FF",
        "text-2":      "#8A9BC4",
        "text-3":      "#4A5878",
        success:       "#00E5A0",
        danger:        "#FF3B5C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,82,255,0.3), 0 0 60px rgba(0,82,255,0.1)" },
          "50%":       { boxShadow: "0 0 40px rgba(0,82,255,0.6), 0 0 80px rgba(0,82,255,0.3)" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "counter-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "25%":       { opacity: "0.85" },
          "50%":       { opacity: "1" },
          "75%":       { opacity: "0.92" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "border-flow": {
          "0%":   { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float:        "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line":  "scan-line 3s linear infinite",
        "counter-up": "counter-up 0.4s ease-out forwards",
        flicker:      "flicker 0.15s ease-in-out",
        marquee:      "marquee 30s linear infinite",
        "border-flow":"border-flow 3s linear infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
