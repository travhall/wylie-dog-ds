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

/** Convert native sync files to DTCG token files plus a resolver. Throws on a value it cannot represent. */
export function nativeToDtcg(nativeFiles: NativeCollectionFile[]): {
  files: Record<string, unknown>;
  resolver: ResolverFile;
};

/** Convert a resolver and its token files back to native collection files, keyed by collection name. */
export function dtcgToNative(
  resolver: ResolverFile,
  files: Record<string, unknown>
): Record<string, NativeCollectionFile>;
