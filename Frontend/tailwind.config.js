/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F7F1EA",
        primary: "#2A1A14",
        accent: "#8D7B6D", // Slightly darker accent for readability on white
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
