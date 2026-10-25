# Component token grammar and the binding rule

**Status:** Rule and exceptions decided with the owner on 2026-10-21 and 2026-10-23 (Plan 193). The binding check and the structure check are both enforced.

## The rule

A component binds only to component tokens. In `packages/ui/src`, including the compositions (`site-header`, `site-footer`, `section-hero`, `section-features`, `page-layout`), every `--color-*` reference must be a colour token from the components collection. The same holds for components in Figma: their fills, strokes and text bind to variables in the components collection.

The three tiers stay intact: primitives hold raw values, semantic tokens hold meaning (`color.background.success-muted`), component tokens hold decisions for one part of one component and alias a semantic tone. A component token for colour never aliases a primitive directly.

`pnpm check:tokens` runs `scripts/check-component-binding.mjs`, which fails on any other `--color-*` reference and names the file and line. The Lint workflow runs it.

## The two documented exceptions

Each exception is an entry with a reason in the allowlist of `scripts/check-component-binding.mjs`.

1. **The focus indicator colours.** Components use the two centralized semantic tokens `color.focus.ring` and `color.focus.halo` directly (through `focusRingClasses`). The indicator must look the same everywhere, so there is no per-component focus colour token. The width and offset are component tokens where a component defines them (`checkbox.focus-ring.width`); they alias `focus.width` and `focus.offset`. See `focus-states.md`.
2. **Font family.** Text may bind the primitive `typography/font-family/sans` (and serif and mono) directly. In code no component sets a font family: text inherits it from the page (`font-sans` on the body, which aliases the primitive). The exception matters in Figma, where the generated text layers bind the primitive.

Everything else that is a colour, including a composition, needs a component token.

## Stories never bind to tokens

The goal is always to tokenise the Wylie Dog UI package. It is the contract between UI and design: the tokens it binds to are what adopters rely on to customise the design for themselves. Stories are not part of that contract. A story must not reference token variables; its demo is built from the UI components and plain layout classes. The exception is the Foundations pages whose subject is the tokens (`apps/storybook/stories/Foundations/Design Tokens/*`), which display token values by design. Existing stories predate this rule; see Plan 196 for the measurement and the open decision on how demo chrome is styled.

## What the check enforces, and what it does not

`check-component-binding.mjs` reads `--color-*` references only. Non-colour references are not checked, and some components bind them directly (measured 2026-10-24 in `packages/ui/src`, tests excluded):

- 90 references to semantic tokens: `--space-icon-size-*` (24), `--space-focus-offset`, `--space-focus-width` and `--space-focus-halo-width`, `--shadow-*` (19), `--z-index-*` (19), `--opacity-scrim` (3).
- 43 references to primitives: `--duration-*`, `--font-weight-*`, `--border-radius-*`, `--line-height-*`.
- Hardcoded Tailwind spacing (`px-4`, `gap-8`, `py-32`) in the compositions (`page-layout`, `site-header`, `site-footer`, `section-hero`, `section-features`). The base components have only one (`pr-0` in `table.tsx`).

Whether the binding rule should extend to these is an open owner decision.

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
