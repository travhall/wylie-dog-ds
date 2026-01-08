# Push After Conflict Resolution Fix

**Date**: January 1, 2026
**Status**: ✅ Fixed - Ready for Testing

---

## Problem

When resolving conflicts during a **push** operation and selecting "keep local", the plugin was not pushing the resolved tokens to GitHub. Instead, it was only importing them back to Figma (which is correct for pull, but not for push).

**User Report**: "When I push or sync and chose 'keep local', it doesn't push to the repo as expected"

---

## Root Cause

The `handleConflictResolution` function was treating both push and pull conflicts the same way:

1. Resolve conflicts
2. Import resolved tokens to Figma

This is correct for **pull** but wrong for **push**. For push, it should:

1. Resolve conflicts
2. **Push resolved tokens to GitHub**

---

## The Fix

### Files Modified

1. **`apps/figma-plugin/src/ui/hooks/usePluginMessages.ts`**
   - Added `conflictOperationType` state to track whether conflicts came from push or pull
   - Updated types and exports

2. **`apps/figma-plugin/src/ui/hooks/domain/useGitHubSync.ts`**
   - Updated `handleGitHubSync` to set `conflictOperationType = "push"` when push conflicts occur
   - Updated `handleGitHubPull` to set `conflictOperationType = "pull"` when pull conflicts occur
   - Updated `handleConflictResolution` to:
     - **For push**: Call `githubClient.syncTokens(resolvedTokens)` to push to GitHub
     - **For pull**: Call `import-tokens` to import to Figma

3. **`apps/figma-plugin/src/ui/App.tsx`**
   - Pass `conflictOperationType` to `useGitHubSync`

---

## How It Works Now

### Push with Conflicts

```
1. User clicks "Push to GitHub"
2. Plugin detects conflicts with remote
3. Sets conflictOperationType = "push"
4. Shows conflict UI
5. User resolves conflicts (keep local)
6. Plugin applies resolutions
7. ✅ Plugin calls syncTokens() to PUSH resolved tokens to GitHub
8. Success message: "✅ Pushed to GitHub successfully!"
```

### Pull with Conflicts

```
1. User clicks "Pull from GitHub"
2. Plugin detects conflicts with local
3. Sets conflictOperationType = "pull"
4. Shows conflict UI
5. User resolves conflicts (keep local)
6. Plugin applies resolutions
7. ✅ Plugin imports resolved tokens to Figma
8. Success message: "✅ Conflicts resolved and applied!"
```

---

## Code Changes

### State Addition

```typescript
// Added to usePluginMessages.ts
const [conflictOperationType, setConflictOperationType] = useState<
  "push" | "pull" | null
>(null);
```

### Push Conflict Detection

```typescript
// In handleGitHubSync (push operation)
if (syncResult.conflicts && syncResult.conflicts.length > 0) {
  actions.setConflicts(syncResult.conflicts);
  actions.setConflictOperationType("push"); // ✅ Mark as push
  actions.setPendingTokensForConflictResolution({
    local: exportData,
    remote: syncResult.remoteTokens || [],
  });
  actions.setShowConflictResolution(true);
  return;
}
```

### Pull Conflict Detection

```typescript
// In handleGitHubPull (pull operation)
if (pullResult.requiresConflictResolution && pullResult.conflicts) {
  actions.setConflicts(pullResult.conflicts);
  actions.setConflictOperationType("pull"); // ✅ Mark as pull
  actions.setPendingTokensForConflictResolution({
    local: localTokens,
    remote: pullResult.tokens || [],
  });
  actions.setShowConflictResolution(true);
  return;
}
```

### Conflict Resolution Handler

```typescript
const handleConflictResolution = useCallback(
  async (resolutions: ConflictResolution[]) => {
    try {
      // ... resolve conflicts ...

      // Handle based on operation type
      if (conflictOperationType === "push") {
        // ✅ For push: sync the resolved tokens to GitHub
        console.log("🔄 Resuming push after conflict resolution...");
        actions.setLoadingMessage("Pushing resolved tokens to GitHub...");

        const syncResult = await githubClient.syncTokens(resolvedTokens);

        if (syncResult.success) {
          actions.setSuccessMessage("✅ Pushed to GitHub successfully!");
        } else {
          actions.setError(syncResult.error || "Push failed");
        }
      } else {
        // ✅ For pull: import the resolved tokens into Figma
        console.log("📥 Importing resolved tokens to Figma...");
        parent.postMessage({
          pluginMessage: {
            type: "import-tokens",
            files: resolvedTokens.map(/* ... */),
          },
        });

        actions.setSuccessMessage("✅ Conflicts resolved and applied!");
      }
    } finally {
      actions.setConflictOperationType(null); // ✅ Clear operation type
      // ... cleanup ...
    }
  },
  [githubClient, actions, pendingExportData, conflictOperationType]
);
```

---

## Testing Instructions

### Test Push with "Keep Local"

1. **Modify a variable in Figma**
   - Example: Change `color/blue/500` from `#0000ff` to `#00ff00`

2. **Click "Push to GitHub"** (or Smart Sync)

3. **Conflict UI appears**
   - Shows: Local `#00ff00` vs Remote `#0000ff`

4. **Select "Keep Local" for all conflicts**

5. **Click "Resolve"**

6. **Expected Result**:

   ```
   🔄 Resuming push after conflict resolution...
   ✅ Pushed to GitHub successfully!
   ```

7. **Verify in GitHub**:
   - Go to your repository
   - Check `packages/tokens/io/sync/primitive.json` (or relevant file)
   - Should show `#00ff00` (your local value)

### Test Push with "Keep Remote"

1. **Modify a variable in Figma** to value A
2. **GitHub has** value B (different)
3. **Click "Push to GitHub"**
4. **Select "Keep Remote"** for conflicts
5. **Click "Resolve"**
6. **Expected Result**:
   - Pushed to GitHub with remote value (B)
   - Your local change (A) is overridden

### Test Pull with "Keep Local"

1. **Modify a variable in Figma**
2. **Click "Pull from GitHub"**
3. **Select "Keep Local"** for conflicts
4. **Click "Resolve"**
5. **Expected Result**:
   - Your Figma variable keeps your local value
   - NOT pushed to GitHub (pull doesn't push)

---

## Console Output

With diagnostic logging, you'll see:

### Push Flow

```
🚀 Starting conflict-aware sync...
🔍 Starting conflict-aware pull...
⚠️ Remote conflicts detected, sync blocked
=== CONFLICT DETECTION DEBUG ===
...
🔄 Resuming push after conflict resolution...
✅ Pushed to GitHub successfully!
```

### Pull Flow

```
🔍 Starting conflict-aware pull...
=== CONFLICT DETECTION DEBUG ===
...
📥 Importing resolved tokens to Figma...
✅ Conflicts resolved and applied!
```

---

## Build Status

✅ **Build Successful**

```
dist/plugin.js  133.43 kB │ gzip: 39.58 kB
dist/src/ui/index.html  364.45 kB │ gzip: 86.96 kB
```

---

## Summary of All Fixes

### Fix #1: Conflict Resolution "Keep Local" (COMPLETED)

**Issue**: "Keep local" was overwriting with remote values
**Fix**: Store both local and remote tokens, pass both to ConflictResolver
**Status**: ✅ Working

### Fix #2: Sync Status Detection (COMPLETED)

**Issue**: Plugin not detecting local changes
**Fix**: Request local tokens before checking sync status
**Status**: ✅ Working

### Fix #3: Push After Conflict Resolution (CURRENT)

**Issue**: Push not completing after resolving conflicts
**Fix**: Track operation type, push to GitHub for push conflicts
**Status**: ✅ Fixed - Ready for Testing

---

## Next Steps

1. **Reload the plugin** in Figma
2. **Test push with "keep local"** following instructions above
3. **Verify tokens are pushed to GitHub**
4. **Check GitHub repository** to confirm values match your local changes

---

**The complete push flow with conflict resolution should now work end-to-end!**
