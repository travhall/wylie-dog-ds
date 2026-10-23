#!/usr/bin/env node
// Structure check for the semantic colour tokens (Plan 188).
//
// Names are color.<part>.<token> with the part background, foreground or border.
// The token is a ground name or a role, with at most one modifier:
//   ground background  default, muted, emphasis, raised, overlay, inverse
//   ground foreground  default, muted, faint, inverse
//   ground border      default, muted, emphasis, focus
//   roles              primary, danger, success, warning, info, optionally
//                      followed by -muted or -emphasis
//
// The plugin turns a dotted name into a Figma path, so the shape of the names is
// the shape of the Figma variable tree. This check keeps it flat and legible:
//   - no more than three segments
//   - no state word in a semantic name (hover, active, disabled, pressed,
//     selected): states belong to the component layer
//   - no group (prefix) that holds a single variable
//   - no variable whose name is also the prefix of another variable
//
// Reads the tracked token source, so no build is needed.
// Usage: node scripts/check-token-structure.mjs

import fs from "node:fs";

const file = "packages/tokens/io/sync/semantic.json";
const variables = Object.assign(
  {},
  ...JSON.parse(fs.readFileSync(file, "utf8"))
).semantic.variables;
const names = Object.keys(variables).filter(
  (name) => variables[name].$type === "color"
);

const ground = {
  background: ["default", "muted", "emphasis", "raised", "overlay", "inverse"],
  foreground: ["default", "muted", "faint", "inverse"],
  border: ["default", "muted", "emphasis", "focus"],
};
const roles = ["primary", "danger", "success", "warning", "info"];
const roleToken = new RegExp(`^(${roles.join("|")})(-muted|-emphasis)?$`);
const stateWord = /(hover|active|disabled|pressed|selected)/;

const problems = [];
const direct = new Map();
const groups = new Set();

for (const name of names) {
  const parts = name.split(".");
  if (parts.length !== 3 || parts[0] !== "color") {
    problems.push(
      `${name}: must have exactly three segments, color.<part>.<token>`
    );
    continue;
  }
  const [, part, token] = parts;
  if (!ground[part]) {
    problems.push(
      `${name}: part "${part}" is not background, foreground or border`
    );
    continue;
  }
  if (stateWord.test(token)) {
    problems.push(
      `${name}: a state word in a semantic name; states belong to the component layer`
    );
  }
  if (!ground[part].includes(token) && !roleToken.test(token)) {
    problems.push(
      `${name}: token "${token}" is neither a ground name for ${part} nor a role with an optional -muted or -emphasis`
    );
  }
  const group = `${parts[0]}.${part}`;
  groups.add(group);
  direct.set(group, (direct.get(group) ?? 0) + 1);
}
for (const [group, count] of direct) {
  if (count === 1)
    problems.push(`${group}: a group that holds a single variable`);
}
for (const name of names) {
  const prefix = `${name}.`;
  if (names.some((other) => other.startsWith(prefix))) {
    problems.push(
      `${name}: a variable that is also the prefix of another variable`
    );
  }
}

// Components collection (Plan 193): the same Figma-shape rules, plus no state word
// as a path level. See documentation/tokens/component-token-grammar.md.
const componentNames = Object.keys(
  Object.assign(
    {},
    ...JSON.parse(
      fs.readFileSync("packages/tokens/io/sync/components.json", "utf8")
    )
  ).components.variables
);
const componentState =
  /^(hover|active|disabled|focus|checked|unchecked|pressed|selected|open)$/;
const componentGroups = new Map();
const everyGroup = new Set();
for (const name of componentNames) {
  const parts = name.split(".");
  if (parts.slice(1, -1).some((part) => componentState.test(part))) {
    problems.push(
      `${name}: a state word as a path level; write it as a trailing suffix (background-checked)`
    );
  }
  for (let i = 1; i < parts.length; i++)
    everyGroup.add(parts.slice(0, i).join("."));
  const group = parts.slice(0, -1).join(".");
  componentGroups.set(group, (componentGroups.get(group) ?? 0) + 1);
}
for (const group of everyGroup) {
  if (componentGroups.get(group) === 1)
    problems.push(`${group}: a component group that holds a single variable`);
  if (componentNames.includes(group))
    problems.push(
      `${group}: a component variable that is also the prefix of another variable`
    );
}

if (problems.length) {
  console.error(`Token structure: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Token structure OK: ${names.length} semantic colour tokens in ${groups.size} groups, depth 3.`
);
