#!/usr/bin/env node
// Figma-to-code parity check (Plan 216, Phase C).
//
// Compares two lists, deterministically and with no AI:
//   code   - Storybook's components manifest (apps/storybook/storybook-static/manifests/
//            components.json, from `pnpm --filter storybook build`), plus the `defaultVariants`
//            of each component's source file, because the manifest does not report cva defaults
//   Figma  - figma/manifest.json, the snapshot written through the Figma MCP by
//            scripts/figma/export-manifest.js
// It compares names, variant properties, options, defaults and variant counts. It does not
// look at CSS or pixels, and it never opens Figma. Code wins: a difference is a finding
// against Figma unless it is listed in scripts/figma-parity.config.json with a reason.
//
// Usage: node scripts/check-figma-parity.mjs [--report] [--no-fail]
//          [--storybook <components.json>] [--figma <manifest.json>] [--config <file>]
//   --report   write documentation/reference/figma-parity-report.md (generated; do not edit)
//   --no-fail  exit 0 even when there are open findings (use while the findings are reviewed)

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { componentDocs } from "./figma/component-docs.mjs";

const DEFAULTS = {
  storybook: "apps/storybook/storybook-static/manifests/components.json",
  figma: "figma/manifest.json",
  config: "scripts/figma-parity.config.json",
  report: "documentation/reference/figma-parity-report.md",
};

export const RULES = {
  "missing-in-figma": {
    title: "In code, not in Figma",
    ways: [
      "Build the component in Figma (the builder), named as in code.",
      "Allow-list it with a reason (for example a story-only pattern that is not a visual component).",
    ],
  },
  "missing-in-code": {
    title: "In Figma, not in code",
    ways: [
      "If it is the same component under another name, add the pair to `names` in the config.",
      "Remove or rename the Figma component; otherwise allow-list it with a reason.",
    ],
  },
  "generic-property": {
    title: "Variant property has no real name",
    ways: [
      "Name the property in the builder (for example `variant`), or draw only the variants that exist in code.",
      "Allow-list it if the component has a single variant on purpose.",
    ],
  },
  "state-axis": {
    title: "Figma `state` property has no single code prop",
    ways: [
      "Split it into properties named as in code (`disabled`, `error`, `open`) where code has a prop.",
      "Allow-list it when the states are CSS states in code (hover, active) that Figma can only draw as variants.",
    ],
  },
  "props-unreadable": {
    title: "Code manifest lists no props (compound or Radix root)",
    ways: [
      "Compare by hand, or extend the check to read the cva `variants` from the component's source file (a candidate follow-up).",
      "Allow-list it with a reason.",
    ],
  },
  "inherited-property": {
    title: "Figma property that code takes from the platform or Radix",
    ways: [
      "Expected for props such as `disabled`, `checked`, `pressed`, `required` and `orientation`, which the manifest does not list. Confirm the prop in code, then allow-list it and name the prop in the reason.",
      "Rename the Figma property if code uses another name.",
    ],
  },
  "property-not-in-code": {
    title: "Figma property not in the code manifest",
    ways: [
      "Rename it to the code prop, or remove it from Figma.",
      "If the code prop exists but is inherited (for example `disabled` from the HTML button), allow-list it and name the prop in the reason.",
    ],
  },
  "property-not-in-figma": {
    title: "Code option property not in Figma",
    ways: [
      "Add the property to the Figma set with the code's options.",
      "Allow-list it when the property has no visual effect.",
    ],
  },
  "options-differ": {
    title: "Options differ",
    ways: [
      "Change Figma to match code (rename or add the option in place; never delete and recreate a variant).",
      "Allow-list it when the code option is an alias (for example `size=default` is `size=md`).",
    ],
  },
  "default-differs": {
    title: "Default differs",
    ways: [
      "Make the code default the Figma default variant, so an instance dragged in matches the code.",
      "Allow-list it with a reason.",
    ],
  },
  "partial-set": {
    title: "Variant set is incomplete",
    ways: [
      "Add the missing variants (the builder or by hand).",
      "Allow-list it when the combinations look the same or do not exist in code (for example disabled where nothing changes).",
    ],
  },
  "content-property-not-in-code": {
    title: "Text, boolean or swap property with no code twin",
    ways: [
      "Rename the Figma property to the code prop it mirrors (`children`, or a prop the component declares).",
      "Allow-list it with a reason when code has no such prop (a compound part such as CardTitle, an icon passed as a child).",
    ],
  },
  "no-description": {
    title: "No component description",
    ways: ["Plan 216 Phase E fills it from the story description."],
  },
  "description-differs": {
    title: "Description differs from the story",
    ways: [
      "Update the Figma description to the first paragraph of the story description (`node scripts/figma/component-docs.mjs --json`), or change the story text.",
    ],
  },
  "no-doc-link": {
    title: "No documentation link",
    ways: ["Plan 216 Phase E adds the Storybook link as a documentation link."],
  },
  "doc-link-differs": {
    title: "Documentation link differs from the Storybook page",
    ways: [
      "Set the Figma documentation link to the component's Storybook docs page.",
    ],
  },
};

// Props the manifest does not list because components inherit them (HTML attributes, Radix).
const INHERITED_HINT = new Set([
  "disabled",
  "checked",
  "pressed",
  "required",
  "orientation",
  "open",
]);

export const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const unquote = (s) => String(s).replace(/^["']|["']$/g, "");

export function optionsOf(typeName) {
  if (!typeName) return null;
  const quoted = [...typeName.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (quoted.length > 0) return quoted;
  if (/^\s*boolean\b/.test(typeName)) return ["false", "true"];
  return null;
}

export function defaultVariantsOf(source) {
  const out = {};
  for (const block of source.matchAll(/defaultVariants\s*:\s*\{([^}]*)\}/g)) {
    for (const m of block[1].matchAll(/(\w+)\s*:\s*("[^"]*"|true|false)/g)) {
      if (!(m[1] in out)) out[m[1]] = unquote(m[2]);
    }
  }
  return out;
}

// Text between the braces that open at `open` (the index of "{"), skipping strings and comments.
function braceBody(source, open) {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      for (i++; i < source.length && source[i] !== ch; i++)
        if (source[i] === "\\") i++;
    } else if (ch === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (ch === "/" && source[i + 1] === "*") {
      i = source.indexOf("*/", i + 2);
      if (i < 0) return "";
      i++;
    } else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return source.slice(open + 1, i);
  }
  return "";
}

// "key: value, key: value" at the top level of an object body -> [[key, valueText]]
function splitEntries(body) {
  const entries = [];
  const keyAt = /\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:/y;
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i++;
    keyAt.lastIndex = i;
    const m = keyAt.exec(body);
    if (!m) break;
    const key = m[1] ?? m[2] ?? m[3];
    let j = keyAt.lastIndex;
    let nest = 0;
    for (; j < body.length; j++) {
      const ch = body[j];
      if (ch === '"' || ch === "'" || ch === "`") {
        for (j++; j < body.length && body[j] !== ch; j++)
          if (body[j] === "\\") j++;
      } else if ("({[".includes(ch)) nest++;
      else if (")}]".includes(ch)) nest--;
      else if (ch === "," && nest === 0) break;
    }
    entries.push([key, body.slice(keyAt.lastIndex, j).trim()]);
    i = j + 1;
  }
  return entries;
}

// The cva `variants` of a source file -> { variantName: [options] }, with the options of
// repeated names (two cva calls in one file) joined.
export function cvaVariantsOf(source) {
  const out = {};
  for (const m of source.matchAll(/\bvariants\s*:\s*\{/g)) {
    const body = braceBody(source, m.index + m[0].length - 1);
    for (const [name, value] of splitEntries(body)) {
      if (!value.startsWith("{")) continue;
      const options = splitEntries(value.slice(1, -1)).map(([k]) => k);
      out[name] = [...new Set([...(out[name] ?? []), ...options])];
    }
  }
  return out;
}

// Storybook manifest -> Map of normalized name -> { name, props: { prop: { options, default } } }
export function readCodeComponents(manifest, readSource = () => "") {
  const byName = new Map();
  for (const entry of Object.values(manifest.components)) {
    const docgen = entry.reactDocgenTypescript;
    if (entry.error || !docgen) continue;
    const source = readSource(docgen.filePath);
    const fromSource = defaultVariantsOf(source);
    const props = {};
    for (const [name, p] of Object.entries(docgen.props ?? {})) {
      const options = optionsOf(p.type?.name);
      let def = p.defaultValue?.value;
      def = def === undefined || def === null ? undefined : unquote(def);
      if (name in fromSource) def = fromSource[name];
      if (def === undefined && options && options.join() === "false,true")
        def = "false";
      props[name] = { options, default: def };
    }
    // The manifest lists the root component's props only; the cva variants in the same source
    // file (Dialog size, Tabs size, Sheet size ...) fill in what it misses.
    for (const [name, options] of Object.entries(cvaVariantsOf(source))) {
      if (props[name]?.options) continue;
      props[name] = { options, default: fromSource[name] };
    }
    const key = norm(entry.name);
    const have = byName.get(key);
    if (!have || Object.keys(props).length > Object.keys(have.props).length) {
      byName.set(key, { name: entry.name, props });
    }
  }
  return byName;
}

const sameSet = (a, b) =>
  a.length === b.length &&
  [...a].sort().join("\u0000") === [...b].sort().join("\u0000");

// An alias says a code option is the same thing as another option (Button size "default" is "md"):
// the code option and default are read as the target before they are compared.
function applyAliases(cp, component, prop, aliases) {
  let { options, default: def } = cp;
  for (const a of aliases) {
    if (norm(a.component) !== norm(component) || a.property !== prop) continue;
    if (options)
      options = [...new Set(options.map((o) => (o === a.from ? a.to : o)))];
    if (def === a.from) def = a.to;
  }
  return { options, default: def };
}

// Returns [{ rule, component, property?, code?, figma?, detail, allowed?: reason }]
export function compare(codeMap, figma, config = {}, docs = null) {
  const names = config.names ?? {};
  const findings = [];
  const add = (f) => findings.push(f);

  const figmaByKey = new Map();
  for (const c of figma.components) {
    figmaByKey.set(norm(names[c.name] ?? c.name), c);
  }

  for (const [key, code] of codeMap) {
    if (!figmaByKey.has(key)) {
      add({
        rule: "missing-in-figma",
        component: code.name,
        detail: `no Figma component for "${code.name}"`,
      });
    }
  }

  for (const [key, fig] of figmaByKey) {
    const code = codeMap.get(key);
    if (!code) {
      add({
        rule: "missing-in-code",
        component: fig.name,
        detail: `no code component for "${fig.name}"`,
      });
      continue;
    }
    const name = fig.name;
    const seen = new Set();
    const unreadable = Object.keys(code.props).length === 0;
    if (unreadable) {
      add({
        rule: "props-unreadable",
        component: name,
        figma: Object.keys(fig.properties).join(", "),
        detail: "property comparison skipped",
      });
    }
    for (const [prop, p] of Object.entries(fig.properties)) {
      if (p.type !== "VARIANT") {
        // Plan 217 phase J: TEXT, BOOLEAN and INSTANCE_SWAP mirror code props. `children`
        // is every component's content prop and is never listed by the docgen. Figma names
        // it "Label" (the manifest key is `label`), so both are the content prop.
        if (prop === "children" || prop === "label" || code.props[prop])
          continue;
        add({
          rule: "content-property-not-in-code",
          component: name,
          property: prop,
          figma: `${prop} (${p.type})`,
          detail: `${p.type} property "${prop}" is not a prop in code`,
        });
        continue;
      }
      if (unreadable && prop !== "state" && !/^Property \d+$/.test(prop))
        continue;
      if (/^Property \d+$/.test(prop)) {
        add({
          rule: "generic-property",
          component: name,
          property: prop,
          figma: `${prop} = ${p.default}`,
          detail: `variant property "${prop}" has no real name`,
        });
        continue;
      }
      if (prop === "state") {
        add({
          rule: "state-axis",
          component: name,
          property: prop,
          figma: p.options.join(" / "),
          detail: `states ${p.options.join(", ")}`,
        });
        continue;
      }
      let cp = code.props[prop];
      seen.add(prop);
      cp = cp && applyAliases(cp, name, prop, config.aliases ?? []);
      if (!cp) {
        add({
          rule: INHERITED_HINT.has(prop)
            ? "inherited-property"
            : "property-not-in-code",
          component: name,
          property: prop,
          figma: p.options.join(" / "),
          detail: `"${prop}" (${p.options.join(", ")}) is not a prop in the code manifest`,
        });
        continue;
      }
      if (cp.options && !sameSet(cp.options, p.options)) {
        const missing = cp.options.filter((o) => !p.options.includes(o));
        const extra = p.options.filter((o) => !cp.options.includes(o));
        add({
          rule: "options-differ",
          component: name,
          property: prop,
          code: cp.options.join(" / "),
          figma: p.options.join(" / "),
          detail:
            (missing.length ? `Figma lacks ${missing.join(", ")}` : "") +
            (missing.length && extra.length ? "; " : "") +
            (extra.length ? `Figma adds ${extra.join(", ")}` : ""),
        });
      }
      if (
        cp.default !== undefined &&
        !cp.default.startsWith("{") &&
        cp.default !== String(p.default)
      ) {
        add({
          rule: "default-differs",
          component: name,
          property: prop,
          code: cp.default,
          figma: String(p.default),
          detail: `code default ${cp.default}, Figma default ${p.default}`,
        });
      }
    }
    for (const [prop, cp] of Object.entries(code.props)) {
      if (seen.has(prop) || !cp.options || cp.options.join() === "false,true")
        continue;
      if (fig.properties[prop]) continue;
      add({
        rule: "property-not-in-figma",
        component: name,
        property: prop,
        code: cp.options.join(" / "),
        detail: `code prop "${prop}" (${cp.options.join(", ")}) has no Figma property`,
      });
    }
    if (
      fig.type === "COMPONENT_SET" &&
      fig.variantCount < fig.expectedVariantCount
    ) {
      add({
        rule: "partial-set",
        component: name,
        figma: `${fig.variantCount} of ${fig.expectedVariantCount}`,
        detail: `${fig.variantCount} of ${fig.expectedVariantCount} combinations drawn`,
      });
    }
    const expected = docs?.get(key);
    if (!fig.description) {
      add({
        rule: "no-description",
        component: name,
        detail: "empty description",
      });
    } else if (expected && fig.description !== expected.description) {
      add({
        rule: "description-differs",
        component: name,
        code: expected.description,
        figma: fig.description,
        detail: "description is not the story's first paragraph",
      });
    }
    if (!fig.documentationLinks?.length) {
      add({
        rule: "no-doc-link",
        component: name,
        detail: "no documentation link",
      });
    } else if (expected && fig.documentationLinks[0] !== expected.url) {
      add({
        rule: "doc-link-differs",
        component: name,
        code: expected.url,
        figma: fig.documentationLinks[0],
        detail: "link is not the Storybook docs page",
      });
    }
  }

  const used = new Set();
  (config.allow ?? []).forEach((a, i) => {
    for (const f of findings) {
      if (
        a.rule === f.rule &&
        norm(a.component) === norm(f.component) &&
        (a.property === undefined || a.property === f.property)
      ) {
        f.allowed = a.reason;
        used.add(i);
      }
    }
  });
  const staleAllow = (config.allow ?? []).filter((_, i) => !used.has(i));
  return { findings, staleAllow };
}

function lastUiChange() {
  try {
    // A shallow clone (CI) has no history to date the change by.
    const shallow = execFileSync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      {
        encoding: "utf8",
      }
    ).trim();
    if (shallow === "true") return "";
    return execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", "packages/ui/src"],
      {
        encoding: "utf8",
      }
    ).trim();
  } catch {
    return "";
  }
}

export function renderReport(result, figma, stale) {
  const open = result.findings.filter((f) => !f.allowed);
  const byRule = (rule) => result.findings.filter((f) => f.rule === rule);
  const lines = [
    "# Figma parity report",
    "",
    "<!-- Generated by `node scripts/check-figma-parity.mjs --report`. Do not edit by hand. -->",
    "",
    `Compares the Storybook components manifest with the Figma snapshot \`figma/manifest.json\` (file \`${figma.fileKey}\`, snapshot ${figma.generatedAt}). Code wins: every finding is against Figma unless it is allow-listed in \`scripts/figma-parity.config.json\`. The check looks at structure only: names, properties, options, defaults and variant counts. Plan 216 describes the workflow.`,
    "",
    `**${open.length} open** and ${result.findings.length - open.length} allow-listed findings.${stale ? " The snapshot is older than the last change to `packages/ui/src`: export it again before trusting this report." : ""}`,
    "",
    "| Rule | Open | Allowed |",
    "| --- | ---: | ---: |",
  ];
  for (const rule of Object.keys(RULES)) {
    const all = byRule(rule);
    if (all.length)
      lines.push(
        `| ${RULES[rule].title} | ${all.filter((f) => !f.allowed).length} | ${all.filter((f) => f.allowed).length} |`
      );
  }
  for (const rule of Object.keys(RULES)) {
    const all = byRule(rule);
    if (!all.length) continue;
    lines.push("", `## ${RULES[rule].title}`, "", "Ways to address it:", "");
    for (const w of RULES[rule].ways) lines.push(`- ${w}`);
    lines.push("");
    if (["no-description", "no-doc-link"].includes(rule)) {
      lines.push(
        `${all.length} components: ${all.map((f) => f.component).join(", ")}.`
      );
      continue;
    }
    lines.push(
      "| Component | Property | Code | Figma | Note |",
      "| --- | --- | --- | --- | --- |"
    );
    for (const f of all) {
      lines.push(
        `| ${f.component} | ${f.property ?? ""} | ${f.code ?? ""} | ${f.figma ?? ""} | ${f.allowed ? `allowed: ${f.allowed}` : f.detail} |`
      );
    }
  }
  if (result.staleAllow.length) {
    lines.push("", "## Allow-list entries that match nothing", "");
    for (const a of result.staleAllow)
      lines.push(
        `- ${a.component} / ${a.rule}${a.property ? ` / ${a.property}` : ""}: ${a.reason}`
      );
  }
  return lines.join("\n") + "\n";
}

function main() {
  const argv = process.argv.slice(2);
  const opt = (flag, dflt) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : dflt;
  };
  const storybookFile = opt("--storybook", DEFAULTS.storybook);
  const figmaFile = opt("--figma", DEFAULTS.figma);
  const configFile = opt("--config", DEFAULTS.config);
  if (!fs.existsSync(storybookFile)) {
    console.error(
      `No Storybook manifest at ${storybookFile}. Run: pnpm --filter storybook build`
    );
    process.exit(2);
  }
  const storybook = JSON.parse(fs.readFileSync(storybookFile, "utf8"));
  const figma = JSON.parse(fs.readFileSync(figmaFile, "utf8"));
  const config = fs.existsSync(configFile)
    ? JSON.parse(fs.readFileSync(configFile, "utf8"))
    : {};
  const readSource = (p) => {
    try {
      return fs.readFileSync(p, "utf8");
    } catch {
      return "";
    }
  };
  const code = readCodeComponents(storybook, readSource);
  const docs = componentDocs(storybook, (p) => {
    try {
      return fs.readFileSync(path.join("apps/storybook", p), "utf8");
    } catch {
      return null;
    }
  });
  const result = compare(code, figma, config, docs);
  const last = lastUiChange();
  const stale = last && Date.parse(figma.generatedAt) < Date.parse(last);

  const open = result.findings.filter((f) => !f.allowed);
  console.log(
    `Code components: ${code.size}, Figma components: ${figma.components.length}`
  );
  for (const rule of Object.keys(RULES)) {
    const all = result.findings.filter((f) => f.rule === rule);
    if (!all.length) continue;
    console.log(
      `  ${rule.padEnd(22)} open ${String(all.filter((f) => !f.allowed).length).padStart(3)}  allowed ${all.filter((f) => f.allowed).length}`
    );
  }
  if (stale)
    console.log(
      `WARNING: the Figma snapshot (${figma.generatedAt}) is older than the last change to packages/ui/src (${last}).`
    );
  for (const a of result.staleAllow)
    console.log(
      `WARNING: allow-list entry matches nothing: ${a.component} / ${a.rule}`
    );

  if (argv.includes("--report")) {
    fs.mkdirSync(path.dirname(DEFAULTS.report), { recursive: true });
    fs.writeFileSync(DEFAULTS.report, renderReport(result, figma, stale));
    console.log(`Report written to ${DEFAULTS.report}`);
  }
  if (open.length && !argv.includes("--no-fail")) {
    console.log(`${open.length} open findings.`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
