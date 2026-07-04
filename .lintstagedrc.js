const path = require("path");

// Quote a path so filenames with spaces survive shell interpolation.
const quote = (f) => `"${f}"`;

// apps/figma-plugin is under an incremental @typescript-eslint/no-explicit-any
// ratchet: its package `lint` script caps TOTAL warnings (enforced in CI), so a
// per-file `--max-warnings 0` here would block committing partially-cleaned
// files. For that package we only autofix + format; every other package keeps
// the strict zero-warning gate.
const isFigmaPlugin = (f) =>
  f.split(path.sep).join("/").includes("/apps/figma-plugin/");

module.exports = {
  // TypeScript and TSX files
  "**/*.{ts,tsx}": (files) => {
    const figma = files.filter(isFigmaPlugin);
    const strict = files.filter((f) => !isFigmaPlugin(f));
    const commands = [];

    if (strict.length) {
      const list = strict.map(quote).join(" ");
      commands.push(`eslint --fix --max-warnings 0 --no-warn-ignored ${list}`);
      commands.push(`prettier --write ${list}`);
    }

    if (figma.length) {
      const list = figma.map(quote).join(" ");
      commands.push(`eslint --fix --no-warn-ignored ${list}`);
      commands.push(`prettier --write ${list}`);
    }

    return commands;
  },

  // Markdown files
  "**/*.md": ["prettier --write"],

  // JSON files
  "**/*.json": ["prettier --write"],

  // Package.json specifically (with plugin)
  "package.json": ["prettier --write"],
};
