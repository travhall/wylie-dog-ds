/**
 * Hands the GitHub-side token hashes of a Push or Pull to the message that
 * records the sync (`record-last-sync`), which is sent from a different place
 * (usePluginMessages) once Figma confirms the sync finished.
 *
 * Only a sync that left GitHub and Figma in agreement sets these. A manual
 * file import, a pull request, or a failed sync leaves them empty, so no
 * baseline is recorded for it (see plugin/storage/sync-state-storage.ts).
 */
import type { TokenHashes } from "../../plugin/sync/sync-baseline";

let pending: TokenHashes | null = null;

export function setPendingRemoteHashes(hashes: TokenHashes | null): void {
  pending = hashes;
}

/** Return the pending hashes once, then forget them. */
export function takePendingRemoteHashes(): TokenHashes | null {
  const hashes = pending;
  pending = null;
  return hashes;
}
