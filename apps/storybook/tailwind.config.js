import baseConfig from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    // Storybook story files
    "./stories/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
    // UI package SOURCE files (not dist) to include component classes
    "../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
