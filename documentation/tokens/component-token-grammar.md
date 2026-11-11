# Component token grammar and the binding rule

**Status:** Rule and exceptions decided with the owner on 2026-10-21 and 2026-10-23 (Plan 193). The binding check and the structure check are both enforced.

## The rule

A component binds only to component tokens. In `packages/ui/src`, including the compositions (`site-header`, `site-footer`, `section-hero`, `section-features`, `page-layout`), every variable reference, color or not, must be a token from the components collection, with the exceptions below; the compositions also have no hardcoded scale values (see "What the check enforces"). The same holds for components in Figma: their fills, strokes and text bind to variables in the components collection.

The three tiers stay intact: primitives hold raw values, semantic tokens hold meaning (`color.background.success-muted`), component tokens hold decisions for one part of one component and alias a semantic tone. A component token for color never aliases a primitive directly.

`pnpm check:tokens` runs `scripts/check-component-binding.mjs`, which fails on any other variable reference, and on the composition rules below, and names the file and line. The Lint workflow runs it. The showcase has its own guard in the same command, `scripts/check-showcase-palette.mjs`: a showcase page binds to semantic tokens and fails on a static primitive color (a palette variable, a Tailwind palette utility or a hex literal). A page that has to name a primitive derives it with `getAlias` in `apps/showcase/src/lib/token-values.ts`.

## The two documented exceptions

Each exception is an entry with a reason in the allowlist of `scripts/check-component-binding.mjs`.

1. **The focus indicator colors.** Components use the two centralized semantic tokens `color.focus.ring` and `color.focus.halo` directly (through `focusRingClasses`). The indicator must look the same everywhere, so there is no per-component focus color token. The width and offset are component tokens where a component defines them (`checkbox.focus-ring.width`); they alias `focus.width` and `focus.offset`. See `focus-states.md`.
2. **Font family.** Text may bind the primitive `typography/font-family/sans` (and serif and mono) directly. In code no component sets a font family: text inherits it from the page (`font-sans` on the body, which aliases the primitive). The exception matters in Figma, where the generated text layers bind the primitive.

Everything else, a color or not, including a composition, needs a component token. The `--radix-*` variables are not design tokens: Radix sets them at runtime and the allowlist lets them through.

## Stories never bind to tokens

The goal is always to tokenise the Wylie Dog UI package. It is the contract between UI and design: the tokens it binds to are what adopters rely on to customise the design for themselves. Stories are not part of that contract. A story must not reference token variables; its demo is built from the UI components and plain layout classes. The exception is the Foundations pages whose subject is the tokens (`apps/storybook/stories/Foundations/Design Tokens/*`), which display token values by design. Demo chrome follows Light and Dark through `currentColor` with opacity (`text-current/70`, `border-current/20`, `bg-current/5`) and palette pairs with a `dark:` variant for status color; the mechanism is documented in `apps/storybook/STORY_AUTHORING_GUIDE.md`. Plan 213 retrofitted every story: 695 token bindings in 61 of 77 story files (measured 2026-10-27) became none, and `scripts/check-story-token-bindings.mjs`, part of `pnpm check:tokens`, fails on a new one (token names in MDX code fences, comments and `summary:` strings are documentation, not bindings).

## What the check enforces

`check-component-binding.mjs` covers all of `packages/ui/src` (tests excluded), the base components, the compositions and the pattern-level compositions `card-grid.tsx` and `feature-grid.tsx`.

**Every file.** A color reference must be a component token, and so must every other variable reference: the check fails, naming the file and line, on a reference to a token that is not in the components collection (`--space-icon-size-md`, `--shadow-md`, `--layer-modal`, `--duration-normal`, `--opacity-90`, `--border-radius-md`, `--line-height-none`, `--font-weight-bold`, `--font-size-lg`, `--space-200`). The allowlist holds the documented exceptions only: the focus indicator, the font family, and `--radix-*`, the measurements Radix sets at runtime (trigger and viewport sizes, swipe offsets).

**Compositions** (the `compositions/` folder, `card-grid.tsx`, `feature-grid.tsx`). A composition is a component, so the check also fails on a hardcoded Tailwind scale utility for spacing, sizing, gap, inset, typography, radius, shadow, z-index, duration, opacity or ring (`px-4`, `gap-8`, `h-16`, `max-w-4xl`, `text-lg`, `font-bold`, `rounded-md`, `z-50`). Layout keywords are not literals: `w-full`, `min-h-screen`, `top-0`, `grid-cols-*`, `order-*`, `col-span-*` carry no design decision. There is no literal exception any more: the focus ring width became a token with Plan 197.

Non-color component tokens alias the shared scale, as color tokens alias a semantic tone: spacing and sizes alias `space.*`, icon sizes alias the semantic `icon.size.*` (every glyph or indicator size, Plan 222), heading titles alias the semantic `typography.font-size.heading.*`, hover scales alias `transition.scale.hover` and `transition.scale.hover-strong`, radius aliases `border-radius.*`, text aliases `typography.*`, shadow aliases `shadow.*`, z-index aliases the semantic `z-index.*`, scrim opacity aliases the primitive `opacity.90`, duration aliases `transition.duration.*` or `duration.*`. The resolved value is the value the component used before, with no rounding; a size with no step on the scale gets a new primitive step first (`z-index.1`, `space.*` steps). Responsive values take one token per breakpoint with a size suffix (`site-header.container.padding-x-sm`, `-md`, `-lg`, applied at the base, `sm:` and `lg:` breakpoints).

**What the check does not cover.** Tailwind utilities that carry a value without a variable in the base components (`rounded-full`, `backdrop-blur-sm`, `ease-in-out`, `transition`, `scale-105`) are not flagged; the literal check only looks at the compositions and does not include transform or filter utilities. Easing is not a token.

## Decisions for the non-color values of the base components (Plan 198, 2026-10-24)

Decided with the owner, one at a time. Every new token aliases a shared value (semantic where one exists, otherwise a primitive) and resolves to exactly the value of the reference it replaces.

1. **Icon size.** One component token per icon part, aliasing the semantic icon scale `icon.size.xs|sm|md`. Names follow the existing structure of each component (`dialog.close-button.icon-size`, `select.trigger.icon-size`, `button.spinner.size`). A part that already has a token of the same value reuses it (the dropdown sub-menu chevron uses `dropdown-menu.item.icon-size`).
2. **Shadow.** One component token per layered part, aliasing the semantic `shadow.sm|md|lg` (`dialog.shadow`, `popover.content-shadow`). Repo-only: Figma keeps the shared effect styles (Shadow/sm, md, lg); shadows are not Figma variables and no effect style is generated per component token.
3. **z-index.** One component token per layered part, aliasing the semantic `layer.*` (the stacking roles; Plan 220, 2026-11-09), so the single `z-index.*` scale stays in the primitives. A part that stacks above its siblings inside one component uses `layer.local` (Plan 222, 2026-11-09), never the primitive. Page chrome that must sit above the sticky header, such as the skip link, uses `layer.fixed`, and a resize handle lifting its grip above its own line uses `layer.local`, not a dropdown or modal layer. `layer.base` (0) is the scale's reserved zero point: no component needs an explicit base layer today. Figma holds them as number variables (documentation and plugin round trip; they cannot be bound to a layer). The precedent is `select.content.z-index`.
4. **Scrim opacity and duration.** Scrim opacity is `<component>.overlay-opacity` aliasing the primitive `opacity.90`. There is no semantic opacity tier: interaction states are color tokens, and a single semantic scrim token had no siblings (Plan 219, 2026-11-09). Durations and easing curves alias the semantic `transition.duration.*` and `transition.easing.*` roles, which in turn alias the raw values in the primitive layer (`duration.*` steps and `easing.in|out|in-out|linear` curves; Plan 221, 2026-11-09). Raw motion values live only in the primitive layer; the semantic layer holds the roles.
5. **Leftovers.** Line height, radius and border width get per-part tokens aliasing the primitive the code used (`dialog.title-line-height`, `button.spinner.radius`, `button.spinner.border-width`). The webkit spin-button reset `opacity-100` is `input.spin-button-opacity`. The navigation menu indicator used `z-1`, for which no step existed, so the primitive `z-index.1` was added. Font weight had no direct references left.
6. **Pattern-level compositions.** `card-grid.tsx` and `feature-grid.tsx` at the package root are compositions: the literal check applies to them as well.

## Unbound in the generated Figma components (by design)

The component generator leaves these unbound because no component token exists and the real component does not set the value:

- Placeholder content: Carousel slide fill and text, Collapsible header and body text, Feature Grid icon frames.
- Glyph corner radii (1 to 2px) on the checkmark, dash and chevron frames, and the Skeleton avatar.
- Font size of body text the real components inherit (Popover, Hover Card, Dialog body, footer buttons).
- Literal auto-layout gaps and wrapper-frame padding the builder chooses itself (for example Button and Alert gaps).

## Naming grammar

`<component>.<part>.<property>[-state]`

- **Component**: the component or composition (`button`, `site-header`).
- **Part** (optional): a part or a variant (`trigger`, `nav-link`, `primary`, `gradient`). A variant such as a button's `primary` is a part.
- **Property**: `background`, `text`, `border`, `radius`, `width`, `padding-x`, and so on.
- **State or variant suffix** (optional, at most one, last): `-hover`, `-active`, `-highlighted`, `-disabled`, `-checked`, `-unchecked`, `-pressed`, `-muted`.

Structure rules, which keep the Figma variable tree flat and legible (the plugin turns each dot into a Figma group):

- A state is never a path level. Write `checkbox.background-checked`, not `checkbox.checked.background`.
- No group holds a single variable. Join the name with a hyphen instead (`button.link-text`, not `button.link.text`).
- No variable has the same name as a group. If `radio.border` is a variable, the radius is `radio.border-radius`.
- A rename that only turns a dot into a hyphen keeps the CSS variable identical, so prefer those.

The focus ring parts follow the same shape: `checkbox.focus-ring.width` and `checkbox.focus-ring.offset`.

## Disabled states dim

A disabled control keeps its normal colours and dims. Each component that can be disabled has one number token, `<component>.<part>.opacity-disabled` (for example `button.opacity-disabled`, `tabs.trigger.opacity-disabled`), that aliases a primitive opacity (`{opacity.60}`). The class is `disabled:opacity-(--button-opacity-disabled)`, or the matching `data-disabled:`, `aria-disabled:` or `peer-disabled:` form where a Radix attribute or a sibling control drives the state. Because the control keeps its own colours, a disabled Primary is still recognisably the Primary button, only switched off, and one value re-tunes every control.

- There are no disabled colour tokens (`*-disabled` colours) and no `disabled:` colour classes. `scripts/check-disabled-states.mjs` (part of `check:tokens`) fails if either comes back.
- Opacity is a separate number token, never an alpha channel on a colour token. Opacity tokens are hidden from Figma because a bound opacity variable is read as a percent, so the builder sets the node opacity to the resolved value.
- Dim the element that is disabled, not a wrapper, and never both a parent and a child (a disabled card holding a disabled button would compound). A menu item or label dims only itself.
- A component can pick its own value when its resting look needs it: `calendar.nav-opacity-disabled` is 30% because the resting navigation button is already 50%.
- A loading Button is disabled (not clickable) and takes the same dimmed look, with the spinner shown.
- Disabled controls are exempt from contrast under WCAG 2.2 (criterion 1.4.3); 60% keeps them readable by choice, not by rule.
- Cursor: enabled buttons and `role="button"` show the pointer and disabled ones `not-allowed` (one base rule in `packages/ui/src/styles/index.css`). A disabled control must not switch pointer events off, or its cursor cannot show; scope hover and press styles to `not-disabled:` instead. Menu items keep the arrow and text inputs the text cursor.

This replaces the earlier rule that a disabled control changes colour and does not fade (Plan 188, 2026-10-23). The owner changed it on 2026-11-10 because the muted tones looked like another variant of the control (see Plan 223).

## Control sizes line up

Single-line controls share one size scale so a button, toggle, input and select of the same size sit level in a row (owner decision, 2026-11-11). Button is the baseline, and no control sets a fixed height: the box model does.

| Size | Font | Padding-y | Button / Toggle (line height 100%) | Input / Select (line height 150%) |
| ---- | ---- | --------- | ---------------------------------- | --------------------------------- |
| sm   | 14   | 8 / 4     | 32                                 | 31                                |
| md   | 16   | 12 / 8    | 42                                 | 42                                |
| lg   | 18   | 16 / 12   | 52                                 | 53                                |

Height is 2 x padding-y + font size x line height + 2 x 1px border. Toggle (and a toggle group item) use the Button tokens' values and a transparent border when not outlined. A native input never goes below its font's normal line height (measured in Chromium: line-height 100% gave 37, 48 and 58), so Input, Select and Textarea keep 150% and trim the padding; md is exact and sm and lg land a pixel off because 4.5px and 11.5px are not on the spacing scale. Select and Textarea take their padding and font size from the input's for the same size, and a select chevron stays under the line height. `scripts/__tests__/control-heights.test.mjs` computes these heights from the tokens and fails when they drift.

## Unreferenced tokens

A component token exists only if code or a Figma component binds to it, or it is listed as specification-only. Specification-only tokens describe a state or part that Figma shows and the code does not use yet; they are reviewed per component before anything is deleted.

## Structure check

`scripts/check-token-structure.mjs` (run by `pnpm check:tokens`) also covers this collection: no state word as a path level, no group that holds a single variable, no variable that is also a group name. A component that would hold one token in its group joins another component's group by the grammar: the radio group gap is `radio.group-gap`, the scroll area padding is `scrollbar.padding`.

## Related

- [naming-convention.md](naming-convention.md): the semantic names and how to use them.
- [semantic-pairing-model.md](semantic-pairing-model.md): why semantic tokens pair a foreground with a background.
