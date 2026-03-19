/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: '#CAFF00',
        'bg-dark': '#0A0A0A',
        'bg-card': '#121212',
        'bg-surface': '#1E1E1E',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
    },
  },
  plugins: [],
};
