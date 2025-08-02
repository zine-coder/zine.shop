/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'dropdown-appear': 'dropdown-appear 0.2s ease-out forwards',
        'toast-enter': 'toast-enter 0.3s ease-out forwards',
        'toast-exit': 'toast-exit 0.3s ease-out forwards',
        'cart-bounce': 'cart-bounce 0.5s ease-in-out',
        'fly-to-cart': 'fly-to-cart 0.6s ease-in-out forwards',
        'count-change': 'count-change 0.3s ease-in-out',
        'slide-in-right': 'slide-in-right 0.3s forwards',
        'slide-out-right': 'slide-out-right 0.3s forwards',
      },
      keyframes: {
        'toast-enter': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-exit': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-20px)' },
        },
        'cart-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'fly-to-cart': {
          '0%': { transform: 'scale(1) translateX(0) translateY(0)', opacity: '1' },
          '70%': { opacity: '0.7' },
          '100%': { transform: 'scale(0.1) translateX(500px) translateY(-500px)', opacity: '0' },
        },
        'count-change': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
