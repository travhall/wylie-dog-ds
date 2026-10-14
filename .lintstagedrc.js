// Quote a path so filenames with spaces survive shell interpolation.
const quote = (f) => `"${f}"`;

module.exports = {
  // TypeScript and TSX files. The showcase keeps a ratcheted warning cap in its
  // own `lint` script (no-hardcoded-oklch warnings), so staged showcase files are
  // checked for errors only here; every other file must have zero warnings.
  "**/*.{ts,tsx}": (files) => {
    const isShowcase = (f) => f.includes("/apps/showcase/");
    const strict = files.filter((f) => !isShowcase(f));
    const showcase = files.filter(isShowcase);
    const list = (fs) => fs.map(quote).join(" ");
    const commands = [];
    if (strict.length) {
      commands.push(
        `eslint --fix --max-warnings 0 --no-warn-ignored ${list(strict)}`
      );
    }
    if (showcase.length) {
      commands.push(`eslint --fix --no-warn-ignored ${list(showcase)}`);
    }
    commands.push(`prettier --write ${list(files)}`);
    return commands;
  },

  // Markdown files
  "**/*.md": ["prettier --write"],

  // JSON files
  "**/*.json": ["prettier --write"],

  // Package.json specifically (with plugin)
  "package.json": ["prettier --write"],
};
