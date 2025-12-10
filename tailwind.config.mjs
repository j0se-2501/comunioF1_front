/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#444c67",       // azul oscuro
        "primary-hover": "#262a39",  // azul oscuro hover
        aqua: "#c1dbda",          // fondo verde-azulado
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
