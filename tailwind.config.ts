import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f4f7fb",
        card: "#ffffff",
        ink: "#111827",
        muted: "#6b7280",
        accent: "#0f766e",
        accentSoft: "#ccfbf1",
        success: "#047857",
        warning: "#b45309"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Sora'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 20% 10%, #e0f2fe 0%, transparent 40%), radial-gradient(circle at 80% 0%, #d1fae5 0%, transparent 36%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"
      }
    }
  },
  plugins: []
};

export default config;
