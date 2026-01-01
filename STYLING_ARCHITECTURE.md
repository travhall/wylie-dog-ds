# Design System Styling Architecture

This document provides an overview of the Tailwind CSS architecture across the Wylie Dog Design System monorepo.

## Overview

The Design System uses a **layered CSS architecture** where:

1. **UI Package** ships pre-compiled component styles
2. **Apps** import UI styles and compile their own app-specific utilities
3. **Shared Config** ensures consistency across all packages

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    @repo/tailwind-config                     │
│                  (Shared Configuration)                      │
│  - Semantic color mappings (muted, border, primary, etc.)   │
│  - Design token integration                                  │
│  - Base theme configuration                                  │
└────────────────┬────────────────────────────────────────────┘
                 │ Extended by
         ┌───────┴──────┬──────────────────┐
         │              │                  │
┌────────▼────────┐ ┌───▼──────────┐ ┌────▼─────────┐
│  UI Package     │ │  Storybook   │ │  Showcase    │
│                 │ │              │ │              │
│ Build:          │ │ Build:       │ │ Build:       │
│ @tailwindcss/   │ │ @tailwindcss/│ │ @tailwindcss/│
│ cli             │ │ cli          │ │ postcss      │
│                 │ │              │ │              │
│ Compiles:       │ │ Compiles:    │ │ Compiles:    │
│ - Tailwind base │ │ - Story utils│ │ - App utils  │
│ - Component     │ │ - Semantic   │ │ - Tailwind   │
│   utilities     │ │   utilities  │ │   utilities  │
│ - Tokens        │ │              │ │              │
│                 │ │ Imports:     │ │ Imports:     │
│ Output:         │ │ - UI styles  │ │ - Tailwind   │
│ dist/index.css  │ │ - Compiled   │ │ - UI styles  │
│ (126KB)         │ │   story CSS  │ │              │
└─────────────────┘ └──────────────┘ └──────────────┘
```

## Package Details

### UI Package (@wyliedog/ui)

**Purpose**: Component library with pre-compiled styles

**Build Process**:

```bash
pnpm build:styles
# Runs: tailwindcss -i ./src/styles/index.css -o ./dist/index.css
```

**What it compiles**:

- Full Tailwind CSS base, components, utilities
- Design tokens from `@wyliedog/tokens`
- Component-specific utilities (e.g., `bg-(--color-button-primary-background)`)

**Exports**:

- `@wyliedog/ui/styles` → `dist/index.css` (126KB pre-compiled)
- Individual components → `dist/button.mjs`, `dist/card.mjs`, etc.

**Key Point**: Ships **complete CSS** so apps can use components without additional setup

---

### Storybook App

**Purpose**: Component documentation and testing

**Build Strategy**: Pre-compile CSS before starting dev server

**Build Process**:

```bash
pnpm build:css
# Runs: tailwindcss -i ./src/styles/storybook.css -o ./dist/storybook.css --minify
```

**CSS Imports** (`stories/globals.css`):

```css
@import "@wyliedog/ui/styles"; /* Component utilities (126KB) */
@import "../dist/storybook.css"; /* Story utilities (75KB) */
```

**Why This Works**:

- Both imports are **pre-compiled static files**
- No runtime JIT compilation = no HMR loops
- Vite only watches files, doesn't trigger Tailwind recompilation

**Story Utilities** (`src/styles/storybook.css`):

- Explicit `@utility` definitions for semantic classes
- Scans both UI component sources and story files
- Generates utilities missing from UI package

**Key Point**: Dual static import prevents HMR infinite loops while maintaining full utility coverage

**Documentation**: See [apps/storybook/README_STYLING.md](apps/storybook/README_STYLING.md)

---

### Showcase App

**Purpose**: Marketing site and example app

**Build Strategy**: Next.js PostCSS integration (build-time compilation)

**Build Process**: Automatic via Next.js development server

**CSS Imports** (`src/app/globals.css`):

```css
@import "tailwindcss"; /* Next.js compiles app utilities */
@import "@wyliedog/ui/styles"; /* Component utilities */
```

**Why This Works**:

- `@import "tailwindcss"` required for Next.js PostCSS plugin
- Next.js automatically compiles utilities at build/dev time
- HMR works correctly without infinite loops (different from Storybook/Vite)

**Key Point**: Next.js handles Tailwind compilation differently than Vite, so `@import "tailwindcss"` is necessary

**Documentation**: See [apps/showcase/README_STYLING.md](apps/showcase/README_STYLING.md)

---

## Shared Configuration (@repo/tailwind-config)

**Purpose**: Consistent theme and semantic mappings across all apps

**Exports**:

- Base Tailwind configuration
- Semantic color mappings (`muted`, `border`, `primary`, etc.)
- Design token integration
- Content path defaults

**Usage**:

```javascript
import baseConfig from "@repo/tailwind-config";

export default {
  ...baseConfig,
  content: [
    /* app-specific paths */
  ],
};
```

**Key Colors Defined**:

```javascript
colors: {
  'background': 'var(--color-background-primary)',
  'muted': {
    DEFAULT: 'var(--color-background-secondary)',
    foreground: 'var(--color-text-secondary)',
  },
  'border': 'var(--color-border-primary)',
  // ... semantic mappings
}
```

---

## Comparison Matrix

| Aspect                      | UI Package         | Storybook              | Showcase                |
| --------------------------- | ------------------ | ---------------------- | ----------------------- |
| **Build Tool**              | `@tailwindcss/cli` | `@tailwindcss/cli`     | `@tailwindcss/postcss`  |
| **Framework**               | None (library)     | Vite                   | Next.js                 |
| **Compilation**             | Pre-build script   | Pre-dev script         | Build-time (automatic)  |
| **CSS Output**              | `dist/index.css`   | `dist/storybook.css`   | Bundled by Next.js      |
| **Import Tailwind Source?** | Yes (compiles it)  | No (uses pre-compiled) | Yes (Next.js needs it)  |
| **Import UI Styles?**       | N/A (is UI)        | Yes                    | Yes                     |
| **Watch Mode**              | Manual             | Separate script        | Built-in HMR            |
| **HMR Concerns**            | N/A                | Yes (avoid loops)      | No (Next.js handles it) |

---

## Design Decisions

### Why Different Build Strategies?

**UI Package** uses `@tailwindcss/cli`:

- Library doesn't run dev server
- Pre-compiled CSS ready for any consumer
- Explicit build step ensures consistent output

**Storybook** uses `@tailwindcss/cli` (pre-compile):

- Vite + Tailwind JIT creates HMR loops with dual imports
- Pre-compilation avoids runtime JIT
- Separate build step runs once before dev server

**Showcase** uses `@tailwindcss/postcss`:

- Next.js standard integration
- PostCSS plugin designed for Next.js build pipeline
- No HMR loop issues (Next.js handles it differently than Vite)

### Why CSS Duplication is Acceptable

Both Storybook and Showcase import:

1. Tailwind base/utilities (via compilation or import)
2. UI package CSS (which also contains Tailwind base)

This creates duplication (~200KB dev), but:

- **Development**: Minor impact on dev server speed
- **Production**: Build tools deduplicate and minify CSS
- **Benefit**: Clear separation of concerns (components vs app utilities)
- **Alternative**: Complex build orchestration (not worth it)

### Why Explicit @utility Definitions?

Tailwind v4 JIT only generates utilities for classes found during file scanning. Semantic utilities like `bg-muted` or `text-muted-foreground`:

- Are defined in `@repo/tailwind-config` theme
- Used in stories but NOT in UI component source
- Would be missing without explicit definitions

Solution: `@utility` directive in `src/styles/storybook.css` forces generation

---

## Best Practices

### For UI Package Consumers

1. **Always import `@wyliedog/ui/styles`** for component styles
2. **Extend `@repo/tailwind-config`** for consistency
3. **Choose build strategy** based on framework:
   - Next.js → Use `@tailwindcss/postcss`
   - Vite → Use `@tailwindcss/cli` (pre-compile if importing UI styles)
   - Other → Use `@tailwindcss/cli`

### For New Apps in Monorepo

**Next.js App**:

```css
/* globals.css */
@import "tailwindcss";
@import "@wyliedog/ui/styles";
```

**Vite App**:

```css
/* globals.css */
@import "@wyliedog/ui/styles";
@import "./compiled-app-utilities.css";
```

Plus build script to compile app utilities separately.

### For Adding Semantic Utilities

1. Add to `@repo/tailwind-config` theme if shared
2. Add `@utility` definition if used in stories:
   ```css
   @utility bg-new-semantic {
     background-color: var(--color-new-token);
   }
   ```
3. Rebuild CSS (`pnpm build:css` in Storybook)

---

## Troubleshooting

### Issue: Component styles missing in new app

**Solution**: Import `@wyliedog/ui/styles` in CSS entry point

### Issue: HMR infinite loop in Vite app

**Solution**: Don't import raw Tailwind alongside pre-compiled UI styles. Use pre-compilation approach like Storybook.

### Issue: Tailwind utilities not working in Next.js

**Solution**: Ensure `@import "tailwindcss"` in `globals.css` and `@tailwindcss/postcss` in `postcss.config.js`

### Issue: Semantic colors not available

**Solution**: Verify app's `tailwind.config.js` extends `@repo/tailwind-config`

---

## Related Documentation

- **[apps/storybook/README_STYLING.md](apps/storybook/README_STYLING.md)** - Storybook CSS architecture
- **[apps/storybook/SOLUTION_SUMMARY.md](apps/storybook/SOLUTION_SUMMARY.md)** - Detailed Storybook implementation
- **[apps/showcase/README_STYLING.md](apps/showcase/README_STYLING.md)** - Showcase CSS architecture
- **[packages/tailwind-config/index.js](packages/tailwind-config/index.js)** - Shared configuration

---

**Last Updated**: 2026-01-01
**Architecture Version**: 2.0 (Tailwind v4 + Turborepo)
