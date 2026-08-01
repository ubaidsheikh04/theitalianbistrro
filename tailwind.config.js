/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        crossFade1: {
          '0%, 35%': { opacity: 1 },
          '65%, 100%': { opacity: 0 },
        },
        crossFade2: {
          '0%, 35%': { opacity: 0 },
          '65%, 100%': { opacity: 1 },
        },
      },
      animation: {
        'cross-fade-1': 'crossFade1 10s linear infinite',
        'cross-fade-2': 'crossFade2 10s linear infinite',
      },
    },
  },
  plugins: [],
};