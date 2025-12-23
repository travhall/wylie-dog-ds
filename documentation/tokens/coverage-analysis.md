# Token Coverage Analysis - Key Findings

Generated: 2025-12-23

## Executive Summary

Analysis of 103 component files in `packages/ui/src/` reveals significant gaps between the refactored token system and current component implementation.

**Critical Stats:**

- **Token Usage:** Only 16 of 307 tokens (5.2%) are actively used
- **Components Coverage:** 39 of 103 components use tokens
- **Unmatched Variables:** 264 CSS custom properties don't match any tokens
- **Naming Pattern Split:** 112 legacy vs 85 modern (0 preferred pattern)

## Current State vs. Desired State

### Naming Convention Migration

| Pattern       | Syntax                                        | Count | Status        |
| ------------- | --------------------------------------------- | ----- | ------------- |
| **Legacy**    | `bg-[var(--color-button-primary-background)]` | 112   | ❌ Deprecated |
| **Modern**    | `bg-(--color-background-primary)`             | 85    | ⚠️ Interim    |
| **Preferred** | `bg-(--background-primary)`                   | 0     | ✅ Target     |

**Key Insight:** No components currently use the preferred pattern (without `color-` prefix). This confirms user's statement that current system is WIP and needs complete overhaul.

## Token Usage by Type

| Type      | Used | Available | Coverage |
| --------- | ---- | --------- | -------- |
| Primitive | 1    | 139       | 0.7%     |
| Semantic  | 14   | 89        | 15.7%    |
| Component | 1    | 79        | 1.3%     |

**Finding:** Component tokens have only 1.3% coverage despite being specifically designed for component usage. This indicates the component token layer needs significant expansion and alignment work.

## Top 10 Most Used Tokens

Understanding which tokens are actively used helps identify what's working:

1. `color.border.focus` - 20 components
2. `color.background.primary` - 13 components
3. `color.text.primary` - 12 components
4. `color.text.secondary` - 10 components
5. `color.border.primary` - 9 components
6. `color.text.danger` - 5 components
7. `color.interactive.secondary` - 5 components
8. `color.interactive.primary` - 3 components
9. `color.background.secondary` - 3 components
10. `badge.radius` - 2 components

**Pattern:** Semantic tokens (background, text, border) see higher usage than component-specific tokens.

## Unmatched CSS Variables - Critical Gaps

**47 components** reference 264 CSS variables that don't exist in the token system. These represent missing component tokens that need to be created.

### Top Components with Unmatched Variables

1. **Badge** (18 unmatched)
   - `--color-badge-default-background`
   - `--color-badge-secondary-background`
   - `--color-badge-success-background`
   - `--color-badge-warning-background`
   - `--color-badge-destructive-background`
   - And 13 more variants

2. **Button** (18 unmatched)
   - `--color-button-primary-background`
   - `--color-button-primary-background-hover`
   - `--color-button-secondary-background`
   - `--color-button-outline-border`
   - `--color-button-ghost-background`
   - And 13 more state variants

3. **Menubar** (14 unmatched)
   - `--color-menubar-trigger-focus`
   - `--color-menubar-trigger-open`
   - `--color-menubar-content-background`
   - And 11 more states

4. **Navigation Menu** (13 unmatched)
   - `--color-navigation-background`
   - `--color-navigation-hover`
   - `--color-navigation-focus`
   - And 10 more states

5. **Alert** (12 unmatched)
   - `--color-alert-default-background`
   - `--color-alert-destructive-background`
   - `--color-alert-warning-background`
   - `--color-alert-success-background`
   - And 8 more variants

### Common Missing Token Patterns

**State Variants:**

- Hover states: `-hover`, `-background-hover`, `-text-hover`
- Active states: `-active`, `-background-active`
- Focus states: `-focus`, `-text-focus`
- Open/Selected states: `-open`, `-selected`, `-checked`

**Component Variants:**

- Alert: `default`, `destructive`, `warning`, `success`
- Badge: `default`, `secondary`, `success`, `warning`, `destructive`, `outline`
- Button: `primary`, `secondary`, `outline`, `ghost`, `link`

**Property Coverage Gaps:**

- Background colors with state variations
- Border colors for different states
- Text colors for contrast in each state

## Recommended Anchor Components

Based on token usage and completeness, these 5 components are ideal for establishing reference patterns:

### 1. Checkbox ✅

- **Tokens Used:** 6
- **Unmatched:** 0
- **Why:** Clean implementation with complete token coverage
- **Path:** `checkbox.tsx`

### 2. Tabs ✅

- **Tokens Used:** 6
- **Unmatched:** 0
- **Why:** Multiple states well-tokenized
- **Path:** `tabs.tsx`

### 3. Site Footer ✅

- **Tokens Used:** 5
- **Unmatched:** 0
- **Why:** Composition example with good patterns
- **Path:** `compositions/site-footer.tsx`

### 4. Dialog ⚠️

- **Tokens Used:** 5
- **Unmatched:** 1
- **Why:** Nearly complete, easy to fix
- **Path:** `dialog.tsx`

### 5. Dropdown Menu ✅

- **Tokens Used:** 5
- **Unmatched:** 0
- **Why:** Interactive states handled well
- **Path:** `dropdown-menu.tsx`

## Components Needing Most Work

These components have the highest number of unmatched variables and should be addressed during systematic overhaul:

1. ~~**Badge** - 18 unmatched (5 variants × 3-4 properties each)~~ ✅ **COMPLETED**
2. ~~**Button** - 18 unmatched (5 variants × 3-4 states each)~~ ✅ **COMPLETED**
3. ~~**Menubar** - 14 unmatched~~ ✅ **COMPLETED**
4. ~~**Navigation Menu** - 13 unmatched~~ ✅ **COMPLETED**
5. ~~**Alert** - 12 unmatched (4 variants × 3 properties each)~~ ✅ **COMPLETED**
6. ~~**Command** - 10 unmatched~~ ✅ **COMPLETED**
7. ~~**Calendar** - 9 unmatched~~ ✅ **COMPLETED**
8. ~~**Select** - 9 unmatched~~ ✅ **COMPLETED**

### Progress Update (2025-12-23)

**Phase 2 Expansion Complete:** Added 83 component tokens across 8 components:

- Badge: Updated to modern syntax (tokens already existed)
- Button: 19 tokens added
- Alert: 12 tokens added
- Menubar: 14 tokens added
- Navigation Menu: 13 tokens added
- Command: 10 tokens added
- Calendar: 8 tokens added
- Input/Select: 7 tokens added

All components now use modern Tailwind 4 syntax `bg-(--color-*)` and have complete token coverage.

## 291 Unused Tokens - Analysis

**Why so many unused tokens?**

1. **Primitive tokens (139):** These are foundation colors not meant for direct use
   - Gray scale: 50, 100, 200, ..., 900, 950 (11 shades)
   - Blue, Red, Green, Yellow, etc. (multiple hues)
   - **Expected:** Primitives should only be used via semantic/component tokens

2. **Semantic tokens (89):** Many semantic tokens exist but aren't referenced
   - Light mode: 89 tokens, only 7 used
   - Dark mode: 89 tokens, only 7 used
   - **Issue:** Components use custom variables instead of semantic tokens

3. **Component tokens (79):** Created but not implemented in components
   - Light mode: 79 tokens, only 1 used
   - Dark mode: 79 tokens, only 0 used
   - **Issue:** Massive disconnect between token system and component implementation

**Conclusion:** This validates the user's statement that "current UI has nothing to do with the token system we just refactored." The token system exists, but components aren't using it.

## Phased Implementation Plan

Based on analysis data and user feedback:

### Phase 1: Pattern Establishment ⚡ START HERE

**Goal:** Establish naming convention and create reference implementations

**Tasks:**

1. Document preferred naming pattern: `bg-(--background-primary)`
2. Create style guide with examples for:
   - Color properties: background, text, border
   - State variants: hover, active, focus, disabled
   - Component variants: default, primary, secondary, destructive, etc.
3. Refactor anchor components (Checkbox, Tabs, Dialog, Dropdown Menu, Site Footer)
4. Document the reference pattern they establish

**Output:** 5 components with clean, standardized token usage

### Phase 2: Token Gap Analysis 🔍

**Goal:** Identify and create missing component tokens

**Tasks:**

1. Review unmatched variables from analysis (264 found)
2. Map to component token structure:
   ```
   button.primary.background
   button.primary.background.hover
   button.primary.text
   button.primary.border
   ```
3. Determine semantic token references:
   ```
   button.primary.background → color.interactive.primary
   button.secondary.background → color.interactive.secondary
   ```
4. Add tokens to Figma and export
5. Run `pnpm process-io && pnpm build`

**Output:** Expanded component token library with full state coverage

### Phase 3: Systematic Overhaul 🔨

**Goal:** Apply established patterns to all components

**Tasks:**

1. Start with components having most unmatched variables:
   - Badge (18), Button (18), Menubar (14), Navigation (13), Alert (12)
2. For each component:
   - Replace legacy `bg-[var(--*)]` with modern `bg-(--*)`
   - Remove `color-` prefix: `--color-background-primary` → `--background-primary`
   - Map to component tokens where they exist
   - Fall back to semantic tokens appropriately
   - Document component-specific token usage
3. Validate with `pnpm report:usage` after each component
4. Track progress (5 components initially, expand outward)

**Output:** 42 components fully aligned with token system

### Phase 4: Validation & Optimization ✅

**Goal:** Ensure complete coverage and consistency

**Tasks:**

1. Run full token validation: `pnpm test:tokens`
2. Run usage analysis: `pnpm report:usage`
3. Target metrics:
   - Component token coverage: >80% (currently 1.3%)
   - Semantic token coverage: >60% (currently 15.7%)
   - Unmatched variables: <10 (currently 264)
   - Components using tokens: >95 of 103 (currently 39)
4. Identify and remove truly unused tokens (if any)
5. Document final token coverage

**Output:** Production-ready token system with comprehensive coverage

## Key Metrics to Track

Use these commands to monitor progress:

```bash
# Full validation (structure, OKLCH, references)
pnpm test:tokens

# Component usage analysis
pnpm report:usage

# Build and verify
pnpm build
```

**Success Criteria:**

- [ ] 0 legacy patterns (`bg-[var(--*)]`)
- [ ] 0 modern interim patterns (`bg-(--color-*)`)
- [ ] 100% preferred patterns (`bg-(--background-*)`)
- [ ] <10 unmatched CSS variables
- [ ] > 80% component token coverage
- [ ] > 95 components using tokens

## Tools Created

### 1. Token Validation (`pnpm test:tokens`)

- OKLCH range validation
- Reference chain validation
- Circular reference detection
- Semantic structure validation

### 2. Component Usage Analysis (`pnpm report:usage`)

- Scans all 103 component files
- Extracts CSS custom properties
- Maps to token registry
- Identifies naming patterns
- Generates comprehensive reports:
  - `io/reports/component-usage-report.txt`
  - `io/reports/component-usage-data.json`

## Next Steps

**Immediate Actions:**

1. Review this analysis with stakeholders
2. Confirm preferred naming pattern: `bg-(--background-primary)`
3. Begin Phase 1: Refactor anchor components (Checkbox, Tabs, Dialog, Dropdown Menu, Site Footer)
4. Document the pattern they establish as reference guide

**Before Starting Implementation:**

- Confirm token naming convention in Figma matches preferred pattern
- Establish clear mapping: Component → Semantic → Primitive
- Set up automated testing for token coverage in CI/CD

## References

- **Pipeline Documentation:** `documentation/tokens/token-pipeline.md`
- **Usage Report:** `packages/tokens/io/reports/component-usage-report.txt`
- **Usage Data (JSON):** `packages/tokens/io/reports/component-usage-data.json`
- **Validation Script:** `packages/tokens/scripts/validate-tokens.js`
- **Analysis Script:** `packages/tokens/scripts/analyze-component-usage.js`
