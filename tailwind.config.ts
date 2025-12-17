import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sdh: {
          bg: '#ffffff',
          surface: '#ffffff',
          'bg-dark': '#05070b',
          'surface-dark': '#111317',
          primary: '#0050b8',
          accent: '#ff6a1a',
          accent2: '#07b357',
          text: '#111827',
          'text-muted': '#6b7280',
          'text-dark': '#f9fafb',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.18)',
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
}

export default config
