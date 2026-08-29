/**
 * Variable Sync Module
 *
 * Monitors Figma variables for changes and syncs with UI.
 */

// Cache for detecting changes
let cachedCollectionIds: Set<string> = new Set();
let cachedVariableCount = 0;
// Per-variable value fingerprint (variable ID -> JSON.stringify(valuesByMode)).
// Rebuilt from scratch every poll so removed variables fall out of the cache
// on their own rather than needing explicit cleanup (see Step 3).
let cachedVariableValues: Map<string, string> = new Map();
let syncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Check for variable changes and notify UI
 */
async function checkForVariableChanges(): Promise<void> {
  try {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const currentCollectionIds = new Set(collections.map((c) => c.id));
    const currentVariableCount = collections.reduce(
      (sum, c) => sum + c.variableIds.length,
      0
    );

    // Fetch all local variables' current values in a single bulk call.
    // Figma's Variable object has no cheap version/timestamp field to diff
    // against, so an in-place value edit (e.g. tweaking a color) can only be
    // detected by comparing actual values. getLocalVariablesAsync() returns
    // every local Variable (including valuesByMode) in one round trip, which
    // is far cheaper than fetching each variable individually via
    // getVariableByIdAsync in a loop.
    const variables = await figma.variables.getLocalVariablesAsync();
    const currentVariableValues = new Map<string, string>();
    for (const variable of variables) {
      // Compare stringified values directly rather than a custom hash, so a
      // fingerprint collision can never mask a real value change.
      currentVariableValues.set(
        variable.id,
        JSON.stringify(variable.valuesByMode)
      );
    }

    // Check if collections, variable count, or any variable's value changed
    const collectionsChanged =
      cachedCollectionIds.size !== currentCollectionIds.size ||
      ![...cachedCollectionIds].every((id) => currentCollectionIds.has(id));

    const variablesChanged = cachedVariableCount !== currentVariableCount;

    const valuesChanged = [...cachedVariableValues].some(
      ([id, fingerprint]) =>
        currentVariableValues.has(id) &&
        currentVariableValues.get(id) !== fingerprint
    );

    if (collectionsChanged || variablesChanged || valuesChanged) {
      console.log(
        `🔄 Variables changed: ${cachedVariableCount} → ${currentVariableCount} variables, ${cachedCollectionIds.size} → ${currentCollectionIds.size} collections`
      );

      // Update cache
      cachedCollectionIds = currentCollectionIds;
      cachedVariableCount = currentVariableCount;
      cachedVariableValues = currentVariableValues;

      // Notify UI to refresh
      figma.ui.postMessage({
        type: "variables-changed",
        collectionCount: currentCollectionIds.size,
        variableCount: currentVariableCount,
      });
    }
  } catch (error) {
    console.error("Error checking for variable changes:", error);
  }
}

/**
 * Start periodic variable sync
 *
 * @returns Cleanup function to stop sync
 */
export function startVariableSync(): () => void {
  if (syncInterval) {
    console.log("⚠️ Variable sync already running");
    return () => stopVariableSync();
  }

  console.log("▶️ Starting variable sync (checking every 2s)");

  // Initial check
  checkForVariableChanges();

  // Check every 2 seconds
  syncInterval = setInterval(checkForVariableChanges, 2000);

  // Return cleanup function
  return () => stopVariableSync();
}

/**
 * Stop variable sync
 */
export function stopVariableSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("⏹️ Variable sync stopped");
  }
}
