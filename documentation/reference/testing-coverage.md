# Testing and Coverage Status

**Last Updated:** November 9, 2026
**Overall Coverage:** 99.63% lines / 99.29% statements (exceeds 80% threshold)
**Tests Passing:** 1,783 | **Tests Skipped:** 0

Numbers come from `pnpm --filter @wyliedog/ui test:coverage`; re-run it rather than trusting this snapshot. `pnpm check:docs:coverage` runs it and fails if the four percentages in the table below no longer match; plain `pnpm check:docs` does the same comparison whenever a fresh coverage run is on disk. Passing and skipped test counts are not checked.

## Coverage Breakdown

| Metric     | Current | Target | Status            |
| ---------- | ------- | ------ | ----------------- |
| Statements | 99.29%  | 80%    | ✅ Pass (+19.17%) |
| Lines      | 99.63%  | 80%    | ✅ Pass (+19.63%) |
| Functions  | 99.10%  | 80%    | ✅ Pass (+19.10%) |
| Branches   | 92.87%  | 70%    | ✅ Pass (+22.87%) |

### Component Coverage

- **Component tests:** 99.63% lines overall (every component is tested; no test is skipped)
- **Utility tests:** 100% lines (utils.ts), 98.78% lines (test-utils.ts)
- **Test files:** 61 passing test files

## Skipped Tests

None. The UI suite runs 1,783 tests and skips 0.

Until 2026-11-09, 62 tests were skipped (tooltip 31, select 15, sheet 9, popover 6, navigation-menu 1) with the note "portal rendering needs async test infrastructure". That reason did not hold: Radix portals render fine under jsdom with `user-event` and `waitFor`, and the accessibility tests next to the skips had always passed with the same pattern. The skips were removed in PRs 78 and 79. Of the 62, 46 passed as soon as the skips came off, and 16 were ordinary test bugs, not component bugs (see "Testing Radix Portals in jsdom" below).

Keep it at zero: fix a failing test or delete it; do not skip it.

---

## Lowest Branch Coverage

Branch coverage (92.87%) trails line coverage because the gaps are untaken conditional branches in otherwise-tested files. The lowest files in the 2026-11-03 run:

| File               | Branches | Uncovered                                 |
| ------------------ | -------- | ----------------------------------------- |
| `switch.tsx`       | 66.66%   | line 56                                   |
| `section-hero.tsx` | 68.08%   | several branches (lines 93, 120, 157-193) |
| `checkbox.tsx`     | 75%      | lines 66-78                               |
| `radio-group.tsx`  | 80%      | line 75                                   |

`context-menu`, `dropdown-menu` and `menubar` were the lowest before `*.helpers.test.tsx` added tests for their `inset` variants, labels, shortcuts and sub-menus. `toast`, `feature-grid`, `slider` and `card-grid` were the lowest until 2026-11-03: tests now cover the `Toaster` render, per-thumb slider labels, grid column and gap variants, and feature badges. The one branch left in `toast.tsx` is the `idx > -1` guard in the listener cleanup, which cannot be false in practice.

---

## Coverage Exclusions

The following files are intentionally excluded from coverage calculation:

```typescript
// vitest.config.ts
exclude: [
  "node_modules/",
  "src/test-setup.ts",
  "**/*.d.ts",
  "**/*.config.*",
  "dist/",
  "src/tokens/**", // Generated files
  "src/styles/**", // CSS files
  "src/accessibility-example.tsx", // Example/documentation code
  "src/lib/accessibility.tsx", // Accessibility utilities documentation
];
```

**Why excluded:**

- `accessibility-example.tsx`: Example/documentation file, not production code
- `accessibility.tsx`: Documentation for accessibility patterns, not used in production

---

## Testing Radix Portals in jsdom

Radix renders Tooltip, Select, Sheet, Popover and similar content in a portal appended to `document.body`. Query it with `screen`, not the render container: open it with `user.click` or `user.hover`, then `await waitFor(...)`. The gotchas that had hidden behind the old skips:

- **Closing a tooltip.** Radix keeps a tooltip open while the pointer is inside its hover grace area, and jsdom has no layout (every rect is 0,0), so `user.unhover` alone never leaves it. Follow it with `fireEvent.pointerMove(document.body, { clientX: 500, clientY: 500 })` (the `leave()` helper in `tooltip.test.tsx`).
- **Duplicate accessible names.** A Select trigger shows the selected value, so `getByText("Apple")` matches the trigger and the option: use `getByRole("option", { name: "Apple" })`. Sheet and Dialog have a built-in X button named "Close", so do not name your own control "Close".
- **Separators.** Radix Select's separator has no `role="separator"`: give it a `data-testid`.
- **Keyboard selection.** Opening a Select focuses the first item, so one ArrowDown then Enter selects the second.
- **Navigation menu.** With one item open, hover the next one to switch; a click on top of the hover appears to toggle it closed again.
- **Wrapper elements.** `getByText(...)` returns the element that directly contains the text, not its parent.
- **Class assertions.** Components bind every value to a component token, so assert the `...-(--token)` classes the component renders, not Tailwind scale classes.

---

## Test File Inventory

### Fully Tested Components (100% coverage)

- accordion.tsx
- alert-dialog.tsx
- alert.tsx
- aspect-ratio.tsx
- avatar.tsx
- badge.tsx
- breadcrumb.tsx
- button.tsx
- calendar.tsx
- card.tsx
- carousel.tsx
- checkbox.tsx
- collapsible.tsx
- dialog.tsx
- dropdown-menu.tsx
- form.tsx
- hover-card.tsx
- input.tsx
- label.tsx
- navigation-menu.tsx
- pagination.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- resizable.tsx ✅ (added Dec 17, 2025)
- scroll-area.tsx
- separator.tsx
- sheet.tsx
- skeleton.tsx
- slider.tsx
- switch.tsx
- table.tsx
- tabs.tsx
- textarea.tsx
- toast.tsx
- toggle-group.tsx
- toggle.tsx
- tooltip.tsx

### Utility Files (100% coverage)

- utils.ts ✅ (14 tests added Dec 17, 2025)
- test-utils.ts ✅ (31 tests added Dec 17, 2025)

### Excluded Files (0% coverage - intentional)

- accessibility-example.tsx (documentation)
- lib/accessibility.tsx (documentation)
- .eslintrc.js (config)

---

## Quick Reference: How to Run Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm --filter @wyliedog/ui test -- --coverage

# Run specific test file
pnpm test src/__tests__/button.test.tsx

# Run tests in watch mode
pnpm test -- --watch

# Run only accessibility tests
TEST_PATTERN="Accessibility" pnpm test
```

---

## Coverage History

| Date         | Coverage                           | Change      | Notes                                                                                                            |
| ------------ | ---------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Dec 16, 2025 | 75.75%                             | Baseline    | 70 tests skipped, initial state                                                                                  |
| Dec 17, 2025 | 78.04%                             | +2.29%      | Fixed separator tests (context-menu, menubar)                                                                    |
| Dec 17, 2025 | 79.63%                             | +1.59%      | Added utils.ts and test-utils.ts tests                                                                           |
| Dec 17, 2025 | 95.41%                             | +15.78%     | Added resizable.test.tsx + excluded docs files                                                                   |
| Jul 5, 2026  | 95.06%                             | -0.35%      | Fixed CommandEmpty role=status regression, enabling test:coverage to complete; refreshed stale Dec 2025 snapshot |
| Oct 14, 2026 | 98.02% statements, 82.93% branches | +1.3 / +3.3 | Added helper-component tests for context-menu, dropdown-menu and menubar (branches were 79.62%)                  |
| Nov 9, 2026  | 99.15% statements, 92.25% branches | +0.13 / 0   | Un-skipped the last 62 tests (tooltip, select, sheet, popover, navigation-menu); none are skipped now            |

---

## Recommendations

### Current Approach

1. Keep zero skipped tests: fix a failing test or delete it, do not skip it.
2. Keep 95%+ coverage; `pnpm check:docs:coverage` fails when the figures above drift from a real run.
3. Test portal components with the patterns in "Testing Radix Portals in jsdom". Storybook is still the place to check how they look and feel.

### If Time Permits

1. Consider E2E tests with Playwright for critical user flows that involve portals and real layout (hover grace areas, positioning).

---

## Questions?

For questions about test coverage, reference this document or check:

- Individual test files for the patterns used
- `vitest.config.ts` for coverage configuration
- Storybook for visual verification of portal components
