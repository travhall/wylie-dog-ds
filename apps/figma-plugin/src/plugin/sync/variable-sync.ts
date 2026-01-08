/**
 * Variable Sync Module
 *
 * Monitors Figma variables for changes and syncs with UI.
 */

// Cache for detecting changes
let cachedCollectionIds: Set<string> = new Set();
let cachedVariableCount = 0;
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

    // Check if collections or variables changed
    const collectionsChanged =
      cachedCollectionIds.size !== currentCollectionIds.size ||
      ![...cachedCollectionIds].every((id) => currentCollectionIds.has(id));

    const variablesChanged = cachedVariableCount !== currentVariableCount;

    if (collectionsChanged || variablesChanged) {
      console.log(
        `🔄 Variables changed: ${cachedVariableCount} → ${currentVariableCount} variables, ${cachedCollectionIds.size} → ${currentCollectionIds.size} collections`
      );

      // Update cache
      cachedCollectionIds = currentCollectionIds;
      cachedVariableCount = currentVariableCount;

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
