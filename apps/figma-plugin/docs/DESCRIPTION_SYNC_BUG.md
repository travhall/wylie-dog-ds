# Font Description Sync Bug — RESOLVED

**Status:** Resolved 2026-07-02 (root cause fixed + regression tests). See caveat below.
**Original priority:** HIGH — blocked `@fontSource()` font-loader generation.

## Symptom

`$description` on `fontFamily` tokens (the `@fontSource(...)` directive consumed by
`packages/tokens/scripts/generate-font-loaders.js`) did not sync GitHub → Figma.
Pulling from GitHub showed **no conflict** and the descriptions never reached the
Figma variables. The adapter logged `⚠️ ADAPTER MISSING` for the font tokens.

## Root cause

An inconsistency between change **detection** and conflict **comparison** in
`sync/conflict-detector.ts`:

- `metadata-manager.generateTokenHash()` **includes** `$description`, so a
  description-only edit made `hasTokenChanged()` return `true`.
- But `compareTokens()` only compared `$type`, `$value`, and `valuesByMode` — it
  **ignored `$description`**. So the token was flagged "changed" yet produced
  **zero conflicts**.

With zero conflicts, the pull's resolution used the local (Figma) tokens as its
base — which lacked the GitHub description — so the description was never applied.
The `ADAPTER MISSING` warning was a _symptom_ of that (local-based data reaching
the adapter), not the cause. The pipeline itself (`addSyncMetadata`,
`stripSyncMetadata`, the adapter, the importer) preserves `$description` correctly.

## Fix

In `conflict-detector.ts`:

1. Added `hasDescriptionChanged()` — compares `$description` after stripping any
   embedded `<!-- SYNC_METADATA:… -->` marker and treating empty/undefined as
   equal (so sync-metadata noise doesn't create false conflicts).
2. `compareTokens()` now surfaces a description-only change as a `value-change`
   conflict (and no longer suppresses it in the "type changed but value identical"
   branch).
3. `createValueChangeConflict()` wording adapts to "Description changed…" when the
   displayed values are equal.

Because the change is auto-resolvable (primitive value) it auto-takes remote on
pull, applying the GitHub description to the Figma variable. It converges: once
Figma stores the description, subsequent pulls compare equal → no conflict.

## Tests

`sync/__tests__/conflict-detector.test.ts` → "description changes (font-source sync)":

- flags a description-only change as a conflict (was 0, now 1)
- does not flag identical descriptions

## Caveat

Verified via static trace + unit tests at the detection/resolution layer. The
final Figma-write step (`importer.ts` setting `variable.description`) is verified
statically only — a live in-Figma pull is the last confirmation, since the plugin
can't be exercised in the test runner.
