/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          deep: '#EA580C',
          light: '#FFF1E6',
          cream: '#FFFDF8',
          bg: '#FFFCF7',
          text: '#1F2937',
          muted: '#6B7280',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(249, 115, 22, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'warm-md': '0 4px 12px rgba(249, 115, 22, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 10px 25px rgba(249, 115, 22, 0.12), 0 4px 6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
