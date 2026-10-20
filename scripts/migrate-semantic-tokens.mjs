#!/usr/bin/env node
// Single-use tool for the semantic colour token rename (plans 175 to 177).
// Deleted in plan 177; git history keeps it.
//
// The rename adds the new names next to the old ones (expand), moves every
// consumer (migrate), then removes the old names (contract). This tool does
// the mechanical parts and proves the values are preserved.
//
// Usage: node scripts/migrate-semantic-tokens.mjs <command>
//   snapshot [--force]  record every old token's resolved value (Light, Dark)
//   expand              add the new tokens to semantic.json, values copied
//   verify              check each new token resolves to its old token's value
//   repoint             repoint component aliases from old names to new names
//   contract            delete the old semantic colour tokens
//   rewrite [--check]   rewrite old names in consumer files (dry run with --check)
//   sweep               list any old name left in consumer files
//
// Reads scripts/semantic-token-map.json. Run from the repo root.

import fs from "node:fs";
import { execSync } from "node:child_process";

const MODES = ["Light", "Dark"];
const MAP_PATH = "scripts/semantic-token-map.json";
const SNAPSHOT_PATH = "scripts/semantic-token-snapshot.json";
const syncPath = (name) => `packages/tokens/io/sync/${name}.json`;

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const map = readJson(MAP_PATH);

/** The `variables` object of a collection's single-collection array file. */
const load = (name) =>
  Object.assign({}, ...readJson(syncPath(name)))[name].variables;

/** Write `variables` back into the same array-wrapper structure. */
function save(name, variables) {
  const data = readJson(syncPath(name));
  const entry = data.find((e) => e[name]);
  entry[name].variables = variables;
  fs.writeFileSync(syncPath(name), JSON.stringify(data, null, 2) + "\n");
}

const all = () => ({
  ...load("primitive"),
  ...load("semantic"),
  ...load("components"),
});

/** Final colour string for a token in one mode, following alias chains. */
function resolve(name, mode, tokens = all()) {
  let token = tokens[name];
  if (!token) throw new Error(`unknown token "${name}"`);
  let value = token.valuesByMode?.[mode] ?? token.$value;
  for (
    let i = 0;
    i < 10 && typeof value === "string" && value.startsWith("{");
    i++
  ) {
    const next = value.slice(1, -1);
    token = tokens[next];
    if (!token) throw new Error(`"${name}" references unknown token "${next}"`);
    value = token.valuesByMode?.[mode] ?? token.$value;
  }
  return value;
}

const newNames = () =>
  new Set([
    ...Object.values(map.mapping).flatMap((m) => m.to),
    ...Object.keys(map.newTokens),
  ]);

const isAlias = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v);

// ---------- commands ----------

function snapshot() {
  if (fs.existsSync(SNAPSHOT_PATH) && !process.argv.includes("--force")) {
    throw new Error(`${SNAPSHOT_PATH} exists; pass --force to overwrite`);
  }
  const tokens = all();
  const out = {};
  for (const old of Object.keys(map.mapping)) {
    out[old] = Object.fromEntries(
      MODES.map((mode) => [mode, resolve(old, mode, tokens)])
    );
  }
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`Snapshot: ${Object.keys(out).length} tokens`);
}

function expand() {
  const semantic = load("semantic");
  const created = {};
  for (const name of newNames()) {
    if (semantic[name]) continue;
    if (map.newTokens[name]) {
      const { light, dark, description } = map.newTokens[name];
      created[name] = {
        after: "color.text.info",
        token: {
          $type: "color",
          $value: light,
          valuesByMode: { Light: light, Dark: dark },
          $description: description,
        },
      };
      continue;
    }
    const source = map.sources[name];
    if (!semantic[source]) throw new Error(`${name}: missing source ${source}`);
    created[name] = {
      after: source,
      token: {
        ...structuredClone(semantic[source]),
        $description:
          map.descriptionOverrides[name] ?? semantic[source].$description,
      },
    };
  }
  const bySource = {};
  for (const [name, { after }] of Object.entries(created)) {
    (bySource[after] ??= []).push(name);
  }
  const next = {};
  for (const [key, token] of Object.entries(semantic)) {
    next[key] = token;
    for (const name of bySource[key] ?? []) next[name] = created[name].token;
  }
  if (
    Object.keys(next).length !==
    Object.keys(semantic).length + Object.keys(created).length
  ) {
    throw new Error("an insertion point was not found");
  }
  save("semantic", next);
  console.log(`Added ${Object.keys(created).length} tokens`);
}

function verify() {
  const snap = readJson(SNAPSHOT_PATH);
  const tokens = all();
  const changed = new Set(map.valueChanges);
  const problems = [];
  let checked = 0;
  for (const [old, m] of Object.entries(map.mapping)) {
    if (m.action === "retire") continue;
    for (const to of m.to) {
      for (const mode of MODES) {
        const after = resolve(to, mode, tokens);
        const before = snap[old][mode];
        if (changed.has(old)) {
          console.log(`${old} (${mode}): ${before} -> ${after}`);
        } else if (after !== before) {
          problems.push(`${old} -> ${to} (${mode}): ${before} vs ${after}`);
        }
      }
    }
    if (!changed.has(old)) checked++;
  }
  for (const name of Object.keys(map.newTokens)) {
    for (const mode of MODES) resolve(name, mode, tokens);
  }
  if (problems.length) {
    console.error(`Value mismatches:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(`Values preserved: ${checked} mappings checked`);
}

function repoint() {
  const components = load("components");
  let changed = 0;
  const failures = [];
  const target = (token, alias) => {
    const old = alias.slice(1, -1);
    const m = map.mapping[old];
    if (!m) return alias;
    const forced = map.componentRepoints[token];
    if (forced) return `{${forced}}`;
    if (m.action === "split" || m.action === "retire") {
      failures.push(`${token} aliases ${old} (${m.action})`);
      return alias;
    }
    return `{${m.to[0]}}`;
  };
  for (const [name, token] of Object.entries(components)) {
    if (isAlias(token.$value)) {
      const next = target(name, token.$value);
      if (next !== token.$value) {
        token.$value = next;
        changed++;
      }
    }
    for (const [mode, value] of Object.entries(token.valuesByMode ?? {})) {
      if (!isAlias(value)) continue;
      const next = target(name, value);
      if (next !== value) {
        token.valuesByMode[mode] = next;
        changed++;
      }
    }
  }
  if (failures.length) {
    console.error(`Cannot repoint:\n${failures.join("\n")}`);
    process.exit(1);
  }
  save("components", components);
  console.log(`Repointed ${changed} alias values`);
}

function contract() {
  const semantic = load("semantic");
  const components = load("components");
  const keep = newNames();
  const doomed = Object.keys(map.mapping).filter(
    (name) => !keep.has(name) && semantic[name]
  );
  const doomedSet = new Set(doomed);
  const offenders = [];
  for (const [file, vars] of [
    ["components", components],
    ["semantic", semantic],
  ]) {
    for (const [name, token] of Object.entries(vars)) {
      const values = [token.$value, ...Object.values(token.valuesByMode ?? {})];
      for (const v of values) {
        if (isAlias(v) && doomedSet.has(v.slice(1, -1))) {
          offenders.push(`${file}: ${name} -> ${v}`);
        }
      }
    }
  }
  if (offenders.length) {
    console.error(`Still referenced:\n${offenders.join("\n")}`);
    process.exit(1);
  }
  for (const name of doomed) delete semantic[name];
  save("semantic", semantic);
  console.log(`Removed ${doomed.length} tokens`);
}

// ---------- consumer rewrite and sweep ----------

const INCLUDE = [
  "packages/ui/src/",
  "apps/showcase/src/",
  "apps/showcase/README_STYLING.md",
  "apps/storybook/",
  "documentation/",
  "README.md",
  "packages/tokens/README.md",
  "packages/tokens/COVERAGE.md",
  "packages/tokens/SYNC_CONTRACT.md",
  "packages/tokens/scripts/",
  "packages/tokens/style-dictionary.config.js",
  "scripts/generate-component.js",
  "scripts/contrast-pairs.json",
];
const EXTENSIONS = /\.(ts|tsx|js|mjs|css|md|mdx|json)$/;
const EXCLUDE = [
  "node_modules/",
  ".next/",
  "storybook-static/",
  "/dist/",
  "/coverage/",
  "apps/showcase/prototype/",
  "apps/figma-plugin/",
  "documentation/tokens/semantic-token-mapping.md",
  "documentation/tokens/semantic-pairing-model.md",
];

function consumerFiles() {
  return execSync("git ls-files", { encoding: "utf8", maxBuffer: 1 << 28 })
    .split("\n")
    .filter(
      (p) =>
        p &&
        EXTENSIONS.test(p) &&
        INCLUDE.some((i) => p.startsWith(i)) &&
        !EXCLUDE.some((e) => p.includes(e)) &&
        fs.existsSync(p)
    );
}

const escapeRe = (s) =>
  s.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\const commands = { snapshot, expand, verify, repoint, contract };"
  );

/** Regex matching the dotted and CSS variable forms of the given old names. */
function nameRegex(names) {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  const dotted = sorted.map(escapeRe).join("|");
  const css = sorted
    .map((n) => escapeRe("--" + n.replaceAll(".", "-")))
    .join("|");
  return new RegExp(
    `(?<![A-Za-z0-9_-])(?<css>${css})(?![A-Za-z0-9_-])|(?<![A-Za-z0-9_.-])(?<dot>${dotted})(?![A-Za-z0-9_-]|\\.[A-Za-z0-9])`,
    "g"
  );
}

const cssForm = (n) => "--" + n.replaceAll(".", "-");

function rewrite() {
  const check = process.argv.includes("--check");
  const names = Object.entries(map.mapping)
    .filter(
      ([n, m]) =>
        m.action !== "retire" &&
        m.action !== "split" &&
        n !== "color.border.strong"
    )
    .map(([n]) => n);
  const lookup = new Map();
  for (const n of names) {
    const to = map.mapping[n].to[0];
    lookup.set(n, to);
    lookup.set(cssForm(n), cssForm(to));
  }
  const re = nameRegex(names);
  let total = 0;
  let files = 0;
  for (const p of consumerFiles()) {
    const text = fs.readFileSync(p, "utf8");
    let count = 0;
    const next = text.replace(re, (m) => {
      count++;
      return lookup.get(m);
    });
    if (!count) continue;
    total += count;
    files++;
    console.log(`${p}: ${count}`);
    if (!check) fs.writeFileSync(p, next);
  }
  console.log(
    `${check ? "Would replace" : "Replaced"} ${total} in ${files} files`
  );
}

function sweep() {
  const names = Object.keys(map.mapping).filter(
    (n) => n !== "color.border.strong"
  );
  const re = nameRegex(names);
  const keyRe = new RegExp(
    `["'](?:${names.map((n) => escapeRe(n.replaceAll(".", "-"))).join("|")})["']`
  );
  let hits = 0;
  for (const p of consumerFiles()) {
    fs.readFileSync(p, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(re)) {
          console.log(`${p}:${i + 1}: ${m[0]}`);
          hits++;
        }
        const k = keyRe.exec(line);
        if (k) {
          console.log(`${p}:${i + 1}: ${k[0]}`);
          hits++;
        }
      });
  }
  if (hits) process.exit(1);
  console.log("No old token names found");
}

const commands = {
  snapshot,
  expand,
  verify,
  repoint,
  contract,
  rewrite,
  sweep,
};
const command = process.argv[2];
if (!commands[command]) {
  console.error(`Usage: ${Object.keys(commands).join(" | ")}`);
  process.exit(1);
}
commands[command]();
