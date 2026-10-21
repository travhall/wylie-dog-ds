# Semantic colour pairing model

**Status:** Implemented on 2026-10-20. The semantic colour tokens use this grammar and the contrast check guards the declared pairs. See [semantic-token-mapping.md](semantic-token-mapping.md) for the old-to-new table.
**Decided with the owner:** 2026-10-20 (level vocabulary settled the same day). **Facts measured on:** 2026-10-20.

This records the direction for how semantic colour tokens pair a foreground with a background, why the current structure needs it, what was decided, and what is still open. It is the reference for a planned case study (see the end).

## The problem

The semantic colour layer (73 tokens) is organised along two axes at once: by property (`background`, `surface`, `text`, `border`, `interactive`) and by role (`primary`, `secondary`, `accent`, `neutral`, `status`). A foreground is never tied to the background it sits on, so contrast depends on each component author picking the right pair.

Measured on 2026-10-20:

- **One role appears at several strengths.** Danger is a strong fill with light text in `button` and `toast`, and a tinted fill with coloured text in `badge` (destructive only) and `alert`. `badge` mixes both: default, success and warning are strong fills, destructive is tinted.
- **Three names for one thing.** The button variant `default` uses component tokens named `primary`, which point at `interactive.primary`. "Primary" also means text emphasis (`text.primary`) and an unused `primary` family.
- **Unused tokens.** 31 of the 73 semantic colours are not referenced by any component token, including all of the `primary`, `secondary`, `accent` and `neutral` families. Their own "text on base" pairs fail contrast (for example `secondary.text` on `secondary.base` is 1.00:1 in Dark).
- **Static text on lightening fills.** `text.on-solid` (the same in both modes) sits on solid fills whose hover and active states lighten in Dark mode, so those states fail 4.5:1. Interactive badges also use a pale focus fill with that light text (1.06:1 in Light). Fixed on 2026-10-20: see "Contrast fixes" below.
- **The primary colour is split.** The unused `primary` family and the `brand` tokens are orange; every shipped primary action is blue (`interactive.primary`).

`pnpm check:contrast` guards the pairs; it found 16 failures on 2026-10-20, all fixed the same day.

## Decisions

1. **Pair-key semantics.** Within a role, the same level means a guaranteed pair: `foreground.X` is readable on `background.X`, in both modes. The pair, not the individual token, is the unit that is checked.
2. **Name the parts directly:** `background` and `foreground` (and `border`), not `surface` or `on-*`.
3. **Intensity is a level of the value, not a separate segment.** No `solid` or `subtle` layer between the role and the part; a quieter version of a value is a level of that value.
4. **Retire `interactive` as a colour namespace.** It mixes role fills with behaviour. Roles become the namespace; hover, active, focus and disabled become states of a background.
5. **Keep the Secondary button.** It stays as a variant; its naming is cleaned up as part of the `interactive` and `primary` clean-up.
6. **Do not change the primary colour yet.** Primary stays blue. It will be changed later, through Figma and pushed to code, as a deliberate end-to-end test (the case study below). The orange brand tokens stay as they are until then.
7. **No alpha inside colour tokens.** Opacity is a separate `number` token (0 to 1). Tints and surfaces are opaque colours resolved per mode. Reasons: contrast can only be verified for opaque colours; the Figma exporter reads only the red, green and blue channels of a variable (read from `processor.ts`, not tested end to end), so alpha would not round-trip; and Figma cannot alias a colour with an alpha change.
8. **The neutral ground is not a role.** It has a text hierarchy (default, muted, faint, disabled) and an elevation ladder (default, subtle, raised, overlay, inverse) that do not pair one to one, so its contract is a matrix rather than a key.
9. **Ground tokens are unprefixed; roles are prefixed.** The ground is written `color.background.<level>`, `color.foreground.<level>` and `color.border.<level>`; roles are `color.<role>.<part>.<level>`. Reasons: about 88 percent of the roughly 2,740 semantic token references in the UI package, the showcase and Storybook are ground tokens (text, border, background, surface), and these names appear in class strings, so the most used tokens should be the shortest; and the ground has structure roles do not. A checker enumerates the ground and the roles separately.
10. **Level vocabulary.** `default` is the canonical value of a part. `subtle` and `strong` describe how a value looks (gentle or bold), not a position on one scale. Ground backgrounds are `default` (the page), `subtle` and `strong`, plus the placement levels `raised` and `overlay`; the ground text hierarchy is `default`, `muted`, `faint`; ground borders are `default`, `subtle`, `strong`. Roles have `default` (the solid fill) and `subtle` (the tint). Ground levels step away from the page and role levels step toward it; that asymmetry is deliberate and documented rather than hidden.
11. **The ground text hierarchy uses different words from the surface levels** (`muted`, `faint`), so `subtle` never means two things: on a role, `foreground.subtle` is the text on the subtle tint.
12. **Inverse is a role of its own** (`color.inverse.background.default` and `color.inverse.foreground.default`), because it is a true one-to-one pair.
13. **States are a suffix after the level** (`.hover`, `.active`, `.focus`, `.disabled`) on any background, including the ground, since hover and active are relative to the surface they sit on. The focus ring is its own group (`color.focus.ring`), and disabled is a state, not a level.
14. **Primary is the main role.** Links and the focus fill follow it (color.primary.foreground.subtle and color.primary.background.subtle). The brand and accent tokens are retired. The primary colour stays blue until the owner changes it through Figma.
15. **Placeholder values.** The values of raised and overlay, like every other value, are provisional; a design pass follows the migration.

## Proposed grammar

Roles (one to one pairs):

```
color.<role>.background.<level>[.<state>]
color.<role>.foreground.<level>
color.<role>.border.<level>
```

The neutral ground (a matrix, not a key):

```
color.background.<level>     # page, subtle, raised, overlay, inverse
color.foreground.<level>     # default, muted, faint, disabled, inverse
color.border.<level>
```

Role fills and states are the same grammar, for example `color.danger.background.default.hover`. The complete old-to-new table for every current semantic colour token is in [semantic-token-mapping.md](semantic-token-mapping.md).

## Intended sequence

1. Declare pairs and check them in CI (done, see below).
2. Fix the failures the check lists (done, see "Contrast fixes").
3. Align the colour ramps by lightness so that "fill step, foreground step" holds across hues (the ramps are not aligned today: step 600 has an OKLCH lightness of 0.52 for gray, 0.55 for blue, 0.65 for orange and 0.69 for yellow).
4. Rename to the grammar above, using the mapping table (done on 2026-10-20, before step 3; the ramps are still unaligned).

## Contrast fixes (2026-10-20)

The 16 failures the check found were fixed with the least invasive change that keeps the paired text, and no token was renamed:

- **Solid hover and active fills now darken in both modes.** `interactive` primary hover and active, and success, warning and danger hover, use the same step in Dark as in Light, so the light text on them stays above 4.5:1 (it was 2.2 to 3.7:1 in Dark).
- **Solid badge focus** (default, success, warning) uses the hover fill instead of the pale focus tint (it was 1.06:1 in Light).
- **Tinted destructive badge hover** keeps its tint instead of switching to the solid danger fill (red text on red was 1.00:1). There is no darker tint token yet; a hover level for tinted fills belongs to the level vocabulary in the open questions.
- **Card pressed fill in Dark** uses the hover fill (the pressed fill left the secondary text at 4.26:1).
- **Breadcrumb link hover** uses the primary text colour instead of an interactive fill colour that was never a text colour.
- **New token `color.border.strong`** (gray 500 in Light, gray 600 in Dark) for the input border and the navigation indicator, which need 3:1 against the page. The shared `color.border.primary` (32 component tokens) is unchanged because decorative dividers do not need it.

Control boundaries were added to the contract the same day, and the same new border token fixed the checkbox border, the radio border and the unchecked switch track (it was 1.12:1 against the page in Light). Declared boundaries are those that are the only visual edge of a control with no text label (input, checkbox, radio, switch, slider) plus focus indicators; controls with a text label (outline button, toggle) are not declared because the label identifies them. The slider's unfilled track is not required to reach 3:1 because the value is carried by the thumb and the filled range, which are declared.

## What exists today

`pnpm check:contrast` reads `scripts/contrast-pairs.json` (128 declared foregrounds, 352 checks across Light and Dark) and fails on any new failure. It currently reports no known failures; any added later must be listed with a reason and removed when fixed. It is part of the Lint workflow. See [token-pipeline.md](token-pipeline.md).

## Case study

The primary colour change will be run through Figma and pushed to code to show the whole flow end to end, and written up in `documentation/case-studies/` using the template there. It is not written yet.
