---
name: wylie-dog-figma
description: Use when checking or changing the Wylie Dog Figma library against the code. Covers the Figma parity check and its findings report, the Figma manifest snapshot, editing component sets in place with the Figma MCP, the component builder's Figma API rules, component descriptions and links, and the Token Bridge code syntax file. Trigger on "parity", "Figma manifest", "component set", "variant", "builder", "code.js", "codeSyntax", "Figma library".
---

# Wylie Dog Figma library

Code wins. The Figma library mirrors `packages/ui`; where they differ, Figma is wrong unless the
difference is listed, with a reason, in `scripts/figma-parity.config.json`. Plan 216
(`plans/216-figma-code-parity.md`, gitignored, owner's checkout) holds the decisions and why.

This skill is instructions only. It ships no scripts; every command below is already in the repo.
Read before running anything that writes to Figma, and never put a token or PAT in a prompt or file.

## Where things are

| What                                    | Where                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Figma snapshot (what is in the library) | `figma/manifest.json`, written through the Figma MCP                                                                               |
| Script that produces the snapshot       | `scripts/figma/export-manifest.js` (the body of one `use_figma` call, read-only)                                                   |
| Parity check, config, report            | `scripts/check-figma-parity.mjs`, `scripts/figma-parity.config.json`, `documentation/reference/figma-parity-report.md` (generated) |
| Descriptions and Storybook links        | `scripts/figma/component-docs.mjs` (from each story's `docs.description.component`)                                                |
| Component builder (create-only)         | `apps/figma-plugin/wylie-dog-figma-builder/code.js`, gitignored, owner's machine only                                              |
| Token Bridge (sync plugin)              | `apps/figma-plugin/`                                                                                                               |
| Code syntax names                       | `packages/tokens/io/code-syntax/web.json` (generated), naming in `packages/tokens/lib/css-variable.js`                             |
| Figma file                              | key `tnVqOsygeKwyDH3BzWB1Yg`, page "Components" (`1863:2`), 48 component sets                                                      |

## The loop

1. `pnpm --filter storybook build` (the check reads `storybook-static/manifests/components.json`).
2. `pnpm check:figma-parity` (`--report` writes the findings page, `--no-fail` while reviewing).
3. For each finding decide one of: change Figma to match code, or allow-list it with a reason. Ask the
   owner one decision at a time with the alternatives; do not accept-all.
4. Apply Figma changes in place (rules below), then refresh the snapshot: run
   `scripts/figma/export-manifest.js` through `use_figma`, write `figma/manifest.json` as
   `{ "schema": 1, "fileKey": "<key>", ...returned object }`, keep the returned order.
5. Re-run the check. Open findings should be 0. `node --test scripts/__tests__/*.test.mjs` must pass.

CI runs the check after the build as advisory (`continue-on-error`), so a mismatch shows but does not fail.

## Editing the Figma file (Figma MCP)

- Call `create_session` first. Load the `figma-use` skill (and `figma-generate-library` for component
  work) and pass their names in `skillNames`. Read the Plugin API typings before guessing.
- Switch pages once per call; return the ids you touched; verify by reading back, plus one screenshot.
- The MCP has no undo: use Figma version history to roll back. Work on a duplicate when others use the file.
- **Never delete and recreate a variant or component set.** The variant key is lost and instances in other
  files stop reconnecting. Rename and repair in place:
  - rename a variant property: `set.editComponentProperty(old, { name })`, then rename the variant layers
    (`prop=value, prop=value`) for any value change; child ids stay the same
  - add a variant: clone an existing one in the set, rename it, bind what differs (for example a stroke to a
    variable with `figma.variables.setBoundVariableForPaint`, then reassign the strokes)
  - never read `componentPropertyDefinitions` from a variant, only from the set
- The default variant is the **top-left** one by position. To change it, permute the positions of the variants
  inside their existing grid slots; do not recompute the grid (heights were measured at build time) and check
  the set size is unchanged and nothing overlaps.
- Descriptions and the Storybook link: `set.description` and `set.documentationLinks = [{ uri }]`, values from
  `node scripts/figma/component-docs.mjs --json`.

## The component builder (`code.js`)

It is a one-time scaffold run inside Figma's plugin sandbox, not part of Token Bridge.

- It only **creates**: a rerun adds a second copy of every set. Run it only in a fresh file, never over the
  library file. After a change to the builder, apply the same change in place to the library.
- Keep it in step with the library: `variantProps` names and values are the Figma property names (match
  code), `DEFAULT_VARIANTS` puts the code default top-left, `COMPONENT_DOCS` is a generated block
  (`node scripts/figma/component-docs.mjs --builder` rewrites it). `scripts/check-builder-coverage.mjs`
  runs every builder under a stubbed `figma` and checks text styles.
- Owner rule: draw only the looks that differ at rest. An option or combination that looks identical is left
  out and recorded in the allow-list with the builder's reason.
- Sandbox rules: `var` only (no `const`/`let`), no `??`, no bare `catch {}`, load async Figma data up front
  in `initialize()`, no `figma.notify()` per component (use `console.log`).
- Figma API rules it already hit: `counterAxisSizingMode` is `"FIXED"` or `"AUTO"` (not `"FILL"`);
  `combineAsVariants` adds a 5px corner radius, set it to 0; call `resize()` before adding children; bind a
  variable before any hardcoded fallback (a later hardcoded value overwrites the binding); apply text styles
  with `setTextStyleIdAsync` (the sync setter fails under `documentAccess: "dynamic-page"`).

## Token Bridge and code syntax

- Code syntax comes from `packages/tokens/io/code-syntax/web.json`, applied on Pull after the import
  (`apps/figma-plugin/src/plugin/variables/code-syntax.ts`). Regenerate with `pnpm generate:code-syntax`;
  `pnpm check:tokens` fails when it is stale. Do not copy the naming rules anywhere else.
- Plugin checks: `pnpm --filter figma-plugin typecheck`, `lint`, `test`. Behaviour inside Figma is not
  verified by tests: say so, and give the owner the manual steps (Pull once, spot-check three variables in Dev Mode).
- Run tests with `NODE_ENV` unset (`env -u NODE_ENV ...`), or React tests fail.
