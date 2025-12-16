/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  ignorePatterns: ["coverage/**"],
  rules: {
    // Disable jsx-a11y rules in main lint - they run in lint:a11y separately
    "jsx-a11y/anchor-has-content": "off",
    "jsx-a11y/heading-has-content": "off",
  },
};
