/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        critico: "#dc2626",
        moderado: "#f59e0b",
        leve: "#16a34a",
        resuelto: "#6b7280",
      },
    },
  },
  plugins: [],
};
