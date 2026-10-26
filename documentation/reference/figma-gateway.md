# Figma Gateway: Line-Height and Letter-Spacing in Figma

**Status:** Decided: percent text styles, no variable binding (2026-10-25). The computed-pixel gateway below is deferred  
**Created:** 2026-05-14  
**Context:** Emerged during Badge component Figma audit

---

## Decision (2026-10-25, Plan 204): percent text styles, no variable binding

Line height and letter spacing are **not bound to Figma variables**. In Figma they are **percent properties on text styles**, generated from the tokens by the component builder (`apps/figma-plugin/wylie-dog-figma-builder`, owner-run, gitignored). A percent value matches CSS exactly (125% of 14px is 17.5px) and scales with the font size. The line-height and tracking variables stay in the sync, because they are tokens and the repo is the source, but their scope is `[]`, so no Figma picker lists them. Changing a token updates the styles on the next Pull (Plan 205, below); the builder is a one-time scaffold.

### Follow-up (2026-10-25, Plan 205): Token Bridge keeps the styles in line

The builder's first run showed two problems: the styles were never applied to the text layers (the synchronous `textStyleId` setter fails under the manifest's `documentAccess: "dynamic-page"`; `setTextStyleIdAsync` works, so the builder now applies styles in an async pass at the end of the run), and nothing kept styles in line with tokens afterwards. Decision (owner, option C): every text style the builder creates or refreshes records explicit links as shared plugin data, namespace `wylie_dog`, keys `lineHeightToken` and `letterSpacingToken`, value the dotted token path. On Pull, Token Bridge reads the links, resolves each token from the incoming tokens (line height as the percent value, letter spacing as em x 100), lists the styles that would change in the review's "Text styles" group, and applies them after the import (font loaded first; an unavailable font skips and reports that style). Styles with no link are designer-owned and never modified; they are listed read-only. No variable is bound to either property, and Push, the token JSON and the baseline hashes are unchanged. Details: [Text styles follow their tokens](../../apps/figma-plugin/README.md#text-styles-follow-their-tokens).

Owner choices: tracking and letter-spacing variables hidden like line height; both families kept in the sync but hidden (not excluded); the builder writes letter spacing as PERCENT (em x 100, `-0.025em` becomes `-2.5%`) where a component has a tracking token (alert, card and dialog titles); the percent lives on local text styles (nodes inherit through `textStyleId`) and the builder is run in the Token Bridge file only.

### Test results (Token Bridge file, scratch items, all deleted afterwards)

- A number variable bound to a text style or text node `lineHeight` always becomes **PIXELS**: 20 gives 20px, 150 gives **150px**, whatever unit was set before binding.
- A letter-spacing variable behaves the same: `-0.05` gives **-0.05px** and `-5` gives -5px, while the tracking tokens are em fractions.
- Binding to text styles and nodes does work for `lineHeight`, `letterSpacing` and `fontSize`, and explicit variable modes resolve on nodes (20 to 30 to 20).

### Research

Figma does not support percentages in number variables. It is an open feature request (forum.figma.com, including an October 2026 thread). The usual workarounds are text styles with a percent line height, or plugins. Aliasing a percent token through a variable cannot carry a unit, so it resolves to a pixel number.

### Options and outcome

| Option                                                | Outcome                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Percent text styles, variables hidden (chosen)**    | Exact match with CSS, scales with font size, no new variables. Cost: a token change needs a builder rerun.   |
| Computed-pixel gateway (derived collection, below)    | Deferred: adds ~129 variables and a build-to-sync cycle; revisit if designers need token-driven line heights |
| Pixel pairs (a px variable beside each percent token) | Deferred: duplicates tokens, drifts from CSS at fractional sizes                                             |
| Bind the percent variable directly                    | Rejected: Figma reads it as pixels (150 gives 150px)                                                         |
| Bind the em tracking variable directly                | Rejected: Figma reads it as pixels (-0.05 gives -0.05px)                                                     |
| Leave the variables bindable (`LINE_HEIGHT` scopes)   | Rejected: a designer picking `line-height/none` gets a 100px line height                                     |
| Exclude the variables from the sync                   | Rejected: they are tokens, and Push and Pull stay lossless when they are kept                                |

If Figma ever supports percent in number variables, bind the variables and change the scope rule in `scopes.ts`.

---

## Background

The sections below are the original analysis (2026-05-14) and the deferred computed-pixel gateway.

During the Badge component audit, line-height was identified as a token that works correctly in CSS but cannot be accurately represented as a native Figma Variable. This document captures everything known about the problem, the proposed solution (Option A), and what implementation would require.

---

## The Problem

Figma Variables only support four native types: **Color**, **Number (FLOAT)**, **String**, and **Boolean**. The W3C DTCG token type `lineHeight` stores values as percentages (e.g. `100%`, `150%`), which are relative to font-size. Figma has no concept of relative Variables — all FLOAT Variables are dimensionless numbers applied as absolute values.

**What happens today:**

- Source token: `typography.line-height.none = "100%"`
- CSS output (via sd-transforms): `--line-height-none: 1` ✓ correct
- Figma import: receives `100`, strips `%`, treats as **100px absolute** ✗ wrong

**Confirmed by Figma's own Plugin API:** `LineHeight` has three modes — `PIXELS`, `PERCENT`, `AUTO`. A FLOAT Variable can only be bound to a text node when its line-height is in **PIXELS** mode. Attempting to bind to `PERCENT` mode silently fails. This is a documented, intentional Figma platform limitation with no fix on the roadmap.

**Why the current workaround doesn't cut it:**  
Setting line-height to "Auto" in Figma produces inaccurate component dimensions that don't match the browser rendering, making it unreliable for design-to-code accuracy.

---

## Research Summary

| Approach                                         | Viable?  | Notes                                                                                          |
| ------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| Bind FLOAT variable to PERCENT-mode line-height  | No       | Silently fails in both UI and Plugin API                                                       |
| Bind FLOAT variable to AUTO-mode line-height     | No       | AUTO has no numeric value to bind                                                              |
| Tokens Studio (composite typography tokens)      | Yes, but | Requires Tokens Studio plugin; not in this workflow                                            |
| Native Figma Text Styles                         | Partial  | Styles support %, but Variables don't                                                          |
| Compute absolute px values at build time         | **Yes**  | Option A — see below                                                                           |
| "Unitless Line Height & Tokens" community plugin | Unknown  | [Figma Community](https://www.figma.com/community/plugin/1577516978004090936/) — not evaluated |

<!-- cSpell:ignore Unitless -->

---

## Earlier state (Option C, superseded by the decision above)

Line-height tokens are **excluded from Figma sync**. The CSS token (`--line-height-badge-line-height: 1`) ships and works correctly in the browser. In Figma, text layer line-heights are set manually per component in PIXELS mode, matching the font-size at each size (e.g. 12/14/16px for sm/md/lg badge).

This is intentional and acceptable for now. The CSS is correct. The Figma divergence is a known, documented gap.

---

## Deferred: the Figma Gateway (computed pixel values)

### Concept

Add a dedicated build step that produces a **separate Figma-specific export file** with computed absolute values — distinct from the semantic source tokens. Figma imports from this computed file instead of the raw sync source.

```text
io/sync/*.json          ← source of truth (semantic, unchanged)
      ↓
pnpm build              ← existing CSS pipeline (unchanged)
      ↓
dist/*.css              ← --line-height-badge-line-height: 1  ✓

      ↓ NEW STEP: generate-figma-exports.js
figma-exports/*.json    ← computed, Figma-specific output
      ↑
Figma plugin            ← imports from figma-exports/ (not io/sync/)
```

### How the computation works

The gateway script resolves token references and computes absolute px values for line-height:

1. Resolve `badge.line-height` → `typography.line-height.none` → `1.0` (multiplier)
2. Resolve `badge.font-size.sm/md/lg` → `12px / 14px / 16px`
3. Compute: `abs = round(multiplier × fontSize)`
4. Output to Figma export:
   - `badge.line-height.sm = 12` (FLOAT, binds as 12px in PIXELS mode)
   - `badge.line-height.md = 14`
   - `badge.line-height.lg = 16`

CSS continues to use the single `--line-height-badge-line-height: 1` token — unchanged.

### Naming convention (required contract)

The script needs a discoverable relationship between line-height and font-size tokens. Proposed convention:

- If a component has `{name}.line-height` AND `{name}.font-size.{size}` tokens, compute `{name}.line-height.{size}` for the Figma export
- If a component has only `{name}.line-height` and no per-size font tokens, output as `{name}.line-height` with the resolved multiplier value (for documentation only — not bindable)
- If a component has `{name}.line-height.{size}` already defined (explicit per-size), pass through as-is

### Architecture change: sync vs. export

**Today:** `io/sync/` is both source of truth and Figma import target (same files)  
**After Option A:** `io/sync/` is source of truth only; `figma-exports/` is the Figma import target

This is a workflow change for anyone managing the Figma connection — the plugin's import path changes from `io/sync/components.json` to `figma-exports/components.json`.

### Implementation steps

1. **Build the reference resolver** — standalone utility that walks the processed token graph and fully resolves all alias chains to primitive values. The hardest part. (~1 day)
2. **Write `generate-figma-exports.js`** — reads processed tokens, applies the line-height computation for matching component pairs, writes `figma-exports/*.json` in the existing sync format. (~0.5–1 day)
3. **Handle edge cases** — single font-size components, components where line-height varies per size, tokens that are already absolute. (~0.5 day)
4. **Wire into build** — add `generate-figma-exports.js` to `pnpm build` after the process-io step. Update `package.json`. (~0.25 day)
5. **Migrate Figma import path** — update wherever the Figma plugin is pointed to use `figma-exports/` instead of `io/sync/`. (~0.25 day)
6. **Retroactive component correction** — run the gateway and update all previously built Figma components whose line-heights are wrong in one pass. (~0.5 day)
7. **Documentation** — explain source/export split for future token authors. (~0.5 day)

### Total estimate: 3–4 days

### Pros

- Figma Variables bind correctly and produce accurate pixel dimensions across all components
- Source tokens stay semantic — intent (`line-height.none` = tight = 100%) is preserved
- CSS output is completely unaffected
- Scales automatically — new components that follow the naming convention get correct Figma Variables without extra work
- Eliminates ongoing manual line-height work in Figma per component
- Clean separation: semantic tokens for code, computed tokens for Figma

### Cons

- `badge.line-height` (one source token) → `badge.line-height.sm/md/lg` (three Figma Variables): the 1-to-many expansion requires explanation
- Naming convention is a hard contract — components that don't follow it fall through to manual handling
- Source/export split adds architectural complexity that new contributors need to understand
- If font-size tokens change, Figma exports must be regenerated and re-imported (build → sync cycle becomes required for Figma accuracy, not optional)
- Does not help with letter-spacing (similar relative unit problem — handle separately if needed)

---

## When to pick this up

Good trigger criteria:

- 10+ components are built in Figma and the manual line-height work is becoming visibly costly
- A component has multiple text sizes with different line-heights (not just a single multiplier), making manual entry error-prone
- The design team is actively filing accuracy bugs related to line-height

Not worth it yet when:

- Fewer than 10 components are in Figma
- Only one or two components have the discrepancy
- The project is in early scaffolding mode

---

## Open questions for implementation

1. **Letter-spacing:** Does it have the same Figma Variable limitation? (Likely yes — also a relative unit in some tokens.) Should the gateway handle both in the same pass?
2. **Convention enforcement:** Should `pnpm build` warn when a component has `*.line-height` but no matching `*.font-size.*` tokens?
3. **Figma import automation:** Is there a Figma REST API call we can add to the build to push the export automatically, eliminating the manual import step?
4. **Token count impact:** With 44 components, if each has 3 sizes, the gateway adds ~129 additional Figma Variables. Is that acceptable in the panel?

---

## Related files

- `packages/tokens/io/sync/components.json` — source token definitions
- `packages/tokens/io/sync/primitive.json` — primitive scales (line-height values live here)
- `packages/tokens/scripts/process-token-io.js` — existing I/O processor (reference for gateway script)
- `packages/tokens/scripts/export-demo-tokens.mjs` — existing Figma export script (reference)
- `packages/tokens/style-dictionary.config.js` — CSS generation (unchanged by Option A)
- `packages/tokens/dist/semantic-light.css` — verify `--line-height-*` values after any changes
