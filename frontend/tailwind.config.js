/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        green: {
          50: "#F1FAF6",
          100: "#DCF3E8",
          200: "#BDE6D2",
          300: "#90D3B1",
          400: "#5CBA8C",
          500: "#1A7151",
          600: "#135E42",
          700: "#0D4A34",
          800: "#0B3321",
          900: "#072115",
        },
        emerald: {
          50: "#F1FAF6",
          100: "#DCF3E8",
          200: "#BDE6D2",
          300: "#90D3B1",
          400: "#5CBA8C",
          500: "#1A7151",
          600: "#135E42",
          700: "#0D4A34",
          800: "#0B3321",
          900: "#072115",
        },
        amber: {
          50: "#FDF8F3",
          100: "#FBF0E2",
          200: "#F5DCBE",
          300: "#EBC293",
          400: "#DEA263",
          500: "#A6763C",
          600: "#8E6230",
          700: "#734F25",
          800: "#583C1C",
          900: "#3E2A12",
        },
        brand: {
          DEFAULT: "#1A7151",
          soft: "#DFBD73"
        },
        primary: {
          DEFAULT: "#1A7151",
          dark: "#0B3321",
          light: "#DFBD73"
        },
        secondary: {
          DEFAULT: "#A6763C",
          dark: "#8E6230",
          light: "#DFBD73"
        },
        accent: {
          DEFAULT: "#DFBD73",
          dark: "#A6763C",
          light: "#FDF8F3"
        },
        danger: {
          DEFAULT: "#EF4444",
          dark: "#B91C1C",
          light: "#FEE2E2"
        },
        warning: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
          light: "#FEF3C7"
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#15803D",
          light: "#DCFCE7"
        },
        muted: "#6B7280",
        panel: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "Inter", "system-ui", "sans-serif"],
        logo: ["Outfit", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
        'elevated': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}
