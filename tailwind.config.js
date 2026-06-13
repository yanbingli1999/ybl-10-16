/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        "clinic-deep": "#0f4c5c",
        "clinic-jade": "#2a9d8f",
        "clinic-light-jade": "#66c2b5",
        "clinic-amber": "#e9c46a",
        "clinic-warm": "#f4a261",
        "clinic-crisis": "#e76f51",
        "clinic-bg": "#f6f5f0",
        "clinic-card": "#fffef7",
        "clinic-border": "#d4c9a8",
      },
      fontFamily: {
        display: ['"ZCOOL XiaoWei"', '"Noto Serif SC"', "serif"],
        body: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(15, 76, 92, 0.15)",
        glow: "0 0 20px rgba(42, 157, 143, 0.5)",
        danger: "0 0 20px rgba(231, 111, 81, 0.5)",
      },
      animation: {
        "pulse-danger": "pulse-danger 1.5s ease-in-out infinite",
        "slide-in": "slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "heal-glow": "heal-glow 0.8s ease-out",
        shake: "shake 0.5s ease-in-out",
        "float-up": "float-up 1s ease-out forwards",
        fade: "fade 0.3s ease-out",
      },
      keyframes: {
        "pulse-danger": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(231, 111, 81, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(231, 111, 81, 0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "heal-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(42, 157, 143, 0.8)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 40px 20px rgba(42, 157, 143, 0.2)", transform: "scale(1.05)" },
          "100%": { boxShadow: "0 0 0 0 rgba(42, 157, 143, 0)", transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
