import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-0)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        accentSoft: "#ccfbf1",
        line: "var(--line)",
        card: "var(--surface)",
        success: "#047857",
        warning: "#b45309",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 20% 10%, #e0f2fe 0%, transparent 40%), radial-gradient(circle at 80% 0%, #d1fae5 0%, transparent 36%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
