# Styling Architecture

How Tailwind CSS 4 and the design tokens reach the UI package, Storybook, and the showcase app. Tailwind is configured CSS-first: there is no `tailwind.config.js` in any app or package that builds styles.

## Overview

1. **Tokens** (`@wyliedog/tokens`) build to CSS custom properties (`packages/tokens/dist/tokens.css`, `semantic-light.css`, `semantic-dark.css`).
2. **The UI package** compiles Tailwind plus the tokens into one stylesheet, `@wyliedog/ui/styles`, that apps import.
3. **Each app** imports that stylesheet and, where it needs its own utilities, compiles Tailwind for its own sources.

Components use token-backed classes written as `bg-(--color-button-primary-background)`; the tokens are plain CSS variables, so no Tailwind theme mapping is involved.

## UI package (`@wyliedog/ui`)

Entry: `packages/ui/src/styles/index.css`.

```css
@import "tailwindcss";
@import "@wyliedog/tokens/tokens.css";
/* plus a few element-level rules, such as token-colored search and date input icons */
```

Build (part of `pnpm --filter @wyliedog/ui build`):

```bash
pnpm --filter @wyliedog/ui build:styles
# tailwindcss -i ./src/styles/index.css -o ./dist/index.css
```

Output: `packages/ui/dist/index.css` (about 250 KB, unminified, measured 2026-10-14), exported as `@wyliedog/ui/styles`. Components themselves ship as separate JS entries (`dist/button.js`, `dist/button.cjs`, ...); see [component-workflow.md](guides/component-workflow.md).

## Storybook (`apps/storybook`)

Storybook compiles an extra stylesheet for classes used in stories and docs, then imports it after the UI styles.

- Entry for the extra stylesheet: `apps/storybook/src/styles/index.css` (imports `tailwindcss` and the tokens, and adds `@source` entries for `stories/**/*.tsx` and `stories/**/*.mdx`).
- Build: `pnpm --filter storybook build:css` runs `tailwindcss -i ./src/styles/index.css -o ./dist/storybook.css --minify` (about 148 KB, measured 2026-10-14).
- `pnpm --filter storybook dev` runs `build:css` once, then starts `dev:css:watch` (Tailwind in watch mode) together with Storybook.
- `apps/storybook/stories/globals.css` imports the two stylesheets in this order:

```css
@import "@wyliedog/ui/styles";
@import "../dist/storybook.css";
```

In Turborepo, `storybook#build:css` depends on the tokens build and the UI `build:styles` task (see `turbo.json`).

If a brand-new Tailwind class does not appear in the dev server although it is present in `dist/storybook.css`, restart the dev server.

## Showcase (`apps/showcase`)

Next.js compiles Tailwind itself through PostCSS.

- `apps/showcase/postcss.config.js` enables `@tailwindcss/postcss`.
- `apps/showcase/src/app/globals.css` starts with:

```css
@import "@wyliedog/ui/styles";
@import "tailwindcss";

@source not "../../prototype";
```

- `@source not` keeps `apps/showcase/prototype/` (reference HTML whose class names are code samples) out of Tailwind's source scan.
- Tailwind scans the app's own files automatically; there is no `content` array.
- Production CSS from `next build` (measured 2026-10-14): one chunk of about 298 KB and one of about 18 KB, minified (about 43 KB and 1.5 KB gzipped).

More detail is in [apps/showcase/README_STYLING.md](../apps/showcase/README_STYLING.md).

## Comparison

| Aspect            | UI package                                       | Storybook                      | Showcase               |
| ----------------- | ------------------------------------------------ | ------------------------------ | ---------------------- |
| Tool              | `@tailwindcss/cli`                               | `@tailwindcss/cli`             | `@tailwindcss/postcss` |
| Framework         | None (library)                                   | Vite                           | Next.js                |
| Entry CSS         | `src/styles/index.css`                           | `src/styles/index.css`         | `src/app/globals.css`  |
| Output            | `dist/index.css`                                 | `dist/storybook.css`           | Bundled by Next.js     |
| Imports UI styles | n/a (is the UI)                                  | Yes, via `stories/globals.css` | Yes, via `globals.css` |
| Watch             | `build:styles` is one-shot; `dev` runs a watcher | `dev:css:watch`                | Next.js dev server     |

Both apps import the UI stylesheet, which already contains Tailwind's base, so some CSS appears twice in development. The showcase production output above is minified.

## Adding styles

- **New token-backed class in a component:** write `bg-(--color-...)` using a token that exists (see [naming-convention.md](tokens/naming-convention.md)). Rebuild the UI package so `dist/index.css` includes it.
- **New app:** import `@wyliedog/ui/styles` in the CSS entry. In a Next.js app also `@import "tailwindcss"` and add `@tailwindcss/postcss` to `postcss.config.js`. In a Vite app, follow the Storybook approach: compile the app's own utilities with the Tailwind CLI and import the output after the UI styles.
- **Theme overrides:** override semantic tokens as CSS variables after importing the UI styles (see Storybook, Resources / Theming).

## Troubleshooting

- **Component styles missing in an app:** the CSS entry must import `@wyliedog/ui/styles`, and the UI package must be built (`ls packages/ui/dist/index.css`).
- **A Tailwind class has no effect in the showcase:** check that the class appears literally in a scanned source file, and that `globals.css` still has `@import "tailwindcss"`.
- **Stale styles in Storybook:** rerun `pnpm --filter storybook build:css`, then restart the dev server.
