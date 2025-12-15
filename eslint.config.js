// Root ESLint configuration for monorepo
// Minimal config to satisfy lint-staged

import tsParser from "@typescript-eslint/parser";

export default [
  // Global ignores for the entire monorepo
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".turbo/**",
      "coverage/**",
      "storybook-static/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.css",
      "**/*.md",
    ],
  },

  // Basic TypeScript/React config
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // No rules - just pass through
    },
  },
];
