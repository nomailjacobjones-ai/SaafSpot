/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBF8F3',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1F2620',
          soft: '#3A4339',
          muted: '#6B7468',
        },
        forest: {
          50: '#EAF3EC',
          100: '#D2E6D6',
          200: '#A7CDAE',
          300: '#7BB385',
          400: '#4F985F',
          500: '#2E7D43',
          600: '#236A35',
          700: '#1B5429',
          800: '#163E20',
          900: '#102C17',
        },
        coral: {
          50: '#FFF1ED',
          100: '#FFE0D6',
          200: '#FFC2B0',
          300: '#FF9E81',
          400: '#F9755A',
          500: '#E85A3F',
          600: '#C8442C',
          700: '#A23322',
          800: '#7D271B',
          900: '#5C1D15',
        },
        sand: {
          100: '#F2ECE0',
          200: '#E6DCC8',
        },
        amber: {
          50: '#FFF8E6',
          100: '#FFEDB8',
          200: '#FFE08A',
          700: '#9A6B00',
        },
        rose: {
          50: '#FFF1F0',
          200: '#FFC9C4',
          700: '#9B2722',
        },
        sky: {
          50: '#EEF6FB',
          200: '#BFDAEE',
          700: '#1B527A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,44,23,0.04), 0 4px 14px rgba(16,44,23,0.06)',
        pop: '0 8px 30px rgba(16,44,23,0.14)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
};
