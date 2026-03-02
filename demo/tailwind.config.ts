import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/blocks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.1)',
        background: '#000000',
        foreground: '#ffffff',
        muted: {
          foreground: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  },
  plugins: [typography],
}

export default config
