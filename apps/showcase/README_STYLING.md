# Showcase App Styling Documentation

This document explains the Showcase app's CSS architecture and Tailwind configuration.

## Current Configuration

**Build Tool**: Next.js with `@tailwindcss/postcss` plugin

**CSS Import Strategy**:

```css
/* apps/showcase/src/app/globals.css */
@import "tailwindcss"; /* Next.js compiles app-specific utilities */
@import "@wyliedog/ui/styles"; /* Pre-compiled component styles */
```

## Why This Approach

Unlike Storybook (which uses `@tailwindcss/cli` for pre-compilation), Showcase uses Next.js's built-in PostCSS integration. This requires the `@import "tailwindcss"` directive for Next.js to:

1. Detect Tailwind CSS needs to be processed
2. Run the `@tailwindcss/postcss` plugin at build/dev time
3. Scan `src/**/*.tsx` files for utility classes
4. Generate app-specific utilities (grids, spacing, responsive classes, etc.)

The `@wyliedog/ui/styles` import provides:

- All UI component styles (buttons, cards, forms, etc.)
- Design tokens
- Component-specific utilities using arbitrary values

## CSS Layers

**Layer 1: Tailwind (Build-time compilation)**

- Source: `@import "tailwindcss"`
- Processed by: Next.js `@tailwindcss/postcss` plugin
- Scans: `src/**/*.{js,ts,jsx,tsx}` (configured in `tailwind.config.js`)
- Generates: Utilities for Showcase pages and layouts

**Layer 2: UI Package (Pre-compiled)**

- Source: `@import "@wyliedog/ui/styles"`
- Provides: Component utilities, tokens, Tailwind base
- Size: ~126KB (pre-compiled)

**CSS Duplication**: Some Tailwind base styles appear in both layers. This is acceptable because:

- Next.js production builds deduplicate and minify CSS
- Development experience remains fast with HMR
- Total CSS size is still reasonable (~200KB dev, much smaller in production)

## Tailwind Configuration

**`tailwind.config.js`:**

```javascript
import baseConfig from "@repo/tailwind-config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@wyliedog/ui/dist/**/*.{js,mjs}",
  ],
};
```

**Extends**: `@repo/tailwind-config` for semantic color mappings and shared theme

**Content Paths**:

- `./src/**/*` - Showcase app source files
- `./app/**/*` - Next.js app directory (if used)
- UI package dist - Ensures utilities referenced in components are available

## PostCSS Configuration

**`postcss.config.js`:**

```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

This tells Next.js to process CSS files with the Tailwind PostCSS plugin.

## Development Workflow

### Normal Development

```bash
pnpm --filter showcase dev
```

Next.js automatically:

1. Processes `globals.css` with PostCSS
2. Compiles Tailwind utilities for classes used in `src/**/*.tsx`
3. Bundles CSS and serves with HMR

### Adding New Utilities

No special steps needed! Just use Tailwind classes in your components:

```tsx
<div className="grid grid-cols-3 gap-4 p-8">
  {/* Next.js auto-compiles these utilities */}
</div>
```

### Using Semantic Colors

Semantic colors from `@repo/tailwind-config` are available:

```tsx
<div className="bg-muted text-muted-foreground border-border">
  {/* These map to design tokens */}
</div>
```

## Comparison with Storybook

| Aspect      | Showcase                              | Storybook                                    |
| ----------- | ------------------------------------- | -------------------------------------------- |
| Build Tool  | `@tailwindcss/postcss`                | `@tailwindcss/cli`                           |
| Framework   | Next.js                               | Vite                                         |
| Compilation | Build-time (Next.js)                  | Pre-compile before dev                       |
| Watch Mode  | Built-in HMR                          | No watch (prevents HMR loops)                |
| CSS Import  | `tailwindcss` + `@wyliedog/ui/styles` | `@wyliedog/ui/styles` + `dist/storybook.css` |

Both approaches:

- Import `@wyliedog/ui/styles` for component utilities
- Use `@repo/tailwind-config` for consistency
- Support full Tailwind v4 functionality
- Maintain design token architecture

## Troubleshooting

### Utilities Not Compiling

**Problem**: Tailwind classes not applying styles

**Solution**:

1. Verify `@import "tailwindcss"` exists in `globals.css`
2. Check `postcss.config.js` has `@tailwindcss/postcss` plugin
3. Ensure class is in a file matching content glob (`src/**/*.tsx`)
4. Restart dev server

### Component Styles Missing

**Problem**: UI components not styled (buttons, cards, etc.)

**Solution**:

1. Verify `@import "@wyliedog/ui/styles"` in `globals.css`
2. Rebuild UI package: `pnpm --filter @wyliedog/ui build:styles`
3. Check CSS exists: `ls -lh packages/ui/dist/index.css` (should be ~126KB)

### CSS Order Issues

**Problem**: Styles not applying due to specificity

**Solution**: Import order matters!

```css
@import "tailwindcss"; /* First: Tailwind base/utilities */
@import "@wyliedog/ui/styles"; /* Second: Component overrides */
```

## Architecture Benefits

1. **Zero Configuration**: Next.js handles Tailwind automatically
2. **Fast HMR**: Changes reflect instantly in browser
3. **Production Optimized**: Automatic deduplication and minification
4. **Component Consistency**: UI package ensures consistent component styling
5. **Design Token Integration**: Shared config maintains token mappings

## Related Documentation

- **[../storybook/README_STYLING.md](../storybook/README_STYLING.md)** - Storybook styling approach
- **[../storybook/SOLUTION_SUMMARY.md](../storybook/SOLUTION_SUMMARY.md)** - Detailed Storybook architecture
- **[../../packages/tailwind-config/index.js](../../packages/tailwind-config/index.js)** - Shared Tailwind config

---

**Last Updated**: 2026-01-01
**Status**: ✅ Working Solution
