/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#030509',
        abyss: '#04070c', ink: '#070b12', panel: '#0a0f16', panel2: '#0d1420',
        cyan2: '#cfe3ee', mist: '#9fb4c2', faint: '#728795',
        teal: '#7fd4e8',
      },
      fontFamily: {
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
