# Component token grammar and the binding rule

**Status:** Rule and exceptions decided with the owner on 2026-10-21 and 2026-10-23 (Plan 193). The binding check and the structure check are both enforced.

## The rule

A component binds only to component tokens. In `packages/ui/src`, including the compositions (`site-header`, `site-footer`, `section-hero`, `section-features`, `page-layout`), every variable reference, colour or not, must be a token from the components collection, with the exceptions below; the compositions also have no hardcoded scale values (see "What the check enforces"). The same holds for components in Figma: their fills, strokes and text bind to variables in the components collection.

The three tiers stay intact: primitives hold raw values, semantic tokens hold meaning (`color.background.success-muted`), component tokens hold decisions for one part of one component and alias a semantic tone. A component token for colour never aliases a primitive directly.

`pnpm check:tokens` runs `scripts/check-component-binding.mjs`, which fails on any other variable reference, and on the composition rules below, and names the file and line. The Lint workflow runs it.

## The two documented exceptions

Each exception is an entry with a reason in the allowlist of `scripts/check-component-binding.mjs`.

1. **The focus indicator colours.** Components use the two centralized semantic tokens `color.focus.ring` and `color.focus.halo` directly (through `focusRingClasses`). The indicator must look the same everywhere, so there is no per-component focus colour token. The width and offset are component tokens where a component defines them (`checkbox.focus-ring.width`); they alias `focus.width` and `focus.offset`. See `focus-states.md`.
2. **Font family.** Text may bind the primitive `typography/font-family/sans` (and serif and mono) directly. In code no component sets a font family: text inherits it from the page (`font-sans` on the body, which aliases the primitive). The exception matters in Figma, where the generated text layers bind the primitive.

Everything else, a colour or not, including a composition, needs a component token. The `--radix-*` variables are not design tokens: Radix sets them at runtime and the allowlist lets them through.

## Stories never bind to tokens

The goal is always to tokenise the Wylie Dog UI package. It is the contract between UI and design: the tokens it binds to are what adopters rely on to customise the design for themselves. Stories are not part of that contract. A story must not reference token variables; its demo is built from the UI components and plain layout classes. The exception is the Foundations pages whose subject is the tokens (`apps/storybook/stories/Foundations/Design Tokens/*`), which display token values by design. Demo chrome that must follow Light and Dark comes from the UI components only (`Card`, `Badge`), with no custom colours; the generator's story template does this. Existing stories predate the rule: 60 of 76 story files outside the token pages reference token variables (measured 2026-10-24), and retrofitting them is separate work.

## What the check enforces

`check-component-binding.mjs` covers all of `packages/ui/src` (tests excluded), the base components, the compositions and the pattern-level compositions `card-grid.tsx` and `feature-grid.tsx`.

**Every file.** A colour reference must be a component token, and so must every other variable reference: the check fails, naming the file and line, on a reference to a token that is not in the components collection (`--space-icon-size-md`, `--shadow-md`, `--z-index-modal`, `--duration-normal`, `--opacity-scrim`, `--border-radius-md`, `--line-height-none`, `--font-weight-bold`, `--font-size-lg`, `--space-200`). The allowlist holds the documented exceptions only: the focus indicator, the font family, and `--radix-*`, the measurements Radix sets at runtime (trigger and viewport sizes, swipe offsets).

**Compositions** (the `compositions/` folder, `card-grid.tsx`, `feature-grid.tsx`). A composition is a component, so the check also fails on a hardcoded Tailwind scale utility for spacing, sizing, gap, inset, typography, radius, shadow, z-index, duration, opacity or ring (`px-4`, `gap-8`, `h-16`, `max-w-4xl`, `text-lg`, `font-bold`, `rounded-md`, `z-50`). Layout keywords are not literals: `w-full`, `min-h-screen`, `top-0`, `grid-cols-*`, `order-*`, `col-span-*` carry no design decision. There is no literal exception any more: the focus ring width became a token with Plan 197.

Non-colour component tokens alias the shared scale, as colour tokens alias a semantic tone: spacing and sizes alias `space.*`, icon sizes alias the semantic `icon.size.*`, radius aliases `border-radius.*`, text aliases `typography.*`, shadow aliases `shadow.*`, z-index aliases the semantic `z-index.*`, scrim opacity aliases `opacity.scrim`, duration aliases `transition.duration.*` or `duration.*`. The resolved value is the value the component used before, with no rounding; a size with no step on the scale gets a new primitive step first (`z-index.1`, `space.*` steps). Responsive values take one token per breakpoint with a size suffix (`site-header.container.padding-x-sm`, `-md`, `-lg`, applied at the base, `sm:` and `lg:` breakpoints).

**What the check does not cover.** Tailwind utilities that carry a value without a variable in the base components (`rounded-full`, `backdrop-blur-sm`, `ease-in-out`, `transition`, `scale-105`) are not flagged; the literal check only looks at the compositions and does not include transform or filter utilities. Easing is not a token.

## Decisions for the non-colour values of the base components (Plan 198, 2026-10-24)

Decided with the owner, one at a time. Every new token aliases a shared value (semantic where one exists, otherwise a primitive) and resolves to exactly the value of the reference it replaces.

1. **Icon size.** One component token per icon part, aliasing the semantic icon scale `icon.size.xs|sm|md`. Names follow the existing structure of each component (`dialog.close-button.icon-size`, `select.trigger.icon-size`, `button.spinner.size`). A part that already has a token of the same value reuses it (the dropdown sub-menu chevron uses `dropdown-menu.item.icon-size`).
2. **Shadow.** One component token per layered part, aliasing the semantic `shadow.sm|md|lg` (`dialog.shadow`, `popover.content-shadow`). Repo-only: Figma keeps the shared effect styles (Shadow/sm, md, lg); shadows are not Figma variables and no effect style is generated per component token.
3. **z-index.** One component token per layered part, aliasing the semantic `z-index.*`, so the single scale stays in the primitives. Figma holds them as number variables (documentation and plugin round trip; they cannot be bound to a layer). The precedent is `select.content.z-index`.
4. **Scrim opacity and duration.** Scrim opacity is `<component>.overlay-opacity` aliasing `opacity.scrim`. Durations alias the semantic `transition.duration.*` where one exists and the primitive `duration.300|500` otherwise. Easing is not a token; the Tailwind keyword `ease-in-out` stays.
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

## Disabled states use colour

A disabled control changes colour; it does not fade. Opacity tokens for disabled states were removed. The tones are the same everywhere, so a disabled control looks consistent across the system:

| Part       | Aliases                                                                |
| ---------- | ---------------------------------------------------------------------- |
| Text, icon | `color.foreground.faint`                                               |
| Background | `color.background.muted` in Light, `color.background.emphasis` in Dark |
| Border     | `color.border.muted`                                                   |

Each component defines the parts it has (`button.primary.background-disabled`, `button.primary.text-disabled`, `button.primary.border-disabled`). Disabled text is exempt from contrast under WCAG 2.2 (criterion 1.4.3), so `scripts/contrast-pairs.json` lists these tokens as exempt with that reason.

A Radix state attribute can outrank the `disabled:` variant, so classes for a disabled checked control use the stacked form, for example `data-[state=checked]:disabled:bg-(--color-checkbox-background-disabled)`.

## Unreferenced tokens

A component token exists only if code or a Figma component binds to it, or it is listed as specification-only. Specification-only tokens describe a state or part that Figma shows and the code does not use yet; they are reviewed per component before anything is deleted.

## Structure check

`scripts/check-token-structure.mjs` (run by `pnpm check:tokens`) also covers this collection: no state word as a path level, no group that holds a single variable, no variable that is also a group name. A component that would hold one token in its group joins another component's group by the grammar: the radio group gap is `radio.group-gap`, the scroll area padding is `scrollbar.padding`.

## Related

- [naming-convention.md](naming-convention.md): the semantic names and how to use them.
- [semantic-pairing-model.md](semantic-pairing-model.md): why semantic tokens pair a foreground with a background.
