/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3cdff",
          300: "#84acff",
          400: "#5686ff",
          500: "#2f63f5",
          600: "#1f48d1",
          700: "#1a3aa8",
          800: "#183285",
          900: "#182c66",
        },
      },
    },
  },
  plugins: [],
};
