/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meridian-white': '#FFFFFF',
        'meridian-pale': '#DBEAFE',
        'meridian-navy': '#0A2463',
        'meridian-blue': '#1E3FA0',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
