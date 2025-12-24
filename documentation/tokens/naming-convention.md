# Token Naming Convention Guide

**Standard Pattern:** `bg-(--color-background-primary)` - Keep `color-` prefix for clarity and standards compliance

This guide establishes the naming convention for using design tokens in Wylie Dog components, based on industry best practices and Tailwind CSS 4 patterns.

## Core Principles

1. **Category Clarity:** The `color-` prefix distinguishes color tokens from spacing, typography, and other categories
2. **Modern Syntax:** Use Tailwind CSS 4 arbitrary values: `bg-(--custom-property)`
3. **Semantic Naming:** Prefer semantic tokens (`--color-background-primary`) over primitives (`--color-gray-50`)
4. **Standards Compliance:** Align with [Tailwind CSS 4](https://tailwindcss.com/docs/theme), [design token best practices](https://www.smashingmagazine.com/2024/05/naming-best-practices/), and [industry standards](https://primer.style/foundations/primitives/token-names/)

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
--color-background-primary: oklch(...); /* Clearly a color value */
```

**3. Category Organization**
Your token system has multiple categories:

- `--color-*` (colors)
- `--spacing-*` (spacing)
- `--font-*` (typography)
- `--radius-*` (border radius)

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
className = "bg-(--color-background-primary)";
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
│  --color-background-primary                     │
│  --color-text-secondary                         │
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

### Semantic Tokens (Primary Choice)

Use semantic tokens for most component styling. They provide meaning and adapt to light/dark modes automatically.

**Background:**

```tsx
// Primary background (white in light mode, dark in dark mode)
className = "bg-(--color-background-primary)";

// Secondary background (subtle contrast)
className = "bg-(--color-background-secondary)";

// Tertiary background (even more subtle)
className = "bg-(--color-background-tertiary)";

// Inverse background (dark in light mode, light in dark mode)
className = "bg-(--color-background-inverse)";
```

**Text:**

```tsx
// Primary text (highest contrast, body text)
className = "text-(--color-text-primary)";

// Secondary text (medium contrast, labels, captions)
className = "text-(--color-text-secondary)";

// Tertiary text (lowest contrast, placeholders)
className = "text-(--color-text-tertiary)";

// Danger/error text
className = "text-(--color-text-danger)";

// Success text
className = "text-(--color-text-success)";

// Inverse text (for dark backgrounds)
className = "text-(--color-text-inverse)";
```

**Border:**

```tsx
// Primary border (default border color)
className = "border-(--color-border-primary)";

// Secondary border (more subtle)
className = "border-(--color-border-secondary)";

// Focus border (for focus states)
className = "border-(--color-border-focus)";

// Danger border (for error states)
className = "border-(--color-border-danger)";
```

**Interactive:**

```tsx
// Primary interactive (buttons, links, primary actions)
className = "bg-(--color-interactive-primary)";

// Hover state
className = "hover:bg-(--color-interactive-primary-hover)";

// Active state
className = "active:bg-(--color-interactive-primary-active)";

// Secondary interactive
className = "bg-(--color-interactive-secondary)";
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
  bg-(--color-background-primary)
  hover:bg-(--color-background-secondary)
"
```

**Focus States:**

```tsx
className="
  border-(--color-border-primary)
  focus:border-(--color-border-focus)
  focus:ring-(--color-border-focus)
"
```

**Active States:**

```tsx
className="
  bg-(--color-interactive-primary)
  active:bg-(--color-interactive-primary-active)
"
```

**Data States (Radix UI):**

```tsx
className="
  data-[state=checked]:bg-(--color-interactive-primary)
  data-[state=active]:text-(--color-text-primary)
"
```

**Disabled States:**

```tsx
className="
  text-(--color-text-disabled)
  opacity-50
  cursor-not-allowed
"
```

### Variants

**Destructive Variant:**

```tsx
// Using semantic tokens
className="
  bg-(--color-background-danger)
  text-(--color-text-danger)
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
  bg-(--color-background-success)
  text-(--color-text-success)
  border-(--color-border-success)
"
```

**Warning Variant:**

```tsx
className="
  bg-(--color-background-warning)
  text-(--color-text-warning)
  border-(--color-border-warning)
"
```

### Complex Components

**Card with Multiple Tokens:**

```tsx
<div
  className="
  bg-(--color-background-primary)
  border-(--color-border-primary)
  rounded-lg
  p-4
"
>
  <h3 className="text-(--color-text-primary) font-semibold">Title</h3>
  <p className="text-(--color-text-secondary) text-sm">Description text</p>
</div>
```

**Interactive List Item:**

```tsx
<li
  className="
  bg-(--color-background-primary)
  hover:bg-(--color-background-secondary)
  focus:bg-(--color-background-secondary)
  border-(--color-border-primary)
  focus:border-(--color-border-focus)
  text-(--color-text-primary)
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
    backgroundColor: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    borderColor: "var(--color-border-primary)",
  }}
>
  Content
</div>
```

**CSS Files:**

```css
.custom-component {
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.custom-component:hover {
  background-color: var(--color-background-secondary);
}

.custom-component:focus {
  border-color: var(--color-border-focus);
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

## JavaScript Access

When you need to access token values in JavaScript:

```tsx
import { color } from "@wyliedog/tokens/hierarchical";

// Access hierarchical structure
const primaryBg = color.background.primary; // "oklch(...)"
const secondaryText = color.text.secondary; // "oklch(...)"

// Use in conditional logic
const textColor = isError ? color.text.danger : color.text.primary;

// Use in dynamic styles
const buttonStyle = {
  backgroundColor: color.interactive.primary,
  color: color.text.inverse,
};
```

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
4. **Validate:** Run `pnpm report:usage` to track progress

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
    └─────┘    │ exists?              │      (e.g., --color-background-primary)
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
  border-(--color-border-primary)
  hover:border-(--color-border-secondary)
  focus:ring-(--color-border-focus)
  data-[state=checked]:bg-(--color-interactive-primary)
  data-[state=checked]:border-(--color-interactive-primary)
  data-[state=checked]:text-(--color-text-inverse)
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
  bg-(--color-background-secondary)
  text-(--color-text-secondary)
"
>
  <TabsTrigger
    className="
    text-(--color-text-secondary)
    hover:bg-(--color-background-tertiary)
    hover:text-(--color-text-primary)
    focus-visible:ring-(--color-border-focus)
    data-[state=active]:bg-(--color-background-primary)
    data-[state=active]:text-(--color-text-primary)
  "
  >
    Tab
  </TabsTrigger>
</TabsList>
```

**Why this works:**

- Background hierarchy: secondary → tertiary → primary
- Text hierarchy: secondary → primary
- Semantic tokens handle all state variations

### Dialog (Reference Implementation)

```tsx
<DialogOverlay className="
  bg-(--color-dialog-overlay)
" />

<DialogContent className="
  bg-(--color-background-primary)
  border-(--color-border-primary)
">
  <DialogClose className="
    focus:ring-(--color-border-focus)
  " />

  <DialogTitle className="
    text-(--color-text-primary)
  " />

  <DialogDescription className="
    text-(--color-text-secondary)
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
  bg-(--color-background-primary)
  border-(--color-border-primary)
  text-(--color-text-primary)
"
>
  <DropdownMenuItem
    className="
    focus:bg-(--color-interactive-secondary)
    focus:text-(--color-text-primary)
  "
  />

  <DropdownMenuLabel
    className="
    text-(--color-text-secondary)
  "
  />

  <DropdownMenuSeparator
    className="
    bg-(--color-border-primary)
  "
  />
</DropdownMenuContent>
```

**Why this works:**

- Consistent use of semantic tokens
- Interactive secondary for subtle focus states
- Text hierarchy for labels vs items

### Site Footer (Reference Implementation)

```tsx
<footer
  className="
  bg-(--color-background-secondary)
  border-t
  border-(--color-border-primary)
"
>
  <p className="text-(--color-text-secondary)">Description</p>

  <a
    className="
    text-(--color-text-secondary)
    hover:text-(--color-text-primary)
  "
  >
    Link
  </a>
</footer>
```

**Why this works:**

- Secondary background for footer differentiation
- Text hierarchy with hover interactions
- Simple, consistent token usage

## Validation

After updating components, validate your changes:

```bash
# Check token usage patterns
pnpm report:usage

# Validate token structure
pnpm test:tokens

# Build and verify
pnpm build
```

**Success Criteria:**

- All `bg-[var(--*)]` legacy patterns migrated
- All tokens use `--color-` prefix where appropriate
- Components use semantic tokens primarily
- Zero undefined CSS variables in browser

## Quick Reference Card

| Use Case               | Pattern                                         | Example                                                 |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **Background**         | `bg-(--color-background-{level})`               | `bg-(--color-background-primary)`                       |
| **Text**               | `text-(--color-text-{level})`                   | `text-(--color-text-secondary)`                         |
| **Border**             | `border-(--color-border-{purpose})`             | `border-(--color-border-focus)`                         |
| **Interactive**        | `bg-(--color-interactive-{level})`              | `bg-(--color-interactive-primary)`                      |
| **Component Specific** | `bg-(--color-{component}-{variant}-{property})` | `bg-(--color-dialog-overlay)`                           |
| **Hover State**        | `hover:bg-(--color-{token})`                    | `hover:bg-(--color-background-secondary)`               |
| **Focus State**        | `focus:border-(--color-border-focus)`           | `focus:ring-(--color-border-focus)`                     |
| **Data State**         | `data-[state={value}]:bg-(--color-{token})`     | `data-[state=checked]:bg-(--color-interactive-primary)` |

## Common Mistakes to Avoid

### ❌ DON'T: Remove the color- prefix

```tsx
// WRONG - Token doesn't exist
className = "bg-(--background-primary)";
```

### ✅ DO: Keep the color- prefix

```tsx
// CORRECT - Token exists
className = "bg-(--color-background-primary)";
```

### ❌ DON'T: Use legacy syntax

```tsx
// WRONG - Old Tailwind 3 pattern
className = "bg-[var(--color-background-primary)]";
```

### ✅ DO: Use modern Tailwind 4 syntax

```tsx
// CORRECT - Tailwind 4 arbitrary values
className = "bg-(--color-background-primary)";
```

### ❌ DON'T: Use primitives directly

```tsx
// WRONG - Bypasses semantic layer
className = "bg-(--color-gray-50)";
```

### ✅ DO: Use semantic tokens

```tsx
// CORRECT - Uses semantic abstraction
className = "bg-(--color-background-primary)";
```

## Getting Help

**Can't find the right token?**

1. Check available tokens: `packages/tokens/dist/tokens.css`
2. Run usage analysis: `pnpm report:usage`
3. Review Token Playground in Storybook: Foundations → Colors → Token Playground
4. Search semantic tokens first, then component tokens

**Need a new token?**

1. Verify a semantic token can't work
2. Document why you need it
3. Create in Figma using Token Bridge plugin
4. Export and process: `pnpm process-io && pnpm build`
5. Use in components

**Migration questions?**

1. Review anchor components as reference
2. Follow the decision tree above
3. Validate with `pnpm report:usage`

## References

This guide is based on industry best practices:

- [Smashing Magazine: Design Token Naming Best Practices](https://www.smashingmagazine.com/2024/05/naming-best-practices/)
- [Tailwind CSS 4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS 4 @theme Directive Guide](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
- [GitHub Primer: Token Names](https://primer.style/foundations/primitives/token-names/)
- [Nord Design System: Naming](https://nordhealth.design/naming/)
