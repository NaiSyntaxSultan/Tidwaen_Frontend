/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-40px)" },
        },
        floatX: {
          "0%, 100%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(40px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatX: "floatX 8s ease-in-out infinite",
      },
      fontFamily: {
        saira: ["Saira Stencil One", "sans-serif"],
        battambang: ["Battambang", "cursive"],
        goldman: ["Goldman", "sans-serif"],
      },
    },
  },
  plugins: [],
};