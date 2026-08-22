/** @type {import('tailwindcss').Config} */

// Every color is backed by a CSS variable holding space-separated RGB channels,
// so utilities keep working with opacity modifiers (bg-primary/10) AND swap
// automatically between the .theme-light / :root(dark) token sets in index.css.
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — use these in new/refactored code
        bg: c('--bg'),
        surface: {
          DEFAULT: c('--surface'),
          2: c('--surface-2'),
        },
        border: c('--border'),
        content: {
          DEFAULT: c('--text'),
          muted: c('--text-muted'),
          subtle: c('--text-subtle'),
        },
        primary: {
          DEFAULT: c('--primary'),
          hover: c('--primary-hover'),
          contrast: c('--primary-contrast'),
        },
        steel: c('--steel'),
        success: c('--success'),
        danger: c('--danger'),
        ring: c('--ring'),

        // Legacy aliases — repoint the classes already scattered through the app
        // to the new variable-backed tokens (zero JSX churn, auto theme-swap).
        dark: {
          900: c('--bg'),
          800: c('--surface'),
          700: c('--border'),
          600: c('--surface-2'),
        },
        light: c('--text'),
        accent: {
          green: c('--success'),
          red: c('--danger'),
          yellow: c('--primary'),
        },
        secondary: c('--steel'),
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
      },
      boxShadow: {
        // Soft elevation tuned for the navy surfaces
        card: '0 10px 30px -12px rgb(0 0 0 / 0.45)',
      },
    },
  },
  plugins: [],
}
