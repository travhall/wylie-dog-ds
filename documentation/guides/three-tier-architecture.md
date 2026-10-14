# Three-Tier Component Architecture

How components are organized across the repo: primitives, compositions, and implementations. This describes the structure as it exists today. It began as an implementation plan in December 2025; the proposal, phases and timeline have been removed because the work is done.

## The tiers

```text
Tier 1: Primitives       packages/ui/src/*.tsx
  Atomic components (Button, Card, Input), most built on Radix UI primitives.
  Exported one by one: @wyliedog/ui/<name>
        ↓
Tier 2: Compositions     packages/ui/src/compositions/*.tsx
  Reusable patterns that combine primitives (SiteHeader, SiteFooter, PageLayout,
  SectionHero, SectionFeatures). Generic and configurable.
  Exported: @wyliedog/ui/compositions and @wyliedog/ui/compositions/<name>
        ↓
Tier 3: Implementations  apps/showcase/src
  App-specific use of Tiers 1 and 2 with real content. For example the
  showcase layout (apps/showcase/src/app/layout.tsx) renders SiteHeader and
  SiteFooter with the Wylie Dog navigation and links.
```

`card-grid.tsx` and `feature-grid.tsx` are pattern-level components that live at the top level of `packages/ui/src` and are exported like primitives (`@wyliedog/ui/card-grid`, `@wyliedog/ui/feature-grid`). They appear in Storybook under Patterns.

Primitives and compositions both have a single source of truth in `packages/ui`. Apps import them; they do not copy them.

## Where things live

```text
packages/ui/src/
├── button.tsx, card.tsx, ...        # Tier 1 (one file per component)
├── compositions/
│   ├── site-header.tsx, site-footer.tsx, page-layout.tsx,
│   │   section-hero.tsx, section-features.tsx
│   └── index.ts                     # barrel for @wyliedog/ui/compositions
└── __tests__/                       # tests for both tiers

apps/storybook/stories/
├── Components/<Category>/            # Tier 1 stories (title "Components/<Group>/<Name>")
├── Patterns/<Category>/             # Tier 2 stories and other patterns (title "Patterns/<Category>/<Name>")
└── Showcase/Marketing Site/         # a full page assembled from the tiers

apps/showcase/src/                   # Tier 3
```

The Storybook sidebar order is defined in `apps/storybook/.storybook/preview.tsx` (`storySort`): Introduction, Foundations, Components, Patterns, and so on.

## Conventions

- **Tier 1 names** are atomic and single-purpose (`button`, `input`, `card`) and follow Radix naming where a Radix primitive is used.
- **Tier 2 names** describe the pattern, with a scope prefix: `site-*`, `page-*`, `section-*`.
- **Imports inside `packages/ui`** are relative (a composition imports `../button`); apps import `@wyliedog/ui/<name>` or `@wyliedog/ui/compositions/<name>`.
- **Styling** uses `cva` variants and token-backed classes in `-(--token-name)` syntax in both tiers (see `packages/ui/src/compositions/site-header.tsx`).
- **Tier 3 components** use an app-specific prefix when they wrap a composition.

## Adding a component

Use the generator; it supports both tiers:

```bash
pnpm generate:component my-component --category=content-display              # Tier 1
pnpm generate:component my-header --composition --category="Navigation Patterns"  # Tier 2
```

It creates the component, a test, a story, the `tsup` entry, the package export, and the barrel export. The full workflow, including what you must finish by hand, is in [component-workflow.md](component-workflow.md).

## Exports and build

Each component, including each composition, is its own entry in `packages/ui/tsup.config.ts` and its own `exports` entry in `packages/ui/package.json`:

```json
"./compositions/site-header": {
  "types": "./dist/compositions/site-header.d.ts",
  "import": "./dist/compositions/site-header.js",
  "require": "./dist/compositions/site-header.cjs"
}
```

`@wyliedog/ui/compositions` points at the barrel (`dist/compositions/index.*`). Builds emit ESM `.js`, CommonJS `.cjs` and type declarations.

## Testing by tier

- **Tier 1 and 2:** Vitest and Testing Library in `packages/ui/src/__tests__/`, with `jest-axe` accessibility audits. Compositions have their own tests (`site-header.test.tsx`, `site-footer.test.tsx`, `page-layout.test.tsx`, `section-hero.test.tsx`, `section-features.test.tsx`). Stories run in Storybook's Vitest setup, including accessibility checks.
- **Tier 3:** the showcase has Vitest tests (`pnpm --filter showcase test`). Lighthouse CI runs against the built Storybook. There is no end-to-end test suite for the showcase.

See [testing-coverage.md](../reference/testing-coverage.md) for coverage numbers and the documented skipped tests.

## Status

Living document. Update it when a tier's location, export path or naming rule changes.
