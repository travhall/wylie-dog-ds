# Token Coverage Audit — Wylie Dog Design System

## Overview

This document is the canonical token coverage audit for the Wylie Dog Design System, establishing the baseline for **Phase 1.2 (3-tier enforcement)** and **Phase 1.3 (new token categories)**. Phase 1.2 will enforce strict layering — primitive tokens consumed only by semantic/component layers, never directly by components. Phase 1.3 will introduce missing token categories (z-index, opacity, motion, elevation) and formalize hardcoded utility patterns as reusable tokens.

## Methodology

**Scope:** All 44 top-level components in `packages/ui/src/*.tsx` (excluding `__tests__/` and `compositions/`), audited against actual token consumption in each component's className expressions and the token definitions in `packages/tokens/io/sync/components.json`.

**Audit process:**

1. Scanned every `.tsx` component for `cn()` calls and className patterns
2. Identified token references (e.g. `bg-(--color-button-primary-background)`, `space-button-radius`)
3. Cross-referenced hardcoded utility classes (e.g. `transition-colors`, `z-50`, `opacity-50`)
4. Mapped component structure to token namespace entries in `components.json`
5. Flagged missing namespaces, direct primitive usage, and 3-tier violations

**State legend:**

- ✅ component-layer tokens exist AND are actively consumed
- 🟡 uses semantic/primitive tokens directly (no component-layer token wrapper)
- ❌ hardcoded value or utility class where a token should exist
- — not relevant for this component
- n/a category not yet defined in the token system

---

## Coverage Matrix

| Component      | Color | Space | Radius | Type | Shadow | Motion | Z-Index | Opacity | Border | Notes                                                                                                                              |
| -------------- | ----- | ----- | ------ | ---- | ------ | ------ | ------- | ------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Accordion      | ✅    | ✅    | ✅     | ✅   | —      | ✅     | —       | 🟡      | ✅     | Uses `animate-in/animate-out`; opacity hardcoded in disabled state                                                                 |
| Alert          | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Complete; well-tokenized                                                                                                           |
| AlertDialog    | ✅    | ✅    | ✅     | ✅   | —      | 🟡     | ❌      | —       | ✅     | Backdrop uses `z-50` hardcoded; `fade-in-0`/`fade-out-0` animations in `cn()`                                                      |
| AspectRatio    | —     | —     | —      | —    | —      | —      | —       | —       | —      | Primitive wrap; no tokens defined (intentional)                                                                                    |
| Avatar         | ✅    | —     | ✅     | ✅   | —      | —      | —       | —       | —      | Image uses aspect-square; no space tokens                                                                                          |
| Badge          | ✅    | ✅    | ✅     | ✅   | —      | ❌     | —       | —       | ✅     | `transition-colors` hardcoded; should reference motion token                                                                       |
| Breadcrumb     | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Well-tokenized structure                                                                                                           |
| Button         | ✅    | ✅    | ✅     | ✅   | —      | ❌     | —       | ✅      | ✅     | Primary gap: `transition-colors` hardcoded; opacity-disabled tokenized ✅                                                          |
| Calendar       | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Well-structured with space tokens for grid cells                                                                                   |
| Card           | ✅    | ✅    | ✅     | ✅   | ✅     | —      | —       | —       | ✅     | Excellent coverage; all major properties tokenized (`shadow.card-shadow`)                                                          |
| CardGrid       | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Uses card tokens; gap/padding via space tokens                                                                                     |
| Carousel       | ✅    | ✅    | ✅     | —    | —      | —      | —       | —       | —      | `-ml-(--space-carousel-item-spacing)` demonstrates negative spacing token usage                                                    |
| Checkbox       | ✅    | ✅    | ✅     | —    | —      | —      | —       | —       | ✅     | Well-structured; minimal but complete                                                                                              |
| Collapsible    | —     | ✅    | —      | —    | —      | ❌     | —       | —       | —      | Uses `animate-collapsible-down/up` hardcoded; should be motion token                                                               |
| Command        | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | 🟡      | ✅     | `opacity-disabled` muted state via shorthand utility; no motion tokens                                                             |
| ContextMenu    | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Good coverage; uses component-layer tokens                                                                                         |
| Dialog         | ✅    | ✅    | ✅     | ✅   | —      | ❌     | ❌      | —       | ✅     | **Critical:** `z-50` hardcoded ([dialog.tsx:21](packages/ui/src/dialog.tsx)); `animate-in/animate-out` missing motion tokens       |
| DropdownMenu   | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Complete component-layer coverage                                                                                                  |
| FeatureGrid    | ✅    | ✅    | ✅     | ✅   | ❌     | ❌     | —       | —       | ✅     | `shadow-sm` hardcoded ([feature-grid.tsx:26](packages/ui/src/feature-grid.tsx)); `transition-transform duration-500` not tokenized |
| Form           | ✅    | ✅    | —      | ✅   | —      | —      | —       | —       | ✅     | Error message margin uses space token; good structure                                                                              |
| HoverCard      | 🟡    | 🟡    | —      | —    | —      | ❌     | ❌      | —       | —      | Minimal tokens; `z-50` and `animate-in/zoom-in-95` hardcoded                                                                       |
| Input          | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | ✅      | ✅     | Complete; focus ring and disabled states well-tokenized                                                                            |
| Label          | ✅    | —     | —      | ✅   | —      | —      | —       | —       | —      | Minimal; typography only                                                                                                           |
| MenuBar        | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Comprehensive coverage                                                                                                             |
| NavigationMenu | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Well-structured; uses component-layer tokens throughout                                                                            |
| Pagination     | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Good coverage across all properties                                                                                                |
| Popover        | 🟡    | 🟡    | —      | —    | —      | ❌     | ❌      | —       | —      | Minimal tokens; `z-50` hardcoded, animations not tokenized                                                                         |
| Progress       | ✅    | ✅    | —      | —    | —      | —      | —       | —       | ✅     | Complete for used properties                                                                                                       |
| RadioGroup     | ✅    | ✅    | ✅     | —    | —      | —      | —       | —       | ✅     | Focused scope; well-executed                                                                                                       |
| Resizable      | —     | —     | —      | —    | —      | —      | —       | —       | —      | Primitive wrapper; minimal token definitions (intentional)                                                                         |
| ScrollArea     | 🟡    | 🟡    | —      | —    | —      | —      | —       | —       | 🟡     | Uses `scrollbar-*` tokens; very limited coverage                                                                                   |
| Select         | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Comprehensive; good structure                                                                                                      |
| Separator      | ✅    | ✅    | —      | —    | —      | —      | —       | —       | —      | Minimal scope; complete for what it does                                                                                           |
| Sheet          | ✅    | ✅    | ✅     | ✅   | —      | 🟡     | ❌      | —       | ✅     | `z-50` hardcoded; animation states use hardcoded `animate-in/animate-out`                                                          |
| Skeleton       | —     | 🟡    | —      | —    | —      | —      | —       | ❌      | —      | Uses opacity-based pulse; motion token missing                                                                                     |
| Slider         | ✅    | ✅    | ✅     | —    | —      | —      | —       | —       | ✅     | Functional; complete for slider semantics                                                                                          |
| Switch         | ✅    | ✅    | ✅     | —    | —      | —      | —       | —       | ✅     | Complete coverage for toggle component                                                                                             |
| Table          | ✅    | ✅    | —      | ✅   | —      | —      | —       | —       | ✅     | Complete row/cell structure                                                                                                        |
| Tabs           | ✅    | ✅    | ✅     | ✅   | 🟡     | ❌     | —       | ✅      | ✅     | Tab trigger shadow via `shadow-sm`; `transition-all` hardcoded ([tabs.tsx:63](packages/ui/src/tabs.tsx))                           |
| TextArea       | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | ✅      | ✅     | Excellent; mirrors Input with proper tokenization                                                                                  |
| Toast          | ✅    | ✅    | ✅     | ✅   | ✅     | ❌     | —       | ❌      | ✅     | Animations (`animate-in/animate-out`) hardcoded; opacity-disabled missing                                                          |
| Toggle         | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Complete; focused scope                                                                                                            |
| ToggleGroup    | ✅    | ✅    | ✅     | ✅   | —      | —      | —       | —       | ✅     | Good structure for group variant                                                                                                   |
| Tooltip        | 🟡    | ✅    | ✅     | ✅   | ❌     | ❌     | ❌      | —       | ✅     | `z-50` hardcoded ([tooltip.tsx:31](packages/ui/src/tooltip.tsx)); `shadow-` should be shadow-md token; animations hardcoded        |

---

## Hardcoded Utility Hot List

The following Tailwind utilities appear hardcoded across components and represent the biggest opportunities for Phase 1.3 token expansion:

| Utility                    | Count | Used in                                                                                     | Suggested token                                                                     |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `transition-colors`        | 21    | Button, Badge, Breadcrumb, DropdownMenu, Input, Tabs, Checkbox, Switch, Toggle, ToggleGroup | `motion.transition.color` (= `motion.duration.standard` + `motion.easing.standard`) |
| `animate-in`               | 19    | Dialog, Sheet, Tooltip, Toast, Popover, HoverCard, Alert                                    | `motion.animation.enter`                                                            |
| `animate-out`              | 19    | Dialog, Sheet, Tooltip, Toast, Popover, HoverCard, Alert                                    | `motion.animation.exit`                                                             |
| `z-50`                     | 14    | Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu          | `z-index.modal` (or `z-index.popover` / `.tooltip` per role)                        |
| `opacity-50`               | 9     | Various disabled/muted states                                                               | `opacity.interactive.disabled`                                                      |
| `shadow-md`                | 8     | Card, Tabs, Tooltip, FeatureGrid                                                            | `elevation.medium`                                                                  |
| `shadow-lg`                | 8     | Toast, Sheet, DropdownMenu, ContextMenu                                                     | `elevation.large`                                                                   |
| `fade-in-0`                | 8+    | Tooltip, Dialog, Popover                                                                    | `motion.animation.fadeIn`                                                           |
| `transition-all`           | 7     | Card, FeatureGrid, Toast, NavigationMenu, MenuBar                                           | `motion.transition.all`                                                             |
| `slide-in-from-*`          | 6+    | Tooltip (sides), Sheet, Popover                                                             | `motion.animation.slideIn` (+ direction)                                            |
| `zoom-in-95`               | 3+    | Tooltip, Popover, HoverCard                                                                 | `motion.animation.zoomIn`                                                           |
| `shadow-sm`                | 2     | Tabs, FeatureGrid                                                                           | `elevation.small`                                                                   |
| `animate-collapsible-down` | 1     | Collapsible                                                                                 | `motion.animation.expandDown`                                                       |
| `animate-collapsible-up`   | 1     | Collapsible                                                                                 | `motion.animation.expandUp`                                                         |
| `opacity-disabled`         | 24    | Button, Input, Tabs, Badge, Command, Toast, etc.                                            | Already tokenized ✅ — keep                                                         |

---

## Components Missing a Complete Token Namespace

| Component       | Reason                                     | Priority                                 |
| --------------- | ------------------------------------------ | ---------------------------------------- |
| **AspectRatio** | Pure primitive wrapper; no UI chrome       | Low (intentional)                        |
| **Resizable**   | Primitive wrapper for drag handles         | Low (intentional)                        |
| **ScrollArea**  | Only scrollbar tokens exist                | Medium — add scroll-track / thumb tokens |
| **HoverCard**   | `z-50` hardcoded, minimal animation tokens | High — popover-adjacent visibility       |
| **Popover**     | `z-50` hardcoded, no motion tokens         | High — ubiquitous in UI                  |
| **Skeleton**    | No color/shape tokens; opacity-pulse only  | Low                                      |
| **Collapsible** | Animation names hardcoded                  | Medium — used in Accordion               |

---

## 3-Tier Violations (Direct Primitive / Semantic-Skipping)

Components that reference primitives directly when Phase 1.2 would mandate a component-layer intermediary:

1. **HoverCard + Popover** — both use `z-50` instead of `z-index.popover` semantic → component token
   - [hover-card.tsx:21](apps/figma-plugin/) · [popover.tsx:21](packages/ui/src/popover.tsx)
2. **Dialog + Sheet + AlertDialog** — all hardcode `z-50` in overlay
   - [dialog.tsx:21](packages/ui/src/dialog.tsx) · [sheet.tsx:~20](packages/ui/src/sheet.tsx) · [alert-dialog.tsx:~18](packages/ui/src/alert-dialog.tsx)
3. **Tabs** — uses `shadow-sm` instead of `tabs.trigger.shadow-active` → `elevation.small`
   - [tabs.tsx:68](packages/ui/src/tabs.tsx) (`data-[state=active]:shadow-sm`)
4. **FeatureGrid** — uses `shadow-sm` and raw `transition-transform duration-500`
   - [feature-grid.tsx:26](packages/ui/src/feature-grid.tsx)

---

## Proposed New Token Categories (Phase 1.3)

### 1. `z-index.*`

**Hardcoded today:** 14 instances of `z-50` across overlays.

```json
{
  "z-index": {
    "base": { "$type": "number", "$value": 0 },
    "dropdown": { "$type": "number", "$value": 10 },
    "sticky": { "$type": "number", "$value": 20 },
    "fixed": { "$type": "number", "$value": 30 },
    "modal-backdrop": { "$type": "number", "$value": 40 },
    "modal": { "$type": "number", "$value": 50 },
    "popover": { "$type": "number", "$value": 60 },
    "tooltip": { "$type": "number", "$value": 70 },
    "toast": { "$type": "number", "$value": 80 }
  }
}
```

**Components affected:** Dialog, Sheet, AlertDialog, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Toast.

### 2. `opacity.*`

**Hardcoded today:** 9 instances of `opacity-50` plus inconsistent muted/subtle usage.

```json
{
  "opacity": {
    "full": { "$type": "number", "$value": 1 },
    "interactive": {
      "hover": { "$type": "number", "$value": 0.8 },
      "active": { "$type": "number", "$value": 0.9 },
      "disabled": { "$type": "number", "$value": 0.5 }
    },
    "semantic": {
      "muted": { "$type": "number", "$value": 0.7 },
      "subtle": { "$type": "number", "$value": 0.6 },
      "overlay": { "$type": "number", "$value": 0.4 },
      "scrim": { "$type": "number", "$value": 0.8 }
    }
  }
}
```

The existing `state.opacity.disabled` token stays — `opacity.interactive.disabled` should reference it.

### 3. `motion.duration.*` and `motion.easing.*`

**Hardcoded today:** 21 × `transition-colors`, 19 × `animate-in`/`animate-out`, plus `transition-all`, `transition-transform`, custom `duration-500`.

```json
{
  "motion": {
    "duration": {
      "instant": { "$type": "duration", "$value": "0ms" },
      "fast": { "$type": "duration", "$value": "100ms" },
      "standard": { "$type": "duration", "$value": "200ms" },
      "normal": { "$type": "duration", "$value": "300ms" },
      "slow": { "$type": "duration", "$value": "500ms" }
    },
    "easing": {
      "linear": { "$type": "cubicBezier", "$value": [0, 0, 1, 1] },
      "standard": { "$type": "cubicBezier", "$value": [0.4, 0, 0.2, 1] },
      "decelerate": { "$type": "cubicBezier", "$value": [0, 0, 0.2, 1] },
      "accelerate": { "$type": "cubicBezier", "$value": [0.4, 0, 1, 1] },
      "sharp": { "$type": "cubicBezier", "$value": [0.4, 0, 0.6, 1] }
    }
  }
}
```

Compound transition tokens (`motion.transition.color`, `motion.transition.all`, etc.) and animation tokens (`motion.animation.enter`, `motion.animation.fadeIn`, etc.) are derived in component layer or via Tailwind plugin — exact shape decided during 1.3 implementation.

### 4. `elevation.*`

**Hardcoded today:** 18 instances of `shadow-{sm,md,lg}`.

```json
{
  "elevation": {
    "0": { "$type": "shadow", "$value": "none" },
    "1": { "$type": "shadow", "$value": "0 1px 2px 0 oklch(0 0 0 / 0.05)" },
    "2": { "$type": "shadow", "$value": "0 4px 6px -1px oklch(0 0 0 / 0.1)" },
    "3": { "$type": "shadow", "$value": "0 10px 15px -3px oklch(0 0 0 / 0.1)" },
    "4": { "$type": "shadow", "$value": "0 20px 25px -5px oklch(0 0 0 / 0.1)" }
  }
}
```

Existing `shadow.card-shadow` and similar component tokens become references to elevation tiers.

---

## Prioritized Work List

### Phase 1.3 (Token additions — additive, low risk, do first)

1. **Add `z-index.*` primitives** (1.5h) — JSON + Style Dictionary output + Tailwind plugin reference. Zero component changes; just makes the tokens available.
2. **Add `opacity.*` primitives** (1.5h) — same scope, additive only.
3. **Add `motion.duration.*` and `motion.easing.*` primitives** (2h).
4. **Add `elevation.*` primitives** (1.5h).
5. **Add component-layer tokens that reference the new primitives** (3h) — e.g. `dialog.overlay.z-index → {z-index.modal}`, `popover.shadow → {elevation.2}`, `button.transition.duration → {motion.duration.standard}`. No component .tsx changes yet.

### Phase 1.2 (Component migration — depends on 1.3)

6. **Unify overlay z-index across Dialog/Sheet/AlertDialog/Popover/HoverCard/Tooltip/DropdownMenu/ContextMenu/Toast** (2h) — replace hardcoded `z-50` with `z-(--z-index-{modal,popover,tooltip,toast})`.
7. **Migrate `transition-colors` (21 instances) to motion tokens** (3h) — sweep across Button, Badge, Breadcrumb, DropdownMenu, Input, Tabs, Checkbox, Switch, Toggle, ToggleGroup.
8. **Migrate `animate-in`/`animate-out` (19 each) to motion animation tokens** (3h) — Dialog, Sheet, Tooltip, Toast, Popover, HoverCard, Alert.
9. **Migrate `shadow-{sm,md,lg}` (18 instances) to elevation tokens** (1.5h) — Tabs, FeatureGrid, Card variants.
10. **Migrate `opacity-50` and other ad-hoc opacity (9 instances) to opacity tokens** (1h).
11. **Audit `opacity-disabled` consistency** across the 24 callsites (1h) — already tokenized, just verify.

### Cross-cutting

12. **ESLint rule (or tailwindcss-no-restricted-classes plugin) blocking `z-50`, `transition-colors`, `transition-all`, `shadow-sm`, `shadow-md`, `shadow-lg`, `opacity-50`, `animate-in`, `animate-out` in `packages/ui/src/*.tsx`** (2h) — prevents regression after Phase 1.2 migration. Allow-list for Storybook stories.
13. **Update `validate-tokens.js` to enforce the 3-tier layer order** (2h) — primitives reference nothing; semantic references only primitives; components references semantic + primitives.
14. **Coverage matrix regeneration script** (1h) — turn this audit into a script that reads `components.json` + greps `packages/ui/src/` and regenerates the matrix above. Keeps the doc honest.

**Total effort estimate: ~26 hours** spread across Phases 1.2 and 1.3.
