/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ayush: {
          50: '#f4f9f4',
          100: '#e5f2e5',
          500: '#2e7d32',
          600: '#1b5e20',
          700: '#0d3811',
          gold: '#c59b27'
        },
        kiosk: {
          bg: '#f8fafc',
          card: '#ffffff',
          primary: '#0284c7', // vibrant clinical blue
          hover: '#0369a1',
          accent: '#059669', // clinical emerald
          danger: '#dc2626', // red flag
          dark: '#0f172a'
        }
      },
      minHeight: {
        touch: '48px'
      },
      minWidth: {
        touch: '48px'
      }
    },
  },
  plugins: [],
}
