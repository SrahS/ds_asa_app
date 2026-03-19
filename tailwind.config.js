/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0061FF',
        secondary: '#FF9318',
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        'primary-text': '#181718',
        'secondary-text': '#737373',
        background: '#FFFFFF',
        foreground: '#FBFBFB',
        'forms-background': '#F5F5F5',
        border: '#E5E5E5',
      },
      boxShadow: {
        soft: '0px 0px 10px rgba(38, 38, 38, 0.1)',
        hard: '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
      },
      fontFamily: {
        light: ['Inter-Light', 'inter'],
        medium: ['Inter-Medium', 'inter'],
        bold: ['Inter-Bold', 'inter'],
        black: ['Inter-Black', 'inter'],
      },
    },
  },
  plugins: [],
};