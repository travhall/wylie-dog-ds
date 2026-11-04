// Which collections stay out of a published library (Plan 217, owner decision I1).
//
// A collection with `hiddenFromPublishing` set is not offered to files that use the
// library. Designers bind the semantic collection and the library's own components
// are already bound to the component tokens, so the raw palette (primitive) and the
// component tier are hidden. Matching is by collection name, and every import
// re-applies it, so a Pull corrects a collection someone changed by hand.

export const HIDDEN_FROM_PUBLISHING: readonly string[] = [
  "primitive",
  "components",
];

export function shouldHideFromPublishing(collectionName: string): boolean {
  return HIDDEN_FROM_PUBLISHING.includes(collectionName.toLowerCase());
}

/**
 * Set `hiddenFromPublishing` from the collection name. Returns true when the flag
 * changed. Never throws: a collection that rejects the flag stays as it was.
 */
export function applyPublishing(collection: {
  name: string;
  hiddenFromPublishing: boolean;
}): boolean {
  const hidden = shouldHideFromPublishing(collection.name);
  if (collection.hiddenFromPublishing === hidden) return false;
  try {
    collection.hiddenFromPublishing = hidden;
    return true;
  } catch {
    return false;
  }
}
