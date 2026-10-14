// Showcase ESLint config.
//
// ESLint 10 only reads flat config, so this file replaces the old
// .eslintrc.json (removed). It enables the Next.js core-web-vitals rule set
// (eslint-config-next) and one custom rule.
//
// no-hardcoded-oklch: pages must use tokens (var(--color-…)) or read values
// from the manifest instead of typing OKLCH colors. It is a warning so existing
// literals do not fail the build, and `lint` caps the total with --max-warnings
// so no new ones can be added. Lower the cap in package.json as they are removed.

import tsParser from "@typescript-eslint/parser";
import coreWebVitals from "eslint-config-next/core-web-vitals";

const message =
  "Hardcoded OKLCH value. Use a token such as var(--color-…) or read the value from the tokens manifest.";

export default [
  ...coreWebVitals,
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
