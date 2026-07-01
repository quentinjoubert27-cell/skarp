import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        carbon: '#171717',
        lime: '#C6FF34',
        cards: '#262626',
        c3: '#303030',
        red: '#FF4D4D',
        orange: '#FF8C42',
      },
      fontFamily: {
        barlow: ['var(--font-barlow)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulseRed 2s infinite',
        'fade-in': 'fadeIn .3s ease',
      },
      keyframes: {
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,77,77,.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255,77,77,0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
