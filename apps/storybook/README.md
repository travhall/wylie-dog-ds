# Wylie Dog Design System - Storybook

Interactive documentation and component explorer for the Wylie Dog Design System.

## Overview

This Storybook application serves as the primary documentation and development environment for the design system. It provides:

- **58 component stories** demonstrating UI components and their variants
- **19 MDX documentation pages** covering design principles, tokens, and usage guidelines
- **Interactive playgrounds** for exploring typography, spacing, and color tokens
- **Automated interaction tests** using Storybook's play functions
- **Accessibility testing** with the axe-core addon

## Quick Start

```bash
# From the repository root
pnpm install

# Start development server
pnpm --filter storybook dev

# Or from this directory
pnpm dev
```

The Storybook will be available at [http://localhost:6006](http://localhost:6006).

## Project Structure

```
apps/storybook/
├── .storybook/
│   ├── main.ts          # Storybook configuration
│   ├── preview.tsx      # Theme and decorators
│   └── manager.ts       # Sidebar configuration
├── stories/
│   ├── Components/      # UI component stories
│   │   ├── Content Display/
│   │   ├── Feedback & Status/
│   │   ├── Inputs & Controls/
│   │   ├── Layout & Structure/
│   │   ├── Navigation/
│   │   └── Overlays & Popovers/
│   ├── Patterns/        # Composition patterns
│   │   ├── Authentication Patterns/
│   │   ├── Data Patterns/
│   │   ├── Form Patterns/
│   │   └── Navigation Patterns/
│   ├── Foundations/     # Design tokens documentation
│   │   ├── Design Principles/
│   │   └── Design Tokens/
│   ├── Introduction/    # Getting started guides
│   ├── Examples/        # Full-page examples
│   ├── Contributing/    # Contribution guidelines
│   └── Resources/       # Additional resources
├── src/
│   └── styles/
│       └── index.css    # Tailwind entry point
├── STORY_AUTHORING_GUIDE.md  # Story writing standards
└── package.json
```

## Technology Stack

- **Storybook 10.2.1** with React Vite adapter
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Radix UI** primitives for accessible components
- **Vitest** for interaction testing
- **Playwright** for browser testing
- **axe-core** for accessibility testing

## Available Scripts

| Script                   | Description                           |
| ------------------------ | ------------------------------------- |
| `pnpm dev`               | Start development server on port 6006 |
| `pnpm build`             | Build static Storybook for production |
| `pnpm build:analyze`     | Build with bundle size visualization  |
| `pnpm lint`              | Lint story files                      |
| `pnpm preview-storybook` | Serve the built Storybook             |

## Writing Stories

All stories must follow the standards defined in [STORY_AUTHORING_GUIDE.md](./STORY_AUTHORING_GUIDE.md).

### Key Requirements

#### 1. Import from `@storybook/react-vite`

```typescript
// ✅ Correct
import type { Meta, StoryObj } from "@storybook/react-vite";

// ❌ Wrong
import type { Meta, StoryObj } from "@storybook/react";
```

#### 2. Use UI Components from `@wyliedog/ui`

**Never use raw HTML elements** for interactive controls. Always import from the design system:

```typescript
// ✅ Correct
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Select } from "@wyliedog/ui/select";

// ❌ Wrong - raw HTML elements
<button className="...">Submit</button>
<input type="text" className="..." />
<select>...</select>
```

#### 3. Use Semantic Color Tokens

```typescript
// ✅ Correct - CSS variable tokens
<p className="text-(--color-text-secondary)">Text</p>
<div className="border-(--color-border-primary)">Content</div>

// ❌ Wrong - hardcoded colors
<p className="text-gray-600">Text</p>
```

#### 4. Include Autodocs Tag

```typescript
const meta: Meta<typeof Component> = {
  title: "Components/Category/ComponentName",
  component: Component,
  tags: ["autodocs"], // Required for automatic documentation
  // ...
};
```

### Standard Story Types

Each component should include:

1. **Default** - Basic usage with minimal configuration
2. **AllVariants** - All visual variants displayed together
3. **AllSizes** - Size variants (if applicable)
4. **States** - Normal, disabled, loading, error states
5. **WithInteractions** - Play function for automated testing
6. **UsageExample** - Real-world context demonstration

## Addons

The following addons are configured:

| Addon                      | Purpose                             |
| -------------------------- | ----------------------------------- |
| `@storybook/addon-docs`    | Automatic documentation generation  |
| `@storybook/addon-a11y`    | Accessibility testing with axe-core |
| `@storybook/addon-vitest`  | Interaction testing (dev only)      |
| `@storybook/addon-links`   | Story linking                       |
| `@chromatic-com/storybook` | Visual regression testing           |
| `storybook-design-token`   | Design token visualization          |

## Build Optimization

The Storybook build is optimized with:

- **Code splitting** - Vendor chunks for React, Radix UI, Lucide icons
- **CSS code splitting** - Separate CSS bundles
- **Lazy loading** - axe-core loaded on demand
- **Pre-bundling** - All Radix UI primitives pre-bundled

Run `pnpm build:analyze` to generate a bundle visualization at `storybook-static/bundle-stats.html`.

## Theme System

Storybook supports light/dark mode switching via the toolbar. The theme is synchronized with:

- CSS custom properties from `@wyliedog/tokens`
- Tailwind CSS dark mode classes
- localStorage persistence

## Dependencies

This app depends on workspace packages:

- `@wyliedog/ui` - UI component library
- `@wyliedog/tokens` - Design tokens
- `@repo/tailwind-config` - Shared Tailwind configuration
- `@repo/typescript-config` - Shared TypeScript configuration
- `@repo/eslint-config` - Shared ESLint configuration

## Contributing

1. Read the [STORY_AUTHORING_GUIDE.md](./STORY_AUTHORING_GUIDE.md) before writing stories
2. Run `pnpm lint` to check for issues
3. Ensure all stories have proper documentation and descriptions
4. Add interaction tests for interactive components
5. Test in both light and dark modes

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/docs)
