# Token Coverage Audit

How far the UI components consume the design tokens, and what is still hardcoded. Re-audited **October 13, 2026**; the previous audit (April 2026) predates the token categories it proposed.

## Regenerate

```bash
pnpm --filter @wyliedog/tokens build
pnpm --filter @wyliedog/tokens report:coverage
```

`scripts/coverage-matrix.mjs` reads the built CSS in `dist/` and every top-level `packages/ui/src/*.tsx`, then prints the tables in the Snapshot section. Copy the output over that section when it changes. It counts only token names that actually exist in the built CSS.

## What changed since April 2026

The April audit proposed four new token categories and counted the hardcoded utilities they would replace. All four categories now exist, and two of the four migrations are done.

| Area    | April 2026                                      | October 2026                                                                                                                                                                                                                                |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Z-index | 14 × hardcoded `z-50`                           | **Migrated.** Tokens `--z-index-{base,dropdown,sticky,fixed,modal-backdrop,modal,popover,tooltip,toast}` exist; overlays use them (`z-(--z-index-modal)`). One `z-1` remains in `navigation-menu`, a local stacking order for its indicator |
| Shadow  | 18 × `shadow-sm/md/lg`                          | **Migrated.** No hardcoded `shadow-sm/md/lg/xl`; components use `shadow-(--shadow-*)`. The tokens are named `--shadow-*`, not the proposed `elevation.*`                                                                                    |
| Opacity | 9 × `opacity-50`                                | **Migrated.** `--opacity-interactive-{hover,active,disabled}`, `--opacity-{muted,subtle,overlay,scrim}` exist. One `opacity-100` remains in `input`, a webkit spin-button reset                                                             |
| Motion  | 21 × `transition-colors`, 19 × `animate-in/out` | **Tokens exist, migration open.** `--duration-{instant,fast,normal,slow}` and `--transition-easing-{default,in,out,in-out}` exist. See below                                                                                                |

Counts are not strictly comparable: April counted each utility separately by hand; the script counts regex matches per file.

## Open: motion

- `transition*` utilities (`transition-colors`, `transition-all`, …) appear **38 times in 26 components**. They run on Tailwind's default duration and easing unless paired with a duration token.
- `animate-in` / `animate-out` appear **40 times in 12 components** (alert-dialog, context-menu, dialog, dropdown-menu, hover-card, menubar, navigation-menu, popover, select, sheet, toast, tooltip).
- Only 9 files use a duration token at all (`duration-(--duration-*)`): accordion, alert-dialog, card-grid, dialog, feature-grid, navigation-menu, progress, sheet and the `site-header` composition.
- **No component uses a `--transition-easing-*` token.**

## Bugs found while auditing

Scanning every `var(--…)` and `-(--…)` reference in `packages/ui/src` and `apps/showcase/src` against the built CSS found names that do not exist.

| Reference                                         | Where                                                                                                                 | Effect                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `--duration-duration-200`                         | `packages/ui/src/compositions/site-header.tsx:13`                                                                     | Typo for `--duration-200`; the transition got no duration. **Fixed in Plan 129** |
| `--color-border-strong`                           | showcase `page.tsx` (14 uses), `components/page.tsx` (11)                                                             | Undefined; `border-color` falls back to `currentcolor`                           |
| `--color-destructive`, `--color-warning`          | showcase `components/`, `patterns/` and `plugin/` pages (about 33 references; a few are label text, not `var()` uses) | Undefined; text and fills render without the intended color                      |
| `--shadow-xs`                                     | showcase `components/page.tsx` (4 uses)                                                                               | Undefined; no shadow. The same name was fixed on the tokens hub in Plan 115      |
| `--color-violet-500`, `--color-button-primary-bg` | showcase `architecture/page.tsx`                                                                                      | Shown as example token names in prose and code; not defined                      |

**All of these are fixed** (site-header in Plan 129, the showcase names in Plan 131), and `pnpm check:tokens` now fails CI on any undefined `var(--x)` or `-(--x)` reference in `packages/ui/src`, `apps/showcase/src` and `apps/storybook`. The names came from the HTML prototypes in `apps/showcase/prototype/`, where they are defined, and were copied into the React pages. Real equivalents: `--color-border-subtle`, `--color-danger-foreground-subtle` / `--color-danger-background-default`, `--color-warning-foreground-subtle`, `--shadow-sm`. Which replacement is right is a design decision.

Ignored as non-bugs: Radix runtime variables (`--radix-*`) and example names in doc comments in `lib/utils.ts`.

## Not covered by this audit

- Border width and border color tokens are not tracked as a separate column.
- Per-component quality ("is the right token used") is not checked, only that a token of the category is referenced.
- Whether tokens are layered correctly (component → semantic → primitive). `validate-tokens.js` does not appear to enforce layer order; not verified.
- `AspectRatio` and `Resizable` reference no tokens; this is intentional (thin primitive wrappers).

## Snapshot (October 13, 2026)

Components scanned: 44. Defined CSS variables: 1185.

### Distinct token references per component

| Component       | Color | Space | Radius | Type | Shadow | Motion |   Z | Opacity |
| --------------- | ----: | ----: | -----: | ---: | -----: | -----: | --: | ------: |
| accordion       |    15 |     6 |      · |    5 |      · |      1 |   · |       · |
| alert-dialog    |     5 |     4 |      1 |    3 |      1 |      1 |   2 |       · |
| alert           |    12 |     5 |      1 |    5 |      · |      · |   · |       · |
| aspect-ratio    |     · |     · |      · |    · |      · |      · |   · |       · |
| avatar          |     4 |     5 |      · |    5 |      · |      · |   · |       · |
| badge           |    36 |     6 |      1 |    5 |      · |      · |   · |       · |
| breadcrumb      |     4 |     4 |      1 |    2 |      · |      · |   · |       · |
| button          |    23 |     8 |      2 |    5 |      · |      · |   · |       · |
| calendar        |    10 |    10 |      1 |    6 |      · |      · |   · |       · |
| card-grid       |     · |     3 |      · |    · |      · |      1 |   · |       · |
| card            |    10 |     6 |      1 |    7 |      1 |      · |   · |       · |
| carousel        |     4 |     6 |      · |    · |      · |      · |   · |       · |
| checkbox        |     6 |     9 |      1 |    · |      · |      · |   · |       · |
| collapsible     |     1 |     · |      1 |    · |      · |      · |   · |       · |
| command         |    10 |    13 |      2 |    3 |      · |      · |   · |       · |
| context-menu    |     7 |    14 |      2 |    3 |      2 |      · |   1 |       · |
| dialog          |     5 |    12 |      2 |    4 |      1 |      1 |   2 |       · |
| dropdown-menu   |     6 |    14 |      3 |    3 |      1 |      · |   1 |       · |
| feature-grid    |     5 |     4 |      2 |    5 |      1 |      1 |   · |       · |
| form            |     5 |     3 |      · |    7 |      · |      · |   · |       · |
| hover-card      |     3 |     4 |      1 |    · |      1 |      · |   1 |       · |
| input           |     9 |     4 |      1 |    3 |      · |      · |   · |       · |
| label           |     4 |     1 |      · |    5 |      · |      · |   · |       · |
| menubar         |    14 |    21 |      2 |    4 |      2 |      · |   1 |       · |
| navigation-menu |    11 |     9 |      2 |    2 |      2 |      1 |   1 |       · |
| pagination      |     7 |     9 |      1 |    2 |      · |      · |   · |       · |
| popover         |     3 |     4 |      1 |    · |      1 |      · |   1 |       · |
| progress        |     5 |     1 |      1 |    · |      · |      1 |   · |       · |
| radio-group     |     5 |     9 |      1 |    · |      · |      · |   · |       · |
| resizable       |     4 |     5 |      1 |    · |      · |      · |   1 |       · |
| scroll-area     |     1 |     3 |      2 |    · |      · |      · |   · |       · |
| select          |    11 |    18 |      3 |    3 |      1 |      · |   · |       · |
| separator       |     1 |     4 |      · |    · |      · |      · |   · |       · |
| sheet           |     4 |    11 |      1 |    3 |      1 |      2 |   2 |       · |
| skeleton        |     1 |     6 |      1 |    · |      · |      · |   · |       · |
| slider          |     5 |     5 |      2 |    · |      · |      · |   · |       · |
| switch          |     4 |    15 |      2 |    · |      1 |      · |   · |       · |
| table           |     6 |     5 |      · |    5 |      · |      · |   · |       · |
| tabs            |    11 |    19 |      · |    4 |      1 |      · |   · |       · |
| textarea        |     7 |     4 |      1 |    2 |      · |      · |   · |       · |
| toast           |    15 |    12 |      3 |    5 |      1 |      · |   1 |       · |
| toggle-group    |     6 |     5 |      1 |    2 |      · |      · |   · |       · |
| toggle          |     7 |     8 |      1 |    2 |      · |      · |   · |       · |
| tooltip         |     3 |     3 |      1 |    1 |      1 |      · |   1 |       · |

### Hardcoded utilities per component (occurrences)

| Component       | transition | duration-N | animate-in/out | z-N | opacity-N | shadow-size |
| --------------- | ---------: | ---------: | -------------: | --: | --------: | ----------: |
| accordion       |          2 |          · |              · |   · |         · |           · |
| alert-dialog    |          · |          · |              4 |   · |         · |           · |
| badge           |          1 |          · |              · |   · |         · |           · |
| breadcrumb      |          1 |          · |              · |   · |         · |           · |
| button          |          1 |          · |              · |   · |         · |           · |
| calendar        |          3 |          · |              · |   · |         · |           · |
| card-grid       |          1 |          · |              · |   · |         · |           · |
| card            |          1 |          · |              · |   · |         · |           · |
| checkbox        |          1 |          · |              · |   · |         · |           · |
| context-menu    |          · |          · |              4 |   · |         · |           · |
| dialog          |          1 |          · |              4 |   · |         · |           · |
| dropdown-menu   |          4 |          · |              4 |   · |         · |           · |
| feature-grid    |          2 |          · |              · |   · |         · |           · |
| hover-card      |          · |          · |              2 |   · |         · |           · |
| input           |          1 |          · |              · |   · |         1 |           · |
| menubar         |          · |          · |              3 |   · |         · |           · |
| navigation-menu |          2 |          · |              6 |   1 |         · |           · |
| pagination      |          1 |          · |              · |   · |         · |           · |
| popover         |          · |          · |              2 |   · |         · |           · |
| progress        |          1 |          · |              · |   · |         · |           · |
| scroll-area     |          1 |          · |              · |   · |         · |           · |
| select          |          1 |          · |              2 |   · |         · |           · |
| sheet           |          2 |          · |              4 |   · |         · |           · |
| slider          |          1 |          · |              · |   · |         · |           · |
| switch          |          2 |          · |              · |   · |         · |           · |
| table           |          1 |          · |              · |   · |         · |           · |
| tabs            |          1 |          · |              · |   · |         · |           · |
| textarea        |          1 |          · |              · |   · |         · |           · |
| toast           |          3 |          · |              3 |   · |         · |           · |
| toggle-group    |          1 |          · |              · |   · |         · |           · |
| toggle          |          1 |          · |              · |   · |         · |           · |
| tooltip         |          · |          · |              2 |   · |         · |           · |

### Hardcoded utility totals

| Utility          | Occurrences | Components                                                                                                                                                                                                                                                   |
| ---------------- | ----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `transition`     |          38 | accordion, badge, breadcrumb, button, calendar, card-grid, card, checkbox, dialog, dropdown-menu, feature-grid, input, navigation-menu, pagination, progress, scroll-area, select, sheet, slider, switch, table, tabs, textarea, toast, toggle-group, toggle |
| `duration-N`     |           0 | none                                                                                                                                                                                                                                                         |
| `animate-in/out` |          40 | alert-dialog, context-menu, dialog, dropdown-menu, hover-card, menubar, navigation-menu, popover, select, sheet, toast, tooltip                                                                                                                              |
| `z-N`            |           1 | navigation-menu                                                                                                                                                                                                                                              |
| `opacity-N`      |           1 | input                                                                                                                                                                                                                                                        |
| `shadow-size`    |           0 | none                                                                                                                                                                                                                                                         |

Notes: a dot means none. Component radius tokens are named `--space-<component>-radius`, so the Radius column counts those as well as `--border-radius-*`. "Z", "Shadow", "Motion" and "Opacity" are the categories added after April 2026.
