import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
      background: 'rgb(var(--background-rgb) / <alpha-value>)',
    },
    extend: {},
  },
  plugins: [],
}
export default config
