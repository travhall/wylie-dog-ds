import tseslint from "typescript-eslint";
import globals from "globals";
import "eslint-plugin-only-warn";

/*
 * ESLint flat config for Node/TypeScript library packages.
 *
 * Hand-composed replacement for the old @vercel/style-guide-based config:
 * @vercel/style-guide is incompatible with ESLint 10 (its @rushstack/eslint-patch
 * dependency hard-throws above ESLint 9). See
 * plans/062-migrate-eslint-config-off-vercel-style-guide.md for the full
 * investigation.
 */
export default [
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["node_modules/**", "dist/**"],
  },
];
