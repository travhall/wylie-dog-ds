# Showcase App Styling

How the showcase app (Next.js) gets its CSS. For the whole monorepo see [documentation/STYLING_ARCHITECTURE.md](../../documentation/STYLING_ARCHITECTURE.md).

## Configuration

- **Tool:** Tailwind CSS 4 through `@tailwindcss/postcss`, enabled in `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- **CSS entry:** `src/app/globals.css`, which begins with:

```css
@import "@wyliedog/ui/styles";
@import "tailwindcss";

@source not "../../prototype";
```

There is no `tailwind.config.js` (or `.ts`/`.mjs`/`.cjs`); Tailwind 4 is configured in CSS.

## What each part does

- `@import "@wyliedog/ui/styles"` brings in the UI package's pre-compiled stylesheet (`packages/ui/dist/index.css`): Tailwind base, the design tokens (from `@wyliedog/tokens/tokens.css`) and the utilities the components use. The UI package must be built first.
- `@import "tailwindcss"` makes the PostCSS plugin compile Tailwind for the showcase's own sources. Tailwind finds `src/**` on its own; there is no `content` array.
- `@source not "../../prototype"` keeps `apps/showcase/prototype/` out of the scan. That folder holds reference HTML whose class names are code samples; without this, Tailwind generated rules no page uses.

Some of Tailwind's base appears in both the UI stylesheet and the app's own output. Next.js minifies in production; the measured production CSS (2026-10-14) is one chunk of about 298 KB and one of about 18 KB (about 43 KB and 1.5 KB gzipped).

## Development

```bash
pnpm --filter showcase dev
```

Next.js processes `globals.css` through PostCSS and serves it with hot reloading. To use a utility, write the class in a component; no registration step is needed.

## Writing styles

Use token-backed classes, not Tailwind scale colors and not hardcoded values:

```tsx
<div className="bg-(--color-background-subtle) text-(--color-foreground-muted) border border-(--color-border-default)">
  ...
</div>
```

`text-white` is not allowed; use `text-(--color-inverse-foreground-default)` so it adapts to dark mode. Use `<Button>` and `buttonVariants({ variant, size })` from `@wyliedog/ui/button` instead of raw `<button>` and `<a>` styling. Token names are listed in [documentation/tokens/token-cheatsheet.md](../../documentation/tokens/token-cheatsheet.md), and `pnpm check:tokens` fails if the showcase references a token that does not exist.

## Troubleshooting

- **Utilities not applying:** confirm `@import "tailwindcss"` is in `globals.css`, `postcss.config.js` lists `@tailwindcss/postcss`, and the class appears literally (not built from string fragments) in a file under `src/`. Restart the dev server.
- **Component styles missing:** confirm `@import "@wyliedog/ui/styles"` is in `globals.css`, rebuild the UI package (`pnpm --filter @wyliedog/ui build:styles`) and check that `packages/ui/dist/index.css` exists.
- **Specificity or order problems:** the import order is `@wyliedog/ui/styles` first, then `tailwindcss`. Keep it unless you have a reason and test both light and dark mode.

## Comparison with Storybook

| Aspect      | Showcase                              | Storybook                                    |
| ----------- | ------------------------------------- | -------------------------------------------- |
| Tool        | `@tailwindcss/postcss`                | `@tailwindcss/cli`                           |
| Framework   | Next.js                               | Vite                                         |
| Compilation | During the Next.js build or dev       | `build:css` before dev, plus a watch script  |
| CSS import  | `@wyliedog/ui/styles` + `tailwindcss` | `@wyliedog/ui/styles` + `dist/storybook.css` |
