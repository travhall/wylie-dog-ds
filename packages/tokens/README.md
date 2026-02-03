# @wyliedog/tokens

Design tokens for the Wylie Dog Design System. This package provides a bi-directional token sync between Figma and code, with production-ready CSS and JavaScript outputs.

## Features

- **Bi-directional Figma sync** via Token Bridge plugin
- **W3C DTCG compliant** token format
- **OKLCH color space** for perceptually uniform colors
- **Light/Dark mode** support with automatic separation
- **Tailwind CSS 4** integration via `@theme`
- **Hierarchical JS exports** for programmatic access

## Directory Structure

```
packages/tokens/
├── io/
│   ├── sync/           # Bi-directional Figma sync (source of truth)
│   │   ├── primitive.json
│   │   ├── semantic.json
│   │   └── components.json
│   └── processed/      # Build artifacts (mode-separated)
├── dist/               # Production outputs
│   ├── tokens.css      # Combined light + dark CSS
│   ├── semantic-light.css
│   ├── semantic-dark.css
│   ├── index.js        # Flat JS exports
│   ├── hierarchical.js # Nested JS exports
│   └── manifest.json   # Rich token metadata
├── scripts/            # Build and utility scripts
└── style-dictionary.config.js
```

## Installation

```bash
pnpm add @wyliedog/tokens
```

## Usage

### CSS

```css
/* Import all tokens (light + dark) */
@import "@wyliedog/tokens/tokens.css";

/* Or import separately */
@import "@wyliedog/tokens/semantic-light.css";
@import "@wyliedog/tokens/semantic-dark.css";
```

### JavaScript

```typescript
// Hierarchical (recommended)
import { color, spacing, shadow } from "@wyliedog/tokens/hierarchical";

const primaryBlue = color.blue[500]; // "oklch(0.623 0.188 259.82)"
const gap = spacing["4"]; // "1rem"

// Flat exports
import tokens from "@wyliedog/tokens";
const value = tokens["color.blue.500"];
```

### Tailwind CSS

Tokens are automatically available as utilities via `@theme`:

```html
<div class="bg-(--color-background-primary) text-(--color-text-primary)">
  Content
</div>
```

## Build Commands

```bash
# Full build (process + Style Dictionary + font loaders)
pnpm build

# Process tokens only (sync → processed)
pnpm process-io

# Development mode (watch for changes)
pnpm dev

# Validate token structure and references
pnpm test:tokens

# Audit token usage across components
pnpm audit
pnpm audit:verbose
```

## Scripts Reference

| Script                     | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `process-token-io.js`      | Main processor: format detection, OKLCH conversion, mode separation |
| `watch-tokens.js`          | File watcher for development                                        |
| `validate-tokens.js`       | Validates OKLCH values, references, and structure                   |
| `audit-tokens.js`          | Analyzes token usage across UI components                           |
| `generate-font-loaders.js` | Generates Next.js font configurations from tokens                   |
| `generate-token-map.js`    | Creates component → token mappings                                  |
| `color-utils.js`           | OKLCH ↔ hex conversion utilities                                    |
| `export-demo-tokens.mjs`   | Exports demo tokens for plugin testing                              |

## Token Pipeline

```
Figma Token Bridge → io/sync/ → process-token-io.js → io/processed/ → Style Dictionary → dist/
                        ↑
                        └────────────────── Write-back (round-trip) ──────────────────────────
```

### Processing Steps

1. **Format Detection**: Supports W3C DTCG, Legacy Adapter, and flat formats
2. **Color Conversion**: Hex → OKLCH using culori library
3. **Mode Separation**: Splits semantic tokens into light/dark files
4. **Reference Normalization**: Ensures consistent `{token.path}` format
5. **Write-back**: Updates `io/sync/` for Figma re-import

## Token Types

| Type         | CSS Prefix                        | Example                |
| ------------ | --------------------------------- | ---------------------- |
| `color`      | `--color-`                        | `--color-blue-500`     |
| `spacing`    | `--spacing-`                      | `--spacing-4`          |
| `shadow`     | `--shadow-`                       | `--shadow-md`          |
| `fontSize`   | `--font-size-`                    | `--font-size-lg`       |
| `fontWeight` | `--font-weight-`                  | `--font-weight-bold`   |
| `lineHeight` | `--line-height-`                  | `--line-height-normal` |
| `duration`   | `--duration-`                     | `--duration-200`       |
| `dimension`  | `--border-radius-` / `--spacing-` | `--border-radius-md`   |

## Figma Integration

The Token Bridge Figma plugin syncs tokens bi-directionally:

1. **Export from Figma**: Plugin commits to `io/sync/` via GitHub API
2. **Import to Figma**: Plugin pulls from `io/sync/` and creates Figma Variables

The plugin auto-detects Wylie Dog projects and uses `packages/tokens/io/sync/` as the default path.

## Contributing

1. Edit tokens in Figma using Token Bridge plugin
2. Run `pnpm build` to process and generate outputs
3. Run `pnpm test:tokens` to validate
4. Commit changes to `io/sync/` (source of truth)

## License

MIT
