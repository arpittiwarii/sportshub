/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E6FF00", // Neon Yellow - Main accent
        accent: {
          red: "#FF2D2D",     // Strength/Power sections
          green: "#2ECC71",   // Performance/Endurance sections
          yellow: "#E6FF00"   // Primary accent
        },
        dark: {
          900: "#0B0B0B",     // Main background
          800: "#1A1A1A",     // Section/card background
          700: "#2A2A2A",     // Borders
          600: "#3B3B3B",     // Muted controls
        },
        secondary: "#1d4ed8", // Deep blue (kept for compatibility)
        light: "#FFFFFF"      // Primary text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
