import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4a',
        danger: '#e3342f',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}

export default config