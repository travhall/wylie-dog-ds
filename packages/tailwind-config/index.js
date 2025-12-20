/**
 * Tailwind Configuration for Wylie Dog Design System Apps
 * 
 * This provides base Tailwind configuration for apps to generate utilities.
 * Design tokens are handled by @wyliedog/ui package CSS import.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // App-specific content patterns (to be overridden by apps)
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    
    // Include UI package components for token detection
    "./node_modules/@wyliedog/ui/dist/**/*.{js,mjs}",
  ],
  
  // Base theme - tokens come from @wyliedog/ui/styles import
  theme: {
    extend: {
      // Semantic color token mappings
      colors: {
        // Primitive colors (already available via @theme)
        // These are mapped for convenience alongside semantic tokens

        // Common shadcn/ui-style aliases for semantic tokens
        'background': 'var(--color-background-primary)',
        'foreground': 'var(--color-text-primary)',
        'muted': {
          DEFAULT: 'var(--color-background-secondary)',
          foreground: 'var(--color-text-secondary)',
        },
        'accent': {
          DEFAULT: 'var(--color-interactive-secondary)',
          foreground: 'var(--color-text-primary)',
        },
        'border': 'var(--color-border-primary)',
        'primary': {
          DEFAULT: 'var(--color-interactive-primary)',
          foreground: 'var(--color-text-inverse)',
        },
        'secondary': {
          DEFAULT: 'var(--color-interactive-secondary)',
          foreground: 'var(--color-text-primary)',
        },
        'destructive': {
          DEFAULT: 'var(--color-background-danger)',
          foreground: 'var(--color-text-inverse)',
        },

        // Semantic background colors
        'background-primary': 'var(--color-background-primary)',
        'background-secondary': 'var(--color-background-secondary)',
        'background-tertiary': 'var(--color-background-tertiary)',
        'background-inverse': 'var(--color-background-inverse)',
        'background-brand': 'var(--color-background-brand)',

        // Semantic surface colors
        'surface-primary': 'var(--color-surface-primary)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-overlay': 'var(--color-surface-overlay)',
        'surface-brand': 'var(--color-surface-brand)',
        'surface-success': 'var(--color-surface-success)',
        'surface-warning': 'var(--color-surface-warning)',
        'surface-danger': 'var(--color-surface-danger)',
        'surface-info': 'var(--color-surface-info)',

        // Semantic text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-disabled': 'var(--color-text-disabled)',
        'text-inverse': 'var(--color-text-inverse)',
        'text-brand': 'var(--color-text-brand)',
        'text-success': 'var(--color-text-success)',
        'text-warning': 'var(--color-text-warning)',
        'text-danger': 'var(--color-text-danger)',
        'text-info': 'var(--color-text-info)',

        // Semantic border colors
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-focus': 'var(--color-border-focus)',
        'border-brand': 'var(--color-border-brand)',
        'border-success': 'var(--color-border-success)',
        'border-warning': 'var(--color-border-warning)',
        'border-danger': 'var(--color-border-danger)',
        'border-info': 'var(--color-border-info)',

        // Semantic interactive colors
        'interactive-primary': 'var(--color-interactive-primary)',
        'interactive-primary-hover': 'var(--color-interactive-primary-hover)',
        'interactive-primary-active': 'var(--color-interactive-primary-active)',
        'interactive-secondary': 'var(--color-interactive-secondary)',
        'interactive-secondary-hover': 'var(--color-interactive-secondary-hover)',
        'interactive-secondary-active': 'var(--color-interactive-secondary-active)',
        'interactive-success': 'var(--color-interactive-success)',
        'interactive-success-hover': 'var(--color-interactive-success-hover)',
        'interactive-warning': 'var(--color-interactive-warning)',
        'interactive-warning-hover': 'var(--color-interactive-warning-hover)',
        'interactive-danger': 'var(--color-interactive-danger)',
        'interactive-danger-hover': 'var(--color-interactive-danger-hover)',
      },
    },
  },
  
  plugins: [
    // Common plugins can be added here
  ],
};
