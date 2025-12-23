import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const tokensRoot = path.resolve(__dirname, "..");
const uiSrcDir = path.join(repoRoot, "packages", "ui", "src");
const documentationDir = path.join(repoRoot, "documentation", "tokens");
const coverageReportPath = path.join(documentationDir, "ui-token-coverage.md");

async function collectFiles(dir, exts) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, exts)));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractUsedVariables(content) {
  const regex = /var\(\s*(--[a-z0-9-]+)/gi;
  const matches = new Set();
  let match;

  while ((match = regex.exec(content))) {
    matches.add(match[1]);
  }

  return matches;
}

function extractDefinedVariables(content) {
  const regex = /(--[a-z0-9-]+)\s*:/gi;
  const matches = new Set();
  let match;

  while ((match = regex.exec(content))) {
    matches.add(match[1]);
  }

  return matches;
}

async function loadUITokenUsage() {
  const fileExts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"];
  const files = await collectFiles(uiSrcDir, fileExts);
  const used = new Set();

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const vars = extractUsedVariables(content);
    vars.forEach((token) => used.add(token));
  }

  return used;
}

async function loadDefinedTokens() {
  const tokensCssPath = path.join(tokensRoot, "dist", "tokens.css");
  const content = await readFile(tokensCssPath, "utf8");
  return extractDefinedVariables(content);
}

function buildSummary(used, defined) {
  const missing = [...used].filter((token) => !defined.has(token)).sort();
  const unused = [...defined].filter((token) => !used.has(token)).sort();
  const covered = [...used].filter((token) => defined.has(token)).sort();

  return {
    totals: {
      used: used.size,
      defined: defined.size,
      usedAndDefined: covered.length,
      missing: missing.length,
      unused: unused.length,
    },
    missing,
    unused,
    covered,
  };
}

function buildMarkdown(summary) {
  return `# UI Token Coverage

_Last updated: ${new Date().toISOString()}_

| Metric | Count |
| ------ | -----:|
| Tokens used in UI | ${summary.totals.used} |
| Tokens defined in @wyliedog/tokens | ${summary.totals.defined} |
| Used & defined | ${summary.totals.usedAndDefined} |
| Missing definitions | ${summary.totals.missing} |
| Defined but unused in UI | ${summary.totals.unused} |

## Missing Tokens
${summary.missing.length === 0 ? "- None 🎉" : summary.missing.map((token) => `- ${token}`).join("\n")}

## Defined but Unused Tokens
${summary.unused.length === 0 ? "- None" : summary.unused.map((token) => `- ${token}`).join("\n")}
`;
}

async function ensureDocumentationDir() {
  await import("fs/promises").then(({ mkdir }) =>
    mkdir(documentationDir, { recursive: true })
  );
}

async function main() {
  const used = await loadUITokenUsage();
  const defined = await loadDefinedTokens();
  const summary = buildSummary(used, defined);
  const markdown = buildMarkdown(summary);

  await ensureDocumentationDir();
  await writeFile(coverageReportPath, markdown, "utf8");

  console.log("✅ Token coverage report saved to:");
  console.log(`   ${path.relative(repoRoot, coverageReportPath)}`);
  if (summary.missing.length > 0) {
    console.warn("⚠️ Missing tokens detected:");
    summary.missing.forEach((token) => console.warn(`   - ${token}`));
  }
}

main().catch((err) => {
  console.error("❌ Failed to build token coverage report:", err);
  process.exit(1);
});
