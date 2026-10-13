import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f3f6f2",
          100: "#e4ebe1",
          200: "#cad8c5",
          300: "#a9c0a2",
          400: "#88a680",
          500: "#6c8c64",
          600: "#56724f",
          700: "#455b40",
          800: "#384a35",
        },
        cream: {
          50: "#fcfaf6",
          100: "#f7f2e9",
          200: "#eee5d4",
          300: "#e0d0b2",
          400: "#c9b38a",
        },
        navy: {
          500: "#4a5a75",
          600: "#3a4862",
          700: "#2c3850",
          800: "#1f2a3e",
          900: "#172032",
        },
        clay: {
          50: "#fbf3f0",
          100: "#f5e2dc",
          400: "#c98a7a",
          600: "#a4604f",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,42,62,0.04), 0 4px 16px rgba(31,42,62,0.06)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
