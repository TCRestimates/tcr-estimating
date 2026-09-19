import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TCR Brand Colors
        brand: {
          orange: '#FF6B35',
          blue: '#1E3A8A',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}

export default config
