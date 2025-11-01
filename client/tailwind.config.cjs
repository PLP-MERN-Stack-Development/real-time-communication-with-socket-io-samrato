/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        dark: {
          100: '#1f2937',
          200: '#111827',
          300: '#0f172a',
          400: '#020617',
        }
      },
      animation: {
        'theme-toggle': 'themeToggle 0.3s ease-in-out',
      },
      keyframes: {
        themeToggle: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}