/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B4F8A",
          light:   "#2E6BAE",
          dark:    "#123762",
        },
      },
      fontFamily: {
        sans: ["Arial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
