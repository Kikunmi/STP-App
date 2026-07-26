/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm sunset coral — primary
        brand: {
          50: '#fff3ed',
          100: '#ffe4d5',
          200: '#ffc4a8',
          300: '#ff9d70',
          400: '#ff7a45',
          500: '#f9531e',
          600: '#ea3a0e',
          700: '#c22b0d',
          800: '#9a2513',
          900: '#7c2213',
        },
        // Ocean teal — accent / secondary
        accent: {
          50: '#effcf9',
          100: '#c8f4ea',
          200: '#95e8d9',
          300: '#5bd3c1',
          400: '#2fb8a7',
          500: '#159a8d',
          600: '#0e7c73',
          700: '#10635d',
          800: '#124f4b',
          900: '#13423f',
        },
        // Golden sand — highlights
        sand: {
          50: '#fdf9ef',
          100: '#f8edcf',
          200: '#f1d99b',
          300: '#e9c063',
          400: '#e3a83a',
          500: '#d68f22',
        },
        teal: {
          400: '#2fb8a7',
          500: '#159a8d',
          600: '#0e7c73',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(124,34,19,0.06)',
        card: '0 8px 24px rgba(124,34,19,0.08)',
        elevated: '0 16px 40px rgba(124,34,19,0.14)',
        glow: '0 8px 30px rgba(249,83,30,0.28)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff7a45 0%, #f9531e 55%, #ea3a0e 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #ff9d70 0%, #f9531e 45%, #159a8d 130%)',
        'hero-radial':
          'radial-gradient(1200px 600px at 50% -10%, #ffe4d5 0%, #fff8f3 55%, #ffffff 100%)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
