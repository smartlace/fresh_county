/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fadac2',
          300: '#f7c194',
          400: '#f39d64',
          500: '#fe4501',
          600: '#e03e01',
          700: '#bc3400',
          800: '#982a00',
          900: '#7a2200',
        },
        orange: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fadac2',
          300: '#f7c194',
          400: '#f39d64',
          500: '#fe4501',
          600: '#e03e01',
          700: '#bc3400',
          800: '#982a00',
          900: '#7a2200',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'screen': '100vh',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}