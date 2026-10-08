import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@deweydocs/dewey/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
