import type { NativeCollectionFile } from "./dtcg-convert";

export const RESOLVER_FILE: string;

/** Is this sync directory in the DTCG token contract layout? */
export function isDtcgSyncDir(dir: string): boolean;

/** Every collection of a sync directory, keyed by collection name, in either layout. */
export function readSyncCollections(
  dir: string
): Record<string, NativeCollectionFile>;

/** One collection as the native file array; throws if the directory has none by that name. */
export function readSyncCollection(
  dir: string,
  name: string
): NativeCollectionFile;

/**
 * Write every collection back in the directory's layout (DTCG files plus a
 * merged resolver, or one native file per collection).
 */
export function writeSyncCollections(
  dir: string,
  collections: Record<string, NativeCollectionFile>
): { layout: "dtcg" | "native" };
