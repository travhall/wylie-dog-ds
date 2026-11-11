import storybook from "eslint-plugin-storybook";
import * as mdx from "eslint-plugin-mdx";
import reactConfig from "./react.js";

/*
 * ESLint flat config for the Storybook app.
 *
 * Hand-composed replacement for the old @vercel/style-guide-based config:
 * @vercel/style-guide is incompatible with ESLint 10 (its @rushstack/eslint-patch
 * dependency hard-throws above ESLint 9). See Plan 062 (migrate the ESLint config off the Vercel style guide) for
 * the full investigation.
 */
export default [
  ...reactConfig,
  ...storybook.configs["flat/recommended"],
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
    }),
  },
  {
    ignores: ["node_modules/**", "dist/**"],
  },
];
