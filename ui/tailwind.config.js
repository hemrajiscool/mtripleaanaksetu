/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        gov: {
          950: '#06090F',
          900: '#0B0F19',
          850: '#101626',
          800: '#161F33',
          700: '#23304E',
          600: '#344773',
          500: '#4B659E',
          400: '#758EC7',
          300: '#A6BAE6',
          200: '#D2DEF7',
          100: '#EDF3FD',
          50: '#F8FAFD',
        },
        status: {
          statutory: '#EF4444',
          'statutory-bg': '#450A0A',
          defect: '#F59E0B',
          'defect-bg': '#451A03',
          review: '#8B5CF6',
          'review-bg': '#2E1065',
          conformant: '#10B981',
          'conformant-bg': '#022C22',
        },
      },
    },
  },
  plugins: [],
}


