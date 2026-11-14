# Guardrails

A **guardrail** is an automated check that fails the build when code or tokens drift from the system's rules. Together they are what makes a design-to-code workflow trustworthy rather than hopeful: a change that breaks a rule fails before it reaches a reviewer. This page is the catalog. Each entry says what it enforces, how to run it, where CI runs it, how to tune it, and what a failure usually means.

You own these rules. A guardrail that does not fit your system is yours to loosen, extend or delete; the "Tune it" line on each entry says where. Terms are defined in the [glossary](../../GLOSSARY.md).

## Where they run

| Workflow                                 | Runs                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `lint.yml`                               | lint, typecheck, `check:docs`, `check:tokens`, `check:contrast`, `check:focus`, `lint:a11y`, Prettier          |
| `test.yml`                               | unit and story tests (including accessibility tests), coverage thresholds, script tests, `check:docs:coverage` |
| `build.yml`                              | build, then `check:figma-parity`                                                                               |
| `size.yml`                               | bundle size budgets                                                                                            |
| `lighthouse.yml`                         | Lighthouse performance audit                                                                                   |
| Pre-commit (`lint-staged` through Husky) | the staged files                                                                                               |

Two checks are not in CI and are run by hand: `check:focus-visible` (needs a built Storybook) and `scripts/audit-showcase.mjs` (needs a built showcase).

## Token guardrails

`pnpm check:tokens` runs every check in this section, in order. Run one alone with `node scripts/<name>.mjs`.

### Token references (`check-token-refs.mjs`)

- **Enforces:** every CSS custom property used in source (`var(--x)`, `bg-(--x)`) is defined by the built token CSS or declared in the scanned files.
- **Tune it:** `scripts/check-token-refs.config.json`.
- **A failure usually means:** a token was renamed or deleted and a reference was left behind. Rebuild tokens (`pnpm --filter @wyliedog/tokens build`) before assuming the check is wrong.

### Semantic color structure (`check-token-structure.mjs`)

- **Enforces:** semantic color names follow `color.<part>.<token>`, with the part `background`, `foreground`, `border` or `focus`, and at most one modifier.
- **Tune it:** the allowed ground names are in the script. This is the rule that encodes this project's three-tier standard; if you adopt a different naming scheme, this is the first check to rewrite.
- **A failure usually means:** a new semantic token invented a segment or a state word.

### Component binding (`check-component-binding.mjs`)

- **Enforces:** components in `packages/ui/src` reference only component tokens, never semantic or primitive ones. Non-color values (spacing, radius, type, shadow, motion) are covered too.
- **Tune it:** the documented exceptions are in the script header.
- **A failure usually means:** a class reached for a semantic token or a palette value directly. Add a component token and bind to that.

### Raw values (`check-raw-values.mjs`, `audit-raw-values.mjs`)

- **Enforces:** no raw value in `packages/ui/src` that a token should own: Tailwind scale utilities, arbitrary numbers, icon sizes and inline style numbers.
- **Tune it:** `scripts/check-raw-values.config.json` lists accepted exceptions. An entry that no longer matches anything also fails, so the list cannot rot. `pnpm audit:raw-values` groups every offender by resolved value to help you design the missing token.
- **A failure usually means:** a literal slipped in. Give the value a token, or add an entry with a reason.

### Units (`check-units.mjs`)

- **Enforces:** text size, spacing, sizing and radius are `rem`, not `px`. 1px hairlines, border widths and decorative geometry are exempt.
- **Tune it:** `scripts/check-units.config.json`.

### Design utilities (`check-design-utilities.mjs`)

- **Enforces:** the catch-all for literals no other check sees: transforms, filters, outlines and strokes, named palette colours, unit literals, stylesheet literals and inline styles.
- **Tune it:** `scripts/check-design-utilities.config.json`; an entry needs a reason and fails if it matches nothing.

### Motion (`check-motion.mjs`)

- **Enforces:** every animation goes through the `wd-motion-*` classes, every number in them is a component token, and one reduced-motion block shortens all animation.
- **A failure usually means:** an `animate-*` or `transition-*` class was added directly.

### Disabled states (`check-disabled-states.mjs`)

- **Enforces:** a disabled control keeps its colours and dims with one `opacity-disabled` token per component; there are no disabled colour tokens.

### Tailwind type hints (`check-tailwind-hints.mjs`)

- **Enforces:** arbitrary variables that Tailwind cannot classify carry a hint, such as `border-b-(length:--space-x)`. Without it Tailwind reads the value as a color and the utility silently does nothing.

### Story token bindings (`check-story-token-bindings.mjs`)

- **Enforces:** stories never bind to tokens. Demos use the components and plain layout classes, so the components remain the contract with adopters.

### Showcase palette and theme (`check-showcase-palette.mjs`, `check-showcase-theme.mjs`)

- **Enforces:** the showcase binds to semantic tokens, never the primitive palette, and its Tailwind type, leading, tracking and radius scales point at token variables. A token change re-themes every page.
- **Delete when:** you remove the showcase.

### Generated files in sync (`generate-text-styles.mjs --check`, `generate-code-syntax.mjs --check`)

- **Enforces:** generated Figma text-style and code-syntax files match the tokens they come from.
- **A failure usually means:** run the generator without `--check` and commit the result.

## Accessibility guardrails

### Contrast (`pnpm check:contrast`)

- **Enforces:** every declared foreground and background pair in `scripts/contrast-pairs.json` meets WCAG 2.2 AA in both Light and Dark (4.5:1 for text, 3:1 for icons, indicators and boundaries).
- **Tune it:** add pairs to `contrast-pairs.json`. `knownFailures` is a ratchet: a listed failure is reported but does not fail, a new failure does, and a known failure that starts passing must be removed.
- **A failure usually means:** a token value moved and a declared pair no longer reads.

### Focus classes (`pnpm check:focus`)

- **Enforces:** components use the project's two-tone outline plus halo focus indicator. `outline-none` and box-shadow focus rings fail, because they vanish in forced-colors mode.

### Keyboard focus visibility (`pnpm check:focus-visible`, by hand)

- **Enforces:** with the keyboard, every focusable element in every component's first story draws a real indicator in Light, Dark and forced-colors mode.
- **Run it:** `pnpm --filter storybook build`, then `pnpm check:focus-visible`.

### JSX accessibility lint (`pnpm lint:a11y`)

- **Enforces:** `jsx-a11y` rules across the packages.

### Story accessibility tests (`pnpm test`)

- **Enforces:** every story runs axe through `@storybook/addon-a11y`, in Light and Dark, and a violation fails the test (`a11y.test: "error"` in `apps/storybook/.storybook/preview.tsx`).
- **Tune it:** the same file. Switch a rule to `todo` only with a written reason.

### Showcase audit (`scripts/audit-showcase.mjs`, by hand)

- **Enforces:** axe, console errors and failed requests over every showcase route, in Light and Dark, at 1280 and 375 pixels.

## Quality guardrails

### Docs drift (`pnpm check:docs`, `pnpm check:docs:coverage`)

- **Enforces:** documentation agrees with the repo. Token names in Markdown must exist in the built CSS, relative links must resolve, and the README's component count, Node version and tooling versions must match source. The coverage variant also checks the test file count in `documentation/reference/testing-coverage.md` against a fresh coverage run.
- **Tune it:** `scripts/check-docs.config.json` (allowlists with reasons).
- **A failure usually means:** a doc quotes a number or token that changed. Fix the doc, not the check.

### Test coverage thresholds

- **Enforces:** the thresholds in `packages/ui/vitest.config.ts`.

### Bundle size (`pnpm size`)

- **Enforces:** the budgets in `.size-limit.json`.
- **Tune it:** raise a budget with a reason in the pull request.

### Figma parity (`pnpm check:figma-parity`)

- **Enforces:** the list of components and variants in Storybook matches a snapshot of the Figma library (`figma/manifest.json`), deterministically and without opening Figma. Code wins: a difference is a finding against Figma unless it is listed with a reason in `scripts/figma-parity.config.json`.
- **Delete when:** you do not keep a Figma component library. The snapshot is the maintainer's; this check has nothing to compare for an adopter who does not maintain one.

## Adding your own

A guardrail here is a small Node script in `scripts/`, a line in `package.json`, and a CI step. Follow the pattern of an existing one: a header comment stating the rule and why, an allowlist file whose entries need reasons, and a failure on an allowlist entry that no longer matches. Add it to this page.
