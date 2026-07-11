/**
 * Utility Functions for Plugin Handlers
 *
 * Shared helper functions used across all message handlers.
 */

/**
 * Communicate loading state to UI
 */
export function setLoading(loading: boolean, message?: string): void {
  figma.ui.postMessage({
    type: "loading-state",
    loading,
    message,
  });
}

/**
 * Process items in chunks to avoid blocking the main thread
 *
 * @param items - Array of items to process
 * @param processFn - Function to process each item
 * @param chunkSize - Number of items to process per chunk (default: 50)
 * @param onProgress - Optional progress callback
 * @returns Array of processed results
 */
export async function processInChunks<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  chunkSize: number = 50,
  onProgress?: (current: number, total: number, message?: string) => void
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item, chunkIndex) => processFn(item, i + chunkIndex))
    );

    results.push(...chunkResults);

    // Update progress
    const current = Math.min(i + chunkSize, total);
    if (onProgress) {
      onProgress(current, total, `Processing ${current}/${total} items...`);
    }

    // Allow UI updates between chunks
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Send error message to UI
 */
export function sendError(message: string): void {
  figma.ui.postMessage({
    type: "error",
    message,
  });
}

/**
 * Send success message to UI
 */
export function sendSuccess(type: string, data: Record<string, unknown>): void {
  figma.ui.postMessage({
    type,
    ...data,
  });
}

/**
 * Fetch a Figma Variable by id and map it to the plain object shape used
 * throughout export/import/conflict-detection. Returns null on missing
 * variable or lookup error (logged, not thrown) so callers can filter it out.
 */
export async function mapFigmaVariable(variableId: string) {
  try {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable) return null;
    return {
      id: variable.id,
      name: variable.name,
      description: variable.description || "",
      resolvedType: variable.resolvedType,
      scopes: variable.scopes,
      valuesByMode: variable.valuesByMode,
      remote: variable.remote,
      key: variable.key,
      // Preserve the source $type (stored on import) so the export
      // round-trips it instead of re-inferring fontSize/lineHeight/etc.
      // — otherwise these read back as a perpetual type mismatch.
      originalType: variable.getPluginData("originalType") || undefined,
    };
  } catch (err) {
    console.error("Error processing variable:", variableId, err);
    return null;
  }
}
