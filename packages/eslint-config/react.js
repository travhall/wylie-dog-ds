import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import "eslint-plugin-only-warn";

/*
 * ESLint flat config for React library packages.
 *
 * Hand-composed replacement for the old @vercel/style-guide-based config:
 * @vercel/style-guide is incompatible with ESLint 10 (its @rushstack/eslint-patch
 * dependency hard-throws above ESLint 9). See
 * plans/062-migrate-eslint-config-off-vercel-style-guide.md for the full
 * investigation.
 *
 * react-hooks rules are hand-picked (rather than spreading the plugin's own
 * "recommended" preset) to match what the old config actually enforced --
 * eslint-plugin-react-hooks@7's presets bundle React Compiler-oriented rules
 * (immutability, purity, set-state-in-render, ...) that were never part of
 * this repo's rule set and would surface a large, unrelated violation
 * backlog on an existing, non-Compiler-authored codebase.
 *
 * settings.react.version is pinned explicitly (not "detect") because
 * eslint-plugin-react@7.37.5's version auto-detection calls the ESLint
 * `context.getFilename()` method, which ESLint 10 removed -- "detect"
 * crashes the linter outright rather than producing a rule violation.
 */
export default [
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "19.2.8",
      },
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "**/*.css"],
  },
];
