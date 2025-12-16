/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  ignorePatterns: ["coverage/**", "dist/**"],
  rules: {},
};
