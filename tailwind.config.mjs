/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#444c67",       // azul oscuro
        primaryHover: "#262a39",  // azul oscuro hover
        aqua: "#c1dbda",          // turquesa
      },
      fontFamily: {
      league: "var(--font-league)",
      roboto: "var(--font-roboto)",
      },
    },
  },
  plugins: [],
};

export default config;
