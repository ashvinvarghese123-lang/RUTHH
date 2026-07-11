import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F9F7F3",   // warm paper white — background
        card: "#FFFFFF",    // cards
        ink: "#1B1B1B",     // objects / charcoal black
        text: "#1B1B1B",    // dark black text
        accent: {
          DEFAULT: "#DCCDB8", // muted beige
          dark: "#C9B79E",    // hover/active state derived from accent
        },
        secondary: "#CFCFCF", // soft gray secondary accent
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(27, 27, 27, 0.05), 0 8px 24px rgba(27, 27, 27, 0.04)",
        lift: "0 8px 30px rgba(27, 27, 27, 0.09)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(1deg)" },
          "50%": { transform: "translateY(-10px) rotate(-1deg)" },
        },
        pageFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-8deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
