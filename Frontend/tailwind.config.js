/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-white': '#FFFFFF',
        'theme-pale': '#DBEAFE',
        'theme-navy': '#0A2463',
        'theme-blue': '#1E3FA0',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
