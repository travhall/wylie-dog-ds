// Quote a path so filenames with spaces survive shell interpolation.
const quote = (f) => `"${f}"`;

module.exports = {
  // TypeScript and TSX files
  "**/*.{ts,tsx}": (files) => {
    const list = files.map(quote).join(" ");
    return [
      `eslint --fix --max-warnings 0 --no-warn-ignored ${list}`,
      `prettier --write ${list}`,
    ];
  },

  // Markdown files
  "**/*.md": ["prettier --write"],

  // JSON files
  "**/*.json": ["prettier --write"],

  // Package.json specifically (with plugin)
  "package.json": ["prettier --write"],
};
