# Component & Token Audit Guide

> A repeatable process for auditing UI components, design tokens, and Storybook stories to ensure alignment between Figma, tokens, and code.

## Overview

This guide provides a systematic approach to:

1. **Verify token integrity** — Ensure tokens in code match Figma source
2. **Audit component implementation** — Confirm components use correct token-based classes
3. **Validate Storybook coverage** — Ensure stories properly demonstrate token usage
4. **Identify and resolve issues** — Phantom tokens, unused tokens, missing tokens, naming inconsistencies

---

## Pre-Audit Setup

### 1. Ensure Fresh Builds

```bash
# From project root
pnpm install
pnpm build
```

### 2. Sync Figma Tokens (if applicable)

If you've made changes in Figma:

```bash
# Follow the Figma sync process
# See: documentation/guides/FIGMA-IMPORT-GUIDE.md
```

### 3. Run Automated Audit Scripts

```bash
# Full token audit
node packages/tokens/scripts/audit-tokens.js --verbose

# Audit specific component
node packages/tokens/scripts/audit-tokens.js --component card --verbose --fix-suggestions

# Generate token map
node packages/tokens/scripts/generate-token-map.js --markdown
```

---

## Phase 1: Token Inventory

### 1.1 Compare Figma to `io/sync/components.json`

**Goal:** Identify phantom tokens (tokens in code but not in Figma) and missing tokens (tokens in Figma but not in code).

**Manual Process:**

1. Open Figma and navigate to the component's token definitions
2. Open `packages/tokens/io/sync/components.json`
3. Search for the component prefix (e.g., `"card.`)
4. Cross-reference each token:

| Check                               | Status                          |
| ----------------------------------- | ------------------------------- |
| Token exists in both Figma and JSON | ✓ Valid                         |
| Token in JSON but not Figma         | ⚠️ Phantom - investigate origin |
| Token in Figma but not JSON         | ⚠️ Missing - needs sync         |

**Red Flags:**

- Tokens scattered far from their component group in the JSON file (phantom indicator)
- Inconsistent naming (e.g., `card.header.gap` vs `card.header-gap` in same component)
- Tokens with `spacing.0` or empty values (may be redundant)

### 1.2 Verify Token Grouping

All tokens for a component should be grouped together in `components.json`.

```bash
# Check token locations
grep -n '"card\.' packages/tokens/io/sync/components.json
```

If you see tokens at vastly different line numbers (e.g., lines 471-607 and also line 4279), investigate the outliers.

### 1.3 Naming Convention Check

**Standard:** Use dot notation for hierarchy.

| Pattern           | Status          |
| ----------------- | --------------- |
| `card.header.gap` | ✓ Correct       |
| `card.header-gap` | ⚠️ Inconsistent |
| `card.headerGap`  | ✗ Wrong         |

---

## Phase 2: Component Implementation Audit

### 2.1 Locate the Component

```bash
# Component source
packages/ui/src/{component}.tsx

# Component tests
packages/ui/src/__tests__/{component}.test.tsx
```

### 2.2 Verify Tailwind 4 Token Syntax

**Correct Syntax Patterns:**

```tsx
// Colors
"bg-(--color-card-background)";
"border-(--color-card-border)";
"text-(--color-card-text)";

// Spacing
"p-(--spacing-card-padding)";
"gap-(--spacing-card-gap)";
"rounded-(--spacing-card-radius)";

// Typography (note the type hint for font-size)
"text-(length:--font-size-card-title)"; // font-size
"text-(--color-card-title-color)"; // color
"font-(--font-weight-card-title)";
"leading-(--line-height-card-title)";
"tracking-(--spacing-card-letter-spacing)";

// Shadows
"shadow-(--shadow-card-shadow)";
```

**Common Mistakes:**

```tsx
// ✗ Wrong: Old Tailwind 3 syntax
"bg-[var(--color-card-background)]";

// ✗ Wrong: Missing type hint for font-size
"text-(--font-size-card-title)"; // Tailwind interprets as color!

// ✗ Wrong: Using semantic tokens instead of component tokens
"bg-(--color-background-primary)"; // Should use --color-card-background
```

### 2.3 Layout & CSS Property Compatibility

Check that CSS properties are used correctly:

| Property               | Requires                  | Example                       |
| ---------------------- | ------------------------- | ----------------------------- |
| `gap`                  | `display: flex` or `grid` | Add `flex flex-col` or `grid` |
| `space-y-*`            | Multiple children         | Only works between siblings   |
| `justify-*`, `items-*` | `display: flex` or `grid` | —                             |

**Audit Checklist:**

- [ ] If using `gap-(...)`, does the element have `flex` or `grid`?
- [ ] If using `space-y-(...)`, are there always multiple children?
- [ ] Are layout utilities (`flex`, `grid`, `block`) appropriate for the component?

### 2.4 Token Coverage Matrix

For each component, create a coverage matrix:

| Sub-component | Token Property | Token Name                  | Used in Code? |
| ------------- | -------------- | --------------------------- | ------------- |
| Card          | background     | card.background             | ✓             |
| Card          | border         | card.border                 | ✓             |
| Card          | padding        | card.padding                | ✓             |
| Card          | gap            | card.gap                    | ✓             |
| Card          | radius         | card.radius                 | ✓             |
| Card          | shadow         | card.shadow                 | ✓             |
| CardHeader    | gap            | card.header.gap             | ✓             |
| CardTitle     | font-size      | card.header.title.font-size | ✓             |
| CardTitle     | color          | card.header.title.color     | ✓             |
| ...           | ...            | ...                         | ...           |

---

## Phase 3: Storybook Validation

### 3.1 Verify Story Exists

```bash
# Stories location
apps/storybook/stories/Components/{category}/{component}.stories.tsx
```

### 3.2 Story Coverage Checklist

- [ ] Default story shows base component
- [ ] Variant stories (if component has variants)
- [ ] Interactive states (hover, focus, disabled) if applicable
- [ ] Dark mode renders correctly
- [ ] All sub-components are demonstrated (e.g., CardHeader, CardContent, CardFooter)

### 3.3 Visual Token Verification

1. Start Storybook: `pnpm --filter storybook dev`
2. Navigate to the component story
3. Use browser DevTools to inspect:
   - Are token-based CSS variables being applied?
   - Do computed values match expected token values?
   - Do styles change when switching light/dark mode?

**DevTools Inspection:**

```
Element: <div class="bg-(--color-card-background) ...">

Styles:
  background-color: var(--color-card-background);
  --color-card-background: oklch(1 0 0);  /* Check this value */
```

### 3.4 Storybook Alias Verification

If component changes aren't reflecting in Storybook:

1. Check `apps/storybook/.storybook/main.ts` aliases
2. Ensure regex patterns correctly redirect to source files
3. Verify the styles import path is correct

---

## Phase 4: Issue Resolution

### 4.1 Phantom Token Removal

**Symptoms:**

- Token in `components.json` but not in Figma
- Token located far from its component group
- Token has `spacing.0` or default/empty value

**Resolution:**

1. Confirm token is not in Figma
2. Check if component references the token
3. If unused, remove from both `components.json` and component source
4. Rebuild tokens: `pnpm --filter @wyliedog/tokens build`

### 4.2 Missing Token Addition

**Symptoms:**

- Component uses hardcoded value instead of token
- Design specifies a value that should be tokenized

**Resolution:**

1. Add token to `packages/tokens/io/sync/components.json`:

```json
"card.new-property": {
  "$type": "spacing",
  "$value": "{spacing.200}",
  "valuesByMode": {
    "Light": "{spacing.200}",
    "Dark": "{spacing.200}"
  }
}
```

2. Rebuild tokens
3. Update component to use new token
4. Verify in Storybook

### 4.3 Naming Convention Fix

**Resolution:**

1. Rename token in `components.json` to use dot notation
2. Rebuild tokens
3. Update component CSS variable reference
4. Verify generated CSS variable name in `dist/tokens.css`

### 4.4 Layout Fix (gap not working)

**Symptoms:**

- `gap-(...)` class present but no visual spacing
- DevTools shows `gap` property but no effect

**Resolution:**

1. Add `flex flex-col` or `grid` to the element
2. Verify children are direct descendants
3. Consider if the layout change affects component flexibility

---

## Automation Scripts Reference

### `audit-tokens.js`

```bash
# Full audit with verbose output
node packages/tokens/scripts/audit-tokens.js --verbose

# Audit specific component
node packages/tokens/scripts/audit-tokens.js --component button

# JSON output for CI integration
node packages/tokens/scripts/audit-tokens.js --json

# Include fix suggestions
node packages/tokens/scripts/audit-tokens.js --fix-suggestions
```

**Output includes:**

- Unused tokens (defined but not used in components)
- Missing tokens (used in components but not defined)
- Naming convention violations
- Phantom tokens (tokens far from their group)
- Component coverage percentages

### `generate-token-map.js`

```bash
# Generate token map JSON
node packages/tokens/scripts/generate-token-map.js

# Also generate markdown documentation
node packages/tokens/scripts/generate-token-map.js --markdown

# Map for specific component
node packages/tokens/scripts/generate-token-map.js --component card
```

**Output includes:**

- Token → CSS variable mapping
- CSS variable → Tailwind class mapping
- Component-grouped token inventory

---

## Audit Checklist Template

Use this checklist when auditing a component:

```markdown
## [Component Name] Audit

### Pre-checks

- [ ] Fresh build completed
- [ ] Ran `audit-tokens.js --component {name}`

### Token Inventory

- [ ] All tokens exist in Figma
- [ ] No phantom tokens found
- [ ] Tokens grouped together in components.json
- [ ] Naming follows dot notation convention

### Component Implementation

- [ ] Uses Tailwind 4 syntax `utility-(--css-var)`
- [ ] Uses component-tier tokens (not semantic)
- [ ] Font-size uses type hint `text-(length:...)`
- [ ] Layout utilities match CSS property requirements
- [ ] No hardcoded values that should be tokens

### Storybook

- [ ] Story exists and renders correctly
- [ ] All variants demonstrated
- [ ] Dark mode works
- [ ] DevTools shows correct CSS variable values

### Issues Found

- [ ] List any issues and their resolutions

### Sign-off

- Audited by: \_\_\_
- Date: \_\_\_
```

---

## Quick Reference: Token Type to CSS Variable Prefix

| Token Type | CSS Prefix       | Example                      |
| ---------- | ---------------- | ---------------------------- |
| color      | `--color-`       | `--color-card-background`    |
| spacing    | `--spacing-`     | `--spacing-card-padding`     |
| dimension  | `--spacing-`     | `--spacing-card-radius`      |
| fontSize   | `--font-size-`   | `--font-size-card-title`     |
| fontWeight | `--font-weight-` | `--font-weight-card-title`   |
| lineHeight | `--line-height-` | `--line-height-card-title`   |
| shadow     | `--shadow-`      | `--shadow-card-shadow`       |
| duration   | `--duration-`    | `--duration-card-transition` |

---

## Quick Reference: Tailwind 4 Utility Syntax

| Use Case         | Syntax                | Example                                    |
| ---------------- | --------------------- | ------------------------------------------ |
| Background color | `bg-(--var)`          | `bg-(--color-card-background)`             |
| Border color     | `border-(--var)`      | `border-(--color-card-border)`             |
| Text color       | `text-(--var)`        | `text-(--color-card-text)`                 |
| Font size        | `text-(length:--var)` | `text-(length:--font-size-card-title)`     |
| Font weight      | `font-(--var)`        | `font-(--font-weight-card-title)`          |
| Line height      | `leading-(--var)`     | `leading-(--line-height-card-title)`       |
| Letter spacing   | `tracking-(--var)`    | `tracking-(--spacing-card-letter-spacing)` |
| Padding          | `p-(--var)`           | `p-(--spacing-card-padding)`               |
| Gap              | `gap-(--var)`         | `gap-(--spacing-card-gap)`                 |
| Border radius    | `rounded-(--var)`     | `rounded-(--spacing-card-radius)`          |
| Box shadow       | `shadow-(--var)`      | `shadow-(--shadow-card-shadow)`            |

---

_Last updated: Auto-generated during Card component audit_
