import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0B10",
          900: "#12141C",
          800: "#1B1E29"
        },
        paper: {
          50: "#FAFAFC",
          100: "#F2F3F8"
        },
        signal: {
          violet: "#5B4CF5",
          cyan: "#22D3EE",
          coral: "#FF6B6B"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        "signal-gradient": "linear-gradient(135deg, #5B4CF5 0%, #22D3EE 100%)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(20, 20, 40, 0.15)",
        "soft-dark": "0 8px 30px -12px rgba(0, 0, 0, 0.6)"
      }
    }
  },
  plugins: []
};

export default config;
