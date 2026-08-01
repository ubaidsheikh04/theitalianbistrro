/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair-display': ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in-out-1': 'fadeInOut 10s infinite',
        'fade-in-out-2': 'fadeInOut 10s infinite 5s',
      },
      keyframes: {
        fadeInOut: {
          '0%, 45%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
