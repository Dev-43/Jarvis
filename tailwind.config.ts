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
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        background: "#09090b",
        surface: "#111113",
        "surface-elevated": "#18181b",
        border: "#27272a",
        "border-subtle": "#1f1f23",
        crimson: {
          DEFAULT: "#e11d48",
          muted: "rgba(225, 29, 72, 0.12)",
          border: "rgba(225, 29, 72, 0.28)",
          text: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
