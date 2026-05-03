/**
 * StorageAdapter — abstract interface for reading and writing token files.
 *
 * The plugin core (pullTokens, syncTokens) works against this interface so
 * that storage backends can be swapped without touching import/export logic.
 * GitHubAdapter is the first implementation; future adapters (GitLab,
 * Bitbucket, custom HTTP endpoint, etc.) implement the same three methods.
 */
export interface StorageAdapter {
  /**
   * List the names of all token files available at the configured path.
   * Returns bare filenames only (e.g. ["primitive.json", "semantic.json"]),
   * not full paths. Throws if the path is unreachable.
   */
  listFiles(): Promise<string[]>;

  /**
   * Fetch the raw content of a single token file by name.
   * The name must be one returned by listFiles() or explicitly configured
   * by the user. Throws if the file does not exist or cannot be read.
   */
  fetchFile(filename: string): Promise<string>;

  /**
   * Write one or more files atomically (single commit / transaction where
   * supported). Each entry carries the bare filename and its full JSON
   * content. Returns whether the write was a no-op (nothing changed).
   */
  pushFiles(
    files: Array<{ filename: string; content: string }>,
    commitMessage: string
  ): Promise<{ changed: boolean; ref?: string }>;
}
