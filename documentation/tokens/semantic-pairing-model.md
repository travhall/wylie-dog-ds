# Semantic colour pairing model

**Status:** Proposed. Nothing here is implemented except the contrast check (see "What exists today").
**Decided with the owner:** 2026-10-20. **Facts measured on:** 2026-10-20.

This records the direction for how semantic colour tokens pair a foreground with a background, why the current structure needs it, what was decided, and what is still open. It is the reference for a planned case study (see the end).

## The problem

The semantic colour layer (73 tokens) is organised along two axes at once: by property (`background`, `surface`, `text`, `border`, `interactive`) and by role (`primary`, `secondary`, `accent`, `neutral`, `status`). A foreground is never tied to the background it sits on, so contrast depends on each component author picking the right pair.

Measured on 2026-10-20:

- **One role appears at several strengths.** Danger is a strong fill with light text in `button` and `toast`, and a tinted fill with coloured text in `badge` (destructive only) and `alert`. `badge` mixes both: default, success and warning are strong fills, destructive is tinted.
- **Three names for one thing.** The button variant `default` uses component tokens named `primary`, which point at `interactive.primary`. "Primary" also means text emphasis (`text.primary`) and an unused `primary` family.
- **Unused tokens.** 31 of the 73 semantic colours are not referenced by any component token, including all of the `primary`, `secondary`, `accent` and `neutral` families. Their own "text on base" pairs fail contrast (for example `secondary.text` on `secondary.base` is 1.00:1 in Dark).
- **Static text on lightening fills.** `text.on-solid` (the same in both modes) sits on solid fills whose hover and active states lighten in Dark mode, so those states fail 4.5:1. Interactive badges also use a pale focus fill with that light text (1.06:1 in Light).
- **The primary colour is split.** The unused `primary` family and the `brand` tokens are orange; every shipped primary action is blue (`interactive.primary`).

`pnpm check:contrast --list` prints the current failures.

## Decisions

1. **Pair-key semantics.** Within a role, the same level means a guaranteed pair: `foreground.X` is readable on `background.X`, in both modes. The pair, not the individual token, is the unit that is checked.
2. **Name the parts directly:** `background` and `foreground` (and `border`), not `surface` or `on-*`.
3. **Intensity is a level of the value, not a separate segment.** No `solid` or `subtle` layer between the role and the part; a quieter version of a value is a level of that value.
4. **Retire `interactive` as a colour namespace.** It mixes role fills with behaviour. Roles become the namespace; hover, active, focus and disabled become states of a background.
5. **Keep the Secondary button.** It stays as a variant; its naming is cleaned up as part of the `interactive` and `primary` clean-up.
6. **Do not change the primary colour yet.** Primary stays blue. It will be changed later, through Figma and pushed to code, as a deliberate end-to-end test (the case study below). The orange brand tokens stay as they are until then.
7. **No alpha inside colour tokens.** Opacity is a separate `number` token (0 to 1). Tints and surfaces are opaque colours resolved per mode. Reasons: contrast can only be verified for opaque colours; the Figma exporter reads only the red, green and blue channels of a variable (read from `processor.ts`, not tested end to end), so alpha would not round-trip; and Figma cannot alias a colour with an alpha change.
8. **The neutral ground is not a role.** It has a text hierarchy (default, muted, faint, disabled) and an elevation ladder (default, subtle, raised, overlay, inverse) that do not pair one to one, so its contract is a matrix rather than a key. See "Open questions" for how it is named.

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

Role fills and states are the same grammar, for example `color.danger.background.default.hover`. Levels run in one direction per role; the exact vocabulary is open.

## Open questions

- **Level vocabulary and direction.** For a coloured role, `default` is the strongest fill and a quieter level is a tint. For the neutral ground `default` is the page and the next level is raised. The same words move in opposite directions, so each needs defining.
- **Text hierarchy words.** If `subtle` means a quieter surface, the text hierarchy needs different words (`muted`, `faint`) so the two meanings do not collide.
- **Role names.** Whether the main action colour and the brand colour are one role, and whether it is called `primary` or `brand`. This follows from the case study.
- **Number of levels and where states live** (a segment after the level, or a suffix).
- **Migration.** Token names appear outside the token files: about 2,740 references across the UI package, the showcase and Storybook (text 1,454, border 447, background 370, interactive 285, surface 97, status 89), plus roughly 290 component-token aliases. `pnpm check:tokens` verifies every reference resolves after a rename, so a scripted migration is checkable. It also touches the Figma sync, the showcase and the docs, so it needs its own plan.

## Intended sequence

1. Declare pairs and check them in CI (done, see below).
2. Fix the failures the check lists.
3. Align the colour ramps by lightness so that "fill step, foreground step" holds across hues (the ramps are not aligned today: step 600 has an OKLCH lightness of 0.52 for gray, 0.55 for blue, 0.65 for orange and 0.69 for yellow).
4. Rename to the grammar above once the ramps settle.

## What exists today

`pnpm check:contrast` reads `scripts/contrast-pairs.json` (99 declared foregrounds, 264 checks across Light and Dark) and fails on any new failure. Known failures are listed with reasons and must be removed when fixed. It is part of the Lint workflow. See [token-pipeline.md](token-pipeline.md).

## Case study

The primary colour change will be run through Figma and pushed to code to show the whole flow end to end, and written up in `documentation/case-studies/` using the template there. It is not written yet.
