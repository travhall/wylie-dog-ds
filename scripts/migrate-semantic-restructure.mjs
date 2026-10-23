#!/usr/bin/env node
// Single-use tool for Plan 188: the semantic colour restructure (property-first
// names, muted and emphasis, states moved to the component layer).
// Deleted in the last step of the plan; git history keeps it.
//
// Usage: node scripts/migrate-semantic-restructure.mjs <command>
//   snapshot [--force]  record resolved Light and Dark values of every semantic
//                       colour token and every component colour token, plus the
//                       component tokens' alias targets
//   expand              add the new semantic tokens beside the old ones
//   verify              check each new semantic token equals its old token
//   repoint             repoint component aliases (renames, and states to tones
//                       per mode)
//   verify-components   compare every component colour token with the snapshot;
//                       only tokens that used a changed semantic may differ
//   rewrite [--check]   rewrite old names in consumer files
//   sweep               list any old name left in consumer files
//   contract            delete the old semantic tokens
//
// Reads scripts/semantic-restructure-map.json. Run from the repo root.

import fs from "node:fs";
import { execSync } from "node:child_process";

const MODES = ["Light", "Dark"];
const MAP_PATH = "scripts/semantic-restructure-map.json";
const SNAPSHOT_PATH = "scripts/semantic-restructure-snapshot.json";
const syncPath = (name) => `packages/tokens/io/sync/${name}.json`;
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const map = readJson(MAP_PATH);

const load = (name) =>
  Object.assign({}, ...readJson(syncPath(name)))[name].variables;
function save(name, variables) {
  const data = readJson(syncPath(name));
  data.find((e) => e[name])[name].variables = variables;
  fs.writeFileSync(syncPath(name), JSON.stringify(data, null, 2) + "\n");
}
const allTokens = () => ({
  ...load("primitive"),
  ...load("semantic"),
  ...load("components"),
});
const isAlias = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v);
const aliasName = (v) => v.slice(1, -1);
const valueIn = (token, mode) => token.valuesByMode?.[mode] ?? token.$value;

function resolve(name, mode, tokens) {
  let token = tokens[name];
  if (!token) throw new Error(`unknown token "${name}"`);
  let value = valueIn(token, mode);
  for (let i = 0; i < 10 && isAlias(value); i++) {
    token = tokens[aliasName(value)];
    if (!token) throw new Error(`"${name}" references unknown ${value}`);
    value = valueIn(token, mode);
  }
  return value;
}

const oldNames = () => [...Object.keys(map.rename), ...Object.keys(map.states)];
const finalNames = () =>
  new Set([...Object.values(map.rename), ...Object.keys(map.newFromState)]);
const renamed = () =>
  Object.entries(map.rename).filter(([from, to]) => from !== to);

// ---------- snapshot ----------

function snapshot() {
  if (fs.existsSync(SNAPSHOT_PATH) && !process.argv.includes("--force")) {
    throw new Error(`${SNAPSHOT_PATH} exists; pass --force to overwrite`);
  }
  const tokens = allTokens();
  const semantic = {};
  for (const name of oldNames()) {
    semantic[name] = Object.fromEntries(
      MODES.map((m) => [m, resolve(name, m, tokens)])
    );
  }
  const components = {};
  for (const [name, token] of Object.entries(load("components"))) {
    if (token.$type !== "color") continue;
    components[name] = {
      aliases: Object.fromEntries(MODES.map((m) => [m, valueIn(token, m)])),
      values: Object.fromEntries(
        MODES.map((m) => [m, resolve(name, m, tokens)])
      ),
    };
  }
  fs.writeFileSync(
    SNAPSHOT_PATH,
    JSON.stringify({ semantic, components }, null, 2) + "\n"
  );
  console.log(
    `Snapshot: ${Object.keys(semantic).length} semantic and ${Object.keys(components).length} component colour tokens`
  );
}

// ---------- expand ----------

function expand() {
  const semantic = load("semantic");
  const created = {};
  const sourceOf = (to) =>
    Object.entries(map.rename).find(([, t]) => t === to)?.[0] ??
    map.newFromState[to];
  for (const to of finalNames()) {
    if (semantic[to]) continue;
    const from = sourceOf(to);
    if (!from || !semantic[from])
      throw new Error(`${to}: missing source ${from}`);
    const token = structuredClone(semantic[from]);
    token.$description = map.descriptions[to];
    const dark = map.darkOverrides[to];
    if (dark) token.valuesByMode.Dark = dark;
    created[to] = { after: from, token };
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
  // descriptions of the names that stay the same
  for (const [from, to] of Object.entries(map.rename)) {
    if (from === to && next[to]) next[to].$description = map.descriptions[to];
  }
  save("semantic", next);
  console.log(`Added ${Object.keys(created).length} tokens`);
}

// ---------- verify (semantic) ----------

function verify() {
  const snap = readJson(SNAPSHOT_PATH).semantic;
  const tokens = allTokens();
  const problems = [];
  let checked = 0;
  for (const [from, to] of Object.entries(map.rename)) {
    for (const mode of MODES) {
      const after = resolve(to, mode, tokens);
      const before = snap[from][mode];
      if (after !== before) {
        if (to === "color.foreground.danger-muted" && mode === "Dark") {
          console.log(
            `${from} (Dark): ${before} -> ${after}  (accepted: red 400)`
          );
        } else
          problems.push(`${from} -> ${to} (${mode}): ${before} vs ${after}`);
      }
    }
    checked++;
  }
  for (const [to, from] of Object.entries(map.newFromState)) {
    for (const mode of MODES) {
      const after = resolve(to, mode, tokens);
      if (after !== snap[from][mode]) {
        problems.push(`${to} (${mode}) differs from ${from}`);
      }
    }
    checked++;
  }
  if (problems.length) {
    console.error(`Value mismatches:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(`Semantic values preserved: ${checked} mappings checked`);
}

// ---------- repoint ----------

function repoint() {
  const components = load("components");
  let changed = 0;
  for (const token of Object.values(components)) {
    if (token.$type !== "color") continue;
    const next = {};
    for (const mode of MODES) {
      const value = valueIn(token, mode);
      if (!isAlias(value)) {
        next[mode] = value;
        continue;
      }
      const old = aliasName(value);
      if (map.states[old]) next[mode] = `{${map.states[old][mode]}}`;
      else if (map.rename[old] !== undefined)
        next[mode] = `{${map.rename[old]}}`;
      else next[mode] = value;
    }
    for (const mode of MODES) {
      if (next[mode] !== valueIn(token, mode)) changed++;
      if (token.valuesByMode) token.valuesByMode[mode] = next[mode];
    }
    if (token.valuesByMode) token.$value = token.valuesByMode.Light;
    else token.$value = next.Light;
  }
  save("components", components);
  console.log(`Repointed ${changed} alias values`);
}

// ---------- verify-components ----------

function verifyComponents() {
  const snap = readJson(SNAPSHOT_PATH).components;
  const tokens = allTokens();
  // semantic tokens whose value is allowed to change (the accepted changes)
  const changedSemantic = new Set([
    "color.foreground.default.disabled",
    "color.background.default.active",
    "color.background.subtle.active",
    "color.primary.background.default.active",
    "color.danger.background.subtle.hover",
    "color.danger.foreground.subtle",
  ]);
  const expectedChanged = new Set();
  const unexpected = [];
  const changes = [];
  for (const [name, before] of Object.entries(snap)) {
    const usesChanged = MODES.some(
      (m) =>
        isAlias(before.aliases[m]) &&
        changedSemantic.has(aliasName(before.aliases[m]))
    );
    if (usesChanged) expectedChanged.add(name);
    for (const mode of MODES) {
      const after = resolve(name, mode, tokens);
      if (after !== before.values[mode]) {
        changes.push(`${name} (${mode}): ${before.values[mode]} -> ${after}`);
        if (!usesChanged) unexpected.push(`${name} (${mode})`);
      }
    }
  }
  console.log(
    `Component colour tokens: ${Object.keys(snap).length}; use an accepted-change semantic: ${expectedChanged.size}; resolved values that changed: ${changes.length}`
  );
  for (const c of changes) console.log("  changed  " + c);
  if (unexpected.length) {
    console.error(
      `\nUnexpected changes (token did not use an accepted-change semantic):\n${unexpected.join("\n")}`
    );
    process.exit(1);
  }
  console.log("All other component colours are identical to the snapshot.");
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
  "documentation/archive/",
  "documentation/case-studies/",
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
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => "\\" + c);
const cssForm = (n) => "--" + n.replaceAll(".", "-");
function nameRegex(names) {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  const dotted = sorted.map(escapeRe).join("|");
  const css = sorted.map((n) => escapeRe(cssForm(n))).join("|");
  return new RegExp(
    "(?<![A-Za-z0-9_-])(?<css>" +
      css +
      ")(?![A-Za-z0-9_-])|(?<![A-Za-z0-9_.-])(?<dot>" +
      dotted +
      ")(?![A-Za-z0-9_-]|\\.[A-Za-z0-9])",
    "g"
  );
}

function rewrite() {
  const check = process.argv.includes("--check");
  const lookup = new Map();
  for (const [from, to] of renamed()) {
    lookup.set(from, to);
    lookup.set(cssForm(from), cssForm(to));
  }
  const re = nameRegex(renamed().map(([from]) => from));
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
  const stale = oldNames().filter((n) => !finalNames().has(n));
  const re = nameRegex(stale);
  let hits = 0;
  for (const p of consumerFiles()) {
    fs.readFileSync(p, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const m of line.matchAll(re)) {
          console.log(`${p}:${i + 1}: ${m[0]}`);
          hits++;
        }
      });
  }
  if (hits) process.exit(1);
  console.log("No old token names found");
}

// ---------- contract ----------

function contract() {
  const semantic = load("semantic");
  const components = load("components");
  const keep = finalNames();
  const doomed = oldNames().filter((n) => !keep.has(n) && semantic[n]);
  const doomedSet = new Set(doomed);
  const offenders = [];
  for (const [file, vars] of [
    ["components", components],
    ["semantic", semantic],
  ]) {
    for (const [name, token] of Object.entries(vars)) {
      for (const v of [
        token.$value,
        ...Object.values(token.valuesByMode ?? {}),
      ]) {
        if (isAlias(v) && doomedSet.has(aliasName(v))) {
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

const commands = {
  snapshot,
  expand,
  verify,
  repoint,
  "verify-components": verifyComponents,
  rewrite,
  sweep,
  contract,
};
const command = process.argv[2];
if (!commands[command]) {
  console.error(`Usage: ${Object.keys(commands).join(" | ")}`);
  process.exit(1);
}
commands[command]();
