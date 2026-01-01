# Storybook Styling - Final Solution Documentation

This document provides a quick reference for the Storybook styling configuration.

## Quick Links

- **[SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md)** - Complete technical implementation details and architecture decisions

## Current Status

**✅ SOLUTION IMPLEMENTED AND WORKING**

**Configuration**: Dual CSS import strategy aligned with Turborepo architecture

**All Issues Resolved**:

- ✅ HMR infinite loop eliminated (no flickering)
- ✅ A11y addon working without flashing
- ✅ Component styles rendering correctly
- ✅ Story-specific utilities available
- ✅ Semantic utilities working (`bg-muted`, `text-muted-foreground`, `border-border`)
- ✅ Maintains Tailwind v4 support throughout Design System

**Implementation**:

1. Import `@wyliedog/ui/styles` (126KB) - Pre-compiled Tailwind + component utilities from UI package
2. Import `../dist/storybook.css` (75KB) - Pre-compiled story-specific utilities
3. Created `src/styles/storybook.css` with `@utility` definitions for semantic classes
4. Tailwind config extends `@repo/tailwind-config` and scans UI component sources + story files
5. CSS builds once before Storybook starts (no watch mode = no HMR loops)

## The Problem (Resolved)

The HMR infinite loop was caused by importing Tailwind source (`@import "tailwindcss"`) in Storybook while also importing pre-compiled UI styles that already contained Tailwind. This created a JIT compilation loop where:

1. Vite detected CSS changes
2. Triggered Tailwind JIT recompilation
3. Output changed, triggering Vite again
4. Loop continued infinitely

## The Solution

**Dual Pre-compiled CSS Import Strategy**:

```css
/* apps/storybook/stories/globals.css */
@import "@wyliedog/ui/styles"; /* Component utilities */
@import "../dist/storybook.css"; /* Story utilities */
```

Both CSS files are **pre-compiled static files**, so Vite doesn't trigger Tailwind JIT during development.

### Why This Works

1. **No Runtime JIT Compilation**: Both imports are static CSS files
2. **Vite Only Watches Files**: No Tailwind compilation triggered on changes
3. **Complete Utility Coverage**: Components get their utilities, stories get theirs
4. **Turborepo Architecture**: Aligns with design - UI ships complete CSS, apps extend

### Trade-offs

- **CSS Size**: ~200KB total (some Tailwind base duplication)
- **Acceptable Because**:
  - Development environment (not production bundle)
  - Gzip compression handles duplication well
  - Eliminates all HMR issues
  - Maintains full Tailwind functionality

## Quick Start

```bash
# Start Storybook (builds CSS automatically)
pnpm --filter storybook dev

# Manually rebuild CSS if needed
cd apps/storybook && pnpm build:css

# Add new story semantic utilities
# 1. Edit src/styles/storybook.css
# 2. Add @utility definition
# 3. Rebuild CSS
```

## Key Files

- **`stories/globals.css`** - Dual CSS imports
- **`src/styles/storybook.css`** - Story utility definitions with `@utility` directives
- **`tailwind.config.js`** - Extends `@repo/tailwind-config`, scans UI sources + story files
- **`package.json`** - Build scripts (`build:css`, `dev`)

## For Design System Consumers

This solution demonstrates best practices for Tailwind v4 in Turborepo:

1. **UI Package Ships Complete CSS** - Pre-compiled with all component utilities
2. **Apps Extend as Needed** - Compile only app-specific utilities
3. **Shared Config** - Use `@repo/tailwind-config` for consistency
4. **Pre-compile Everything** - No runtime JIT prevents performance issues
5. **CSS Duplication is OK** - Better than HMR loops and missing styles

## Troubleshooting

### HMR Loops Return

- Ensure `globals.css` imports only pre-compiled CSS (no `@import "tailwindcss"`)
- Check that Tailwind watch mode isn't running (`dev:css:watch`)
- Verify both CSS files exist in `dist/`

### Component Styles Missing

- Ensure `@wyliedog/ui/styles` is imported first in `globals.css`
- Check UI package built CSS: `ls -lh packages/ui/dist/index.css` (should be ~126KB)

### Story Utilities Missing

- Add `@utility` definition to `src/styles/storybook.css`
- Rebuild CSS: `cd apps/storybook && pnpm build:css`
- Verify in compiled file: `grep "your-class" apps/storybook/dist/storybook.css`

## Documentation

- **[SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md)** - Complete technical details, architecture decisions, development workflow

---

**Last Updated**: 2025-12-31
**Status**: ✅ Working Solution Implemented
