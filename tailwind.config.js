/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-felt': '#0F5132',
        'poker-felt-light': '#198754',
        'poker-gold': '#FFD700',
        'poker-red': '#DC3545',
        'card-white': '#FEFEFE',
      },
      fontFamily: {
        'poker': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
