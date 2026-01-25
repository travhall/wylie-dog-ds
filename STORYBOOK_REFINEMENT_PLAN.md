# Storybook Refinement Plan

## Project Context

**Wylie Dog Design System** - Production Turborepo with:

- **44 Components** (packages/ui/src/)
- **58 Storybook Stories** (apps/storybook/stories/)
- **275+ Design Tokens** using OKLCH color space
- **8 Color Scales**: Gray, Blue, Green, Orange, Pink, Purple, Red, Yellow (11 shades each: 50-950)

## Refinement Principles

1. **Token-First Styling**: Components must use design tokens via CSS custom properties
   - ✅ `bg-(--color-button-primary-background)`
   - ❌ `bg-blue-500` (Tailwind utility)

2. **Tailwind for Structure Only**: Layout/spacing utilities when tokens don't apply
   - ✅ `flex`, `grid`, `space-y-4`, `p-4`
   - ❌ `bg-gray-100`, `text-blue-600`

3. **Stories Use Components**: Compose UI components, not raw HTML
   - ✅ `<Button>`, `<Card>`, `<Badge>`
   - ❌ `<div className="...">`, `<button>`

4. **Complete Token Coverage**: Every visual style needs a token
   - Missing component tokens get added
   - Gaps in semantic layer identified

## Current State Assessment

### Color System (Foundations/Design Tokens/colors.stories.tsx)

**✅ Strengths:**

- Excellent OKLCH breakdown with L/C/H components
- Interactive Token Playground with search
- Real component usage examples
- Copy-to-clipboard functionality
- Statistics dashboard

**❌ Issues Found:**

1. **Line 274-289**: Hardcoded theme example shows HSL, not OKLCH

   ```tsx
   /* Example of theme variables */
   :root {
     --background: 0 0% 100%;        // ❌ This is HSL
     --foreground: 240 10% 3.9%;     // ❌ Should be OKLCH
   ```

2. **Line 234**: Direct Tailwind color utilities instead of tokens

   ```tsx
   <Card className="border-primary/20 bg-primary/5">
   ```

   Should use: `border-(--color-card-primary-border) bg-(--color-card-primary-background)`

3. **Line 68**: Hardcoded border color

   ```tsx
   className = "w-12 h-12 rounded border border-neutral-200";
   ```

   Should use: `border-(--color-border-default)`

4. **Line 123**: Hardcoded background

   ```tsx
   className = "...border bg-background";
   ```

   `bg-background` is acceptable (semantic token), but verify it exists

5. **Missing Brand Colors**: No brand-specific color scale
   - Recommendation: Add `color.brand.*` (50-950 shades)
   - Use case: Primary branding, hero sections, CTAs

6. **Limited Semantic Examples**: Only shows primitive colors
   - Missing: semantic tokens like `color.interactive.*`, `color.status.*`

### Token Coverage Gaps

**Primitive Tokens** (io/processed/primitive.json):

- ✅ Gray (50-950) ✅ Blue ✅ Green ✅ Orange
- ✅ Pink ✅ Purple ✅ Red ✅ Yellow
- ❌ Brand colors (missing)
- ❌ Accent colors (missing)

**Semantic Tokens** (Need to verify):

- Background colors (light/dark)
- Text colors
- Border colors
- Interactive states (hover, active, disabled)
- Status colors (success, warning, error, info)

**Component Tokens** (Need to verify):

- Button (all variants)
- Card
- Input
- Alert
- Badge
- etc.

## Refinement Roadmap

### Phase 1: Foundation Token Stories (Priority: HIGH)

#### Story 1: colors.stories.tsx ⬅️ **START HERE**

**File**: `apps/storybook/stories/Foundations/Design Tokens/colors.stories.tsx`
**Component**: N/A (token showcase)

**Tasks:**

1. Fix hardcoded theme example (lines 274-289) to show actual OKLCH values
2. Replace Tailwind utilities with token references
3. Add semantic color section (background, text, border, interactive, status)
4. Add brand color scale showcase
5. Verify all component usage examples use actual component tokens
6. Add color contrast accessibility checker
7. Add P3 gamut explanation and visual comparison
8. Document token naming conventions

**Cross-Reference Files:**

- `packages/tokens/io/processed/primitive.json` - Primitive colors
- `packages/tokens/io/processed/semantic-light.json` - Light mode semantics
- `packages/tokens/io/processed/semantic-dark.json` - Dark mode semantics
- `packages/tokens/io/processed/component-light.json` - Component tokens
- `packages/tokens/dist/tokens.css` - Generated CSS variables

**Expected Outcome:**

- Accurate OKLCH representation
- 100% token-driven styling
- Expanded to show semantic + component layers
- Brand color integration

---

#### Story 2: typography.stories.tsx

**File**: `apps/storybook/stories/Foundations/Design Tokens/typography.stories.tsx`
**Component**: N/A (typography showcase)

**Tasks:**

1. Verify font loading (Inter, JetBrains Mono)
2. Show all type scales (headings, body, code, labels)
3. Demonstrate line-height ratios
4. Show responsive typography
5. Document font token structure
6. Add token references for font-size, font-weight, line-height, font-family

**Cross-Reference:**

- `packages/tokens/dist/font-loaders.next.ts`
- Font family tokens in primitive.json
- Typography component tokens

---

#### Story 3: spacing.stories.tsx

**File**: `apps/storybook/stories/Foundations/Design Tokens/spacing.stories.tsx`
**Component**: N/A (spacing showcase)

**Tasks:**

1. Verify 4px/8px grid system
2. Show all spacing values with visual examples
3. Demonstrate responsive spacing
4. Show component padding/margin tokens
5. Add composition examples

**Cross-Reference:**

- Spacing tokens in primitive.json
- Component spacing tokens

---

### Phase 2: Core Component Stories (Priority: HIGH)

For each component story:

**Standard Checklist:**

- [ ] Read component implementation (`packages/ui/src/[component].tsx`)
- [ ] Read story file (`apps/storybook/stories/.../[component].stories.tsx`)
- [ ] Verify all props have corresponding controls
- [ ] Check token usage in component (CSS custom properties)
- [ ] Ensure story examples use component, not raw HTML
- [ ] Validate TypeScript interfaces match story args
- [ ] Test all variants and sizes
- [ ] Document accessibility features
- [ ] Add usage guidelines
- [ ] Check dark mode support

**Priority Order:**

1. button.stories.tsx + button.tsx
2. input.stories.tsx + input.tsx
3. card.stories.tsx + card.tsx
4. alert.stories.tsx + alert.tsx
5. badge.stories.tsx + badge.tsx
6. (Continue through all 42 components)

---

### Phase 3: Pattern Stories (Priority: MEDIUM)

Authentication, form, navigation, layout patterns

---

### Phase 4: Documentation Pages (Priority: LOW)

Introduction, Resources, Contributing sections

---

## Token Expansion Recommendations

### 1. Add Brand Color Scale

**File to Update**: `packages/tokens/io/sync/primitive.json`

Add new color scale:

```json
{
  "color": {
    "brand": {
      "50": { "$value": "oklch(...)", "$type": "color" },
      "100": { "$value": "oklch(...)", "$type": "color" },
      // ... 200-900
      "950": { "$value": "oklch(...)", "$type": "color" }
    }
  }
}
```

**Use Cases:**

- Primary branding elements
- Hero sections
- Call-to-action buttons
- Navigation highlights
- Logo colors

### 2. Expand Semantic Tokens

**Files**:

- `packages/tokens/io/processed/semantic-light.json`
- `packages/tokens/io/processed/semantic-dark.json`

**Needed Semantics:**

```json
{
  "color": {
    "background": {
      "primary": "...",
      "secondary": "...",
      "tertiary": "...",
      "inverse": "..."
    },
    "text": {
      "primary": "...",
      "secondary": "...",
      "tertiary": "...",
      "inverse": "...",
      "disabled": "..."
    },
    "border": {
      "default": "...",
      "strong": "...",
      "subtle": "...",
      "interactive": "...",
      "focus": "..."
    },
    "interactive": {
      "primary": {
        "default": "...",
        "hover": "...",
        "active": "...",
        "disabled": "..."
      },
      "secondary": {
        "default": "...",
        "hover": "...",
        "active": "...",
        "disabled": "..."
      }
    },
    "status": {
      "success": { "background": "...", "text": "...", "border": "..." },
      "warning": { "background": "...", "text": "...", "border": "..." },
      "error": { "background": "...", "text": "...", "border": "..." },
      "info": { "background": "...", "text": "...", "border": "..." }
    }
  }
}
```

### 3. Complete Component Tokens

For every component, ensure tokens exist for:

- All backgrounds (default, hover, active, disabled)
- All text colors
- All borders
- All shadows/elevations
- All spacing (padding, margin, gap)

---

## Success Criteria

### Per Story:

- [ ] 100% component usage (no raw HTML)
- [ ] 100% token usage (no Tailwind color utilities)
- [ ] All variants documented
- [ ] Accessibility verified
- [ ] Dark mode tested
- [ ] Copy-paste ready examples
- [ ] Cross-referenced with component implementation

### Overall:

- [ ] Brand colors integrated
- [ ] Complete semantic token layer
- [ ] All 275+ tokens documented
- [ ] Consistent story structure
- [ ] Accurate OKLCH representation
- [ ] P3 gamut explained

---

## Next Steps

1. **Review & Approve** this plan
2. **Start with colors.stories.tsx** refinement
3. **Expand token set** as needed (brand colors, semantic gaps)
4. **Systematic component review** following checklist
5. **Build validation** after each story update
6. **Documentation accuracy** pass at the end

---

**Document Version**: 1.0
**Created**: 2026-01-24
**Status**: Ready for Review
