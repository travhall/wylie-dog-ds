// Which icon tier (sm, md or lg) an icon in packages/ui draws its stroke from.
//
// Every icon the system renders passes `size` to <Icon>, because the size picks the stroke token
// (`icon.stroke-width.sm|md|lg`). The tier follows the icon's drawn size, which the component sets
// from its own size token: up to 16px is sm, up to 24px is md, anything larger is lg. A 12px
// indicator or an 8px dot has no tier of its own; it takes the smallest stroke.
//
// Shared by the check that enforces this (scripts/__tests__/icon-stroke-tier.test.mjs).

import fs from "node:fs";

const sync = "packages/tokens/io/sync";
const readVariables = (file, collection) =>
  Object.assign({}, ...JSON.parse(fs.readFileSync(`${sync}/${file}`, "utf8")))[
    collection
  ].variables;

const collections = [
  readVariables("components.json", "components"),
  readVariables("semantic.json", "semantic"),
  readVariables("primitive.json", "primitive"),
];

// CSS variable of a component token, as the token build names it (dimension is --space-*).
const cssVar = (name) => `--space-${name.replaceAll(".", "-")}`;
const bySpaceVar = new Map(
  Object.entries(collections[0])
    .filter(([, token]) => ["dimension", "spacing"].includes(token.$type))
    .map(([name]) => [cssVar(name), name])
);

const lookup = (name) => {
  for (const variables of collections)
    if (variables[name]) return variables[name];
  return undefined;
};

/** Pixels of a token, following aliases ("{icon.size.sm}" to "{space.200}" to "16px"). */
export const resolvePx = (name) => {
  let value = lookup(name)?.$value;
  while (typeof value === "string" && /^\{.+\}$/.test(value)) {
    value = lookup(value.slice(1, -1))?.$value;
  }
  const px = /^(\d+(?:\.\d+)?)px$/.exec(value ?? "");
  return px ? Number(px[1]) : undefined;
};

/** The tier for a drawn size in pixels. */
export const tierForPx = (px) => (px <= 16 ? "sm" : px <= 24 ? "md" : "lg");

/** Pixels drawn by a CSS variable such as --space-select-trigger-icon-size, if it is a token. */
export const pxOfSpaceVar = (ref) => {
  const name = bySpaceVar.get(ref);
  return name ? resolvePx(name) : undefined;
};
