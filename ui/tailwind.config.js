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
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        gov: {
          950: '#0F172A',
          900: '#1E293B',
          850: '#334155',
          800: '#475569',
          700: '#64748B',
          600: '#94A3B8',
          500: '#CBD5E1',
          400: '#E2E8F0',
          300: '#F1F5F9',
          200: '#F8FAFC',
          100: '#FFFFFF',
          50: '#FFFFFF',
        },
        status: {
          statutory: '#EF4444',
          'statutory-bg': '#FEF2F2',
          defect: '#F59E0B',
          'defect-bg': '#FFFBEB',
          review: '#3B82F6',
          'review-bg': '#EFF6FF',
          conformant: '#10B981',
          'conformant-bg': '#ECFDF5',
        },
      },
    },
  },
  plugins: [],
}


