# Component token grammar and the binding rule

**Status:** Rule and exceptions decided with the owner on 2026-10-21 and 2026-10-23 (Plan 193). The binding check is enforced; the structure check for this layer is partly pending (see "Open renames").

## The rule

A component binds only to component tokens. In `packages/ui/src`, including the compositions (`site-header`, `site-footer`, `section-hero`, `section-features`, `page-layout`), every `--color-*` reference must be a colour token from the components collection. The same holds for components in Figma: their fills, strokes and text bind to variables in the components collection.

The three tiers stay intact: primitives hold raw values, semantic tokens hold meaning (`color.background.success-muted`), component tokens hold decisions for one part of one component and alias a semantic tone. A component token for colour never aliases a primitive directly.

`pnpm check:tokens` runs `scripts/check-component-binding.mjs`, which fails on any other `--color-*` reference and names the file and line. The Lint workflow runs it.

## The two documented exceptions

Each exception is an entry with a reason in the allowlist of `scripts/check-component-binding.mjs`.

1. **The focus ring colour.** Components use the one centralized semantic token `color.border.focus` directly (`focus:ring-(--color-border-focus)`). The ring is a single accessibility indicator that must look the same everywhere, so there is no per-component focus colour token. The ring width and offset are still component tokens where a component defines them (`checkbox.focus-ring.width`).
2. **Font family.** Text may bind the primitive `typography/font-family/sans` (and serif and mono) directly. It is the only non-colour exception.

Everything else, including a composition, needs a component token.

## Naming grammar

`<component>.<part>.<property>[-state]`

- **Component**: the component or composition (`button`, `site-header`).
- **Part** (optional): a part or a variant (`trigger`, `nav-link`, `primary`, `gradient`). A variant such as a button's `primary` is a part.
- **Property**: `background`, `text`, `border`, `radius`, `width`, `padding-x`, and so on.
- **State or variant suffix** (optional, at most one, last): `-hover`, `-active`, `-focus`, `-disabled`, `-checked`, `-unchecked`, `-pressed`, `-muted`.

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

## Open renames

Tokens that still write a state as a path level (`input.disabled.background`, `input.disabled.text`, `checkbox.checked.background`, `checkbox.checked.text`, `checkbox.checked.border`) and the components that hold a single token in their group change the CSS variable name, so they wait for the owner's approval. Until they are renamed the structure check for this layer is not enforced.

## Related

- [naming-convention.md](naming-convention.md): the semantic names and how to use them.
- [semantic-pairing-model.md](semantic-pairing-model.md): why semantic tokens pair a foreground with a background.
