import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#f97316",
          "primary-hover": "#ea580c",
          accent: "#2563eb",
          "accent-soft": "#eff6ff",
          gold: "#fbb40b",
          heading: "#0f172a",
          body: "#334155",
          muted: "#64748b",
          surface: "#ffffff",
          "surface-soft": "#f8fafc",
          "surface-warm": "#fff7e6",
          border: "#e2e8f0",
        },
        availability: {
          open: "#22c55e",
          low: "#fbb40b",
          full: "#ef4444",
          cutoff: "#94a3b8",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", '"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "80rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
