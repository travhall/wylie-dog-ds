# Focus states

How keyboard focus is drawn, how it is expressed as tokens, and why. Decided with the owner on 2026-10-24 (Plan 197).

## The indicator

A two-tone outline with a halo:

```
page or surface
  halo       color.focus.halo   fills the gap and extends focus.halo-width past the outline
  outline    color.focus.ring   focus.width thick, focus.offset away from the control
  gap        halo colour
control
```

In CSS this is a real `outline` (`outline-offset` gives the gap) plus a `box-shadow` for the halo. The classes live in one place, `packages/ui/src/lib/utils.ts`:

- `focusRingClasses`: the indicator drawn outside the control. Used by every control that has room around it.
- `focusRingInsetClasses`: the same indicator drawn inside the control, for items that a menu, select or command list clips (menu items, select items, the command input).

It shows for keyboard focus only (`focus-visible`), so a mouse click does not draw it.

## Tokens

| Figma variable (Semantic) | CSS variable               | Value in Light and Dark                               |
| ------------------------- | -------------------------- | ----------------------------------------------------- |
| `color/focus/ring`        | `--color-focus-ring`       | gray.900 in Light, gray.100 in Dark (foreground tone) |
| `color/focus/halo`        | `--color-focus-halo`       | gray.50 in Light, gray.950 in Dark (page tone)        |
| `focus/width`             | `--space-focus-width`      | border-width.2 (2px)                                  |
| `focus/offset`            | `--space-focus-offset`     | border-width.2 (2px)                                  |
| `focus/halo-width`        | `--space-focus-halo-width` | border-width.2 (2px)                                  |

Checkbox, switch, radio, slider and the resizable handle also define `*.focus-ring.width` and `*.focus-ring.offset` component tokens (for example `--space-checkbox-focus-ring-width`). They alias `focus.width` and `focus.offset`, so an adopter can change one control without touching the rest.

An adopter overrides the indicator at the primitive level (the gray ramp), the semantic level (the five tokens above) or, for width and offset, the component level.

### The exception

Components bind to component tokens, with one documented exception: they use `--color-focus-ring` and `--color-focus-halo` directly. The indicator has to look the same everywhere, so it has no per-component colour token. The exception is listed in `scripts/check-component-binding.mjs`.

## Why a foreground and page tone

The first indicator was a blue.500 box-shadow ring. Measured on the default Button:

- ring against the blue.600 fill: 1.41:1 (needs 3:1)
- the ring sat directly on the fill, because `ring-offset-(--space-focus-ring-offset)` had no `length:` type hint, so Tailwind v4 read the width token as a colour and the offset width stayed 0px
- in forced-colors mode no indicator was drawn (box-shadow is removed and `outline-none` left nothing)

A foreground-tone outline flanked by a page-tone halo reaches 17:1 against the halo in both modes, so the 3:1 requirement for non-text contrast (WCAG 2.2, 1.4.11) is met on any surface the control sits on without a per-surface token. Measured against the primary fill: 3.44:1 in Light, 4.49:1 in Dark. The outline is a real outline, so forced-colors mode draws it in the system colour.

## The three meanings of "focus"

Before this change "focus" named three different things. Now each has its own name.

| Meaning                                                    | Name                                                                                                                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The keyboard indicator                                     | `color.focus.ring`, `color.focus.halo`, `focus.*`                                                                                                           |
| A menu-like item that is highlighted (keyboard or pointer) | `*-highlighted` (`menubar.item-highlighted`, `select.item.background-highlighted`, `navigation.highlighted`, `site-header.nav-link.background-highlighted`) |
| An input border colour on focus                            | removed; the input uses the indicator                                                                                                                       |

The standalone focus fills (accordion trigger, the six badge variants, card) were removed. The indicator is their keyboard cue, and the fills were inconsistent with hover (the destructive badge turned blue on focus).

A highlighted item changes its surface by only 1.12:1 in Light and 1.4:1 in Dark against what it sits on, which is not a 3:1 cue, so menu-like items also draw the inset indicator.

## WCAG 2.2

- 2.4.7 Focus Visible (AA): every focusable element in a component story draws an outline in Light, Dark and forced-colors mode. Checked by `pnpm check:focus-visible`.
- 2.4.11 Focus Not Obscured, Minimum (AA): the indicator is outside the control and does not hide it; sticky headers and overlays are the adopter's layout to keep clear.
- 1.4.11 Non-text Contrast (AA): the ring against the halo, and against every highlighted item surface, is declared in `scripts/contrast-pairs.json` and checked by `pnpm check:contrast`.
- 2.4.13 Focus Appearance (AAA, guidance): a 2px outline with 17:1 against the adjacent halo meets the area and contrast of the criterion.

## Guarding it

- `pnpm check:focus` fails on `outline-none`, a box-shadow focus ring, `ring-offset-*`, and an un-hinted `outline-(--x)` or `ring-(--space-x)` value.
- `pnpm check:focus-visible` (after a Storybook build) tabs through the first story of every component and fails on a focused element without an outline.
- `pnpm check:contrast` fails if the ring and halo stop reaching 3:1.

## Figma

The Figma components currently have no focus state. The variables above are the ones a focus state would bind: an outside stroke bound to `color/focus/ring` at `focus/width` and a surrounding stroke or shadow bound to `color/focus/halo`.
