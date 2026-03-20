/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#030005',
          900: '#0a0010',
          800: '#120018',
          700: '#1a0025',
        },
        crimson: {
          400: '#ff4444',
          500: '#cc0000',
          600: '#990000',
          700: '#660000',
          glow: '#ff000080',
        },
        amber: {
          vhs: '#ffb300',
        },
        rift: {
          400: '#b44fff',
          500: '#8b00ff',
        }
      },
      fontFamily: {
        pixel: ['"VT323"', 'monospace'],
        creep: ['"Creepster"', 'cursive'],
        body: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(255,0,0,0.6), 0 0 60px rgba(255,0,0,0.2)',
        'red-glow-sm': '0 0 10px rgba(255,0,0,0.5)',
        'rift-glow': '0 0 20px rgba(180,79,255,0.5)',
        'card-hover': '0 0 30px rgba(255,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8)',
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'vhs-scan': 'vhsScan 8s linear infinite',
        'carousel-scroll': 'carouselScroll 30s linear infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.7' },
          '99%': { opacity: '1' },
        },
        vhsScan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        carouselScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,0,0,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,0,0,0.8), 0 0 60px rgba(255,0,0,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'void-gradient': 'radial-gradient(ellipse at center, #1a0025 0%, #0a0010 50%, #030005 100%)',
        'card-gradient': 'linear-gradient(135deg, #120018 0%, #0a0010 50%, #030005 100%)',
        'stat-bar': 'linear-gradient(90deg, #cc0000, #ff4444)',
        'stat-bar-stealth': 'linear-gradient(90deg, #1a0050, #8b00ff)',
        'stat-bar-rift': 'linear-gradient(90deg, #003366, #0066ff)',
      },
    },
  },
  plugins: [],
}
