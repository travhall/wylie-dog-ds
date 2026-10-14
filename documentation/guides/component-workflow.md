# Component Development Workflow

How to add a component to `@wyliedog/ui` with the generator, what it creates, what you still have to do by hand, and how to check the result.

For the wider process (proposal, design review, pull request) see the Storybook page "Contributing / Workflows / Component Development Process" (`apps/storybook/stories/Contributing/Workflows/component-development.mdx`). For story conventions see `apps/storybook/STORY_AUTHORING_GUIDE.md`.

## 1. Generate the scaffold

```bash
# A primitive (Tier 1) component: --category is required
pnpm generate:component my-component --category=content-display

# A composition (Tier 2): --category is the name of a folder in apps/storybook/stories/Patterns
pnpm generate:component my-header --composition --category="Navigation Patterns"
```

The name must be lowercase kebab-case. The command stops with a message if you leave out `--category`, if the name or story already exists, or if the category is not valid.

Primitive categories (the key, and the Storybook folder it maps to):

| `--category=`       | Storybook folder    | Sidebar group       |
| ------------------- | ------------------- | ------------------- |
| `inputs-controls`   | `Inputs-Controls`   | Inputs & Controls   |
| `navigation`        | `Navigation`        | Navigation          |
| `layout-structure`  | `Layout-Structure`  | Layout & Structure  |
| `content-display`   | `Content-Display`   | Content Display     |
| `feedback-status`   | `Feedback-Status`   | Feedback & Status   |
| `overlays-popovers` | `Overlays-Popovers` | Overlays & Popovers |

Composition categories are the folders under `apps/storybook/stories/Patterns/` (for example `Navigation Patterns`, `Form Patterns`, `Page Compositions`). The script lists the valid ones in its error message.

### What it creates and changes

For a primitive named `my-component` (compositions use `src/compositions/` and `stories/Patterns/<category>/` instead):

| Path                                                                   | What                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `packages/ui/src/my-component.tsx`                                     | Component: `cva` variants, `cn`, `focusRingClasses`, `asChild` via Radix `Slot`, `forwardRef`     |
| `packages/ui/src/__tests__/my-component.test.tsx`                      | Vitest + Testing Library + `jest-axe` tests (a11y audit, render, className, ref, default variant) |
| `apps/storybook/stories/Components/<Folder>/my-component.stories.tsx`  | Story with Default, AllVariants, States, WithInteractions, UsageExample                           |
| `packages/ui/tsup.config.ts`                                           | New entry in `entryPoints`                                                                        |
| `packages/ui/package.json`                                             | New `exports["./my-component"]`                                                                   |
| `packages/ui/src/index.ts` (compositions: `src/compositions/index.ts`) | New export line                                                                                   |

Then it runs Prettier and ESLint on the generated files.

The export map entry looks like this (the build emits ESM `.js`, CommonJS `.cjs`, and `.d.ts`/`.d.cts` types, not `.mjs`):

```json
"./my-component": {
  "types": "./dist/my-component.d.ts",
  "import": "./dist/my-component.js",
  "require": "./dist/my-component.cjs"
}
```

## 2. Finish what the generator leaves open

The scaffold is a starting point, not a finished component. It marks the gaps with `TODO` comments.

- **Tokens.** The generated classes use placeholder names like `bg-(--color-my-component-default-background)`. Those tokens do not exist. Either add real component tokens to `packages/tokens/io/sync/components.json` and rebuild (`pnpm --filter @wyliedog/tokens build`), or use existing semantic tokens. Always write token-backed values as `-(--token-name)` (font sizes as `text-(length:--font-size-...)`) and never hardcode colors or spacing. See `documentation/tokens/naming-convention.md`.
- **Role and semantics.** The scaffold renders a `div` with `role="group"` only so it passes the axe audit. Replace it with the right element or WAI-ARIA role, and add keyboard and state tests for that pattern. See `documentation/guides/accessibility-guide.md` (WCAG 2.2).
- **Variants and sizes.** Replace the single `default` variant. Look at `packages/ui/src/badge.tsx` and `button.tsx` for the house style: `cva` variants, token-backed classes, `compoundVariants` for interactive states, `Slot` for `asChild`. Sizes are per component (for example `sm`/`md`/`lg`); there is no shared pixel-height scale.
- **Sub-components** are separate named exports (`Card`, `CardHeader`, `CardTitle`, ...), not dot notation.
- **Story.** Fill in the description text, real variants and states, and a meaningful `play` function.
- **Size budget.** Add an entry for the new file to `.size-limit.json` (one entry per component, with `"ignore": ["react"]`).
- **README count.** The component count in `README.md` is checked against the story files by `pnpm check:docs`; update it when you add a component.

## 3. Develop with it running

```bash
pnpm --filter @wyliedog/ui dev          # tsup --watch and Tailwind CLI --watch for the package
pnpm --filter storybook dev             # Storybook at http://localhost:6006
```

Stories import from `@wyliedog/ui/<name>`, which resolves to the package's `dist`. If Storybook or its type check cannot find the new component, build the UI package first: `pnpm --filter @wyliedog/ui build`.

Import rules:

- Apps import per component: `import { Button } from "@wyliedog/ui/button"`, and the styles once: `import "@wyliedog/ui/styles"`.
- Inside `packages/ui`, import relatively (`./lib/utils`, `./button`), never `@wyliedog/ui/...`.
- Components live only in `packages/ui/src`; do not create components in the Storybook or showcase apps.

## 4. Test

```bash
pnpm --filter @wyliedog/ui test            # all UI tests (run with NODE_ENV unset)
pnpm --filter @wyliedog/ui test:watch
pnpm --filter @wyliedog/ui test:coverage   # thresholds: 80% statements, lines and functions; 70% branches
pnpm --filter @wyliedog/ui test:a11y       # only the *.a11y.test.tsx files
pnpm test                                  # every package, via Turborepo
```

Radix portal components (menus, popovers, tooltips) are awkward in jsdom; `documentation/reference/testing-coverage.md` explains the skipped tests and how Storybook covers them. Story-level accessibility checks run in Storybook's test setup (Vitest, light and dark).

## 5. Check before you open the pull request

```bash
pnpm typecheck
pnpm lint            # includes eslint --max-warnings 0 for the UI package
pnpm --filter @wyliedog/ui lint:a11y
pnpm build
pnpm size            # needs a build; compares against .size-limit.json
pnpm check:docs      # README counts, doc links and token names
pnpm check:tokens    # showcase token references
```

`pnpm --filter @wyliedog/ui validate:tokens` lists token references in `packages/ui/src` that no token file defines. It also reports a few fragments inside comments in `src/lib/utils.ts`, so treat only new entries from your own files as real problems.

## Troubleshooting

- **Component not in Storybook.** The story must be under `apps/storybook/stories/` and its `title` must start with `Components/<Sidebar group>/` or `Patterns/<category>/`. Restart the dev server after adding a file.
- **Cannot resolve `@wyliedog/ui/<name>`.** Build the UI package, and check that `packages/ui/package.json` has the export and `tsup.config.ts` has the entry.
- **Type errors in a story.** Usually the UI package has not been built since you added the component; build it, then re-run `pnpm --filter storybook typecheck`.
- **Stale output.** Delete `packages/ui/dist` and run `pnpm --filter @wyliedog/ui build`. Do not use `pnpm --filter @wyliedog/ui clean`: it also removes `node_modules`.
- **`pnpm check:docs` fails after adding a component.** Update the component count in `README.md`.
