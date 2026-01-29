# Comprehensive UI & Token Audit Plan

> Generated: 2026-01-29
> Purpose: Systematic audit of all UI components and design tokens to ensure alignment between Figma, tokens, and code.

## Executive Summary

### Current State (from audit script)

| Metric                 | Count         |
| ---------------------- | ------------- |
| Total component tokens | 604           |
| UI components          | 50            |
| Unused tokens          | 283 (47%)     |
| Missing tokens         | 313           |
| Naming issues          | 30 components |
| Phantom tokens         | 12            |

### Coverage by Component

**High Coverage (80%+)** — 7 components

- card (100%) ✅ COMPLETE
- switch (95%)
- alert (89%)
- toggle (86%)
- slider (82%)
- badge (80%)
- checkbox (80%)

**Medium Coverage (50-79%)** — 14 components

- toast (78%)
- avatar (78%)
- skeleton (75%)
- breadcrumb (73%)
- collapsible (67%)
- popover (63%)
- dialog (61%)
- table (60%)
- select (59%)
- sheet (58%)
- input (53%)
- button (50%)
- pagination (50%)
- textarea (50%)

**Low Coverage (<50%)** — 14 components

- command (44%)
- progress (43%)
- tabs (41%)
- accordion (35%)
- form (33%)
- menubar (31%)
- carousel (30%)
- calendar (26%)
- resizable (25%)
- label (14%)

**Zero Coverage** — 9 components

- navigation (0%)
- contextmenu (0%)
- hover-card (0%)
- radio (0%)
- scrollbar (0%)
- context-menu (0%)
- dropdown-menu (0%)
- card-grid (0%)
- feature-grid (0%)
- alert-dialog (0%)
- radio-group (0%)
- navigation-menu (0%)
- toggle-group (0%)
- scroll-area (0%)

---

## Audit Phases

### Phase 1: High-Value Quick Wins

**Goal:** Complete high-coverage components to establish patterns

| Component | Current | Target | Priority |
| --------- | ------- | ------ | -------- |
| switch    | 95%     | 100%   | P1       |
| alert     | 89%     | 100%   | P1       |
| toggle    | 86%     | 100%   | P1       |
| slider    | 82%     | 100%   | P1       |
| badge     | 80%     | 100%   | P1       |
| checkbox  | 80%     | 100%   | P1       |

**Estimated effort:** 1-2 tokens per component

### Phase 2: Core UI Components

**Goal:** Complete the most commonly used components

| Component | Current | Target | Priority |
| --------- | ------- | ------ | -------- |
| button    | 50%     | 100%   | P1       |
| input     | 53%     | 100%   | P1       |
| select    | 59%     | 100%   | P1       |
| dialog    | 61%     | 100%   | P1       |
| toast     | 78%     | 100%   | P2       |
| form      | 33%     | 100%   | P2       |

### Phase 3: Navigation & Layout

**Goal:** Complete navigation and layout components

| Component       | Current | Target | Priority |
| --------------- | ------- | ------ | -------- |
| tabs            | 41%     | 100%   | P2       |
| accordion       | 35%     | 100%   | P2       |
| menubar         | 31%     | 100%   | P2       |
| navigation      | 0%      | 100%   | P2       |
| navigation-menu | 0%      | 100%   | P2       |
| breadcrumb      | 73%     | 100%   | P2       |

### Phase 4: Data Display

**Goal:** Complete data display components

| Component  | Current | Target | Priority |
| ---------- | ------- | ------ | -------- |
| table      | 60%     | 100%   | P2       |
| calendar   | 26%     | 100%   | P3       |
| pagination | 50%     | 100%   | P2       |
| progress   | 43%     | 100%   | P2       |
| skeleton   | 75%     | 100%   | P2       |
| avatar     | 78%     | 100%   | P2       |

### Phase 5: Overlays & Popovers

**Goal:** Complete overlay components

| Component     | Current | Target | Priority |
| ------------- | ------- | ------ | -------- |
| popover       | 63%     | 100%   | P2       |
| sheet         | 58%     | 100%   | P2       |
| hover-card    | 0%      | 100%   | P3       |
| context-menu  | 0%      | 100%   | P3       |
| dropdown-menu | 0%      | 100%   | P3       |
| alert-dialog  | 0%      | 100%   | P3       |
| command       | 44%     | 100%   | P3       |

### Phase 6: Remaining Components

**Goal:** Complete all remaining components

| Component    | Current | Target | Priority |
| ------------ | ------- | ------ | -------- |
| carousel     | 30%     | 100%   | P3       |
| resizable    | 25%     | 100%   | P3       |
| label        | 14%     | 100%   | P3       |
| textarea     | 50%     | 100%   | P3       |
| radio        | 0%      | 100%   | P3       |
| radio-group  | 0%      | 100%   | P3       |
| toggle-group | 0%      | 100%   | P3       |
| scroll-area  | 0%      | 100%   | P3       |
| scrollbar    | 0%      | 100%   | P3       |
| collapsible  | 67%     | 100%   | P3       |

### Phase 7: Compositions & Patterns

**Goal:** Complete composition-level tokens

| Component    | Current | Target | Priority |
| ------------ | ------- | ------ | -------- |
| card-grid    | 0%      | 100%   | P3       |
| feature-grid | 0%      | 100%   | P3       |

---

## Per-Component Audit Workflow

For each component, follow this checklist:

### 1. Pre-Audit

```bash
# Run audit for specific component
node packages/tokens/scripts/audit-tokens.js --component {name} --verbose

# Generate token map for reference
node packages/tokens/scripts/generate-token-map.js --component {name}
```

### 2. Token Inventory

- [ ] Compare Figma tokens vs `io/sync/components.json`
- [ ] Identify phantom tokens (remove if not in Figma)
- [ ] Identify missing tokens (add from Figma)
- [ ] Verify token grouping (all component tokens contiguous)
- [ ] Check naming conventions (prefer dot notation)

### 3. Component Implementation

- [ ] Read the component source file
- [ ] Verify Tailwind 4 syntax: `utility-(--css-variable)`
- [ ] Check for hardcoded values that should be tokens
- [ ] Verify type hints for font-size: `text-(length:--var)`
- [ ] Verify layout utilities match CSS requirements (flex for gap, etc.)
- [ ] Update component to use all defined tokens

### 4. Build & Test

```bash
# Rebuild tokens
pnpm --filter @wyliedog/tokens build

# Rebuild UI
pnpm --filter @wyliedog/ui build

# Start Storybook
pnpm --filter storybook dev
```

### 5. Visual Verification

- [ ] Component renders correctly in Storybook
- [ ] DevTools shows correct CSS variable values
- [ ] Dark mode works correctly
- [ ] All variants are properly styled

### 6. Re-Audit

```bash
# Verify 100% coverage
node packages/tokens/scripts/audit-tokens.js --component {name}
```

---

## Naming Convention Resolution

The audit found 30 components with mixed naming conventions. The pattern:

**Current mixed state:**

- `card.header.gap` (dot notation)
- `card.header.title.font-size` (hyphen in type suffix)

**Decision needed:** Standardize on one approach:

**Option A: All dots** (not recommended)

- `card.header.title.font.size`
- Loses semantic meaning of compound type names

**Option B: Dots for hierarchy, hyphens for type suffixes** (recommended)

- `card.header.title.font-size`
- `card.header.gap`
- Preserves compound type names like `font-size`, `line-height`, `padding-top`

**Resolution:** The naming convention warning in the audit is informational only. The current mixed approach is intentional and correct — hierarchy uses dots, compound type names use hyphens.

---

## Phantom Token Resolution

The audit found 12 phantom tokens. These are tokens that exist in `components.json` but are scattered far from their component's main token group.

**Process:**

1. For each phantom token, verify it exists in Figma
2. If not in Figma: remove from `components.json`
3. If in Figma: relocate to be with other component tokens

---

## Automation Tools

### Available Scripts

```bash
# Full audit
pnpm --filter @wyliedog/tokens audit

# Verbose audit
pnpm --filter @wyliedog/tokens audit:verbose

# Component-specific audit
node packages/tokens/scripts/audit-tokens.js --component {name} --verbose

# Generate token map (with markdown docs)
pnpm --filter @wyliedog/tokens generate:token-map

# JSON output for CI
node packages/tokens/scripts/audit-tokens.js --json
```

### CI Integration (Future)

Consider adding to CI pipeline:

```yaml
- name: Token Audit
  run: |
    node packages/tokens/scripts/audit-tokens.js --json > audit-results.json
    # Fail if missing tokens or phantoms found
    if [ $(jq '.summary.missingTokens' audit-results.json) -gt 0 ]; then
      exit 1
    fi
```

---

## Success Criteria

The audit is complete when:

1. **All components at 100% token coverage**
2. **Zero missing tokens** (no tokens referenced but undefined)
3. **Zero phantom tokens** (no tokens scattered outside their group)
4. **Zero unused tokens** (or documented as intentionally reserved)
5. **All Storybook stories visually verified**
6. **Dark mode works for all components**

---

## Reference Documents

- [Component Token Audit Guide](./COMPONENT-TOKEN-AUDIT-GUIDE.md) — Detailed audit procedures
- [Token System Overview](./tokens/token-system.md)
- [Naming Convention Guide](./tokens/naming-convention.md)
- [Figma Import Guide](./guides/FIGMA-IMPORT-GUIDE.md)
