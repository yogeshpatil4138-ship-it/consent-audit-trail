/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:     { DEFAULT: "#08122A", 2: "#0E1B3D", 3: "#16285A" },
        paper:   "#E9EEF8",
        mist:    "#9AABC6",
        saffron: { DEFAULT: "#F4A63B", deep: "#D98A1C" },
        seal:    "#35C3AE",
        rose:    "#F0647A",
        sky:     "#6EA8FF",
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
      },
      borderRadius: { panel: "1.5rem" },
    },
  },
  plugins: [],
};
