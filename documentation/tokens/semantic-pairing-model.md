# Semantic color pairing model

**Status:** Implemented on 2026-10-20 and restructured on 2026-10-23 (see "Restructure" below). The semantic color tokens use this grammar and the contrast check guards the declared pairs. See [semantic-token-mapping.md](semantic-token-mapping.md) for the old-to-new table.
**Decided with the owner:** 2026-10-20 (level vocabulary settled the same day). **Facts measured on:** 2026-10-20.

This records the direction for how semantic color tokens pair a foreground with a background, why the current structure needs it, what was decided, and what is still open. It is the reference for a planned case study (see the end).

## Restructure (2026-10-23)

The grammar below was implemented on 2026-10-20 and **restructured on 2026-10-23** after the owner reviewed it in Figma. The nested level and state naming produced 35 Figma groups for 48 variables, 14 groups holding a single variable and 8 variables that were also group names. This section supersedes decisions 3, 10, 11, 12 and 13 and the grammar section below; everything else in this record is kept as history.

- **Names** are `color.<part>.<token>` with the part `background`, `foreground` or `border` (property first, three segments, never more). Ground tokens: `background.{default, muted, emphasis, raised, overlay, inverse}`, `foreground.{default, muted, faint, inverse}`, `border.{default, muted, emphasis, focus}`. A role is a name inside the part: `color.background.success` (solid fill), `success-muted` (tint), `success-emphasis` (stronger fill); `color.foreground.success` (text over the fill), `success-muted` (text over the tint); `color.border.success`.
- **Vocabulary:** `muted` is the quieter tone and `emphasis` the stronger one. They replace `subtle` and `strong`. `faint` exists only for ground text.
- **Pairs:** `foreground.X` is the text over `background.X`.
- **States are not semantic tokens.** Hover, active, focus and disabled belong to the component layer, where a component token references a semantic tone (per mode where the tones differ). 12 semantic state tokens were removed; 4 emphasis tones were added for the solid fills.
- **Components bind only to component tokens.** The focus indicator is a centralized exception (`color.focus.ring` and `color.focus.halo`).
- **Structure is enforced:** `pnpm check:tokens` runs `scripts/check-token-structure.mjs` (three segments, no state word, no single-variable group, no variable that is also a group name).
- **Value changes accepted:** Dark danger text is red 400 (it was red 300); disabled text uses `foreground.faint`; pressed fills use the emphasis tone; the tinted destructive badge has no hover color. 26 component color values changed in all; every other component color is identical to before.
- **Counts:** 41 semantic color tokens in 4 Figma groups, 91 semantic tokens in all. (42 and 92 after `foreground.link` on 2026-10-31, 47 and 97 after the `-intense` tones on 2026-11-01.) The old-to-new table is the second mapping in [semantic-token-mapping.md](semantic-token-mapping.md).

## The problem

The semantic color layer (73 tokens) is organised along two axes at once: by property (`background`, `surface`, `text`, `border`, `interactive`) and by role (`primary`, `secondary`, `accent`, `neutral`, `status`). A foreground is never tied to the background it sits on, so contrast depends on each component author picking the right pair.

Measured on 2026-10-20:

- **One role appears at several strengths.** Danger is a strong fill with light text in `button` and `toast`, and a tinted fill with colored text in `badge` (destructive only) and `alert`. `badge` mixed both: default, success and warning are strong fills, destructive was tinted (it became a solid fill on 2026-11-02).
- **Three names for one thing.** The button variant `default` uses component tokens named `primary`, which point at `interactive.primary`. "Primary" also means text emphasis (`text.primary`) and an unused `primary` family.
- **Unused tokens.** 31 of the 73 semantic colors are not referenced by any component token, including all of the `primary`, `secondary`, `accent` and `neutral` families. Their own "text on base" pairs fail contrast (for example `secondary.text` on `secondary.base` is 1.00:1 in Dark).
- **Static text on lightening fills.** `text.on-solid` (the same in both modes) sits on solid fills whose hover and active states lighten in Dark mode, so those states fail 4.5:1. Interactive badges also use a pale focus fill with that light text (1.06:1 in Light). Fixed on 2026-10-20: see "Contrast fixes" below.
- **The primary color is split.** The unused `primary` family and the `brand` tokens are orange; every shipped primary action is blue (`interactive.primary`). (Measured on 2026-10-20; primary has since moved to fiery-coral.)

`pnpm check:contrast` guards the pairs; it found 16 failures on 2026-10-20, all fixed the same day.

## Decisions

1. **Pair-key semantics.** Within a role, the same level means a guaranteed pair: `foreground.X` is readable on `background.X`, in both modes. The pair, not the individual token, is the unit that is checked.
2. **Name the parts directly:** `background` and `foreground` (and `border`), not `surface` or `on-*`.
3. **Intensity is a level of the value, not a separate segment.** No `solid` or `subtle` layer between the role and the part; a quieter version of a value is a level of that value.
4. **Retire `interactive` as a color namespace.** It mixes role fills with behaviour. Roles become the namespace; hover, active, focus and disabled become states of a background.
5. **Keep the Secondary button.** It stays as a variant; its naming is cleaned up as part of the `interactive` and `primary` clean-up.
6. **Do not change the primary color yet.** Primary stays blue. It will be changed later, through Figma and pushed to code, as a deliberate end-to-end test (the case study below). The orange brand tokens stay as they are until then. _Superseded on 2026-10-31: primary is now fiery-coral, see "Link and the primary pair" below._
7. **No alpha inside color tokens.** Opacity is a separate `number` token (0 to 1). Tints and surfaces are opaque colors resolved per mode. Reasons: contrast can only be verified for opaque colors; the Figma exporter reads only the red, green and blue channels of a variable (read from `processor.ts`, not tested end to end), so alpha would not round-trip; and Figma cannot alias a color with an alpha change.
8. **The neutral ground is not a role.** It has a text hierarchy (default, muted, faint, disabled) and an elevation ladder (default, subtle, raised, overlay, inverse) that do not pair one to one, so its contract is a matrix rather than a key.
9. **Ground tokens are unprefixed; roles are prefixed.** The ground is written `color.background.<level>`, `color.foreground.<level>` and `color.border.<level>`; roles are `color.<role>.<part>.<level>`. Reasons: about 88 percent of the roughly 2,740 semantic token references in the UI package, the showcase and Storybook are ground tokens (text, border, background, surface), and these names appear in class strings, so the most used tokens should be the shortest; and the ground has structure roles do not. A checker enumerates the ground and the roles separately.
10. **Level vocabulary.** `default` is the canonical value of a part. `subtle` and `strong` describe how a value looks (gentle or bold), not a position on one scale. Ground backgrounds are `default` (the page), `subtle` and `strong`, plus the placement levels `raised` and `overlay`; the ground text hierarchy is `default`, `muted`, `faint`; ground borders are `default`, `subtle`, `strong`. Roles have `default` (the solid fill) and `subtle` (the tint). Ground levels step away from the page and role levels step toward it; that asymmetry is deliberate and documented rather than hidden.
11. **The ground text hierarchy uses different words from the surface levels** (`muted`, `faint`), so `subtle` never means two things: on a role, `foreground.subtle` is the text on the subtle tint.
12. **Inverse is a role of its own** (`color.inverse.background.default` and `color.inverse.foreground.default`), because it is a true one-to-one pair.
13. **States are a suffix after the level** (`.hover`, `.active`, `.focus`, `.disabled`) on any background, including the ground, since hover and active are relative to the surface they sit on. The focus ring is its own group (`color.focus.ring`), and disabled is a state, not a level.
14. **Primary is the main role.** Links and the focus fill follow it (color.primary.foreground.subtle and color.primary.background.subtle). The brand and accent tokens are retired. The primary color stayed blue until 2026-10-31, when it became fiery-coral. _Links now use `color.foreground.link`, see "Link and the primary pair" below._
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

Role fills and states are the same grammar, for example `color.danger.background.default.hover`. The complete old-to-new table for every current semantic color token is in [semantic-token-mapping.md](semantic-token-mapping.md).

## Intended sequence

1. Declare pairs and check them in CI (done, see below).
2. Fix the failures the check lists (done, see "Contrast fixes").
3. Align the color ramps by lightness so that "fill step, foreground step" holds across hues (done on 2026-10-21, see "Ramp alignment" below).
4. Rename to the grammar above, using the mapping table (done on 2026-10-20, before step 3; the ramps are still unaligned).

## Contrast fixes (2026-10-20)

The 16 failures the check found were fixed with the least invasive change that keeps the paired text, and no token was renamed:

- **Solid hover and active fills now darken in both modes.** `interactive` primary hover and active, and success, warning and danger hover, use the same step in Dark as in Light, so the light text on them stays above 4.5:1 (it was 2.2 to 3.7:1 in Dark).
- **Solid badge focus** (default, success, warning) uses the hover fill instead of the pale focus tint (it was 1.06:1 in Light).
- **Tinted destructive badge hover** keeps its tint instead of switching to the solid danger fill (red text on red was 1.00:1). There is no darker tint token yet; a hover level for tinted fills belongs to the level vocabulary in the open questions.
- **Card pressed fill in Dark** uses the hover fill (the pressed fill left the secondary text at 4.26:1).
- **Breadcrumb link hover** uses the primary text color instead of an interactive fill color that was never a text color.
- **New token `color.border.strong`** (gray 500 in Light, gray 600 in Dark) for the input border and the navigation indicator, which need 3:1 against the page. The shared `color.border.primary` (32 component tokens) is unchanged because decorative dividers do not need it.

Control boundaries were added to the contract the same day, and the same new border token fixed the checkbox border, the radio border and the unchecked switch track (it was 1.12:1 against the page in Light). Declared boundaries are those that are the only visual edge of a control with no text label (input, checkbox, radio, switch, slider) plus focus indicators; controls with a text label (outline button, toggle) are not declared because the label identifies them. The slider's unfilled track is not required to reach 3:1 because the value is carried by the thumb and the filled range, which are declared.

## Ramp alignment (2026-10-21)

Before: the step that first reached 4.5:1 with the light foreground (gray 50) was 600 for blue, red, purple and gray, 700 for green, orange and pink, and 800 for yellow. At step 600 the OKLCH lightness ran from 0.52 (gray) to 0.69 (yellow). A role could not change hue and keep its step.

Now: the seven chromatic palettes (blue, green, orange, red, purple, pink, yellow) share blue's lightness at every step, with each palette's own hue and chroma (chroma clamped to the sRGB gamut where the lightness left no room). Gray stays the neutral scale and the five named palettes (polar-night, fiery-coral, sandcastle, petrified-wood, black-bear) are unchanged; no semantic token uses them.

- **Chroma kept:** 100 percent for blue, red and purple; about 90 percent at the middle steps for green and orange; about 85 to 90 percent for pink at 700 to 950; 80 to 90 percent for yellow at 400 to 950.
- **Exception:** green 600 is 0.003 lighter than the curve asks (0.543 against 0.546) because at exactly 0.546 it measured 4.49:1 on gray 50. OKLCH lightness is not WCAG luminance, so equal lightness gives slightly different contrast per hue.
- **Guard:** `pnpm check:contrast` fails if any aligned palette drifts more than 0.005 from blue's lightness at any step (the `alignedRamps` block in `scripts/contrast-pairs.json`), and it declares gray 50 on the 600 step of every chromatic hue as a text pair.
- **Role fill steps (2026-10-21):** primary, danger and success solid fills are step 600, hover is 700 and (primary only) active is 800. Success moved from 700 and 800 to 600 and 700, so its fill is lighter and brighter than before.
- **Warning is the exception (2026-10-21):** amber cannot hold light text at step 600 without turning brown, so the warning role uses the yellow ramp with dark text: fill `yellow.300`, hover `yellow.400`, `color.warning.foreground.default` is `gray.950` (10.8:1 on the fill, 7.6:1 on hover), tint `yellow.50` and `yellow.950`, text on the tint `yellow.700` and `yellow.400`, border `yellow.600`. The pair rule still holds (`foreground.default` is readable on `background.default`); the foreground is per role, which is why `on-solid` was split.
- **Yellow and orange retuned (2026-10-21):** only hue and chroma changed, never lightness, so the alignment holds. Yellow now runs from cream and lemon at the pale end through amber at 300 and 400 to bronze at the dark end (hue 96 down to 71); before, its pale steps were khaki. Orange keeps its mid steps and loses the drift toward red at the dark end (hue 41 instead of 36 to 38).

## Subtle hover states (2026-10-21)

A subtle fill now has a named hover, like the solid fills: `color.background.subtle.hover` (gray 200 in Light, gray 800 in Dark) sits between `subtle` and `subtle.active`, and `color.danger.background.subtle.hover` (red 100, red 900) gives the tinted destructive badge a visible hover. Red 400 text on red 900 measured 3.93:1, so `color.danger.foreground.subtle` in Dark moved to red 300 (about 5.5:1 on the hover); this lightens error text, the required-field marker and tinted badge and alert text slightly in Dark. The other roles have no hover on their tint because no component needs one yet.

## Fill tokens used as text or border (2026-10-21)

About 60 places used `color.primary.background.default` as text on the page (blue 600: 5.04:1 in Light, 3.81:1 in Dark, under 4.5:1) and about 20 as a border or ring. Text now uses `color.primary.foreground.subtle` (6.54:1 in Light, 7.75:1 in Dark, the shade also moves for the approved homepage headline emphasis). Borders and rings use the new `color.primary.border.default`, which keeps blue 600 and is declared as a non-text pair on the page. Indicator dots that used `success` and `warning` `foreground.subtle` as a fill now use the role fill. Five stories paired text with the wrong token on a blue fill (`inverse.foreground.default` is gray 900 in Dark) and now use `color.primary.foreground.default`; two toggle stories do the same for danger. Left as they are: solid components whose border matches their fill, and ring offsets that match the page background.

## Raised and overlay (2026-10-20)

`raised` and `overlay` are the top of the neutral ground's elevation ladder (default, subtle, raised, overlay, inverse). Neither was used: every floating surface aliased `background.default`, and `overlay` was a gray 300 / 700 "surface for modals and popovers" that mixed a surface with a scrim, while the dialog and sheet scrims used the inverse role with no opacity. In Dark that scrim was opaque near-white, so an open dialog turned the whole page white; in Light it was opaque near-black.

- **`color.background.raised`** is the surface of anything that floats above the page: gray 50 in Light (the same as the page, so the shadow does the lifting) and gray 900 in Dark (one step lighter, the usual dark-mode elevation cue). Card, popover, hover card, dropdown menu, context menu, select, command, dialog, sheet and toast use it.
- **`color.background.overlay`** is the scrim color behind a modal or sheet: gray 950 in both modes. The dialog, alert dialog and sheet apply it at 0.9 through their `overlay-opacity` component tokens, which alias the primitive `opacity.90`, so it is never opaque. Tooltip keeps the inverse role.
- **Pairs:** default, muted and faint foreground, and the primary and danger subtle text, are declared on `raised`.
- **Still open:** the scrim opacity (0.9, raised from 0.8 on 2026-10-21, now set on the three `overlay-opacity` component tokens) and whether Light needs a visibly different raised surface are design decisions for later.

## Link and the primary pair (2026-10-31)

The primary color moved from blue to fiery-coral through Figma. Two things broke the pairing model's reading of `primary`, and both were decided with the owner the same day.

- **Links get their own ground token, `color.foreground.link`.** Before, `foreground.primary-muted` meant three things at once: link text (3 component tokens: `button.link-text`, `breadcrumb.link`, one icon), primary-colored emphasis text on the page (about 68 direct uses in the showcase) and text over the primary tint. A link token separates the first from the other two, the way Carbon (`$link-primary`), Primer (`fgColor-link` against `fgColor-accent`) and Atlassian (`color.link`) do. It is a ground text token beside `default`, `muted` and `faint`, so it does not become a role; hover stays at the component layer and there is no visited token. Value: polar-night 400 in Light (5.84:1 on the page) and polar-night 200 in Dark (7.98:1 on the page). Polar-night 300 passes on the Dark page (4.74:1) but fails on the raised and muted surfaces (about 4.3:1), so 200 is the Dark step. Coral links were rejected because coral 700 (hue 38) is too close to red 700 error text (hue 27) in both modes. Inline links are still underlined: polar-night 400 against black-bear 900 body text is 3.0:1, only just enough to carry a link by color.
- **`foreground.primary` is text over the primary fill again.** It first became `gray.950` on coral 600 (4.83:1 against 3.98:1 for `gray.50`), and moved to `gray.50` on coral 700 the same day, see "Light text on darker fills".
- **`foreground.primary-muted`** is coral 700 in Light and coral 300 in Dark. Coral 400 in Dark is 4.2:1 on the coral 900 tint.
- **Light text scale** is black-bear 900, 500 and 400 (17.6, 12.0 and 6.4:1 on the page). Lightness steps are 0.128 and 0.150, against 0.214 and 0.097 for gray 900, 700 and 600, so muted and faint stop looking alike. Dark is unchanged (gray 50, 200 and 400).
- **Still open:** the sandcastle surfaces, petrified-wood borders and a Dark surface change for the brand palettes. Each moves the contrast of the others (faint at gray 600 fails on sandcastle 100 and 200 at 4.44:1), so they belong in one design pass.

## Warm neutrals and the info role (2026-11-01)

The brand palettes now carry the neutral ground, so the whole UI reads as the brand and a token change re-themes it. Ten semantic variables changed and no component token did; `check:contrast` passes all 146 declared foregrounds unchanged.

- **Light surfaces:** `background.muted` is sandcastle 100 and `background.emphasis` is sandcastle 200. The page and the raised surface stay gray 50, so cards still lift off the warm panels.
- **Light borders:** petrified-wood 100, 300 and 500 for muted, default and emphasis. Step 500 is 3.83:1 on the page, enough for the 3:1 control-boundary rule.
- **Dark surfaces:** black-bear 950 for the page, 900 for muted and raised, 700 for emphasis. Overlay is black-bear 950 in both modes; inverse is black-bear 950 in Light and sandcastle 50 in Dark.
- **Dark borders:** petrified-wood 900, 800 and 600.
- **Dark text:** sandcastle 50, 300 and 600 (18.4, 12.1 and 7.7:1 on the page), evenly spaced.
- **Info:** `background.info-muted` is polar-night 50 and 950, and `foreground.info-muted` is polar-night 500 and 200. Polar-night is the cool counterpoint to the warm neutrals and the coral primary; the role is completed in "Secondary, accent and info roles" below.

Faint text at gray 600 fails on sandcastle 100 and 200 (4.44:1), which is why the Light scale is black-bear and not gray. Surfaces, borders and text were changed together for that reason.

Alert and Toast gained their `info` variants on 2026-11-01, see "Secondary, accent and info roles".

## Pressed tones (2026-11-01)

Hover and pressed were the same fill everywhere, and the destructive and outline buttons and most badges had no pressed token at all. A pressed state needs its own tone, and component tokens can only alias a semantic tone, so the vocabulary gains a third level: `intense`, the strongest tone, one step past `emphasis`. It carries no state word, so the rule that semantic names never say hover or pressed still holds; the component layer decides that `intense` means pressed.

- **New tokens:** `background.intense` (sandcastle 300 in Light, black-bear 600 in Dark) and `background.primary-intense`, `danger-intense`, `success-intense` and `warning-intense`.
- **The rule:** pressed is one ramp step further in the direction hover already moves. Every role's hover and pressed go darker: red 700 to 800, green 700 to 800, yellow 400 to 500 for warning, and (after "Light text on darker fills") coral 800 to 900 and polar-night 500 to 600. Each holds 4.5:1 with its foreground: red 800 with `gray.50` is 8.81:1, green 800 7.70:1, yellow 500 with `gray.950` 5.38:1, coral 900 with `gray.50` 11.26:1, and the default text on `background.intense` is 11.1:1 in Light and 12.3:1 in Dark.
- **Rebound:** `button.primary`, `secondary` and `ghost`, `card` and `accordion` pressed fills now use the intense tone.
- **New component tokens (7):** `button.destructive.background-active`, `button.outline.background-active`, and `badge.default`, `secondary`, `success`, `warning` and `outline` `background-active`, each with the matching `active:` class in `button.tsx` and `badge.tsx`.
- **The tinted destructive badge** had no pressed tone and no visible hover. It became a solid fill on 2026-11-02 and takes `danger-emphasis` and `danger-intense` like the button.
- **Guards:** `check-token-structure.mjs` allows the `-intense` suffix and `intense` as a ground background; the declared contrast pairs cover the foreground on each new fill.

## Secondary, accent and info roles (2026-11-01)

Polar-night, the cool counterpoint to the coral primary, now carries three roles with separate jobs. They resolve to the same hue today and can be recolored independently, which is the point of keeping them apart. Primary stays the action and brand color.

- **`info`** (5 tokens): `background.info` (polar-night 400), `-emphasis` (500, hover) and `-intense` (600, pressed), `foreground.info` (`gray.50`, 5.84:1 on the fill) and `border.info` (300, 4.05:1 on the Light page). With the existing `info-muted` tint this completes the role. Alert and Toast gain an `info` variant: the alert is the tint with the info border, the toast is the solid fill, as for success. Both announce politely.
- **Info badge (2026-11-02):** the badge gained an `info` variant, bound like success: fill `background.info`, hover `-emphasis`, pressed `-intense`, label `foreground.info`. It is the first consumer of `info-emphasis` and `info-intense`. It was identical to the Secondary badge, so the Secondary badge went neutral (see "Badge refinement").
- **Toast controls on a solid fill (2026-11-02):** the action button and close button on a solid toast hovered to the neutral `background.muted` (`background.emphasis` in Dark) and the close icon used the neutral muted text. Measured against the fill: white text on a hovered danger, success or info action was 1.21:1 in Light, dark text on a hovered warning action 1.09:1 in Dark, and the close icon was 2.05 to 3.40:1 on most fills. Each solid variant now has its own control tokens: `toast.<variant>.control-background-hover` is the role's `-emphasis`, `toast.<variant>.control-background-active` its `-intense`, and `toast.<variant>.close-icon` the same `foreground.<role>` as the text (4.55:1 or better on the fill, 5.38:1 or better on hover and pressed). The default toast keeps the neutral tokens. The Toast root exposes `data-variant`; the buttons pick their tones through `group-data-[variant=…]`. This is the second consumer of `info-emphasis` and `info-intense`, and the first of `danger-emphasis` and `-intense` outside the button and of `success` and `warning` outside the badge.
- **Badge refinement (2026-11-02):** three changes, decided with the owner. (1) Secondary and Info were the same polar-night fill, so the **Secondary badge went neutral**: fill `background.emphasis`, hover and pressed `background.intense`, text `foreground.default`. The neutral ground has no tone past `intense`, so hover and pressed share it for this one variant. Info stays the only polar-night badge. The Secondary button stays polar-night, so the badge and the button no longer match. (2) The **Destructive badge is a solid fill** like the others: `background.danger`, hover `-emphasis`, pressed `-intense`, text `foreground.danger`. This also gives it the hover and pressed it never had. (3) **Badge text is set in the mono font**, bound straight to the primitive `--typography-font-family-mono` (the documented font-family exception; the Tailwind theme alias for the mono family is not emitted, so a rule using it silently falls back to the inherited font). JetBrains Mono 600 is now loaded in Storybook.
- **`secondary`** (4 tokens): `background.secondary` (400), `-emphasis` (500) and `-intense` (600), and `foreground.secondary` (`gray.50`). The Secondary button moves to it from the neutral ground, so the role and the variant are the same thing; the Secondary badge returned to the neutral ground on 2026-11-02 (see "Badge refinement"). Both fills are solid; the polar-night chroma (0.04) is far below coral's (0.17), so the secondary reads as secondary.
- **`accent`** (2 tokens): `background.accent` (polar-night 400) and `foreground.accent` (`gray.50`), the same in both modes. It is the fill of selected and on-state controls: checkbox, radio and switch, slider range, progress, selected tab and page, calendar day and pressed toggle (12 background and 5 foreground component tokens). A control needs 3:1 against the page and a readable mark: 5.84:1 for the mark, and 5.84:1 against the Light page and 3.33:1 against the Dark page. Controls reuse the fill for their border, as primary does.
- **Primary stays coral** where it is the brand or the action: the primary button and badge, the feature icon, the hero gradient and the card and feature-grid hover borders.
- **Tooltip:** `background.inverse` is polar-night 950 in Light and 50 in Dark, and `foreground.inverse` is sandcastle 50 and black-bear 900 (17.8:1 and 15.2:1). The tooltip is its only consumer.
- **Focus ring:** stays neutral. A polar-night ring passes against the surfaces (8 to 11:1) but would rely on the halo gap against a coral fill, where it is 1.65:1 in Dark.
- **Rejected:** polar-night 500 as an info or secondary fill in Dark (1.88:1 against the page).
- **Guards:** `check-token-structure.mjs` allows `secondary` and `accent` as roles; the declared pairs cover each new foreground and fill, the info border, the accent fill on the page, muted and raised surfaces, and the info alert and toast text.

## Light text on darker fills (2026-11-01)

The first pass chose dark text on mid-tone fills (`gray.950` on coral 600 and polar-night 300) because it scored best on WCAG 2 contrast: 4.83:1 and 4.74:1. It read weakly. WCAG 2's formula overrates dark text on mid-tone saturated fills; APCA, the perceptual model proposed for WCAG 3, scores those pairs at Lc 37 and 35, below the large-text minimum, against Lc 71 for white on the same fills. White on coral 600 is 3.98:1 and fails AA, so the fill moved one step darker instead.

- **Primary:** `background.primary` is coral 700 (6.02:1, Lc 83) with `foreground.primary` `gray.50`. Hover is coral 800 (8.50:1) and pressed coral 900 (11.26:1). Coral 700 (`#a54222`) is a darker step of the same coral, close to the logo's own darker shade (`#b74f2c`) but not identical; coral 600 stays the brand step for `border.primary` and as the Light page-text tint source.
- **Secondary and info:** polar-night 400 (5.84:1, Lc 83) with `gray.50`, hover 500 (10.36:1), pressed 600 (11.28:1).
- **Accent:** polar-night 400 with `gray.50` in both modes. The Dark mode check keeps it above 3:1 against the page, muted and raised surfaces (3.33:1 on the page).
- **One value in both modes:** per-mode values stay available and are used where a reason exists (the text scale, the tints, the accent mark before this change). Here there is none: coral 700 is the lightest coral step that holds white at AA, a lighter Dark step would force dark text and cost about 28 points of APCA, and one rule is easier for consumers: white text on every solid fill, and hover and pressed always go darker.
- **The exception is warning:** yellow 300 is a light fill, so it keeps dark text (10.78:1, Lc 70).
- **Showcase mocks follow the real components:** the hand-built previews of progress, switch, checkbox, radio, slider, calendar day, active tab and the selected carousel thumbnail use `background.accent` and `foreground.accent`; the input and textarea focus mocks use `focus.ring` and `focus.halo`; the hover-card link uses `foreground.link`. Buttons, the default badge, glows and tints stay on primary.

## What exists today

`pnpm check:contrast` reads `scripts/contrast-pairs.json` (158 declared foregrounds, 516 checks across Light and Dark) and fails on any new failure. It currently reports no known failures; any added later must be listed with a reason and removed when fixed. It is part of the Lint workflow. See [token-pipeline.md](token-pipeline.md).

## Case study

The primary color change was run through Figma and pushed to code to show the whole flow end to end. The write-up is a draft at [`documentation/case-studies/primary-color-change/`](../case-studies/primary-color-change/README.md), with before and after evidence next to it.
