/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#8098F9',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        slatebg: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0 4px 20px -2px rgba(79, 70, 229, 0.12)',
        'card-light': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'modal-light': '0 20px 40px -15px rgba(15, 23, 42, 0.12)'
      }
    },
  },
  plugins: [],
}
