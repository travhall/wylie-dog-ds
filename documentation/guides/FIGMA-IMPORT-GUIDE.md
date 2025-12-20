# Figma Token Import Guide

## Overview

Three JSON files have been generated for import into Figma, following the W3C DTCG (Design Tokens Community Group) format:

1. **figma-tokens-primitive.json** - Foundation color scales
2. **figma-tokens-semantic.json** - Context-based semantic tokens
3. **figma-tokens-component.json** - Component-specific tokens

## Enhanced Color Scheme

The new color palette features **increased vibrancy and saturation** compared to the original:

### Key Improvements:

- ✅ **20-30% more chroma** across all hues for richer, more vibrant colors
- ✅ **Added Cyan & Yellow** scales for better info and accent coverage
- ✅ **Enhanced Purple** for more striking accent colors
- ✅ **Optimized contrast ratios** maintaining WCAG AA compliance
- ✅ **OKLCH color space** for perceptually uniform brightness

### Color Scales Included:

- **Gray** (11 shades) - Neutral foundation
- **Blue** (11 shades) - Primary brand, enhanced vibrancy
- **Green** (11 shades) - Success states, fresh and vibrant
- **Orange** (11 shades) - Warning states, warm and noticeable
- **Red** (11 shades) - Danger/error states, clear alerts
- **Purple** (11 shades) - Accent colors, rich and saturated
- **Cyan** (11 shades) - Info states, fresh and modern
- **Yellow** (11 shades) - Highlights, bright and attention-grabbing

## Import Order

Import in this sequence to ensure proper token references:

### 1. Primitive Tokens (Foundation)

**File:** `figma-tokens-primitive.json`

These are your raw color values in OKLCH format. All other tokens reference these.

**Import as:** `Primitives` or `Foundation` collection

### 2. Semantic Tokens (Meaning)

**File:** `figma-tokens-semantic.json`

These reference primitive tokens and assign semantic meaning (e.g., "success", "danger").

**Import as:** `Semantic` or `Light Mode` collection

**Note:** References like `{Color.Gray.50}` will resolve to the primitive tokens.

### 3. Component Tokens (Application)

**File:** `figma-tokens-component.json`

These reference semantic tokens and define component-specific usage.

**Import as:** `Components` collection

**Note:** References like `{Color.Interactive.primary}` will resolve to semantic tokens, which then resolve to primitives.

## Figma Variables Setup

### RECOMMENDED: Using Wylie Dog Token Bridge Plugin (Native W3C DTCG Support)

The **Wylie Dog Token Bridge** plugin natively supports standard W3C DTCG format - no proprietary wrappers required!

1. **Open the plugin** in your Figma file
2. **Import tokens:**
   - Select `figma-tokens-primitive.json` → imports as "Color" collection
   - Select `figma-tokens-semantic.json` → imports semantic tokens
   - Select `figma-tokens-component.json` → imports component tokens

The plugin automatically:

- ✅ Detects nested W3C DTCG structure
- ✅ Creates Figma variable collections
- ✅ Resolves token references (`{Color.Blue.500}`)
- ✅ Converts OKLCH to Figma RGB format
- ✅ Validates token integrity

**Test file provided:** `w3c-dtcg-test.json` contains a small subset for testing the import flow.

### Alternative: Using Tokens Studio Plugin

1. **Install:** [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978)
2. **Open Plugin:** Plugins → Tokens Studio
3. **Import:**
   - Note: Tokens Studio may require the proprietary wrapper format
   - Use the files with Token Bridge wrapper if needed
   - Import `figma-tokens-primitive.json` → Set as "Primitives" collection
   - Import `figma-tokens-semantic.json` → Set as "Semantic" collection
   - Import `figma-tokens-component.json` → Set as "Components" collection

4. **Sync:** Push to Figma Variables

## Token Structure

### Primitive Format:

```json
{
  "Color": {
    "Blue": {
      "600": {
        "$type": "color",
        "$value": "oklch(0.570 0.240 262.88)",
        "$description": "Brand blue - Rich and saturated"
      }
    }
  }
}
```

### Semantic Format (References Primitives):

```json
{
  "Color": {
    "Interactive": {
      "primary": {
        "$type": "color",
        "$value": "{Color.Blue.600}",
        "$description": "Primary interactive element"
      }
    }
  }
}
```

### Component Format (References Semantic):

```json
{
  "Button": {
    "primary": {
      "background": {
        "$type": "color",
        "$value": "{Color.Interactive.primary}",
        "$description": "Primary button background"
      }
    }
  }
}
```

## Token Coverage

### Complete Coverage Includes:

**Semantic Tokens:**

- ✅ Background (9 variants)
- ✅ Surface (9 variants)
- ✅ Text (10 variants)
- ✅ Border (8 variants)
- ✅ Interactive (14 variants with hover states)

**Component Tokens:**

- ✅ Badge (6 variants)
- ✅ Button (5 variants with states)
- ✅ Input (all states)
- ✅ Alert (4 variants)
- ✅ Card
- ✅ Dialog
- ✅ Navigation
- ✅ Table
- ✅ Tooltip

**Total: 88 color scales × 11 shades = 968 primitive tokens**
**Plus: 50 semantic tokens**
**Plus: 45+ component tokens**

## Validation

After import, verify:

1. **Token References Resolve:** Check that semantic tokens properly reference primitives
2. **OKLCH Values Display:** Ensure Figma correctly interprets OKLCH color space
3. **Dark Mode Ready:** Structure supports adding dark mode collections later
4. **Component Coverage:** All components from Color Story are represented

## Next Steps

1. **Import all three files** into Figma
2. **Create mode variants** for light/dark themes
3. **Apply to designs** using the component tokens
4. **Sync back to code** using the Figma plugin when tokens are updated

## OKLCH Browser Support

These tokens use OKLCH for:

- ✅ Perceptually uniform lightness
- ✅ P3 wide color gamut support
- ✅ Better color manipulation
- ✅ Future-proof color science

Supported in:

- Chrome 111+
- Safari 16.4+
- Firefox 113+

## Questions?

Refer to:

- [W3C DTCG Spec](https://tr.designtokens.org/format/)
- [OKLCH Color Picker](https://oklch.com/)
- [Tokens Studio Docs](https://docs.tokens.studio/)
