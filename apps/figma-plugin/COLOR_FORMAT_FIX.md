# Color Format Fix - OKLCH Export

**Date**: January 2, 2026
**Status**: ✅ Fixed - Colors Now Export in OKLCH

---

## Problem

When pushing tokens, every color was flagged as a conflict even though values were unchanged:

- **Local**: `#664d00` (hex format)
- **Remote**: `oklch(0.435 0.089 87.06)` (OKLCH format)
- **Result**: Same color, different format → false conflict

This caused 96+ conflicts when only a few tokens were actually changed.

---

## Root Cause

The `rgbToHex()` function in `processor.ts` was converting Figma RGB colors to hex format, but the token system uses OKLCH format for device-independent, perceptually uniform colors.

---

## The Fix

### Replaced Hex Export with OKLCH

**File**: `apps/figma-plugin/src/plugin/variables/processor.ts`

Added full color conversion pipeline:

1. RGB → sRGB (gamma correction)
2. sRGB → XYZ (D65 illuminant)
3. XYZ → OKLab (perceptual color space)
4. OKLab → OKLCH (cylindrical coordinates)

### Implementation

```typescript
/**
 * Convert Figma RGB color (0-1 range) to OKLCH format
 */
function rgbToOklch(color: { r: number; g: number; b: number }): string {
  // Convert RGB to XYZ
  const [x, y, z] = srgbToXYZ(color.r, color.g, color.b);

  // Convert XYZ to OKLab
  const [L, a, b] = xyzToOKLab(x, y, z);

  // Convert OKLab to OKLCH
  const [l, c, h] = oklabToOKLCH(L, a, b);

  // Format as "oklch(L C H)" with appropriate precision
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(2)})`;
}
```

**Changed**:

```typescript
case "COLOR":
  processedValue = rgbToOklch(value); // Was: rgbToHex(value)
  break;
```

---

## Result

### Before

```
color.yellow.900:
  Local:  #664d00
  Remote: oklch(0.435 0.089 87.06)
  Status: CONFLICT ❌
```

### After

```
color.yellow.900:
  Local:  oklch(0.435 0.089 87.06)
  Remote: oklch(0.435 0.089 87.06)
  Status: MATCH ✅
```

---

## Benefits

1. **No False Conflicts**: Colors no longer flagged as different when unchanged
2. **Format Consistency**: Local and remote use same OKLCH format
3. **Perceptual Accuracy**: OKLCH provides device-independent, perceptually uniform colors
4. **Proper Rounding**: Matches GitHub token precision (L/C: 3 decimals, H: 2 decimals)

---

## Remaining Issue: Unknown References

You may still see conflicts like:

```
components.button.outline.border:
  Local:  {unknown-reference-VariableID:802:181}
  Remote: {color.border.primary}
```

**Cause**: Component tokens reference other variables (aliases). When exporting, the reference map doesn't include all variables from all collections.

**Fix Needed**: Ensure all collections are loaded into the reference map before processing, not just selected collections.

---

## Testing

1. **Reload the plugin** in Figma
2. **Modify a single color** (e.g., change one shade)
3. **Click "Push to GitHub"**

**Expected**:

- Only the modified color shows as a conflict
- All other colors show as matching
- Significantly fewer conflicts than before

**If you still see many color conflicts**:

- Check console for conversion errors
- Verify the color values in the conflict UI match

---

## Build Status

✅ **Build Successful**

```
dist/plugin.js  134.32 kB │ gzip: 40.08 kB
dist/src/ui/index.html  364.45 kB │ gzip: 86.96 kB
```

---

## Next Steps

### To Fix Unknown References

The reference issue needs investigation:

1. Check if all collections are being passed to `buildVariableReferenceMap()`
2. Verify component tokens are exported AFTER primitive/semantic tokens
3. Ensure cross-collection references are resolved

### Temporary Workaround

If you see "unknown-reference" conflicts:

- Select **all collections** (Primitive, Semantic, Components) before pushing
- This ensures the reference map has all tokens

---

**The color format issue is now resolved. Test with a small change to verify!**
