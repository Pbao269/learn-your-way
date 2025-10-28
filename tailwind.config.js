/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './extension/sidepanel/**/*.{html,tsx,ts}',
    './extension/sidepanel.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};

