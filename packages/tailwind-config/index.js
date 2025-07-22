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
      // Apps can extend theme here
    },
  },
  
  plugins: [
    // Common plugins can be added here
  ],
};
