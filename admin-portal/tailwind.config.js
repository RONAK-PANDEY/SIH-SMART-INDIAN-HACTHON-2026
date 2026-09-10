/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        subtle: '0 1px 3px rgb(15 23 42 / 0.08)',
      },
    },
  },
  plugins: [],
};
