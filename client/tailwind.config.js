/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0f19',       // Deep Dark Slate
          card: '#161e2e',     // Subtle Slate Card
          border: '#243249',   // Slate Border
          text: '#f3f4f6',     // Soft White
          muted: '#9ca3af'     // Muted Gray
        },
        brand: {
          indigo: '#6366f1',
          purple: '#a855f7',
          cyan: '#06b6d4',
          indigoDark: '#4f46e5',
          purpleDark: '#9333ea',
          cyanDark: '#0891b2'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
