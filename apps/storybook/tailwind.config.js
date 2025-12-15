import baseConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    "./stories/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
    // Include UI package components
    "./node_modules/@wyliedog/ui/dist/**/*.{js,mjs}",
  ],
};
