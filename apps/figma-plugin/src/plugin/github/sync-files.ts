// Builds the files a Push writes, in the layout the repository already uses.
//
// The plugin works on native collections (ExportData[]). A token folder with a
// tokens.resolver.json is in the DTCG token contract layout
// (documentation/tokens/dtcg-contract.md): Push converts to it and merges into
// the existing resolver, keeping what the repository's owner added. A folder
// without one stays in the native layout (one <collection>.json per
// collection). The layout is never switched by a Push.

import { mergeResolver, nativeToDtcg } from "@wyliedog/tokens/dtcg-convert";
import type {
  NativeCollectionFile,
  ResolverFile,
  SkippedToken,
} from "@wyliedog/tokens/dtcg-convert";
import type { ExportData } from "../variables/processor";

/** A token folder holding this file is in the DTCG token contract layout. */
export const DTCG_RESOLVER_FILE = "tokens.resolver.json";

export interface SyncFile {
  filename: string;
  content: string;
}

export interface PreparedSync {
  layout: "native" | "dtcg";
  files: SyncFile[];
  /** Tokens left out because they cannot be written as DTCG (DTCG layout only). */
  skipped: SkippedToken[];
}

const serialize = (data: unknown): string =>
  JSON.stringify(data, null, 2) + "\n";

/** `Brand Colors` becomes `brand-colors.json`, as the native layout always did. */
export function nativeFileName(collection: string): string {
  return `${collection.toLowerCase().replace(/\s+/g, "-")}.json`;
}

function prepareNativeFiles(exportData: ExportData[]): SyncFile[] {
  return exportData.map((collectionData) => {
    const collectionName = Object.keys(collectionData)[0];
    return {
      filename: nativeFileName(collectionName),
      content: serialize([
        { [collectionName]: collectionData[collectionName] },
      ]),
    };
  });
}

function prepareDtcgFiles(
  exportData: ExportData[],
  existingResolver: ResolverFile
): { files: SyncFile[]; skipped: SkippedToken[] } {
  // ExportData[] is one object per collection; the converter takes native
  // files, each an array holding one such object.
  const { files, resolver, skipped } = nativeToDtcg(
    exportData.map((collection) => [
      collection,
    ]) as unknown as NativeCollectionFile[],
    { skip: true }
  );
  return {
    files: [
      ...Object.entries(files).map(([filename, tree]) => ({
        filename,
        content: serialize(tree),
      })),
      {
        filename: DTCG_RESOLVER_FILE,
        content: serialize(mergeResolver(existingResolver, resolver)),
      },
    ],
    skipped,
  };
}

/**
 * Decide the layout from the repository and build the files to write.
 * `readExisting` returns a file's current content, or null when it does not
 * exist; it is called once, for the resolver.
 */
export async function prepareSyncFiles(
  exportData: ExportData[],
  readExisting: (filename: string) => Promise<string | null>
): Promise<PreparedSync> {
  const existing = await readExisting(DTCG_RESOLVER_FILE);
  if (existing === null) {
    return {
      layout: "native",
      files: prepareNativeFiles(exportData),
      skipped: [],
    };
  }

  let resolver: ResolverFile;
  try {
    resolver = JSON.parse(existing) as ResolverFile;
  } catch {
    throw new Error(
      `${DTCG_RESOLVER_FILE} in the repository is not valid JSON. Fix it, then push again.`
    );
  }
  return { layout: "dtcg", ...prepareDtcgFiles(exportData, resolver) };
}

/** A one-line summary of skipped tokens for a result message, or "". */
export function describeSkipped(skipped: SkippedToken[]): string {
  if (skipped.length === 0) return "";
  const names = skipped
    .slice(0, 5)
    .map((s) => s.token)
    .join(", ");
  const more = skipped.length > 5 ? `, and ${skipped.length - 5} more` : "";
  return `${skipped.length} token(s) were left out because they cannot be written as DTCG: ${names}${more}.`;
}
