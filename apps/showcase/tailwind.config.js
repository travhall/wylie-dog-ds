import baseConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    // Include UI package components
    "./node_modules/@wyliedog/ui/dist/**/*.{js,mjs}",
  ],
};
