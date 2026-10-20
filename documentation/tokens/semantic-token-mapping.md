# Semantic colour token mapping (proposed)

**Status:** Proposed. Nothing has been renamed. This is the old-to-new table for the model in [semantic-pairing-model.md](semantic-pairing-model.md), generated from the token files on 2026-10-20 so counts are measured, not estimated.

## How to read it

- **Component tokens** is how many component-tier tokens alias the current token. **Code refs** is how many times its CSS variable appears in the UI package, the showcase and Storybook (tests excluded).
- **Actions:** _rename_ (one to one), _merge_ (same purpose and value as another token, so it folds into it), _split_ (one token becomes one per role), _keep_ (name stays), _move_ (leaves the colour ground for its own group) and _retire_ (unused, removed).
- A merged token's references are rewritten to the surviving token. The retired tokens have no references.

## The vocabulary

| Part                                           | Levels                                                                         | Meaning                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Ground background                              | `default` (the page), `subtle`, `strong`; placement levels `raised`, `overlay` | `subtle` and `strong` are tonal steps away from the page.                                                     |
| Ground foreground                              | `default`, `muted`, `faint`; `disabled` is a state                             | A text hierarchy, readable on every ground background.                                                        |
| Ground border                                  | `default`, `subtle`, `strong`                                                  | The focus ring is its own group: `color.focus.ring`.                                                          |
| Role (primary, danger, success, warning, info) | `default` (solid fill), `subtle` (tint)                                        | Background and foreground pair by level: `foreground.X` is readable on `background.X`. Borders are `default`. |
| Inverse                                        | `default`                                                                      | A role of its own: `color.inverse.background.default` and `color.inverse.foreground.default`.                 |
| States                                         | `.hover`, `.active`, `.focus`, `.disabled`                                     | A suffix after the level, on any background.                                                                  |

`default` is the canonical value of a part. `subtle` and `strong` describe how a value looks (gentle or bold), not a position on one scale: ground levels step away from the page, role levels step toward it, and that asymmetry is deliberate.

## Summary

- 74 semantic colour tokens map to 45 distinct names (plus 3 to add when needed, listed below).
- 37 rename, 9 merge, 1 split (into four), 3 keep, 1 move and 23 retire.
- The retired tokens are the unused parts of the primary, secondary, accent and neutral families (18 tokens), the unused brand tokens (4) and one unused status token. They have no component-token references and no code references.

### Ground: background

| Current token                | Light / Dark            | Component tokens | Code refs | New name                           | Action | Note                                                                                             |
| ---------------------------- | ----------------------- | ---------------- | --------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `color.background.primary`   | gray.50 / gray.950      | 26               | 156       | `color.background.default`         | rename |                                                                                                  |
| `color.background.secondary` | gray.100 / gray.900     | 13               | 160       | `color.background.subtle`          | rename |                                                                                                  |
| `color.background.tertiary`  | gray.200 / gray.800     | 7                | 45        | `color.background.strong`          | rename |                                                                                                  |
| `color.background.inverse`   | gray.950 / gray.50      | 3                | 9         | `color.inverse.background.default` | rename | Inverse becomes a role: a true one-to-one pair (the tooltip).                                    |
| `color.background.brand`     | orange.600 / orange.500 | 0                | 0         | none                               | retire | Unused. Brand versus primary is decided with the primary-colour case study.                      |
| `color.background.danger`    | red.600 / red.600       | 1                | 0         | `color.danger.background.default`  | merge  | Same value as the solid danger fill (used for the destructive progress fill).                    |
| `color.surface.primary`      | gray.50 / gray.950      | 2                | 76        | `color.background.default`         | merge  | Same values as the page.                                                                         |
| `color.surface.secondary`    | gray.100 / gray.900     | 0                | 0         | `color.background.subtle`          | merge  | Unused; same values as the subtle surface.                                                       |
| `color.surface.raised`       | gray.50 / gray.950      | 0                | 0         | `color.background.raised`          | keep   | Unused; same value as the page today. Keep the name for when a component needs a lifted surface. |
| `color.surface.overlay`      | gray.300 / gray.700     | 0                | 0         | `color.background.overlay`         | keep   | Unused; the value (gray 300 / gray 700) needs a design review before use.                        |
| `color.surface.brand`        | blue.50 / blue.950      | 0                | 0         | none                               | retire | Unused. Brand versus primary is decided with the primary-colour case study.                      |
| `color.surface.success`      | green.50 / green.950    | 1                | 4         | `color.success.background.subtle`  | rename |                                                                                                  |
| `color.surface.warning`      | orange.50 / orange.950  | 1                | 2         | `color.warning.background.subtle`  | rename |                                                                                                  |
| `color.surface.danger`       | red.50 / red.950        | 3                | 8         | `color.danger.background.subtle`   | rename |                                                                                                  |
| `color.surface.info`         | blue.50 / blue.950      | 0                | 7         | `color.info.background.subtle`     | rename |                                                                                                  |

### Ground: foreground (text)

| Current token          | Light / Dark        | Component tokens | Code refs | New name                                                                                                                                            | Action | Note                                                                                                                                                  |
| ---------------------- | ------------------- | ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.text.primary`   | gray.900 / gray.100 | 53               | 280       | `color.foreground.default`                                                                                                                          | rename |                                                                                                                                                       |
| `color.text.secondary` | gray.700 / gray.300 | 22               | 329       | `color.foreground.muted`                                                                                                                            | rename |                                                                                                                                                       |
| `color.text.tertiary`  | gray.600 / gray.500 | 1                | 710       | `color.foreground.faint`                                                                                                                            | rename | Most of its references are in the showcase and Storybook.                                                                                             |
| `color.text.disabled`  | gray.400 / gray.600 | 5                | 1         | `color.foreground.default.disabled`                                                                                                                 | rename | Disabled is a state, not a level.                                                                                                                     |
| `color.text.inverse`   | gray.50 / gray.900  | 1                | 48        | `color.inverse.foreground.default`                                                                                                                  | rename |                                                                                                                                                       |
| `color.text.on-solid`  | gray.50 / gray.50   | 13               | 3         | `color.primary.foreground.default`<br>`color.danger.foreground.default`<br>`color.success.foreground.default`<br>`color.warning.foreground.default` | split  | Each role gets its own foreground for its solid fill. Every value is gray 50 today; they are separate tokens so a role can change without the others. |

### Ground: border and focus

| Current token            | Light / Dark        | Component tokens | Code refs | New name               | Action | Note                                                           |
| ------------------------ | ------------------- | ---------------- | --------- | ---------------------- | ------ | -------------------------------------------------------------- |
| `color.border.primary`   | gray.300 / gray.700 | 29               | 392       | `color.border.default` | rename |                                                                |
| `color.border.secondary` | gray.200 / gray.800 | 3                | 14        | `color.border.subtle`  | rename |                                                                |
| `color.border.strong`    | gray.500 / gray.600 | 5                | 0         | `color.border.strong`  | keep   |                                                                |
| `color.border.focus`     | blue.500 / blue.500 | 3                | 27        | `color.focus.ring`     | move   | The focus ring is its own group; it is a purpose, not a level. |

### Roles: solid fills, states and borders

| Current token                      | Light / Dark            | Component tokens | Code refs | New name                                  | Action | Note |
| ---------------------------------- | ----------------------- | ---------------- | --------- | ----------------------------------------- | ------ | ---- |
| `color.border.success`             | green.600 / green.600   | 1                | 4         | `color.success.border.default`            | rename |      |
| `color.border.warning`             | orange.600 / orange.600 | 1                | 0         | `color.warning.border.default`            | rename |      |
| `color.border.danger`              | red.600 / red.600       | 4                | 10        | `color.danger.border.default`             | rename |      |
| `color.interactive.primary`        | blue.600 / blue.600     | 17               | 256       | `color.primary.background.default`        | rename |      |
| `color.interactive.primary-hover`  | blue.700 / blue.700     | 3                | 2         | `color.primary.background.default.hover`  | rename |      |
| `color.interactive.primary-active` | blue.800 / blue.800     | 1                | 0         | `color.primary.background.default.active` | rename |      |
| `color.interactive.success`        | green.700 / green.700   | 5                | 1         | `color.success.background.default`        | rename |      |
| `color.interactive.success-hover`  | green.800 / green.800   | 2                | 0         | `color.success.background.default.hover`  | rename |      |
| `color.interactive.warning`        | orange.700 / orange.700 | 5                | 2         | `color.warning.background.default`        | rename |      |
| `color.interactive.warning-hover`  | orange.800 / orange.800 | 2                | 0         | `color.warning.background.default.hover`  | rename |      |
| `color.interactive.danger`         | red.600 / red.600       | 4                | 3         | `color.danger.background.default`         | rename |      |
| `color.interactive.danger-hover`   | red.700 / red.700       | 1                | 0         | `color.danger.background.default.hover`   | rename |      |

### Roles: tints and role-coloured text

| Current token        | Light / Dark            | Component tokens | Code refs | New name                          | Action | Note                                                                                                              |
| -------------------- | ----------------------- | ---------------- | --------- | --------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `color.text.success` | green.700 / green.400   | 1                | 23        | `color.success.foreground.subtle` | rename | Text on the tint; also used as role-coloured text on the page.                                                    |
| `color.text.warning` | orange.700 / orange.400 | 1                | 10        | `color.warning.foreground.subtle` | rename | Text on the tint; also used as role-coloured text on the page.                                                    |
| `color.text.danger`  | red.700 / red.400       | 7                | 40        | `color.danger.foreground.subtle`  | rename | Text on the tint; also used as role-coloured text on the page.                                                    |
| `color.text.info`    | blue.700 / blue.400     | 2                | 9         | `color.info.foreground.subtle`    | rename | Open question: link colour (button link, breadcrumb) is info today; should links follow the primary role instead? |

### Ground states (neutral fills)

| Current token                        | Light / Dark        | Component tokens | Code refs | New name                            | Action | Note                                                                                                                        |
| ------------------------------------ | ------------------- | ---------------- | --------- | ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `color.interactive.secondary`        | gray.100 / gray.800 | 17               | 2         | `color.background.default.hover`    | merge  | Same values as interactive.hover; used for hover and selected fills on the page.                                            |
| `color.interactive.secondary-hover`  | gray.200 / gray.700 | 1                | 0         | `color.background.default.active`   | merge  | Same values as interactive.pressed.                                                                                         |
| `color.interactive.secondary-active` | gray.300 / gray.600 | 1                | 0         | `color.background.subtle.active`    | rename | Hover and active on a subtle surface are one tone further than on the page.                                                 |
| `color.interactive.hover`            | gray.100 / gray.800 | 4                | 19        | `color.background.default.hover`    | rename |                                                                                                                             |
| `color.interactive.pressed`          | gray.200 / gray.700 | 2                | 0         | `color.background.default.active`   | rename |                                                                                                                             |
| `color.interactive.focus`            | blue.50 / blue.950  | 9                | 0         | `color.background.default.focus`    | rename | Open question: its value (blue 50 / blue 950) is a primary tint, so it should follow the primary role when primary changes. |
| `color.interactive.disabled`         | gray.100 / gray.800 | 8                | 0         | `color.background.default.disabled` | rename |                                                                                                                             |

### Status duplicates

| Current token            | Light / Dark            | Component tokens | Code refs | New name                          | Action | Note                                                                                                                                 |
| ------------------------ | ----------------------- | ---------------- | --------- | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `color.status.success`   | green.700 / green.400   | 0                | 60        | `color.success.foreground.subtle` | merge  | Same value as text.success.                                                                                                          |
| `color.status.warning`   | orange.700 / orange.400 | 0                | 16        | `color.warning.foreground.subtle` | merge  | Unused; same value as text.warning.                                                                                                  |
| `color.status.danger`    | red.600 / red.500       | 1                | 13        | `color.danger.foreground.subtle`  | merge  | Used only by the form required marker; the value differs slightly (red 600 / 500 against red 700 / 400), so check contrast on merge. |
| `color.status.info`      | blue.600 / blue.500     | 0                | 0         | `color.info.foreground.subtle`    | merge  | Unused; value differs (blue 600 / 500 against blue 700 / 400).                                                                       |
| `color.status.highlight` | yellow.300 / yellow.400 | 0                | 0         | none                              | retire | Unused.                                                                                                                              |

### Unused families and brand tokens

| Current token             | Light / Dark            | Component tokens | Code refs | New name                         | Action | Note                                                                                                                                                                                       |
| ------------------------- | ----------------------- | ---------------- | --------- | -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `color.text.brand`        | orange.600 / orange.500 | 0                | 0         | none                             | retire | Unused. Brand versus primary is decided with the primary-colour case study.                                                                                                                |
| `color.border.brand`      | orange.600 / orange.500 | 0                | 0         | none                             | retire | Unused. Brand versus primary is decided with the primary-colour case study.                                                                                                                |
| `color.primary.base`      | orange.700 / orange.400 | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.primary.hover`     | orange.800 / orange.500 | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.primary.active`    | orange.900 / orange.600 | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.primary.surface`   | orange.50 / orange.950  | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.primary.text`      | gray.950 / gray.50      | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.secondary.base`    | gray.200 / gray.100     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.secondary.hover`   | gray.300 / gray.200     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.secondary.active`  | gray.400 / gray.300     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.secondary.surface` | gray.100 / gray.900     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.secondary.text`    | gray.900 / gray.100     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.accent.hover`      | purple.700 / purple.500 | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.accent.active`     | purple.800 / purple.400 | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.accent.surface`    | purple.50 / purple.950  | 0                | 1         | `color.accent.background.subtle` | rename | Not unused: one code reference, the hero composition gradient (packages/ui/src/compositions/section-hero.tsx). Open question: keep an accent role for this, or use a primary or info tint. |
| `color.accent.text`       | purple.900 / purple.50  | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.accent.highlight`  | pink.300 / pink.700     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.neutral.base`      | gray.600 / gray.100     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.neutral.muted`     | gray.400 / gray.300     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.neutral.subtle`    | gray.200 / gray.500     | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |
| `color.neutral.on`        | gray.900 / gray.50      | 0                | 0         | none                             | retire | Unused family; its own text-on-base pairs fail contrast.                                                                                                                                   |

## Tokens to add when a component needs them

- `color.background.subtle.hover`: Today button.secondary uses the strong tone (gray 200 / gray 800) as its hover fill; this makes that a named state.
- `color.danger.background.subtle.hover`: The tinted destructive badge has no hover fill today (Plan 172 left it equal to the resting tint).
- `color.primary.background.subtle`: A primary tint (focus and selection fills). Add together with color.primary.foreground.subtle when a component needs it; the value today is blue 50 / blue 950.

## Decisions this table still needs

- **Link colour.** Button links and breadcrumb links use the info colour (blue 700 / 400). If links should follow the primary role, then changing primary to another colour (the planned case study) would move them with it; as info, they stay blue.
- **Focus fill.** `color.interactive.focus` is a primary tint in practice. Mapping it to `color.background.default.focus` keeps it a fixed value; letting it follow `color.primary.background.subtle` needs one semantic token to alias another, which the pipeline does not do today.
- **Brand versus primary.** The retired brand tokens are orange; every shipped primary is blue. Which colour the main role carries is the case study, so the four brand tokens are retired only as unused, not as a decision.
- **Accent.** `color.accent.surface` (purple 50 / 950) is used once, in the hero composition's gradient. Keep an accent role for it, or replace it with a primary or info tint and retire the rest of the family.
- **Raised and overlay values.** `color.background.raised` has the page's value and `color.background.overlay` (gray 300 / 700) looks arbitrary; both need a design pass before first use.
- **Merging `status.danger`.** The required-field marker would move from red 600 / 500 to red 700 / 400; check it against the contrast contract.
