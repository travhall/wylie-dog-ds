// Scoped ESLint config for the Token Bridge Figma plugin.
//
// Intentionally standalone: it does NOT touch the monorepo root
// eslint.config.mjs (a no-op pass-through other workspaces rely on) or the
// shared @repo/eslint-config. Its sole job today is the type-safety ratchet —
// surfacing `any` usage via @typescript-eslint/no-explicit-any at "warn" and
// driving the count to zero one batch at a time. The `lint` script pins
// --max-warnings to the current baseline so the number can only go down.
//
// See memory: project_figma_plugin_typesafety_ratchet.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", ".turbo/**", "coverage/**", "**/*.config.*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
