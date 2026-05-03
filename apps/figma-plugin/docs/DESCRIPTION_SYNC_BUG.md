# Font Description Sync Bug Investigation

## Problem Statement

**Goal**: Bidirectionally sync `$description` field on `fontFamily` tokens between Figma variables and GitHub JSON files.

**Current Status**:

- ✅ `typography.font-family.sans` description syncs correctly (Figma ↔ GitHub)
- ❌ `typography.font-family.mono` description does NOT sync from GitHub → Figma
- Both descriptions exist in GitHub source file: `packages/tokens/io/sync/primitive.json`

## Description Pattern

The `$description` field contains a `@fontSource()` pattern used by `packages/tokens/scripts/generate-font-loaders.js`:

```json
{
  "typography.font-family.sans": {
    "$type": "fontFamily",
    "$value": "Inter",
    "$description": "@fontSource(provider:google,weights:400-500-600-700-800,subsets:latin,display:swap)"
  },
  "typography.font-family.mono": {
    "$type": "fontFamily",
    "$value": "JetBrains Mono",
    "$description": "@fontSource(provider:google,weights:400-500-600-700,subsets:latin,display:swap)"
  }
}
```

## Data Flow Traced

### Pull Operation (GitHub → Figma)

```
GitHub JSON
→ GitHub Client (client.ts) ✅ both descriptions exist
→ Conflict Detector (conflict-detector.ts) ✅ both descriptions exist
→ ??? MISSING STEP ???
→ Adapter (wylie-dog-native.ts) ❌ both descriptions MISSING
→ Importer (importer.ts) ❌ can't set missing descriptions
→ Figma Variables
```

## Key Evidence from Console Logs

```
🔍 CLIENT PARSED primitive.json:
  sans has $description: true
  mono has $description: true
```

```
🔍 CONFLICT DETECTOR ENTRY:
  Collection primitive:
    sans $description: true
    mono $description: true
```

```
⚠️ ADAPTER MISSING: primitive.typography.font-family.sans
⚠️ ADAPTER MISSING: primitive.typography.font-family.mono
```

**Critical Finding**: Descriptions exist ENTERING conflict detection but are MISSING when they reach the adapter.

## Files Investigated

### 1. `/apps/figma-plugin/src/plugin/github/client.ts`

- **Lines 159-180**: Fetches and parses GitHub JSON
- **Added debug logs**: Confirmed both descriptions exist after `JSON.parse()`
- ✅ NOT the problem - data is correct here

### 2. `/apps/figma-plugin/src/plugin/sync/conflict-detector.ts`

- **Lines 18-131**: Main conflict detection entry point
- **Lines 22-36**: Added debug log showing descriptions exist at entry
- **Lines 65-72**: Calls `metadataManager.addSyncMetadataToExportData()`
- ⚠️ Descriptions exist BEFORE this call, MISSING after

### 3. `/apps/figma-plugin/src/plugin/sync/metadata-manager.ts`

- **Lines 57-73**: `addSyncMetadata()` - uses spread operator `{...token, $syncMetadata}`
- **Lines 78-93**: `addSyncMetadataToCollection()` - processes each token
- **Lines 98-114**: `addSyncMetadataToExportData()` - processes collections
- **Lines 18-52**: `generateTokenHash()` - DOES include `$description` in hash
- ⚠️ Spread operator SHOULD preserve all fields including `$description`

### 4. `/apps/figma-plugin/src/plugin/sync/conflict-resolver.ts`

- **Lines 275-303**: `stripSyncMetadata()` - explicitly includes `$description: token.$description`
- ✅ NOT the problem - would preserve descriptions

### 5. `/apps/figma-plugin/src/plugin/variables/adapters/wylie-dog-native.ts`

- **Lines 68-151**: `normalize()` - passes data through unchanged (`data: data`)
- **Lines 88-98**: Added debug log showing descriptions MISSING
- ❌ Descriptions already missing when reaching adapter

### 6. `/apps/figma-plugin/src/plugin/variables/importer.ts`

- **Lines 435-461**: Creates Figma variables and sets descriptions
- **Key code**: `if (token.$description) { variable.description = token.$description; }`
- ✅ Logic is correct, but can't set what's missing

### 7. `/apps/figma-plugin/src/ui/hooks/domain/useGitHubSync.ts`

- **Lines 190-310**: `handleGitHubPull()` - main pull flow
- **Lines 230-231**: Calls `pullTokensWithConflictDetection()`
- **Lines 237-252**: Handles conflicts if any (returns early)
- **Lines 257-310**: NO CONFLICTS path - should send to import
- **Lines 279-294**: Added debug logs (THESE NEVER EXECUTE!)
- ⚠️ The normal pull flow logs are NOT appearing in console

### 8. `/apps/figma-plugin/src/plugin/sync/conflict-aware-github-client.ts`

- **Lines 36-93**: `pullTokensWithConflictDetection()`
- **Lines 65-68**: Calls `conflictDetector.detectConflicts()`
- **Lines 70-78**: Returns with conflicts if any
- **Lines 81-84**: Returns WITHOUT conflicts (no mutation expected)

## Mysterious Flow Issue

The console shows:

```
📥 Importing resolved tokens to Figma...
```

This message is from `handleConflictResolution` (line 389 of useGitHubSync.ts), NOT from `handleGitHubPull`.

**But**:

- No conflict UI appeared
- Conflict detector found 0 conflicts
- `handleGitHubPull` should have proceeded to line 257-310

**Missing debug logs**:

- `📊 PULL CHECK` (line 277) - NOT in console
- `🔍 BEFORE IMPORT` (line 287) - NOT in console

This suggests the code flow is NOT going through the expected path (lines 257-310 in `handleGitHubPull`).

## Theories

### Theory 1: Conflict Detection Mutates Original Object

The `addSyncMetadataToExportData()` might be mutating `pullResult.tokens` instead of creating a new object, stripping `$description` fields in the process.

**Counter-evidence**: Uses spread operator which should preserve fields.

### Theory 2: JSON.stringify Strips Undefined

If `$description` is `undefined` (not missing, but explicitly undefined), `JSON.stringify()` will remove it.

**Where to check**: Line 299 in useGitHubSync.ts:

```typescript
content: JSON.stringify(pullResult.tokens, null, 2),
```

### Theory 3: Different Code Path Entirely

The `📥 Importing resolved tokens` message suggests conflict resolution is running even with 0 conflicts. Maybe there's an auto-resolution happening?

**Added debug log** (not yet tested):

```typescript
// Line 298-300 in useGitHubSync.ts
console.log(
  `🔧 handleConflictResolution called with ${resolutions.length} resolutions`
);
console.log(`  conflictOperationType: ${conflictOperationType}`);
```

## Next Steps

### Immediate Actions

1. **Test the latest build** with new debug logs to see:
   - Is `handleConflictResolution` being called?
   - Why aren't the `PULL CHECK` and `BEFORE IMPORT` logs appearing?

2. **Add log RIGHT BEFORE adapter is called** to see exact data state:

   ```typescript
   // In token-handlers.ts, before calling parseTokenFile
   console.log(
     "🔍 DATA BEFORE ADAPTER:",
     JSON.stringify(file.content).includes("$description")
   );
   ```

3. **Check if spread operator preserves undefined**:
   ```typescript
   // Test in metadata-manager.ts addSyncMetadata
   const test = { ...token };
   console.log("SPREAD TEST:", test.$description);
   ```

### Root Cause Hypotheses (Priority Order)

1. **MOST LIKELY**: The conflict detection system's `addSyncMetadataToExportData()` is somehow stripping `$description` when it shouldn't. The spread operator might not be preserving fields with undefined values.

2. **LIKELY**: There's a type mismatch where `ProcessedToken` expects `$description?: string` but somewhere it's being set to `undefined` explicitly, which gets stripped by JSON.stringify.

3. **POSSIBLE**: The data flow is going through a different code path than expected (conflict resolution instead of normal pull).

## Code Locations Reference

### Debug Logs Added

- `client.ts:169-173` - Check descriptions after JSON.parse
- `conflict-detector.ts:22-36` - Check descriptions entering conflict detection
- `wylie-dog-native.ts:88-98` - Check descriptions in adapter
- `useGitHubSync.ts:277` - PULL CHECK log
- `useGitHubSync.ts:279-294` - BEFORE IMPORT log
- `useGitHubSync.ts:298-300` - handleConflictResolution entry log (NEW)

### Critical Functions

- `conflict-detector.ts:detectConflicts()` - Where descriptions go missing
- `metadata-manager.ts:addSyncMetadata()` - Line 69: `{...token, $syncMetadata}`
- `metadata-manager.ts:addSyncMetadataToCollection()` - Line 86: Processes each token
- `metadata-manager.ts:generateTokenHash()` - Line 20-25: Includes $description

### Data Transformation Points

1. GitHub JSON → client.ts (✅ descriptions present)
2. client.ts → conflict-detector.ts (✅ descriptions present)
3. conflict-detector.ts → metadata-manager.ts (❓ transformation happens here)
4. metadata-manager.ts → ??? (❌ descriptions missing)
5. ??? → adapter (❌ descriptions missing)
6. adapter → importer (❌ descriptions missing)

## Working Example vs Broken

### Sans (WORKS) vs Mono (BROKEN)

Both have identical structure in GitHub JSON. Both show up in early logs. The bug affects BOTH equally - neither description reaches Figma. The earlier observation that "sans works" was incorrect - checking Figma variables shows neither has descriptions after pull.

## Testing Procedure

1. Open Figma plugin
2. Click "Pull from GitHub"
3. Check console for these logs in order:
   - `🔍 CLIENT PARSED` - should show both true
   - `🔍 CONFLICT DETECTOR ENTRY` - should show both true
   - `📊 PULL CHECK` or `🔧 handleConflictResolution` - which path?
   - `🔍 BEFORE IMPORT` - does this appear?
   - `⚠️ ADAPTER MISSING` - currently shows both missing
4. Check Figma variables after import - descriptions should be set

## Related Files

- `packages/tokens/io/sync/primitive.json` - Source of truth for remote tokens
- `packages/tokens/scripts/generate-font-loaders.js` - Consumes `$description` field
- `packages/tokens/FONTS.md` - Documentation of font loading system

## Build Commands

```bash
cd /Users/travishall/GitHub/wylie-dog-ds/apps/figma-plugin
pnpm build
```

Then reload plugin in Figma.

---

**Last Updated**: 2026-01-10
**Status**: Bug location narrowed to conflict detection system, exact stripping point still unknown
**Priority**: HIGH - Blocks font loader generation for showcase app
