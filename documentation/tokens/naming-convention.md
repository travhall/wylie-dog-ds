# Token Naming Convention Guide

**Standard Pattern:** `bg-(--color-background-default)` - Keep `color-` prefix for clarity and standards compliance

This guide establishes the naming convention for using design tokens in Wylie Dog components, based on industry best practices and Tailwind CSS 4 patterns.

## Core Principles

1. **Category Clarity:** The `color-` prefix distinguishes color tokens from spacing, typography, and other categories
2. **Modern Syntax:** Use Tailwind CSS 4 arbitrary values: `bg-(--custom-property)`
3. **Semantic Naming:** Prefer semantic tokens (`--color-background-default`) over primitives (`--color-gray-50`)
4. **Standards Compliance:** Align with [Tailwind CSS 4](https://tailwindcss.com/docs/theme), [design token best practices](https://www.smashingmagazine.com/2024/05/naming-best-practices/), and [industry standards](https://primer.style/foundations/primitives/token-names/)

## Semantic colour grammar

- **Ground tokens** are `color.background.<level>`, `color.foreground.<level>` and `color.border.<level>`. Backgrounds and borders use the levels `default`, `subtle` and `strong` (backgrounds also have the placement levels `raised` and `overlay`); foregrounds use `default`, `muted` and `faint`.
- **Roles** are `color.<role>.<part>.<level>` with the roles `primary`, `danger`, `success`, `warning`, `info` and `inverse`, the parts `background`, `foreground` and `border`, and the levels `default` (the solid fill) and `subtle` (the tint).
- **Pairs.** Within a role, `foreground.X` is readable on `background.X`. `pnpm check:contrast` checks the declared pairs.
- **States** are a suffix after the level: `.hover`, `.active`, `.focus`, `.disabled` (`--color-primary-background-default-hover` in CSS).
- **The focus ring** is its own group: `color.focus.ring`.

The reasoning and the old-to-new history are in [semantic-pairing-model.md](semantic-pairing-model.md).

## Why Keep the `color-` Prefix?

After research and evaluation, the `color-` prefix is the correct choice because:

**1. Industry Standard**

- [Tailwind CSS 4 @theme directive](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06) uses category prefixes
- [GitHub's Primer](https://primer.style/foundations/primitives/token-names/) uses namespace-category-concept pattern
- [Nord Design System](https://nordhealth.design/naming/) uses role-based prefixes like `--color-accent`

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
│  --color-focus-ring                           │
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

### Semantic Tokens (Primary Choice)

Use semantic tokens for most component styling. They provide meaning and adapt to light/dark modes automatically.

**Background:**

```tsx
// Default background (the page: white in light mode, dark in dark mode)
className = "bg-(--color-background-default)";

// Subtle background (subtle contrast)
className = "bg-(--color-background-subtle)";

// Strong background (stronger contrast with the page)
className = "bg-(--color-background-strong)";

// Inverse background (dark in light mode, light in dark mode)
className = "bg-(--color-inverse-background-default)";
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
className = "text-(--color-danger-foreground-subtle)";

// Success text
className = "text-(--color-success-foreground-subtle)";

// Inverse text (for dark backgrounds)
className = "text-(--color-inverse-foreground-default)";
```

**Border:**

```tsx
// Default border (default border color)
className = "border-(--color-border-default)";

// Subtle border (more subtle)
className = "border-(--color-border-subtle)";

// Focus border (for focus states)
className = "border-(--color-focus-ring)";

// Danger border (for error states)
className = "border-(--color-danger-border-default)";
```

**Interactive:**

```tsx
// Primary fill (buttons and primary actions)
className = "bg-(--color-primary-background-default)";

// Hover state
className = "hover:bg-(--color-primary-background-default-hover)";

// Active state
className = "active:bg-(--color-primary-background-default-active)";

// Hover fill on the page background (also used for the secondary button)
className = "bg-(--color-background-default-hover)";
```

### Component Tokens (When Available)

Use component-specific tokens when they exist. They encapsulate design decisions and typically reference semantic tokens.

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
  hover:bg-(--color-background-subtle)
"
```

**Focus States:**

```tsx
className="
  border-(--color-border-default)
  focus:border-(--color-focus-ring)
  focus:ring-(--color-focus-ring)
"
```

**Active States:**

```tsx
className="
  bg-(--color-primary-background-default)
  active:bg-(--color-primary-background-default-active)
"
```

**Data States (Radix UI):**

```tsx
className="
  data-[state=checked]:bg-(--color-primary-background-default)
  data-[state=active]:text-(--color-foreground-default)
"
```

**Disabled States:**

```tsx
className="
  text-(--color-foreground-default-disabled)
  opacity-50
  cursor-not-allowed
"
```

### Variants

**Destructive Variant:**

```tsx
// Using semantic tokens
className="
  bg-(--color-danger-background-default)
  text-(--color-danger-foreground-subtle)
  border-(--color-danger-border-default)
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
  text-(--color-success-foreground-subtle)
  border-(--color-success-border-default)
"
```

**Warning Variant:**

```tsx
className="
  text-(--color-warning-foreground-subtle)
  border-(--color-warning-border-default)
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
  hover:bg-(--color-background-subtle)
  focus:bg-(--color-background-subtle)
  border-(--color-border-default)
  focus:border-(--color-focus-ring)
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
  background-color: var(--color-background-subtle);
}

.custom-component:focus {
  border-color: var(--color-focus-ring);
  outline: 2px solid var(--color-focus-ring);
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

## Examples from Anchor Components

### Checkbox (Reference Implementation)

```tsx
<Checkbox
  className="
  border-(--color-border-default)
  hover:border-(--color-border-subtle)
  focus:ring-(--color-focus-ring)
  data-[state=checked]:bg-(--color-primary-background-default)
  data-[state=checked]:border-(--color-primary-background-default)
  data-[state=checked]:text-(--color-inverse-foreground-default)
"
/>
```

**Why this works:**

- Uses semantic tokens consistently
- Clear state handling with Radix data attributes
- Proper focus states with dedicated focus token

### Tabs (Reference Implementation)

```tsx
<TabsList
  className="
  bg-(--color-background-subtle)
  text-(--color-foreground-muted)
"
>
  <TabsTrigger
    className="
    text-(--color-foreground-muted)
    hover:bg-(--color-background-strong)
    hover:text-(--color-foreground-default)
    focus-visible:ring-(--color-focus-ring)
    data-[state=active]:bg-(--color-background-default)
    data-[state=active]:text-(--color-foreground-default)
  "
  >
    Tab
  </TabsTrigger>
</TabsList>
```

**Why this works:**

- Background levels: subtle, strong and default
- Text levels: muted and default
- Semantic tokens handle all state variations

### Dialog (Reference Implementation)

```tsx
<DialogOverlay className="
  bg-(--color-dialog-overlay)
" />

<DialogContent className="
  bg-(--color-background-default)
  border-(--color-border-default)
">
  <DialogClose className="
    focus:ring-(--color-focus-ring)
  " />

  <DialogTitle className="
    text-(--color-foreground-default)
  " />

  <DialogDescription className="
    text-(--color-foreground-muted)
  " />
</DialogContent>
```

**Why this works:**

- Uses component token (`--color-dialog-overlay`) for dialog-specific styling
- Falls back to semantic tokens for standard elements
- Text hierarchy for title/description

### Dropdown Menu (Reference Implementation)

```tsx
<DropdownMenuContent
  className="
  bg-(--color-background-default)
  border-(--color-border-default)
  text-(--color-foreground-default)
"
>
  <DropdownMenuItem
    className="
    focus:bg-(--color-background-default-hover)
    focus:text-(--color-foreground-default)
  "
  />

  <DropdownMenuLabel
    className="
    text-(--color-foreground-muted)
  "
  />

  <DropdownMenuSeparator
    className="
    bg-(--color-border-default)
  "
  />
</DropdownMenuContent>
```

**Why this works:**

- Consistent use of semantic tokens
- Hover and active fills on the page background for subtle focus states
- Text hierarchy for labels vs items

### Site Footer (Reference Implementation)

```tsx
<footer
  className="
  bg-(--color-background-subtle)
  border-t
  border-(--color-border-default)
"
>
  <p className="text-(--color-foreground-muted)">Description</p>

  <a
    className="
    text-(--color-foreground-muted)
    hover:text-(--color-foreground-default)
  "
  >
    Link
  </a>
</footer>
```

**Why this works:**

- Subtle background for footer differentiation
- Text hierarchy with hover interactions
- Simple, consistent token usage

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
- Components use semantic tokens primarily
- Zero undefined CSS variables in browser

## Quick Reference Card

| Use Case               | Pattern                                         | Example                                                        |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| **Background**         | `bg-(--color-background-{level})`               | `bg-(--color-background-default)`                              |
| **Text**               | `text-(--color-foreground-{level})`             | `text-(--color-foreground-muted)`                              |
| **Border**             | `border-(--color-border-{purpose})`             | `border-(--color-focus-ring)`                                  |
| **Role fill**          | `bg-(--color-{role}-background-{level})`        | `bg-(--color-primary-background-default)`                      |
| **Component Specific** | `bg-(--color-{component}-{variant}-{property})` | `bg-(--color-dialog-overlay)`                                  |
| **Hover State**        | `hover:bg-(--color-{token})`                    | `hover:bg-(--color-background-subtle)`                         |
| **Focus State**        | `focus:border-(--color-focus-ring)`             | `focus:ring-(--color-focus-ring)`                              |
| **Data State**         | `data-[state={value}]:bg-(--color-{token})`     | `data-[state=checked]:bg-(--color-primary-background-default)` |

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
