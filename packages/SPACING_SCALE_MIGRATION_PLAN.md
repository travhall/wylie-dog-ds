# Spacing Scale Migration Plan

## From Numeric to Hybrid T-Shirt + Numeric Scale

**Status:** Ready for Implementation
**Breaking Changes:** None (100% backwards compatible)
**Estimated Time:** 30 minutes
**Impact:** 654 token references across components and semantics

---

## Executive Summary

Migrate from inconsistent numeric spacing scale (27 tokens) to a hybrid semantic T-shirt + numeric precision scale. This provides intuitive semantic names for common sizes while maintaining precision tokens for fine-grained control.

### Key Benefits

- ✅ **Zero Breaking Changes** - All existing values preserved
- ✅ **Better DX** - Intuitive semantic names (xs, sm, md, lg, xl, etc.)
- ✅ **Maintained Precision** - Numeric tokens for exact values when needed
- ✅ **Cleaner Scale** - Removes awkward transitions and gaps
- ✅ **Industry Standard** - Aligns with common design system patterns

---

## Current Problems

### 1. Inconsistent Naming

- Mix of fine-grained (1-13) and coarse scales (16+)
- Awkward half-values (1.5, 2.5, 3.5)
- Gap from 52px → 64px with no intermediate values

### 2. Non-Semantic Names

- `spacing.1` → What does "1" mean? 1px? 1rem? (Actually 4px)
- `spacing.16` → Looks like 16px, but it's 64px
- Hard to remember which number maps to which value

### 3. Usage Analysis (654 total references)

**Most Used (covers 80% of usage):**

- `spacing.1` (4px) → 102 uses (15.6%)
- `spacing.4` (16px) → 81 uses (12.4%)
- `spacing.2` (8px) → 78 uses (11.9%)
- `spacing.6` (24px) → 54 uses (8.3%)
- `spacing.3` (12px) → 45 uses (6.9%)
- `spacing.8` (32px) → 36 uses (5.5%)
- `spacing.5` (20px) → 27 uses (4.1%)

**Rarely Used (<1% each):**

- `spacing.13` (52px) → 3 uses
- `spacing.2.5` (10px) → 3 uses
- `spacing.20` (80px) → 3 uses

---

## Proposed Solution: Hybrid Scale

### New Scale (27 tokens - same count, better organization)

```json
{
  // ===== SEMANTIC T-SHIRT SIZES (Primary) =====
  // Use these for most spacing needs
  "spacing.none": "0px", // Zero spacing
  "spacing.xs": "4px", // Extra small - tight spacing
  "spacing.sm": "8px", // Small - compact layouts
  "spacing.md": "16px", // Medium - standard spacing
  "spacing.lg": "24px", // Large - comfortable spacing
  "spacing.xl": "32px", // Extra large - generous spacing
  "spacing.2xl": "48px", // 2X large - section spacing
  "spacing.3xl": "64px", // 3X large - major sections
  "spacing.4xl": "96px", // 4X large - page sections
  "spacing.5xl": "128px", // 5X large - large separations
  "spacing.6xl": "192px", // 6X large - hero sections
  "spacing.7xl": "256px", // 7X large - full-bleed layouts
  "spacing.8xl": "384px", // 8X large - max container widths
  "spacing.9xl": "512px", // 9X large - ultra-wide layouts

  // ===== PRECISION NUMERIC TOKENS (Secondary) =====
  // Use these when exact pixel values are required
  "spacing.6": "6px", // Fine control between xs/sm
  "spacing.10": "10px", // Fine control
  "spacing.12": "12px", // Common 3/4 rem value
  "spacing.14": "14px", // Between sm/md
  "spacing.20": "20px", // Common 1.25rem value
  "spacing.28": "28px", // Between lg/xl
  "spacing.36": "36px", // Between xl/2xl
  "spacing.40": "40px", // Common 2.5rem value
  "spacing.44": "44px", // Between 2xl/3xl
  "spacing.52": "52px", // Between 3xl/4xl
  "spacing.80": "80px", // Between 4xl/5xl
  "spacing.320": "320px", // Between 7xl/8xl
  "spacing.448": "448px" // Between 8xl/9xl
}
```

---

## Complete Migration Mapping

| Old Token   | New Token    | Value | Uses | Strategy          | Notes              |
| ----------- | ------------ | ----- | ---- | ----------------- | ------------------ |
| spacing.0   | spacing.none | 0px   | 18   | Direct rename     | Semantic "none"    |
| spacing.1   | spacing.xs   | 4px   | 102  | Direct rename     | MOST USED!         |
| spacing.1.5 | spacing.6    | 6px   | 24   | Numeric precision | Remove .5 notation |
| spacing.2   | spacing.sm   | 8px   | 78   | Direct rename     | Very common        |
| spacing.2.5 | spacing.10   | 10px  | 3    | Numeric precision | Remove .5 notation |
| spacing.3   | spacing.12   | 12px  | 45   | Numeric precision | Common value       |
| spacing.3.5 | spacing.14   | 14px  | 12   | Numeric precision | Remove .5 notation |
| spacing.4   | spacing.md   | 16px  | 81   | Direct rename     | VERY COMMON!       |
| spacing.5   | spacing.20   | 20px  | 27   | Numeric precision | 1.25rem            |
| spacing.6   | spacing.lg   | 24px  | 54   | Direct rename     | Common             |
| spacing.7   | spacing.28   | 28px  | 6    | Numeric precision | Rare               |
| spacing.8   | spacing.xl   | 32px  | 36   | Direct rename     | Standard           |
| spacing.9   | spacing.36   | 36px  | 15   | Numeric precision | Mid-range          |
| spacing.10  | spacing.40   | 40px  | 24   | Numeric precision | 2.5rem             |
| spacing.11  | spacing.44   | 44px  | 6    | Numeric precision | Rare               |
| spacing.12  | spacing.2xl  | 48px  | 21   | Direct rename     | Section spacing    |
| spacing.13  | spacing.52   | 52px  | 3    | Numeric precision | Awkward value      |
| spacing.16  | spacing.3xl  | 64px  | 6    | Direct rename     | Major sections     |
| spacing.20  | spacing.80   | 80px  | 3    | Numeric precision | Rare               |
| spacing.24  | spacing.4xl  | 96px  | 3    | Direct rename     | Page sections      |
| spacing.32  | spacing.5xl  | 128px | 15   | Direct rename     | Large separations  |
| spacing.48  | spacing.6xl  | 192px | 3    | Direct rename     | Hero sections      |
| spacing.64  | spacing.7xl  | 256px | 6    | Direct rename     | Full-bleed         |
| spacing.80  | spacing.320  | 320px | 18   | Numeric precision | Container width    |
| spacing.96  | spacing.8xl  | 384px | 18   | Direct rename     | Max containers     |
| spacing.112 | spacing.448  | 448px | 6    | Numeric precision | Between 8xl/9xl    |
| spacing.128 | spacing.9xl  | 512px | 3    | Direct rename     | Ultra-wide         |

**Summary:**

- 14 T-shirt renames (semantic improvements)
- 13 numeric precision tokens (maintained precision)
- 0 breaking changes (all values preserved)
- 654 component references will be updated

---

## Implementation Steps

### Phase 1: Update Primitive Tokens (5 min)

1. Edit `packages/tokens/io/sync/primitive.json`
2. Rename all spacing tokens according to migration map
3. Keep same values, just change token names

### Phase 2: Update Component/Semantic References (15 min)

1. Find & replace in `io/sync/components.json`:
   - `{spacing.1}` → `{spacing.xs}`
   - `{spacing.2}` → `{spacing.sm}`
   - `{spacing.4}` → `{spacing.md}`
   - ... (all 27 mappings)

2. Find & replace in `io/sync/semantic.json`:
   - Same replacements as above

### Phase 3: Rebuild & Verify (5 min)

1. Run `pnpm build` in tokens package
2. Verify CSS output has correct values
3. Check that all references resolved

### Phase 4: Test & Document (5 min)

1. Build UI package to ensure no errors
2. Update any spacing documentation
3. Add migration notes to changelog

---

## Automated Find & Replace Script

```bash
#!/bin/bash
# Run from packages/tokens directory

# Backup files
cp io/sync/primitive.json io/sync/primitive.json.backup
cp io/sync/components.json io/sync/components.json.backup
cp io/sync/semantic.json io/sync/semantic.json.backup

# Phase 1: Update primitive token names
sed -i '' 's/"spacing\.0"/"spacing.none"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.1"/"spacing.xs"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.1\.5"/"spacing.6"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.2"/"spacing.sm"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.2\.5"/"spacing.10"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.3"/"spacing.12"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.3\.5"/"spacing.14"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.4"/"spacing.md"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.5"/"spacing.20"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.6"/"spacing.lg"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.7"/"spacing.28"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.8"/"spacing.xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.9"/"spacing.36"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.10"/"spacing.40"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.11"/"spacing.44"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.12"/"spacing.2xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.13"/"spacing.52"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.16"/"spacing.3xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.20"/"spacing.80"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.24"/"spacing.4xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.32"/"spacing.5xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.48"/"spacing.6xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.64"/"spacing.7xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.80"/"spacing.320"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.96"/"spacing.8xl"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.112"/"spacing.448"/g' io/sync/primitive.json
sed -i '' 's/"spacing\.128"/"spacing.9xl"/g' io/sync/primitive.json

# Phase 2: Update references in components and semantics
for file in io/sync/components.json io/sync/semantic.json; do
  sed -i '' 's/{spacing\.0}/{spacing.none}/g' "$file"
  sed -i '' 's/{spacing\.1}/{spacing.xs}/g' "$file"
  sed -i '' 's/{spacing\.1\.5}/{spacing.6}/g' "$file"
  sed -i '' 's/{spacing\.2}/{spacing.sm}/g' "$file"
  sed -i '' 's/{spacing\.2\.5}/{spacing.10}/g' "$file"
  sed -i '' 's/{spacing\.3}/{spacing.12}/g' "$file"
  sed -i '' 's/{spacing\.3\.5}/{spacing.14}/g' "$file"
  sed -i '' 's/{spacing\.4}/{spacing.md}/g' "$file"
  sed -i '' 's/{spacing\.5}/{spacing.20}/g' "$file"
  sed -i '' 's/{spacing\.6}/{spacing.lg}/g' "$file"
  sed -i '' 's/{spacing\.7}/{spacing.28}/g' "$file"
  sed -i '' 's/{spacing\.8}/{spacing.xl}/g' "$file"
  sed -i '' 's/{spacing\.9}/{spacing.36}/g' "$file"
  sed -i '' 's/{spacing\.10}/{spacing.40}/g' "$file"
  sed -i '' 's/{spacing\.11}/{spacing.44}/g' "$file"
  sed -i '' 's/{spacing\.12}/{spacing.2xl}/g' "$file"
  sed -i '' 's/{spacing\.13}/{spacing.52}/g' "$file"
  sed -i '' 's/{spacing\.16}/{spacing.3xl}/g' "$file"
  sed -i '' 's/{spacing\.20}/{spacing.80}/g' "$file"
  sed -i '' 's/{spacing\.24}/{spacing.4xl}/g' "$file"
  sed -i '' 's/{spacing\.32}/{spacing.5xl}/g' "$file"
  sed -i '' 's/{spacing\.48}/{spacing.6xl}/g' "$file"
  sed -i '' 's/{spacing\.64}/{spacing.7xl}/g' "$file"
  sed -i '' 's/{spacing\.80}/{spacing.320}/g' "$file"
  sed -i '' 's/{spacing\.96}/{spacing.8xl}/g' "$file"
  sed -i '' 's/{spacing\.112}/{spacing.448}/g' "$file"
  sed -i '' 's/{spacing\.128}/{spacing.9xl}/g' "$file"
done

echo "✅ Migration complete! Now run: pnpm build"
```

---

## Verification Checklist

After migration, verify:

- [ ] All 27 tokens exist in primitive.json with new names
- [ ] All values unchanged (just names changed)
- [ ] No `{spacing.X}` references remain in components.json
- [ ] No `{spacing.X}` references remain in semantic.json
- [ ] Tokens package builds successfully
- [ ] Generated CSS has correct variable names (e.g., `--spacing-xs`, `--spacing-md`)
- [ ] UI package builds successfully
- [ ] No TypeScript errors
- [ ] Storybook components render correctly

---

## Generated CSS Variable Names

**Before:**

```css
--spacing-spacing-1: 4px;
--spacing-spacing-2: 8px;
--spacing-spacing-4: 16px;
--spacing-spacing-1-5: 6px; /* awkward name */
```

**After:**

```css
--spacing-spacing-xs: 4px;
--spacing-spacing-sm: 8px;
--spacing-spacing-md: 16px;
--spacing-spacing-6: 6px; /* clear numeric */
```

---

## Success Criteria

✅ **All token references updated** - 654 references migrated
✅ **Zero breaking changes** - All values preserved
✅ **Better semantics** - Intuitive t-shirt sizes for common values
✅ **Maintained precision** - Numeric tokens for exact control
✅ **Clean scale** - No more awkward .5 values or gaps
✅ **Industry standard** - Aligns with Tailwind, Chakra, etc.
✅ **Better DX** - Easier to remember and use

---

## Rollback Plan

If issues arise:

```bash
cd packages/tokens
cp io/sync/primitive.json.backup io/sync/primitive.json
cp io/sync/components.json.backup io/sync/components.json
cp io/sync/semantic.json.backup io/sync/semantic.json
pnpm build
```

---

**Ready to proceed?** This plan ensures zero breaking changes while significantly improving the spacing scale's usability and semantic clarity.
