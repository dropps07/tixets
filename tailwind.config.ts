import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39FF14',
          blue: '#00FFFF',
          pink: '#FF10F0',
        },
      },
      animation: {
        glow: 'glow 1s ease-in-out infinite alternate',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #39FF14, 0 0 20px #39FF14, 0 0 35px #39FF14, 0 0 40px #39FF14' },
          '100%': { textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #39FF14, 0 0 40px #39FF14, 0 0 70px #39FF14, 0 0 80px #39FF14' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config