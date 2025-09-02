/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a1a2e',
        'brand-navy': '#16213e',
        'brand-blue': '#0f3460',
        'brand-accent': '#e94560',
        'brand-light': '#f0f0f0',
        'brand-dark-blue': '#0a192f',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
