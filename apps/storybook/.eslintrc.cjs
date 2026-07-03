/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/storybook.js", "plugin:storybook/recommended"],
  rules: {
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "Literal[value=/(?:text|bg|border|from|via|to|ring|fill|stroke|divide|outline)-(?:gray|slate|zinc|neutral|stone|blue|red|green|yellow|amber|orange|emerald|teal|indigo|violet|purple|pink|rose)-[0-9]{2,3}/]",
        message:
          "Use design-system semantic tokens (e.g. text-(--color-text-secondary)) instead of hardcoded Tailwind scale classes. See STORY_AUTHORING_GUIDE.md.",
      },
      {
        selector:
          "TemplateElement[value.raw=/(?:text|bg|border|from|via|to|ring|fill|stroke|divide|outline)-(?:gray|slate|zinc|neutral|stone|blue|red|green|yellow|amber|orange|emerald|teal|indigo|violet|purple|pink|rose)-[0-9]{2,3}/]",
        message:
          "Use design-system semantic tokens instead of hardcoded Tailwind scale classes. See STORY_AUTHORING_GUIDE.md.",
      },
    ],
  },
};
