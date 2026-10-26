# Design Token Pipeline

How design tokens get from Figma (via the Token Bridge plugin and GitHub) to the CSS and JavaScript the apps use. All commands run in `packages/tokens` or with `pnpm --filter @wyliedog/tokens <script>`.

## Pipeline

```text
Figma Variables
      │  Token Bridge plugin (GitHub API)
      ▼
io/sync/            primitive.json, semantic.json, components.json   (committed)
      │  scripts/process-token-io.js   (pnpm process-io)
      ▼
io/processed/       primitive.json, semantic-light/dark.json,
      │             component-light/dark.json                         (committed)
      │  style-dictionary.config.js
      ▼
dist/               CSS, JS, manifest, types                          (committed)
      │
      ▼
@wyliedog/ui and the apps
```

`pnpm build` runs the whole chain: `process-io`, Style Dictionary, `generate-font-loaders.js`, `generate-token-types.js`. It takes about a second.

`io/sync/`, `io/processed/` and `dist/` are all tracked in git, so a token change shows up as changes in all three.

## Stage 1: Sync (`io/sync/`)

The files the Token Bridge plugin reads and writes through GitHub (`packages/tokens/io/sync/`):

| File              | Collection   | Modes           |
| ----------------- | ------------ | --------------- |
| `primitive.json`  | `primitive`  | `Value`         |
| `semantic.json`   | `semantic`   | `Light`, `Dark` |
| `components.json` | `components` | `Light`, `Dark` |

Each file is an array with one object per collection, holding its `modes` and a flat `variables` map keyed by dot-separated token name:

```json
[
  {
    "semantic": {
      "modes": [
        { "modeId": "mode:semantic:light", "name": "Light" },
        { "modeId": "mode:semantic:dark", "name": "Dark" }
      ],
      "variables": {
        "color.background.default": {
          "$type": "color",
          "$value": "{color.gray.50}",
          "valuesByMode": {
            "Light": "{color.gray.50}",
            "Dark": "{color.gray.950}"
          },
          "$description": "Main page background color"
        }
      }
    }
  }
]
```

Mode ids follow `mode:<collection>:<lowercased-mode-name>`; the exact contract is in [packages/tokens/SYNC_CONTRACT.md](../../packages/tokens/SYNC_CONTRACT.md).

The sync files are also an output: `process-io` regenerates all three from the processed data (`generateExports`), so a build can rewrite them. Run `git diff packages/tokens/io/sync` after a build before committing.

## Stage 2: Processing (`io/processed/`)

`pnpm process-io` (`scripts/process-token-io.js`) reads `io/sync/*.json` and writes normalized files:

```text
io/processed/
├── primitive.json
├── semantic-light.json
├── semantic-dark.json
├── component-light.json
└── component-dark.json
```

What it does:

- **Format detection** per file: `w3c-dtcg` (the array format above), `legacy-adapter` (`modes` as an object of mode name to tokens), `w3c-dtcg-single` (one collection object, not in an array), or `unknown` (treated as a flat token object).
- **Hex to OKLCH:** color values that are hex are converted with `convertHexToOklch` (`scripts/color-utils.js`, Culori). Values already written as `oklch(...)`, which is what the committed sync files contain, are left as they are.
- **Mode separation:** `semantic` and `components` are split into light and dark files.
- **Write-back** to `io/sync/` (see above).

## Stage 3: Build (`dist/`)

`style-dictionary.config.js` produces:

| File                           | Contents                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`                   | Everything: light tokens followed by the `.dark` overrides. This is what `@wyliedog/ui` imports                            |
| `semantic-light.css`           | The light-mode part of `tokens.css`                                                                                        |
| `semantic-dark.css`            | Only the `.dark { ... }` overrides for semantic and component tokens                                                       |
| `index.js`, `index.d.ts`       | One named export per token, e.g. `colorPolarNight50`                                                                       |
| `hierarchical.js`              | Nested objects such as `color["polar-night"]["50"]`, plus shadow, spacing, font size and other groups                      |
| `manifest.json`                | Token metadata (name, path, value, type, CSS variable, description) grouped as `primitives`, `semantics`, `components`     |
| `css-vars.js`, `css-vars.d.ts` | `CssVarName` type of every CSS variable (from `generate-token-types.js`)                                                   |
| `font-loaders.next.ts`         | Next.js font loader config generated from `@fontSource(...)` descriptions (see [FONTS.md](../../packages/tokens/FONTS.md)) |

The CSS is emitted in tiers:

```css
@theme inline static {
  /* primitives: static scales that generate Tailwind utilities */
  --color-gray-50: oklch(0.991 0.003 264.45);
}
@theme static {
  /* semantic tokens: themeable, utilities use var() so .dark works */
}
:root {
  /* component tokens: internal, not exposed as utilities */
}
.dark {
  --color-background-default: oklch(0.149 0.012 259.72);
}
```

Dark mode is applied by adding the `dark` class to an ancestor (`<html class="dark">`).

Package exports (`packages/tokens/package.json`): `.` (named exports), `./tokens.css`, `./semantic-light.css`, `./semantic-dark.css`, `./hierarchical`, `./css-vars`, `./manifest.json`.

```javascript
import { color } from "@wyliedog/tokens/hierarchical";
import { colorGray50 } from "@wyliedog/tokens";
```

Apps normally do not import the JS; they import the stylesheet through `@wyliedog/ui/styles` and use the variables as `bg-(--color-background-default)`. See [STYLING_ARCHITECTURE.md](../STYLING_ARCHITECTURE.md).

## Units

The source of truth stays **px**: `io/sync/*.json` and Figma hold plain pixel values, and the Token Bridge plugin never sees rem. The Style Dictionary build (`wd/size/rem` in `style-dictionary.config.js`) converts to **rem** in `tokens.css`, `index.js`, `hierarchical.js` and `manifest.json`, dividing by 16 (**1rem = 16px**, the browser default root size, which this project never overrides: no `62.5%` root hack, anywhere). rem follows the user's browser text-size setting (WCAG 1.4.4 Resize Text); px does not.

| Converts to rem                                                     | Stays as the source value                        |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| Spacing scale (`space.*`), including sizes and widths that alias it | Border widths (`border-width.*`), 1px hairlines  |
| Font sizes (`typography.font-size.*`)                               | Shadow geometry (offset, blur, spread)           |
| Border radius `sm` to `2xl` (`border-radius.*`)                     | Focus width, offset and halo (`focus.*`)         |
|                                                                     | `border-radius.full` (9999px is a pill sentinel) |
|                                                                     | Letter-spacing (em), durations, opacity, z-index |

The conversion happens on the primitive only. Semantic and component tokens alias a primitive and take its unit, so a component `separator.height` that aliases `border-width.1` stays `1px` while one that aliases `space.200` becomes `1rem`. Every converted value satisfies `rem * 16 == px` exactly (the build throws otherwise; `scripts/__tests__/rem-units.test.mjs` checks the output against the sync source). Token pages show both, for example `0.75rem (12px)`, because Figma shows px.

Front-end code follows the same rule: `pnpm check:units` fails on px literals for text size, spacing, sizing and radius in `packages/ui/src` and `apps/showcase/src` (1px hairlines, border widths, shadows, blur, gradients, media queries and the documented allowlist are exempt) and only warns for `apps/storybook/stories`.

Decisions (owner, 2026-10-25): radius converts to rem with `full` left in px; focus dimensions stay px; the units check fails for UI and showcase and warns for stories; the showcase's sub-12px text converts to its exact rem equivalent now (11px is `0.6875rem`), with sub-12px text recorded as an accessibility follow-up; token pages show rem and px together.

## Resolution chain

Component tokens alias semantic tokens, which alias primitives, which hold the value:

```text
component token  →  {color.background.primary}  →  {color.<scale>.<step>}  →  oklch(...)
```

Style Dictionary resolves the aliases during the build; the CSS contains resolved values.

## Workflows

**Change or add a token from Figma:** edit the variable in Figma, push with Token Bridge (a commit or pull request that touches `io/sync/`), pull the change, then:

```bash
pnpm --filter @wyliedog/tokens build
git diff packages/tokens   # io/sync, io/processed and dist change together
```

**Change a token in code:** edit `io/sync/*.json` (keep the structure above), run the same build, and bring the change into Figma with the plugin's import or pull.

**Sync status:** the plugin's Sync tab reports `to push`, `to pull` and `conflicts` by comparing Figma and GitHub each with a baseline recorded at the last successful push or pull, and says `N differences, direction unknown` until a baseline exists. The baseline stays in the Figma file and is never written to `io/sync/`. See [Sync status and the sync baseline](../../apps/figma-plugin/README.md#sync-status-and-the-sync-baseline). Push and Pull each show a per-token review (old to new values, deletions called out) before writing; see [Reviewing a Push or Pull](../../apps/figma-plugin/README.md#reviewing-a-push-or-pull).

**Figma variable scopes:** the plugin sets every variable's scopes from its token name when it imports (semantic `color.background.*` as fills, `color.foreground.*` as text and shape fills, `color.border.*` as strokes, component colours by the property word in the name; font size, weight, opacity and shadow blur/offset/spread to their own pickers), and re-sets them on every import, so pulling updates existing variables. An empty scope list hides a variable from every picker: primitive colours, z-index, durations, easings, shadow strings, focus dimensions, line height and tracking are hidden. Line height and tracking are hidden because the tokens are percentages and em fractions and Figma binds both as pixels; in Figma they are percent text-style properties generated by the component builder, and each style records which tokens drive it (shared plugin data, namespace `wylie_dog`) so a Pull keeps it in line: the review lists "Text styles will change" with from and to values, and the changes are applied after the import. Styles with no link are designer-owned and never modified. Token Bridge also **creates** the styles: `packages/tokens/io/styles/text-styles.json` (generated by `pnpm generate:text-styles` from the component tokens, checked by `pnpm check:tokens`, outside `io/sync` so Push never writes it) lists one style per text part as token paths, and a Pull with "Text styles" ticked in the Sync tab (remembered per Figma file, ticked by default in an empty file, and announced by the Sync tab when unticked) creates and updates them, binding font family, size and weight to variables; see [Text styles from the definitions file](../../apps/figma-plugin/README.md#text-styles-from-the-definitions-file). Each managed style also records its font-size token (`fontSizeToken`), which the one-time component builder uses to find a layer's style: Pull with Text styles first, then the builder, which creates no styles (plan 208). Nothing in Token Bridge depends on the builder. See [Text styles follow their tokens](../../apps/figma-plugin/README.md#text-styles-follow-their-tokens). Only 49 component colours with no property word stay unrestricted. The rule and table are in [`apps/figma-plugin/README.md`](../../apps/figma-plugin/README.md#variable-scopes). Renaming a token can change its scopes. Scopes are derived, not part of the token JSON, so they are shown in the Pull review ("Picker scopes will change") and a Pull can be confirmed when only scopes differ; see [Reviewing a Push or Pull](../../apps/figma-plugin/README.md#reviewing-a-push-or-pull).

**Dark mode:** put the dark value in `valuesByMode.Dark` of the semantic or component token; the build writes it into `.dark` in `tokens.css` and `semantic-dark.css`.

After any token change also run `pnpm check:docs` and `pnpm check:tokens` from the repo root; they fail if docs or the showcase reference a token that no longer exists.

**Contrast:** also run `pnpm check:contrast`. It reads `scripts/contrast-pairs.json`, a list of foreground tokens with the backgrounds each must be readable on, resolves every pair to its final colour in Light and Dark, and requires WCAG 2.2 AA (4.5:1 for text, 3:1 for icons, indicators and boundaries). It reads `io/sync` directly, so it needs no build. Pairs that fail today are listed under `knownFailures` with a reason (`pnpm check:contrast --list` prints them); a new failure fails the check, and so does a known failure that starts passing, so remove it from the list when you fix it. Disabled states are exempt under WCAG and are not declared. When you add a component foreground token, declare its pair in the same change.

## Commands

```bash
pnpm --filter @wyliedog/tokens build            # full pipeline
pnpm --filter @wyliedog/tokens process-io       # io/sync -> io/processed (and rewrites io/sync)
pnpm --filter @wyliedog/tokens dev              # watch io/sync and rebuild
pnpm --filter @wyliedog/tokens clean            # removes dist and io/processed
pnpm --filter @wyliedog/tokens test:tokens      # validate-tokens.js: structure, references, OKLCH ranges (also run by the rebuild-tokens workflow)
pnpm --filter @wyliedog/tokens run audit        # audit-tokens.js: unused, missing and misnamed tokens
pnpm --filter @wyliedog/tokens report:coverage  # token coverage in UI components
pnpm --filter @wyliedog/tokens report:usage     # component usage analysis
```

Use `run audit` because `pnpm audit` is pnpm's own vulnerability audit. `test:tokens` prints many warnings (for example tokens defined in more than one file); read the errors, not the warning count.

## Troubleshooting

- **Tokens not updating in the UI or apps:** rebuild tokens, then the UI package (`pnpm --filter @wyliedog/ui build`).
- **A token is missing from the CSS:** confirm it is in `io/sync/*.json`, rebuild, and search `dist/tokens.css`.
- **Broken references:** an alias like `{color.gray.50}` must match an existing token name exactly; run `test:tokens`.
- **Build changed `io/sync`:** expected (write-back); review the diff and commit it with the token change.

## References

- [Semantic colour pairing model](semantic-pairing-model.md) (proposed direction for pairing foregrounds and backgrounds)
- [W3C DTCG Specification](https://tr.designtokens.org/format/)
- [Style Dictionary](https://styledictionary.com/)
- [OKLCH color picker](https://oklch.com/)
- [Tailwind CSS 4 theme variables](https://tailwindcss.com/docs/theme)
- [Culori](https://culorijs.org/)
