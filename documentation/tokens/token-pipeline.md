# Design Token Pipeline Architecture

## Overview

The Wylie Dog design token system features a sophisticated **three-stage I/O pipeline** that transforms raw Figma exports into production-ready CSS and JavaScript assets. This document explains the complete flow from design to code.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOKEN PIPELINE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

    FIGMA DESIGN TOOL
          │
          │ Export (Token Bridge Plugin)
          │
          ▼
    ┌──────────────┐
    │  io/input/   │  ← Raw Figma exports (version controlled)
    └──────┬───────┘
           │
           │ process-token-io.js
           │ • Format detection (W3C DTCG / Legacy / Raw)
           │ • Hex → OKLCH conversion (Culori)
           │ • Mode separation (Light / Dark)
           │ • Reference normalization
           │
           ▼
    ┌──────────────┐
    │io/processed/ │  ← Normalized W3C DTCG tokens
    └──────┬───────┘
           │
           │ style-dictionary.config.js
           │ • CSS generation (@theme + :root)
           │ • JS hierarchical export
           │ • Type definition generation
           │
           ▼
    ┌──────────────┐
    │    dist/     │  ← Built assets for distribution
    └──────┬───────┘
           │
           │ Import in UI package
           │
           ▼
    ┌──────────────┐
    │  @wyliedog/  │  ← Consumed by applications
    │     ui       │
    └──────────────┘
```

## Stage 1: Input (`io/input/`)

**Purpose:** Store raw token exports from Figma in a version-controlled format.

**Files:**

```
io/input/
├── primitive.json    # Foundation color scales, spacing, typography
├── semantic.json     # Contextual tokens (light + dark modes mixed)
└── components.json   # Component-specific tokens
```

**Format Support:**
The pipeline automatically detects and processes multiple formats:

1. **W3C DTCG Format** (Recommended)

   ```json
   [
     {
       "primitive": {
         "modes": [{ "modeId": "583:1", "name": "Value" }],
         "variables": {
           "color.gray.50": {
             "$type": "color",
             "$value": "#ffffff"
           }
         }
       }
     }
   ]
   ```

2. **Legacy Adapter Format**

   ```json
   [{
     "semantic": {
       "modes": {
         "Light": { "color.background.primary": {...} },
         "Dark": { "color.background.primary": {...} }
       }
     }
   }]
   ```

3. **Flat Token Object**
   ```json
   {
     "color.gray.50": {
       "$type": "color",
       "$value": "#ffffff"
     }
   }
   ```

**Why version control input files?**

- Provides audit trail of design changes
- Enables rollback to previous token versions
- Documents the source of truth from Figma

## Stage 2: Processing (`io/processed/`)

**Purpose:** Normalize tokens into a consistent W3C DTCG format with mode separation and OKLCH conversion.

**Process:** `pnpm process-io` runs `scripts/process-token-io.js`

**Transformations:**

### 1. Format Detection

```javascript
detectFormat(data, filename)
  → "w3c-dtcg" | "legacy-adapter" | "w3c-dtcg-single" | "unknown"
```

The processor examines the structure of each input file and routes it to the appropriate handler.

### 2. Hex → OKLCH Conversion

```javascript
// Input: "#3b82f6"
convertHexToOklch("#3b82f6");
// Output: "oklch(0.623 0.188 259.81)"
```

**Precision Rules:**

- **Lightness (L):** 3 decimal places (0.000 - 1.000)
- **Chroma (C):** 3 decimal places (0.000 - 0.400 typical)
- **Hue (H):** 2 decimal places (0.00 - 360.00)

**Why OKLCH?**

- Perceptually uniform lightness across all hues
- Mathematical color relationships enable programmatic generation
- P3 wide gamut support (30% more colors than sRGB)
- Future-proof for CSS relative color syntax

### 3. Mode Separation

```javascript
// Input: semantic.json (mixed Light/Dark)
splitModes(data);
// Output: semantic-light.json + semantic-dark.json
```

Semantic and component tokens are split into separate light/dark mode files for clean separation.

### 4. Reference Normalization

```javascript
// Ensure consistent reference format
"{color.gray.50}" ✅  // Correct
"{Color.Gray.50}" ❌  // Gets normalized to above
```

**Output Files:**

```
io/processed/
├── primitive.json           # Foundation tokens (OKLCH converted)
├── semantic-light.json      # Light mode semantic tokens
├── semantic-dark.json       # Dark mode semantic tokens
├── component-light.json     # Light mode component tokens
└── component-dark.json      # Dark mode component tokens
```

**File Format (Normalized W3C DTCG):**

```json
{
  "color.background.primary": {
    "$type": "color",
    "$value": "{color.gray.50}"
  },
  "color.blue.500": {
    "$type": "color",
    "$value": "oklch(0.623 0.188 259.81)"
  }
}
```

## Stage 3: Build (`dist/`)

**Purpose:** Generate production-ready CSS and JavaScript from processed tokens.

**Process:** `pnpm build` runs Style Dictionary configuration

**Build Configuration:** `style-dictionary.config.js`

### CSS Generation

**1. Primitives CSS** (`dist/primitives.css`)

```css
/* Foundation tokens only */
@layer theme {
  :root,
  :host {
    --color-gray-50: oklch(1 0 0);
    --color-blue-500: oklch(0.623 0.188 259.81);
  }
}
```

**2. Semantic Light CSS** (`dist/semantic-light.css`)

```css
/**
 * Light mode semantic and component tokens
 * These are in @theme for Tailwind utility generation
 */
@theme inline {
  --color-background-primary: oklch(1 0 0);
  --color-text-primary: oklch(0.279 0.037 260.03);
}

@layer base {
  :root {
    --color-background-primary: oklch(1 0 0);
    --color-text-primary: oklch(0.279 0.037 260.03);
  }
}
```

**3. Semantic Dark CSS** (`dist/semantic-dark.css`)

```css
/**
 * Dark mode semantic and component tokens
 * Applied via .dark class
 */
.dark {
  --color-background-primary: oklch(0.208 0.04 265.75);
  --color-text-primary: oklch(0.984 0.003 247.86);
}
```

**4. Combined CSS** (`dist/tokens.css`)

```css
/* All tokens: primitives + light + dark */
```

**Why `@theme inline`?**
Tailwind CSS 4's `@theme` directive makes all tokens available as utilities:

```css
/* Token defined in @theme */
--color-background-primary: oklch(1.000 0.000 0.00);

/* Automatically becomes Tailwind utility */
<div class="bg-(--color-background-primary)">
```

### JavaScript Generation

**1. Hierarchical Export** (`dist/hierarchical.js`)

```javascript
export const color = {
  gray: {
    50: "oklch(1.000 0.000 0.00)",
    500: "oklch(0.711 0.035 256.79)",
  },
  blue: {
    500: "oklch(0.623 0.188 259.81)",
  },
};

export const background = {
  primary: "oklch(1.000 0.000 0.00)",
  secondary: "oklch(0.984 0.003 247.86)",
};
```

**2. Flat Export** (`dist/index.js`)

```javascript
export default {
  "color.gray.50": "oklch(1.000 0.000 0.00)",
  "color.background.primary": "oklch(1.000 0.000 0.00)",
};
```

**Usage:**

```javascript
// Hierarchical (recommended)
import { color, background } from "@wyliedog/tokens/hierarchical";
const primary = color.blue[500];
const bg = background.primary;

// Flat (backwards compatible)
import tokens from "@wyliedog/tokens";
const primary = tokens["color.blue.500"];
```

## Stage 4: Export (`io/export/`)

**Purpose:** Generate Figma-compatible token files for re-import to design tool.

**Process:** Processed tokens are copied to export directory in a format the Figma plugin can import.

**Files:**

```
io/export/
├── primitive.json    # For Figma import
├── semantic.json     # For Figma import
└── components.json   # For Figma import
```

This completes the **round-trip capability**: Figma → Code → Figma

## Complete Workflow Examples

### Example 1: Adding a New Primitive Color

**Step 1:** Export from Figma Token Bridge plugin

- Exports to `io/input/primitive.json` with hex values

**Step 2:** Process tokens

```bash
pnpm process-io
```

- Converts `"#3b82f6"` → `"oklch(0.623 0.188 259.81)"`
- Outputs to `io/processed/primitive.json`

**Step 3:** Build assets

```bash
pnpm build
```

- Generates CSS with `--color-blue-500: oklch(0.623 0.188 259.81)`
- Creates JS export: `color.blue[500] = "oklch(0.623 0.188 259.81)"`

**Step 4:** Use in components

```tsx
import { color } from "@wyliedog/tokens/hierarchical";

const primaryBlue = color.blue[500];
// "oklch(0.623 0.188 259.81)"
```

### Example 2: Adding a Semantic Token

**Step 1:** Export from Figma

- Add `color.background.brand` referencing `{color.blue.600}`
- Export to `io/input/semantic.json`

**Step 2:** Process tokens

```bash
pnpm process-io
```

- Separates light/dark modes
- Normalizes reference format
- Outputs to `io/processed/semantic-light.json` and `semantic-dark.json`

**Step 3:** Build assets

```bash
pnpm build
```

- Resolves reference chain: `{color.blue.600}` → `oklch(0.546 0.215 262.88)`
- Generates CSS: `--color-background-brand: oklch(0.546 0.215 262.88)`

**Step 4:** Use in Tailwind

```tsx
<div className="bg-(--color-background-brand)">Brand background</div>
```

### Example 3: Updating Dark Mode Tokens

**Step 1:** Update in Figma

- Change dark mode `background.primary` to lighter gray
- Export to `io/input/semantic.json`

**Step 2:** Process and build

```bash
pnpm build  # Runs process-io + style-dictionary
```

**Step 3:** Verify output

```bash
# Check dark mode file
cat io/processed/semantic-dark.json
cat dist/semantic-dark.css
```

**Step 4:** Test in browser

```html
<html class="dark">
  <!-- Dark mode tokens automatically applied -->
</html>
```

## Build Commands Reference

```bash
# Full pipeline (process + build)
pnpm build

# Process tokens only (input → processed)
pnpm process-io

# Build outputs only (processed → dist)
# (Run style-dictionary directly if needed)
node style-dictionary.config.js

# Clean all build artifacts
pnpm clean

# Clean legacy src/ directory (one-time)
pnpm clean:legacy
```

## File Watching & Development

For active development, use the monorepo dev command:

```bash
# Start entire monorepo in watch mode
pnpm dev

# Rebuild tokens when input files change
pnpm --filter @wyliedog/tokens build --watch
```

## Token Resolution Chain

Understanding how token references resolve:

```
Component Token
    ↓ references
Semantic Token
    ↓ references
Primitive Token
    ↓ actual value
OKLCH Color Value
```

**Example:**

```json
// Component token
"button.primary.background": {
  "$value": "{color.interactive.primary}"
}

// Semantic token
"color.interactive.primary": {
  "$value": "{color.blue.600}"
}

// Primitive token
"color.blue.600": {
  "$value": "oklch(0.546 0.215 262.88)"
}
```

**Resolution:**

1. Start: `button.primary.background`
2. Resolves to: `color.interactive.primary`
3. Resolves to: `color.blue.600`
4. Final value: `oklch(0.546 0.215 262.88)`

Style Dictionary handles this resolution automatically during build.

## Troubleshooting

### Issue: Tokens not updating in UI

**Solution:**

```bash
# Full rebuild
pnpm clean
pnpm build

# Rebuild UI package
pnpm --filter @wyliedog/ui build
```

### Issue: OKLCH conversion failed

**Check:**

1. Input is valid hex color: `#3b82f6` (not `3b82f6`)
2. Culori is installed: `pnpm install`
3. Review warnings in console during `process-io`

**Manual verification:**

```javascript
import { convertHexToOklch } from "./scripts/color-utils.js";
console.log(convertHexToOklch("#3b82f6"));
// Should output: "oklch(0.623 0.188 259.81)"
```

### Issue: Token references broken

**Check:**

1. Reference syntax: `{color.blue.500}` not `{{color.blue.500}}`
2. Referenced token exists in primitive.json
3. No circular references

**Validation:**

```bash
pnpm test:tokens  # Validates references (if implemented)
```

### Issue: Mode separation incorrect

**Check:**

1. Input file has mode data: `modes: { Light: {...}, Dark: {...} }`
2. Tokens are in correct mode object
3. Check console output during `process-io` for warnings

## Performance Considerations

**Build Times:**

- Token processing: ~200ms
- Style Dictionary build: ~800ms
- **Total: ~1 second** ✅

**File Sizes:**

- `tokens.css`: ~38KB (uncompressed)
- `semantic-light.css`: ~30KB
- `semantic-dark.css`: ~8KB
- All files gzip to ~30% of original size

**Optimization:**

- Only import what you need: `@import "@wyliedog/tokens/semantic-light.css"`
- Tailwind CSS purges unused utilities automatically
- Token count has minimal impact on runtime performance (CSS custom properties are efficient)

## Best Practices

### 1. Version Control

✅ **Commit:** `io/input/` files (source of truth)
❌ **Don't commit:** `io/processed/` and `dist/` (build artifacts)

### 2. Token Naming

✅ **Use semantic names:** `color.background.primary`
❌ **Avoid appearance names:** `color.light-gray`

✅ **Be consistent with scales:** 50, 100, 200, ..., 900, 950
❌ **Avoid arbitrary scales:** 25, 150, 275

### 3. Mode Handling

✅ **Separate modes in Figma:** Use proper Light/Dark mode collections
❌ **Don't mix modes:** Creates confusion in processing

### 4. Reference Chains

✅ **Keep chains short:** Component → Semantic → Primitive
❌ **Avoid deep nesting:** Component → Semantic → Semantic → Semantic → Primitive

### 5. Color Format

✅ **Export hex from Figma:** Let pipeline convert to OKLCH
❌ **Don't manually write OKLCH:** Use conversion for consistency

## Advanced Topics

### Custom Token Types

Add support for new token types in `style-dictionary.config.js`:

```javascript
if (token.$type === "dimension") {
  const dimensionName = `--dimension-${name}`;
  themeVariables.push(`  ${dimensionName}: ${token.$value};`);
}
```

### Platform-Specific Outputs

Generate tokens for iOS/Android:

```javascript
// Add to style-dictionary.config.js
platforms: {
  ios: {
    transformGroup: 'ios',
    buildPath: 'dist/ios/',
    files: [{
      destination: 'tokens.swift',
      format: 'ios-swift/class.swift'
    }]
  }
}
```

### Token Validation

Implement validation hooks in `process-token-io.js`:

```javascript
validateTokenValue(token) {
  if (token.$type === 'color' && token.$value.startsWith('oklch')) {
    const [l, c, h] = parseOklch(token.$value);
    if (l < 0 || l > 1) throw new Error(`Invalid lightness: ${l}`);
    if (c < 0 || c > 0.4) console.warn(`Unusual chroma: ${c}`);
  }
}
```

## Future Enhancements

- [ ] Automated token usage reporting
- [ ] Visual regression testing for token changes
- [ ] Token documentation generator
- [ ] Multi-brand theming support
- [ ] Token validation in CI/CD
- [ ] iOS/Android platform outputs

## References

- [W3C DTCG Specification](https://tr.designtokens.org/format/)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [OKLCH Color Space](https://oklch.com/)
- [Tailwind CSS 4 @theme](https://tailwindcss.com/docs/theme)
- [Culori Color Library](https://culorijs.org/)
