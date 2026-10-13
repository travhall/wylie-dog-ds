// Showcase ESLint config.
//
// ESLint 10 only reads flat config, so the legacy .eslintrc.json next to this
// file is ignored and, before this file existed, the showcase linted against the
// root config, which has no rules. This config adds one rule; it does not turn
// on the Next.js rule set.
//
// no-hardcoded-oklch: pages must use tokens (var(--color-…)) or read values
// from the manifest instead of typing OKLCH colors. It is a warning so existing
// literals do not fail the build, and `lint` caps the total with --max-warnings
// so no new ones can be added. Lower the cap in package.json as they are removed.

import tsParser from "@typescript-eslint/parser";

const message =
  "Hardcoded OKLCH value. Use a token such as var(--color-…) or read the value from the tokens manifest.";

export default [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "prototype/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/__tests__/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-restricted-syntax": [
        "warn",
        { selector: "Literal[value=/oklch\\(/]", message },
        { selector: "TemplateElement[value.raw=/oklch\\(/]", message },
      ],
    },
  },
];
