# Token Naming Convention Guide

**Standard Pattern:** `bg-(--color-background-default)` - Keep `color-` prefix for clarity and standards compliance

This guide establishes the naming convention for using design tokens in Wylie Dog components, based on industry best practices and Tailwind CSS 4 patterns.

## Core Principles

1. **Category Clarity:** The `color-` prefix distinguishes color tokens from spacing, typography, and other categories
2. **Modern Syntax:** Use Tailwind CSS 4 arbitrary values: `bg-(--custom-property)`
3. **Semantic Naming:** Prefer semantic tokens (`--color-background-default`) over primitives (`--color-gray-50`)
4. **Standards Compliance:** Align with [Tailwind CSS 4](https://tailwindcss.com/docs/theme), [design token best practices](https://www.smashingmagazine.com/2024/05/naming-best-practices/), and [industry standards](https://primer.style/foundations/primitives/token-names/)

## Semantic colour grammar

Names are `color.<part>.<token>` with the part `background`, `foreground` or `border`; there are never more than three segments.

- **Ground tokens:** `color.background.{default, muted, emphasis, raised, overlay, inverse}`, `color.foreground.{default, muted, faint, inverse}` and `color.border.{default, muted, emphasis, focus}`.
- **Roles** (`primary`, `danger`, `success`, `warning`, `info`) put the role in the token name, with an optional modifier: `color.background.success` (the solid fill), `color.background.success-muted` (the tint), `color.background.success-emphasis` (the stronger tone of the fill), `color.foreground.success` (text over the fill), `color.foreground.success-muted` (text over the tint, and the role colour on the page) and `color.border.success`. `info` has only the muted tint and its text.
- **Modifiers have one meaning each:** `muted` is the quieter tone, `emphasis` the stronger one. `faint` exists only for ground text.
- **Pairs:** `foreground.X` is the text over `background.X`, for every X. `pnpm check:contrast` checks the declared pairs.
- **No states in semantic names.** Hover, active, focus and disabled belong to the component layer: a component token references a semantic tone.
- **The focus ring** is the centralized `color.border.focus`.

The reasoning and the old-to-new history are in [semantic-pairing-model.md](semantic-pairing-model.md).

## Why Keep the `color-` Prefix?

After research and evaluation, the `color-` prefix is the correct choice because:

**1. Industry Standard**

- [Tailwind CSS 4 @theme directive](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06) uses category prefixes
- [GitHub's Primer](https://primer.style/foundations/primitives/token-names/) uses namespace-category-concept pattern
- [Nord Design System](https://nordhealth.design/naming/) uses role-based prefixes such as "accent"

**2. Prevents Naming Collisions**

```css
/* Without prefix - ambiguous */
--background-primary: ...; /* Is this a color? A gradient? A pattern? */

/* With prefix - explicit */
--color-background-default: oklch(...); /* Clearly a color value */
```

**3. Category Organization**
Your token system has multiple categories:

- `--color-*` (colors)
- `--space-*` (spacing)
- `--font-size-*`, `--font-weight-*`, `--line-height-*` (typography)
- `--border-radius-*` (border radius)

The prefix maintains clear boundaries between categories.

**4. Future-Proof**
When you add new token types (shadows, transitions, etc.), the category prefix pattern scales naturally.

## Naming Pattern Evolution

### ❌ Legacy (Deprecated)

```tsx
// Legacy (deprecated)
className = "bg-[var(--color-button-primary-background)]";
```

**Issues with legacy syntax:**

- Verbose `var()` wrapper required
- Long bracket syntax `[...]`
- Difficult to read

### ✅ Modern Standard (Current Target)

```tsx
className = "bg-(--color-background-default)";
```

**Benefits:**

- Clean Tailwind CSS 4 arbitrary value syntax
- Standard `--color-` prefix for clarity
- Explicit category indication
- Industry-standard naming

## Token Hierarchy

Your system follows **property-based organization** (not role-based):

```
┌─────────────────────────────────────────────────┐
│  PRIMITIVE TOKENS (Foundation)                  │
│  --color-gray-50, --color-blue-500, etc.       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  SEMANTIC TOKENS (Context & Purpose)            │
│  --color-background-default                     │
│  --color-foreground-muted                         │
│  --color-border-focus                           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  COMPONENT TOKENS (Component-Specific)          │
│  --color-button-primary-background              │
│  --color-dialog-overlay                         │
│  --color-badge-success-text                     │
└─────────────────────────────────────────────────┘
```

## Token Categories

### Semantic Tokens (for application code)

Use semantic tokens in application code, pages and stories. They say what a colour means and adapt to light and dark mode automatically. Components in `packages/ui` do not use them directly: a component binds only to its own component tokens (see Component Tokens below).

**Background:**

```tsx
// Default background (the page: white in light mode, dark in dark mode)
className = "bg-(--color-background-default)";

// Muted background (a quiet surface)
className = "bg-(--color-background-muted)";

// Emphasis background (a stronger surface)
className = "bg-(--color-background-emphasis)";

// Inverse background (dark in light mode, light in dark mode)
className = "bg-(--color-background-inverse)";
```

**Text:**

```tsx
// Default text (highest contrast, body text)
className = "text-(--color-foreground-default)";

// Muted text (medium contrast, labels, captions)
className = "text-(--color-foreground-muted)";

// Faint text (lowest contrast, placeholders)
className = "text-(--color-foreground-faint)";

// Danger/error text
className = "text-(--color-foreground-danger-muted)";

// Success text
className = "text-(--color-foreground-success-muted)";

// Inverse text (for dark backgrounds)
className = "text-(--color-foreground-inverse)";
```

**Border:**

```tsx
// Default border (default border color)
className = "border-(--color-border-default)";

// Muted border (quieter)
className = "border-(--color-border-muted)";

// Focus border (for focus states)
className = "border-(--color-border-focus)";

// Danger border (for error states)
className = "border-(--color-border-danger)";
```

**Interactive (application code):**

```tsx
// Primary fill (buttons and primary actions)
className = "bg-(--color-background-primary)";

// Its stronger tone, for hover and pressed styling
className = "hover:bg-(--color-background-primary-emphasis)";

// A quiet surface under hover on the page background
className = "hover:bg-(--color-background-muted)";
```

Hover, active, focus and disabled are not semantic tokens. In a component they come from a component token; in application code you pick the tone.

### Component Tokens (the only tokens a component uses)

A component binds only to component tokens. Each one encapsulates a design decision (a colour, a spacing, a state) for one part of one component and references a semantic tone. The two exceptions (the focus ring colour and font family), the component naming grammar and the disabled-state model are in [component-token-grammar.md](component-token-grammar.md); `pnpm check:tokens` enforces the rule.

**Dialog:**

```tsx
// Dialog-specific overlay (component token)
className = "bg-(--color-dialog-overlay)";
```

**Button (Future - not yet implemented):**

```tsx
// Primary button
className =
  "bg-(--color-button-primary-background) text-(--color-button-primary-text)";

// With hover state
className = "hover:bg-(--color-button-primary-background-hover)";
```

**Badge (Future - not yet implemented):**

```tsx
// Success badge
className =
  "bg-(--color-badge-success-background) text-(--color-badge-success-text)";
```

### Primitive Tokens (Avoid Direct Use)

Primitive tokens should rarely be used directly in components. They're foundations for semantic and component tokens.

**Only use primitives when:**

- No semantic or component token exists
- You need a specific shade for a unique case
- You're defining new semantic/component tokens in Figma

```tsx
// Rare cases only - prefer semantic tokens
className = "bg-(--color-gray-50)";
```

## Common Patterns

### States

**Hover States:**

```tsx
className="
  bg-(--color-background-default)
  hover:bg-(--color-background-muted)
"
```

**Focus States:**

```tsx
className="
  border-(--color-border-default)
  focus:border-(--color-border-focus)
  focus:ring-(--color-border-focus)
"
```

**Active (pressed) states:**

```tsx
// Application code picks the stronger tone; a component uses its own pressed token
className="
  bg-(--color-background-primary)
  active:bg-(--color-background-primary-emphasis)
"
```

**Data States (Radix UI):**

```tsx
className="
  data-[state=checked]:bg-(--color-background-primary)
  data-[state=active]:text-(--color-foreground-default)
"
```

**Disabled States:**

```tsx
className="
  text-(--color-foreground-faint)
  cursor-not-allowed
"
```

### Variants

**Destructive Variant:**

```tsx
// Using semantic tokens
className="
  bg-(--color-background-danger)
  text-(--color-foreground-danger-muted)
  border-(--color-border-danger)
"

// Future: Using component tokens
className="
  bg-(--color-button-destructive-background)
  text-(--color-button-destructive-text)
"
```

**Success Variant:**

```tsx
className="
  text-(--color-foreground-success-muted)
  border-(--color-border-success)
"
```

**Warning Variant:**

```tsx
className="
  text-(--color-foreground-warning-muted)
  border-(--color-border-warning)
"
```

### Complex Components

**Card with Multiple Tokens:**

```tsx
<div
  className="
  bg-(--color-background-default)
  border-(--color-border-default)
  rounded-lg
  p-4
"
>
  <h3 className="text-(--color-foreground-default) font-semibold">Title</h3>
  <p className="text-(--color-foreground-muted) text-sm">Description text</p>
</div>
```

**Interactive List Item:**

```tsx
<li
  className="
  bg-(--color-background-default)
  hover:bg-(--color-background-muted)
  focus:bg-(--color-background-muted)
  border-(--color-border-default)
  focus:border-(--color-border-focus)
  text-(--color-foreground-default)
  transition-colors
"
>
  List Item
</li>
```

## CSS Custom Properties

When you need to use tokens outside of Tailwind utilities:

**React Inline Styles:**

```tsx
<div
  style={{
    backgroundColor: "var(--color-background-default)",
    color: "var(--color-foreground-default)",
    borderColor: "var(--color-border-default)",
  }}
>
  Content
</div>
```

**CSS Files:**

```css
.custom-component {
  background-color: var(--color-background-default);
  color: var(--color-foreground-default);
  border-color: var(--color-border-default);
}

.custom-component:hover {
  background-color: var(--color-background-muted);
}

.custom-component:focus {
  border-color: var(--color-border-focus);
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

## JavaScript Access

When you need to access token values in JavaScript, use the hierarchical module for primitive colour scales:

```tsx
import { color } from "@wyliedog/tokens/hierarchical";

const blue = color.blue[600]; // "oklch(...)"
```

Semantic colours are CSS variables only. Use `var(--color-foreground-default)` (or the Tailwind class) rather than reading a semantic value in JavaScript; the variable follows the active mode, a JavaScript constant does not.

## Migration Strategy

### Migrating from Legacy Pattern

**Before (Legacy - deprecated):**

```tsx
className = "bg-[var(--color-button-primary-background)]";
```

**After (Modern standard):**

```tsx
className = "bg-(--color-button-primary-background)";
```

### Steps:

1. **Find:** Search for `bg-[var(--color-` patterns
2. **Replace:** Convert to `bg-(--color-` syntax
3. **Test:** Verify colors apply correctly
4. **Validate:** Run `pnpm --filter @wyliedog/tokens report:usage` to track progress

## Token Selection Decision Tree

```
┌─────────────────────────────────────┐
│   Need to style a component?        │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Component token      │ ◄─── FIRST CHOICE
    │ exists?              │      (e.g., --color-dialog-overlay)
    └──┬───────────────┬───┘
       │ Yes           │ No
       ▼               ▼
    ┌─────┐    ┌──────────────────────┐
    │ USE │    │ Semantic token       │ ◄─── SECOND CHOICE
    └─────┘    │ exists?              │      (e.g., --color-background-default)
               └──┬───────────────┬───┘
                  │ Yes           │ No
                  ▼               ▼
               ┌─────┐    ┌──────────────────────┐
               │ USE │    │ Create missing token │ ◄─── LAST RESORT
               └─────┘    │ or use primitive     │      Document gap
                          │ temporarily          │      (e.g., --color-gray-50)
                          └──────────────────────┘
```

## Example from a Component

### Dropdown Menu

The real component binds only to its own component tokens (colour, spacing and state):

```tsx
<DropdownMenuContent
  className="
  bg-(--color-dropdown-menu-content-background)
  border-(--color-dropdown-menu-content-border)
  text-(--color-dropdown-menu-content-text)
"
>
  <DropdownMenuItem
    className="
    focus:bg-(--color-dropdown-menu-item-background-hover)
    focus:text-(--color-dropdown-menu-item-text-hover)
  "
  />

  <DropdownMenuSeparator className="bg-(--color-dropdown-menu-separator-background)" />
</DropdownMenuContent>
```

**Why this works:**

- Every colour is a component token, so a theme or a Figma change reaches the component through one tier
- The hover state is its own component token that references a semantic tone
- Spacing and radius are component tokens too

## Validation

After updating components, validate your changes:

```bash
# Check token usage patterns
pnpm --filter @wyliedog/tokens report:usage

# Validate token structure
pnpm --filter @wyliedog/tokens test:tokens

# Build and verify
pnpm --filter @wyliedog/tokens build
```

**Success Criteria:**

- All `bg-[var(--*)]` legacy patterns migrated
- All tokens use `--color-` prefix where appropriate
- Components bind only to component tokens
- Zero undefined CSS variables in browser

## Quick Reference Card

| Use Case               | Pattern                                             | Example                                                |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| **Background**         | `bg-(--color-background-{level})`                   | `bg-(--color-background-default)`                      |
| **Text**               | `text-(--color-foreground-{level})`                 | `text-(--color-foreground-muted)`                      |
| **Border**             | `border-(--color-border-{purpose})`                 | `border-(--color-border-focus)`                        |
| **Role fill**          | `bg-(--color-background-{role}[-muted\|-emphasis])` | `bg-(--color-background-primary)`                      |
| **Component Specific** | `bg-(--color-{component}-{variant}-{property})`     | `bg-(--color-dialog-overlay)`                          |
| **Hover State**        | `hover:bg-(--color-{token})`                        | `hover:bg-(--color-background-muted)`                  |
| **Focus State**        | `focus:border-(--color-border-focus)`               | `focus:ring-(--color-border-focus)`                    |
| **Data State**         | `data-[state={value}]:bg-(--color-{token})`         | `data-[state=checked]:bg-(--color-background-primary)` |

## Common Mistakes to Avoid

### ❌ DON'T: Remove the color- prefix

```tsx
// WRONG - Token doesn't exist
className = "bg-(--background-primary)";
```

### ✅ DO: Keep the color- prefix

```tsx
// CORRECT - Token exists
className = "bg-(--color-background-default)";
```

### ❌ DON'T: Use legacy syntax

```tsx
// WRONG - Old Tailwind 3 pattern
className = "bg-[var(--color-background-default)]";
```

### ✅ DO: Use modern Tailwind 4 syntax

```tsx
// CORRECT - Tailwind 4 arbitrary values
className = "bg-(--color-background-default)";
```

### ❌ DON'T: Use primitives directly

```tsx
// WRONG - Bypasses semantic layer
className = "bg-(--color-gray-50)";
```

### ✅ DO: Use semantic tokens

```tsx
// CORRECT - Uses semantic abstraction
className = "bg-(--color-background-default)";
```

## Getting Help

**Can't find the right token?**

1. Check available tokens: `packages/tokens/dist/tokens.css`
2. Run usage analysis: `pnpm --filter @wyliedog/tokens report:usage`
3. Review Token Playground in Storybook: Foundations → Colors → Token Playground
4. Search semantic tokens first, then component tokens

**Need a new token?**

1. Verify a semantic token can't work
2. Document why you need it
3. Create in Figma using Token Bridge plugin
4. Export and process: `pnpm --filter @wyliedog/tokens build` (it runs `process-io` first)
5. Use in components

**Migration questions?**

1. Review anchor components as reference
2. Follow the decision tree above
3. Validate with `pnpm --filter @wyliedog/tokens report:usage`

## References

This guide is based on industry best practices:

- [Smashing Magazine: Design Token Naming Best Practices](https://www.smashingmagazine.com/2024/05/naming-best-practices/)
- [Tailwind CSS 4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS 4 @theme Directive Guide](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
- [GitHub Primer: Token Names](https://primer.style/foundations/primitives/token-names/)
- [Nord Design System: Naming](https://nordhealth.design/naming/)
