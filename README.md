# Wylie Dog Design System

A monorepo design system with 43 components, OKLCH-based design tokens, and full Storybook documentation.

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-blue?style=flat-square)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square)](https://react.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-10.3-ff4785?style=flat-square)](https://storybook.js.org/)
[![Storybook Docs](https://img.shields.io/badge/Docs-Netlify-00C7B7?style=flat-square)](https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/)

## Overview

Wylie Dog is a component library and design token system built with React 19, Tailwind CSS 4, and Radix UI primitives. The token system uses the OKLCH color space with P3 wide-gamut support, structured in a three-tier primitive → semantic → component hierarchy and distributed in W3C DTCG format.

The repo includes:

- **`@wyliedog/ui`** — 43 React components with TypeScript, tree-shakeable individual exports
- **`@wyliedog/tokens`** — OKLCH design tokens built with Style Dictionary, output as CSS variables and TypeScript
- **Storybook** — interactive documentation for all components and foundations, deployed to Netlify
- **Showcase** — Next.js app demonstrating real-world usage patterns
- **Figma Plugin** — bidirectional design token synchronization between Figma and the codebase (beta)

## Monorepo Structure

```
wylie-dog-ds/
├── packages/
│   ├── tokens/           # @wyliedog/tokens — OKLCH design tokens
│   ├── ui/               # @wyliedog/ui — React component library
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── tailwind-config/  # Shared Tailwind CSS configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── apps/
    ├── storybook/        # Component documentation (Storybook 10.3)
    ├── showcase/         # Next.js demo application
    └── figma-plugin/     # Figma token sync plugin (beta)
```

Managed with pnpm workspaces and Turborepo. Package manager: `pnpm@10.28.2`.

## Tech Stack

| Tool               | Version |
| ------------------ | ------- |
| React              | 19.2    |
| TypeScript         | 6.0     |
| Tailwind CSS       | 4.2     |
| Storybook          | 10.3    |
| Vite               | 8.0     |
| Next.js (showcase) | 16.2    |
| Vitest             | 4.1     |
| Turborepo          | 2.9     |
| Style Dictionary   | 5.4     |
| Radix UI           | various |
| pnpm               | 10.28.2 |

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/travhall/wyliedog.git
cd wylie-dog-ds
pnpm install

# Start all packages in development mode
pnpm dev

# Or start specific apps
pnpm dev:storybook    # Storybook at http://localhost:6006
pnpm dev:showcase     # Next.js showcase at http://localhost:3001
pnpm dev:figma        # Figma plugin dev build
```

### Using in a Project

```bash
pnpm add @wyliedog/ui
```

```tsx
import "@wyliedog/ui/styles";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
```

Each component is individually exported for tree-shaking. You can also import from the barrel:

```tsx
import { Button, Card, Badge } from "@wyliedog/ui";
```

## Components

43 components across six categories. Each has a named export, TypeScript types, and a Storybook story.

### Form Controls

`Accordion` `Button` `Checkbox` `Form` `Input` `Label` `RadioGroup` `Select` `Slider` `Switch` `Textarea` `Toggle` `ToggleGroup`

### Layout & Structure

`AspectRatio` `Card` `CardGrid` `Collapsible` `FeatureGrid` `Resizable` `ScrollArea` `Separator` `Tabs`

### Navigation

`Breadcrumb` `Command` `Menubar` `NavigationMenu` `Pagination`

### Content Display

`Avatar` `Badge` `Calendar` `Carousel` `Table`

### Overlays & Popovers

`AlertDialog` `ContextMenu` `Dialog` `DropdownMenu` `HoverCard` `Popover` `Sheet` `Tooltip`

### Feedback & Status

`Alert` `Progress` `Skeleton` `Toast`

### Compositions

Higher-level layout components: `PageLayout` `SiteHeader` `SiteFooter` `SectionHero` `SectionFeatures`

### Generating a New Component

```bash
pnpm generate:component <name>
```

This scaffolds the component file, test file, and Storybook story, and updates the package exports.

## Token System

Tokens live in `packages/tokens` and are published as `@wyliedog/tokens`.

### Architecture

Tokens follow a three-tier hierarchy:

1. **Primitive** — raw OKLCH color values, spacing scale, type scale, etc.
2. **Semantic** — role-based aliases (e.g. `color.interactive.primary`, `color.text.inverse`) with light and dark mode values
3. **Component** — component-specific tokens referencing semantic tokens (e.g. `badge.default.background`)

### Color System

All colors are defined in OKLCH, which provides perceptually uniform lightness steps and supports the P3 wide-gamut color space. Color palettes include named scales (e.g. `fiery-coral`, `polar-night`, `sandcastle`) mapped to semantic roles.

### Token Pipeline

```
packages/tokens/
├── io/
│   ├── sync/          # Figma-synced raw token files (version controlled)
│   │   ├── primitive.json
│   │   ├── semantic.json
│   │   └── components.json
│   └── processed/     # Normalized W3C DTCG format (generated)
├── dist/              # Build output — CSS, JS, type declarations
├── scripts/           # Build and processing scripts
└── style-dictionary.config.js
```

Build runs: `process-token-io.js` → Style Dictionary → font loaders → TypeScript types.

### Token Outputs

```bash
# Import CSS variables
import "@wyliedog/tokens/tokens.css";          # All primitive tokens
import "@wyliedog/tokens/semantic-light.css";   # Semantic tokens, light mode
import "@wyliedog/tokens/semantic-dark.css";    # Semantic tokens, dark mode

# Import TypeScript values
import { colors } from "@wyliedog/tokens";
import { color, space } from "@wyliedog/tokens/hierarchical";
import { cssVars } from "@wyliedog/tokens/css-vars";
```

### Token Commands

```bash
pnpm --filter @wyliedog/tokens build        # Full build
pnpm --filter @wyliedog/tokens process-io   # Normalize sync files → processed
pnpm --filter @wyliedog/tokens audit        # Audit token usage
pnpm --filter @wyliedog/tokens test:tokens  # Validate token structure
```

## Storybook

Storybook is deployed to Netlify from `apps/storybook/storybook-static`.

**Live docs:** [https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/](https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/)

Stories are organized into:

- **Foundations** — Design Tokens, Design Principles, Accessibility Guidelines
- **Components** — all 43 components, grouped by category
- **Patterns** — Form Patterns, Navigation Patterns, Layout Patterns, Data Patterns, Feedback Patterns, Authentication Patterns, Page Compositions, Responsive, Overview
- **Showcase** — real-world usage examples

Addons: `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-vitest`, `@storybook/addon-links`.

Visual regression tests run with Playwright: `pnpm --filter storybook test:visual`.

## Figma Plugin

Located at `apps/figma-plugin` (version 0.2.0, beta). Enables design token sync between Figma and the codebase.

**Features:**

- Multi-format import: Style Dictionary, Tokens Studio, W3C DTCG
- Smart conflict detection and resolution
- GitHub integration — push tokens directly or open a PR
- OKLCH color space support

**Development setup:**

```bash
pnpm dev:figma

# Load in Figma:
# Plugins → Development → Import plugin from manifest
# Select: apps/figma-plugin/manifest.json
```

See `apps/figma-plugin/README.md` for full documentation.

## Development Workflow

### Scripts (run from repo root)

```bash
# Development
pnpm dev                        # Start all packages
pnpm dev:storybook              # Storybook only (port 6006)
pnpm dev:showcase               # Next.js app only (port 3001)
pnpm dev:figma                  # Figma plugin dev build

# Building
pnpm build                      # Build all packages
pnpm --filter @wyliedog/ui build        # Build component library only
pnpm --filter @wyliedog/tokens build    # Build tokens only

# Quality
pnpm lint                       # Lint all packages
pnpm lint:a11y                  # Accessibility linting
pnpm test                       # Run all tests
pnpm test:a11y                  # Accessibility tests
pnpm test:coverage              # Tests with coverage
pnpm test:watch                 # Tests in watch mode
pnpm format                     # Prettier format

# Scaffolding
pnpm generate:component <name>  # Scaffold a new component

# Performance
pnpm perf                       # Lighthouse + bundle checks
pnpm size                       # Bundle size report (size-limit)

# Releases
pnpm changeset                  # Create a changeset
pnpm version-packages           # Bump versions from changesets
pnpm release                    # Build + publish to npm
```

### CI/CD

GitHub Actions workflows run on PRs and pushes to `main`:

| Workflow                | Trigger        | Purpose                           |
| ----------------------- | -------------- | --------------------------------- |
| `build.yml`             | PR / push      | Build all packages                |
| `test.yml`              | PR / push      | Full test suite                   |
| `lint.yml`              | PR / push      | Lint all packages                 |
| `size.yml`              | PR / push      | Bundle size enforcement           |
| `lighthouse.yml`        | PR / push      | Lighthouse performance audit      |
| `visual-regression.yml` | PR / push      | Playwright visual regression      |
| `release.yml`           | push to `main` | Changesets versioning and publish |
| `rebuild-tokens.yml`    | scheduled      | Token rebuild                     |
| `figma-plugin-test.yml` | PR / push      | Plugin test suite                 |

Storybook is deployed to Netlify on every push. Config: `netlify.toml`.

### Token Usage in Components

Use the `-(--token-name)` arbitrary Tailwind syntax for any token-backed value. Do not substitute hardcoded Tailwind scale values.

```tsx
// Correct — token-backed
className = "bg-(--color-interactive-primary) text-(--color-text-inverse)";

// Incorrect — hardcoded scale
className = "bg-blue-500 text-white";
```

## License

MIT — see [LICENSE](LICENSE) for details.
