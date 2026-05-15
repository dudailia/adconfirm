import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#04070F",
        surface: "#0a1020",
        "surface-2": "#121a2e",
        accent: "#0052FF",
        "accent-hover": "#1a66ff",
        muted: "#1e293b",
        "muted-fg": "#94a3b8",
        border: "rgba(255,255,255,0.08)",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
