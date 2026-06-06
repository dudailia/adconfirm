import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050A14",
        surface: "#0D1629",
        "surface-2": "#162035",
        accent: "#0066FF",
        "accent-dim": "#0052CC",
        muted: "#1E2D45",
        "muted-fg": "#9AA5B4",
        border: "rgba(255,255,255,0.08)",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
