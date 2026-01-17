# Component Refinement Plan

## Wylie Dog Design System - Comprehensive Token & Component Audit

## Overview

This document outlines the systematic process for refining all 44 components in the Wylie Dog Design System to achieve complete token coverage, accurate Storybook stories, and proper light/dark mode support.

## Objectives

1. **Complete Token Coverage** - Every component fully tokenized and ready for Figma sync
2. **Accurate Token Mapping** - All tokens properly referenced through hierarchy (primitive → semantic → component)
3. **Working Storybook Stories** - Each story accurately demonstrates component functionality
4. **Light + Dark Mode Verification** - Both modes render correctly with proper token support
5. **Source-Only Token Edits** - All token changes made in `io/sync/*.json` files only

## Process Per Component

### Step 1: Assessment & Proposal (No Changes)

**What I Do:**

1. Analyze current component code
2. Check all token references exist in `dist/tokens.css`
3. Identify issues:
   - Missing tokens
   - Wrong Tailwind CSS 4 syntax
   - Hardcoded values that should be tokens
   - Incorrect token hierarchy (using primitive instead of semantic/component)
4. Review Storybook story for completeness
5. Test visual rendering in Storybook (light + dark modes)
6. **Present findings with proposed changes**

**What You Do:**

- Review assessment
- Approve, adjust, or redirect approach
- Answer any component-specific questions
- Make decisions about breaking changes (if any)

### Step 2: Implementation (Only After Approval)

**Token Work:**

1. Create missing tokens in `io/sync/components.json` or `io/sync/semantic.json`
2. Ensure proper token structure:

   ```json
   "component.property": {
     "$type": "spacing",  // or "color"
     "$value": "{semantic.reference}",
     "valuesByMode": {
       "Light": "{semantic.reference}",
       "Dark": "{semantic.reference.dark}"
     }
   }
   ```

3. Verify token references resolve correctly
4. Run `pnpm build` in tokens package

**Component Code:**

1. Fix Tailwind CSS 4 syntax: `px-(--spacing-token)`
2. Replace hardcoded values with token references
3. Ensure proper token usage hierarchy
4. Add missing states (hover, focus, active, disabled, data-states)
5. Verify accessibility attributes

**Storybook Story:**

1. Update/create comprehensive variants
2. Add interactive controls for all props
3. Include usage examples
4. Document accessibility features
5. Add token usage documentation (if applicable)

**Build:**

```bash
cd packages/tokens && pnpm build
cd ../ui && pnpm build
```

### Step 3: Verification

**Visual Testing:**

1. Open component in Storybook
2. Test all variants in light mode
3. Switch to dark mode, test all variants
4. Verify spacing, colors, sizing, borders, shadows
5. Test interactive states (hover, focus, active, disabled)

**Token Verification:**

```bash
# Check token exists
grep "component-token-name" packages/tokens/dist/tokens.css

# Verify component uses it correctly
grep "component-token-name" packages/ui/src/component.tsx
```

**Accessibility Check:**

- Keyboard navigation works
- Focus states visible
- ARIA attributes correct
- Screen reader friendly

### Step 4: Documentation

**Update Status:**

- Mark component as complete in tracking document
- Note any decisions made
- Document any breaking changes
- Record token count (before/after)

## Move to Next Component

## Component List (Alphabetical Order)

- [ ] Accordion
- [ ] Alert
- [ ] Alert Dialog
- [ ] Aspect Ratio
- [ ] Avatar
- [ ] Badge
- [ ] Breadcrumb
- [ ] Button
- [ ] Calendar
- [ ] Card
- [ ] Card Grid
- [ ] Carousel
- [ ] Checkbox
- [ ] Collapsible
- [ ] Command
- [ ] Context Menu
- [ ] Dialog
- [ ] Dropdown Menu
- [ ] Feature Grid (Composition)
- [ ] Form
- [ ] Hover Card
- [ ] Input
- [ ] Label
- [ ] Menubar
- [ ] Navigation Menu
- [ ] Page Layout (Composition)
- [ ] Pagination
- [ ] Popover
- [ ] Progress
- [ ] Radio Group
- [ ] Resizable
- [ ] Scroll Area
- [ ] Section Features (Composition)
- [ ] Section Hero (Composition)
- [ ] Select
- [ ] Separator
- [ ] Sheet
- [ ] Site Footer (Composition)
- [ ] Site Header (Composition)
- [ ] Skeleton
- [ ] Slider
- [ ] Switch
- [ ] Table
- [ ] Tabs
- [ ] Textarea
- [ ] Toast
- [ ] Toggle
- [ ] Toggle Group
- [ ] Tooltip

## Token Hierarchy Rules

### When to Use Each Token Type

**Primitive Tokens** (`primitive.json`)

- Base color palette (gray.50, blue.500, etc.)
- Base spacing scale (spacing.1, spacing.4, etc.)
- Typography foundations (font-size.sm, font-weight.medium)
- **Usage:** Referenced by semantic/component tokens, rarely used directly in components

**Semantic Tokens** (`semantic.json`)

- Context-based tokens (background.primary, text.secondary, border.focus)
- Cross-component patterns (interactive.padding-x, component.gap)
- System-wide values (shadow.base, transition.duration.fast)
- **Usage:** Referenced by component tokens or used directly when no component token exists

**Component Tokens** (`components.json`)

- Component-specific values (button.padding-x.md, alert.radius)
- Component variants (button.primary.background, badge.success.text)
- Component states (button.primary.background-hover)
- **Usage:** Used directly in component code as final values

### Token Naming Patterns

**Color Tokens:**

```text
component.variant.property
→ button.primary.background
→ badge.success.text
→ alert.destructive.border
```

**Spacing Tokens:**

```text
component.property.size
→ button.padding-x.md
→ input.height.lg
→ card.gap
```

**Typography Tokens:**

```text
component.property.size
→ button.font-size.md
→ alert.title.font-size
→ card.description.font-size
```

## Tailwind CSS 4 Syntax Reference

### Correct Patterns

**Colors:**

```tsx
// Component tokens
bg - (--color - button - primary - background);
text - (--color - button - primary - text);
border - (--color - button - primary - border);

// Semantic tokens (when component token doesn't exist)
bg - (--color - background - primary);
text - (--color - text - secondary);
border - (--color - border - focus);
```

**Spacing (padding, margin, gap):**

```tsx
px - (--spacing - button - padding - x - md);
py - (--spacing - button - padding - y - md);
p - (--spacing - card - padding);
gap - (--spacing - card - gap);
m - (--spacing - content - margin);
```

**Sizing:**

```tsx
h - (--spacing - button - height - md);
w - (--spacing - button - width);
min - h - (--spacing - input - min - height);
max - w - (--spacing - dialog - max - width);
```

**Border Radius:**

```tsx
rounded - (--spacing - button - radius);
rounded - t - (--spacing - card - radius);
```

**Font Size:**

```tsx
text-(length:--spacing-button-font-size-md)
```

**Border Width:**

```tsx
border - (--spacing - checkbox - border - width);
```

**Focus Ring:**

```tsx
focus: ring - (--spacing - checkbox - focus - ring - width);
focus: ring - (--color - border - focus);
focus: ring - offset - (--spacing - checkbox - focus - ring - offset);
```

### Common Mistakes to Avoid

❌ **Wrong:**

```tsx
// Missing spacing- prefix
px-(--button-padding-x-md)

// Missing color- prefix
bg-(--button-primary-background)

// Using var() wrapper (legacy Tailwind 3 syntax)
bg-[var(--color-background-primary)]

// Missing length: for font-size
text-(--spacing-button-font-size-md)

// Using primitive tokens directly
bg-(--color-blue-500)
```

✅ **Correct:**

```tsx
// Proper prefixes
px-(--spacing-button-padding-x-md)
bg-(--color-button-primary-background)

// Modern Tailwind 4 syntax
bg-(--color-background-primary)

// Font size with length:
text-(length:--spacing-button-font-size-md)

// Component/semantic tokens
bg-(--color-button-primary-background)
```

## Token Type Reference

### Color Tokens (`$type: "color"`)

**Generated as:** `--color-{name}`

Used for:

- Background colors
- Text colors
- Border colors
- Any OKLCH color values

**Example:**

```json
"button.primary.background": {
  "$type": "color",
  "$value": "{color.interactive.primary}",
  "valuesByMode": {
    "Light": "{color.interactive.primary}",
    "Dark": "{color.interactive.primary}"
  }
}
```

### Spacing Tokens (`$type: "spacing"`)

**Generated as:** `--spacing-{name}`

Used for:

- Padding (px, py, p, pt, pr, pb, pl)
- Margin (mx, my, m, mt, mr, mb, ml)
- Gap (gap, gap-x, gap-y, space-x, space-y)
- Sizing (w, h, min-w, max-w, min-h, max-h)
- Border radius (rounded, rounded-t, rounded-r, etc.)
- Border width (border)
- Font size (text with length: prefix)
- Inset (top, right, bottom, left)

**Example:**

```json
"button.padding-x.md": {
  "$type": "spacing",
  "$value": "{space.lg}",
  "valuesByMode": {
    "Light": "{space.lg}",
    "Dark": "{space.lg}"
  }
}
```

### Shadow Tokens (`$type: "shadow"`)

**Generated as:** `--shadow-{name}`

Used for:

- Box shadows

**Example:**

```json
"shadow.base": {
  "$type": "shadow",
  "$value": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "valuesByMode": {
    "Light": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "Dark": "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)"
  }
}
```

## Assessment Checklist Template

Use this for each component assessment:

```markdown
## Component: [Name]

### Current State

- [ ] Component file exists
- [ ] Storybook story exists
- [ ] Renders without errors
- [ ] Light mode works
- [ ] Dark mode works

### Token Audit

**Color Tokens:**

- [ ] Background colors tokenized
- [ ] Text colors tokenized
- [ ] Border colors tokenized
- [ ] State colors tokenized (hover, active, focus, disabled)

**Spacing Tokens:**

- [ ] Padding tokenized
- [ ] Margins tokenized (if any)
- [ ] Gaps tokenized (if any)
- [ ] Height/width tokenized

**Typography Tokens:**

- [ ] Font sizes tokenized
- [ ] Font weights tokenized (if custom)
- [ ] Line heights tokenized (if custom)

**Other Tokens:**

- [ ] Border radius tokenized
- [ ] Border width tokenized (if custom)
- [ ] Shadows tokenized (if any)
- [ ] Transitions tokenized (if any)

### Issues Found

- [ ] Missing tokens: [list]
- [ ] Hardcoded values: [list]
- [ ] Wrong syntax: [list]
- [ ] Wrong token hierarchy: [list]

### Storybook Story

- [ ] All variants shown
- [ ] All sizes shown
- [ ] All states shown (hover, focus, disabled, etc.)
- [ ] Interactive controls present
- [ ] Usage examples included
- [ ] Accessibility documented

### Proposed Changes

[Detailed list of what needs to be fixed]

### Questions

[Any component-specific questions for decision-making]
```

## Success Metrics

For each component, we aim for:

- **100% token coverage** - No hardcoded values except intentional utility classes (flex, grid, opacity-50, etc.)
- **Complete Storybook story** - All variants, states, and use cases demonstrated
- **Light + dark mode verified** - Both modes render correctly
- **Accessibility confirmed** - Keyboard navigation, focus states, ARIA attributes
- **Documentation complete** - Token usage and decisions recorded

## Tools & Commands

### Token Operations

```bash
# Rebuild tokens after edits
cd packages/tokens && pnpm build

# Check if token exists
grep "token-name" packages/tokens/dist/tokens.css

# View all tokens for a component
grep "component-name" packages/tokens/dist/tokens.css
```

### Component Operations

```bash
# Rebuild UI package
cd packages/ui && pnpm build

# Check component token usage
grep "spacing-\|color-" packages/ui/src/component.tsx
```

### Storybook

```bash
# Run Storybook
cd apps/storybook && pnpm dev

# Build Storybook
cd apps/storybook && pnpm build
```

### Full System Build

```bash
# From root
pnpm build

# Or specific packages
pnpm --filter @wyliedog/tokens build
pnpm --filter @wyliedog/ui build
```

## Notes & Decisions Log

### Session 1: [Date]

- Fixed 104 component tokens from `$type: "dimension"` to `$type: "spacing"`
- Resolved spacing/sizing/radius issues across ~25 components
- Identified border color visibility issue (gray-300 too light on white backgrounds)

### Session 2: [Date]

[To be filled in as we progress]

---

**Last Updated:** [Date]
**Status:** Planning Phase
**Next Component:** Accordion
