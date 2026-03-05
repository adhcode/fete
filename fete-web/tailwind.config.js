/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'clash': ['ClashDisplay', 'sans-serif'],
        'satoshi': ['Satoshi', 'sans-serif'],
      },
      colors: {
        'charcoal': '#2D2D2D',
        'gold': '#FFD700',
        'yellow': '#FFC107',
        'coral': '#FF6B6B',
        'purple': '#9B59B6',
      },
    },
  },
  plugins: [],
}
