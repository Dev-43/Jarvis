import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        obsidian: {
          950: "#030305",
          900: "#07070a",
          850: "#0b0c10",
          800: "#101217",
          700: "#181b24",
          600: "#222734",
        },
        crimson: {
          50: "#fff1f3",
          100: "#ffe4e7",
          200: "#fecdd4",
          300: "#fda4b2",
          400: "#fb7188",
          500: "#f43f60",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        cyber: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          violet: "#8b5cf6",
          blue: "#3b82f6",
        },
        warden: {
          dark: "#050508",
          card: "#0b0c10",
          border: "#1c1f2b",
          muted: "#9ca3af",
          accent: "#e11d48",
          danger: "#e11d48",
          warning: "#f59e0b",
          success: "#10b981",
        },
      },
      boxShadow: {
        "crimson-glow": "0 0 25px -5px rgba(225, 29, 72, 0.35)",
        "crimson-glow-lg": "0 0 50px -10px rgba(225, 29, 72, 0.45)",
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        "cyber-glow": "0 0 25px -5px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
