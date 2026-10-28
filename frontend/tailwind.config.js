/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#ECE3DA',
        },
        lavender: {
          50: '#F7F5FC',
          100: '#EFEBF8',
          200: '#DFD7F2',
          300: '#C7B8E6',
          400: '#A48ED4',
          500: '#7E69AB',
          600: '#695394',
          700: '#534078',
        },
        coolblue: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8DCFF',
          500: '#2563EB',
          600: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
