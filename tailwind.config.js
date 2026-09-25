/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f7',
          100: '#e3e3e7',
          200: '#c7c7cf',
          300: '#a3a3b1',
          400: '#7a798f',
          500: '#5c5b73',
          600: '#464559',
          700: '#343444',
          800: '#1e1e28',
          900: '#121218',
          950: '#0b0b0f',
        }
      }
    },
  },
  plugins: [],
}
