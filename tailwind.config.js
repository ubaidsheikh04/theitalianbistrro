/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-beige': '#f8f1e7',
        'brand-olive': '#3d4a39',
        'brand-gold': '#c89d7c',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};