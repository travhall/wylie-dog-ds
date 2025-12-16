/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  overrides: [
    {
      files: ["src/**/*.{js,jsx,ts,tsx}"],
      plugins: ["jsx-a11y"],
      extends: ["plugin:jsx-a11y/recommended"],
      rules: {
        // Allow flexibility for design system components
        "jsx-a11y/anchor-has-content": ["warn", {
          components: ["Link", "a", "PaginationLink", "BreadcrumbLink"],
        }],
        "jsx-a11y/heading-has-content": ["error", {
          components: ["h1", "h2", "h3", "h4", "h5", "h6"],
        }],
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "jsx-a11y/click-events-have-key-events": "warn",
      },
      settings: {
        "jsx-a11y": {
          components: {
            Button: "button",
            Input: "input",
            Select: "select",
            Textarea: "textarea",
            Label: "label",
            Link: "a",
            Image: "img",
            PaginationLink: "a",
            BreadcrumbLink: "a",
            AlertTitle: null,
            CardTitle: null,
            Avatar: null,
            Card: null,
            Alert: null,
          },
        },
      },
    },
  ],
};
