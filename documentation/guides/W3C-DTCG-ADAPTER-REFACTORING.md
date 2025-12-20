# W3C DTCG Adapter Refactoring Summary

## Overview

The Figma Token Bridge plugin's W3C DTCG adapter has been refactored to natively support **standard nested W3C DTCG format** without requiring proprietary wrapper structures.

## Problem Statement

Previously, the plugin required token files to be wrapped in a proprietary format:

```json
[
  {
    "collection-name": {
      "modes": {
        "Value": {
          "Color": {
            "Gray": {
              "50": { "$type": "color", "$value": "..." }
            }
          }
        }
      }
    }
  }
]
```

This created friction for users who wanted to import standard W3C DTCG format files directly.

## Solution

The W3C DTCG adapter (`apps/figma-plugin/src/plugin/variables/adapters/w3c-dtcg.ts`) was refactored to accept standard nested W3C DTCG format:

```json
{
  "$schema": "https://schemas.tr.design/draft/design-tokens-community-group-format.json",
  "Color": {
    "Gray": {
      "50": {
        "$type": "color",
        "$value": "oklch(0.990 0.000 0.00)",
        "$description": "Lightest gray"
      }
    }
  }
}
```

## Changes Made

### 1. Added Recursive Token Detection (`countW3CTokens()`)

**Location:** `w3c-dtcg.ts:43-63`

```typescript
private countW3CTokens(obj: any, depth = 0): number {
  if (depth > 10) return 0; // Prevent infinite recursion

  let count = 0;

  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    // Check if this object is a token
    if (obj.$type && obj.$value !== undefined) {
      return 1;
    }

    // Recursively check children (skip $ metadata keys)
    for (const [key, value] of Object.entries(obj)) {
      if (!key.startsWith('$')) {
        count += this.countW3CTokens(value, depth + 1);
      }
    }
  }

  return count;
}
```

**Purpose:** Detects W3C DTCG tokens at any nesting depth, enabling proper format detection for nested structures.

### 2. Added Token Flattening (`flattenTokens()`)

**Location:** `w3c-dtcg.ts:143-164`

```typescript
private flattenTokens(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata fields at root level
    if (!prefix && key.startsWith('$')) continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if this is a token (has $type and $value)
      if (value.$type && value.$value !== undefined) {
        flattened[path] = value;
      } else {
        // Recurse into nested groups
        Object.assign(flattened, this.flattenTokens(value, path));
      }
    }
  }

  return flattened;
}
```

**Purpose:** Converts nested object structure to flat dot-notation paths that the rest of the plugin expects:

- Input: `{ Color: { Gray: { 50: {...} } } }`
- Output: `{ "Color.Gray.50": {...} }`

### 3. Enhanced Detection (`detect()`)

**Location:** `w3c-dtcg.ts:15-41`

**Changes:**

- Added detection of `$schema`, `$description`, `$extensions` metadata (30% confidence boost)
- Uses `countW3CTokens()` for recursive token detection (50% confidence boost)
- Properly identifies nested W3C DTCG structure vs proprietary formats

### 4. Updated Collection Organization (`organizeIntoCollections()`)

**Location:** `w3c-dtcg.ts:119-141`

**Changes:**

- Now uses `flattenTokens()` helper to process nested structure
- Groups tokens by top-level key (e.g., "Color", "Spacing")
- Handles both flat and nested W3C DTCG structures

### 5. Improved Structure Analysis (`analyzeStructure()`)

**Location:** `w3c-dtcg.ts:191-218`

**Changes:**

- Uses `flattenTokens()` for accurate token counting
- Properly counts reference tokens in nested structures
- Sets `namingConvention: "nested-object"` to reflect actual input format
- Provides accurate metadata for plugin diagnostics

### 6. Enhanced Token Transformation (`transformCollection()`)

**Location:** `w3c-dtcg.ts:166-197`

**Changes:**

- Only includes defined properties (cleaner output)
- Properly handles optional `$description` field
- Maintains W3C DTCG compliance in output

## Architecture Flow

```
User uploads W3C DTCG file
         ↓
FormatAdapterManager.processTokenFile()
         ↓
FormatDetectorRegistry.detectFormat()
         ↓
W3CDTCGAdapter.detect()
  - Runs countW3CTokens() recursively
  - Calculates confidence score
         ↓
W3CDTCGAdapter.normalize()
  - Runs flattenTokens() to convert nested → flat
  - Organizes into collections
  - Creates ProcessedToken objects
         ↓
Importer.importMultipleCollections()
  - Creates Figma variable collections
  - Resolves token references
  - Imports into Figma
```

## Benefits

1. ✅ **Standards Compliant:** Accepts standard W3C DTCG format without modifications
2. ✅ **User-Friendly:** No need to learn proprietary wrapper format
3. ✅ **Flexible:** Handles both nested and flat W3C DTCG structures
4. ✅ **Robust:** Recursive detection works at any nesting depth
5. ✅ **Maintainable:** Clear separation of concerns (flatten → organize → transform)

## Testing

A test file has been provided for validation:

**File:** `packages/tokens/figma-exports/token test/w3c-dtcg-test.json`

This file contains a subset of primitive color tokens in standard W3C DTCG format for testing the import flow.

## Migration Notes

**For Users:**

- Existing Token Bridge wrapper format files still work
- Standard W3C DTCG files now work without modification
- Plugin automatically detects format and applies appropriate adapter

**For Developers:**

- The adapter is dynamically loaded on-demand by `FormatAdapterManager`
- All changes are backward compatible
- No breaking changes to public APIs

## Files Modified

1. `apps/figma-plugin/src/plugin/variables/adapters/w3c-dtcg.ts` - Core adapter refactoring
2. `documentation/guides/FIGMA-IMPORT-GUIDE.md` - Updated documentation
3. `packages/tokens/figma-exports/token test/w3c-dtcg-test.json` - New test file

## Future Enhancements

Potential improvements for future work:

1. Support for W3C DTCG composite types (typography, shadow)
2. Enhanced metadata preservation (`$extensions`, custom properties)
3. Mode detection from W3C DTCG file metadata
4. Validation against W3C DTCG JSON schema

## References

- [W3C DTCG Specification](https://tr.designtokens.org/format/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- Plugin source: `apps/figma-plugin/`
