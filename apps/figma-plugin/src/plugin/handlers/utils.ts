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
export function sendSuccess(type: string, data: any): void {
  figma.ui.postMessage({
    type,
    ...data,
  });
}
