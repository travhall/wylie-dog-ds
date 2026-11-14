/** One mode of a collection in the native sync layout. */
export interface NativeMode {
  modeId: string;
  name: string;
}

/** A collection in the native sync layout: modes plus a flat variable map. */
export interface NativeCollection {
  modes: NativeMode[];
  variables: Record<string, unknown>;
}

/** A native sync file: an array with one `{ collectionName: collection }` object. */
export type NativeCollectionFile = Array<Record<string, NativeCollection>>;

/** The DTCG resolver file (documentation/tokens/dtcg-contract.md). */
export type ResolverFile = Record<string, unknown>;

/** A token the converter left out because it cannot be written as DTCG. */
export interface SkippedToken {
  collection: string;
  token: string;
  reason: string;
}

/**
 * Convert native sync files to DTCG token files plus a resolver. By default it
 * throws on a value it cannot represent; with `{ skip: true }` it leaves that
 * token out of every mode and lists it in `skipped`.
 */
export function nativeToDtcg(
  nativeFiles: NativeCollectionFile[],
  options?: { skip?: boolean }
): {
  files: Record<string, unknown>;
  resolver: ResolverFile;
  skipped: SkippedToken[];
};

/**
 * Merge the resolver generated from Figma into the one already in the repo,
 * keeping everything an adopter added. With no existing resolver, returns the
 * generated one.
 */
export function mergeResolver(
  existing: ResolverFile | undefined,
  generated: ResolverFile
): ResolverFile;

/** Convert a resolver and its token files back to native collection files, keyed by collection name. */
export function dtcgToNative(
  resolver: ResolverFile,
  files: Record<string, unknown>
): Record<string, NativeCollectionFile>;
