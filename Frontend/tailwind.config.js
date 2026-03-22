/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1e3a5f', light: '#2b4f7e', dark: '#152c49', 50: '#eff6ff', 100: '#dbeafe', 900: '#0f1d30' },
        orange: { DEFAULT: '#f97316', light: '#fb923c', dark: '#ea580c', 50: '#fff7ed', 100: '#ffedd5' },
        cyan: { DEFAULT: '#0891b2', light: '#22d3ee', dark: '#0e7490', 50: '#f0fdfa' },
        surface: { DEFAULT: '#f8fafc', dark: '#f1f5f9' },
        border: { DEFAULT: '#e2e8f0', dark: '#cbd5e1' },
        content: { primary: '#111827', secondary: '#475569', muted: '#94a3b8' },
      },
      boxShadow: {
        'navbar': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}