/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: {
          DEFAULT: "#e5e7eb",
          dark: "#334155",
        },
        input: {
          DEFAULT: "#d1d5db",
          dark: "#475569",
        },
        background: {
          DEFAULT: "#ffffff",
          secondary: "#f9fafb",
          dark: "#0f172a",
          "dark-secondary": "#1e293b",
        },
        foreground: {
          DEFAULT: "#111827",
          secondary: "#374151",
          muted: "#4b5563",
          "dark-primary": "#ffffff",
          "dark-secondary": "#cbd5e1",
        },
        primary: {
          DEFAULT: "#1e40af",
          foreground: "#ffffff",
          dark: "#3b82f6",
        },
        secondary: {
          DEFAULT: "#60a5fa",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f9fafb",
          foreground: "#4b5563",
          dark: "#1e293b",
          "dark-foreground": "#cbd5e1",
        },
        accent: {
          DEFAULT: "#60a5fa",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
          dark: "#1e293b",
          "dark-foreground": "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        logo: "1.25rem",
        h1: "3.75rem",
        h2: "1.25rem",
        base: "1rem",
        sm: "0.875rem",
      },
      spacing: {
        nav: "5rem",
        section: "4rem",
        element: "1rem",
        "element-lg": "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

