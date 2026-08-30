# Wylie Dog Showcase

A Next.js (App Router) demo application that dogfoods `@wyliedog/ui` and
`@wyliedog/tokens` in a real app — every page here is built with the
published component and token packages, not a documentation-only sandbox.

## Running it

From the repo root:

```bash
pnpm install
pnpm dev:showcase
```

Or from this directory:

```bash
pnpm dev        # start dev server on http://localhost:3001
pnpm build      # production build
pnpm start      # run the production build
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint src --max-warnings 0
```

## Route map

- `/` — home
- `/components` — component gallery
  - `/components/content-display`
  - `/components/feedback`
  - `/components/inputs`
  - `/components/layout`
  - `/components/navigation`
  - `/components/overlays`
- `/patterns` — composed usage patterns
  - `/patterns/accessibility`
  - `/patterns/auth`
  - `/patterns/compositions`
  - `/patterns/data`
  - `/patterns/feedback`
  - `/patterns/forms`
  - `/patterns/layout`
  - `/patterns/navigation`
  - `/patterns/responsive`
- `/tokens` — design token reference
  - `/tokens/borders`
  - `/tokens/colors`
  - `/tokens/spacing`
  - `/tokens/typography`
- `/architecture` — system architecture overview
- `/plugin` — Figma plugin (Token Bridge) info

## Styling

For CSS/Tailwind architecture details, see
[README_STYLING.md](./README_STYLING.md).
