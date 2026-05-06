import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "rock":      "rock 0.55s ease-in-out infinite",
        "slow-spin": "slow-spin 4s linear infinite",
        "flicker":   "flicker 0.15s ease-in-out infinite alternate",
      },
      keyframes: {
        rock: {
          "0%, 100%": { transform: "rotate(-12deg)" },
          "50%":      { transform: "rotate(12deg)" },
        },
        "slow-spin": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        flicker: {
          "0%":   { transform: "scale(1)   translateY(0px)" },
          "100%": { transform: "scale(1.1) translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
