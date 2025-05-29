/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Work Sans'", 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'deep-purple': {
          50: '#f3f0fa', 100: '#e0d6f5', 200: '#c1aeea', 300: '#a285df', 400: '#835dd4', 500: '#6434c9', 600: '#5029a1', 700: '#3c1f79', 800: '#281451', 900: '#140a28',
        },
        'royal-purple': {
          50: '#f5f2fa', 100: '#e5d8f5', 200: '#cbaef0', 300: '#b185eb', 400: '#975be6', 500: '#7d31e1', 600: '#6427b4', 700: '#4b1d87', 800: '#321359', 900: '#190a2c',
        },
        'hot-pink': {
          50: '#fdf0f7', 100: '#fad6eb', 200: '#f5aed7', 300: '#f085c3', 400: '#eb5caf', 500: '#e6339b', 600: '#b4297c', 700: '#871f5d', 800: '#59143e', 900: '#2c0a1f',
        },
        'coral-orange': {
          50: '#fff4f0', 100: '#ffe0d6', 200: '#ffc1ae', 300: '#ffa285', 400: '#ff835c', 500: '#ff6434', 600: '#cc5029', 700: '#993c1f', 800: '#662814', 900: '#33140a',
        },
        'goldenrod': {
          50: '#fff9f0', 100: '#fff0d6', 200: '#ffe1ae', 300: '#ffd285', 400: '#ffc35c', 500: '#ffb434', 600: '#cc9029', 700: '#996c1f', 800: '#664814', 900: '#33240a',
        },
        'ivory-cream': '#F5F5DA',
        'crimson-wine': '#7B021D',
      },
    },
  },
  plugins: [],
}

