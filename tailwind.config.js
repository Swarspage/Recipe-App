/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0E0E0F",
        surface: "#2A1A14",
        primary: "#F7F1EA",
        accent: "#B7A79A",
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        poiret: ["Poiret One", "cursive"],
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
}
