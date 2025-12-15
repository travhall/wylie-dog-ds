module.exports = {
  // TypeScript and TSX files
  "**/*.{ts,tsx}": [
    "eslint --fix --max-warnings 0 --no-warn-ignored",
    "prettier --write",
  ],

  // Markdown files
  "**/*.md": ["prettier --write"],

  // JSON files
  "**/*.json": ["prettier --write"],

  // Package.json specifically (with plugin)
  "package.json": ["prettier --write"],
};
