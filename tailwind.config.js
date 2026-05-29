/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'electric': '#00d4ff',
        'neon-orange': '#ff6b00',
        'neon-green': '#00ff88',
        'dark-bg': '#050510',
        'dark-panel': '#0d0d2b',
        'dark-card': '#12122a',
      },
      fontFamily: {
        'industrial': ['Rajdhani', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        }
      }
    },
  },
  plugins: [],
}
