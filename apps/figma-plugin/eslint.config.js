// Scoped ESLint config for the Token Bridge Figma plugin.
//
// Intentionally standalone: it does NOT touch the monorepo root
// eslint.config.mjs (a no-op pass-through other workspaces rely on) or the
// shared @repo/eslint-config. The type-safety ratchet drove
// @typescript-eslint/no-explicit-any from a baseline of 358 to 0 — the rule
// is now "error" so the codebase stays any-free.
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
      "@typescript-eslint/no-explicit-any": "error",
    },
  }
);
