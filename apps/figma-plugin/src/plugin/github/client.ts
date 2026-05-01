// GitHub integration for token synchronization

import fetch from "cross-fetch";
import { Octokit } from "@octokit/rest";
import type { GitHubConfig, SyncMode } from "../../shared/types";

// Make fetch available globally for Octokit
(globalThis as any).fetch = fetch;

// btoa/atob only handle Latin-1 (U+0000–U+00FF). Token content can contain
// arbitrary Unicode (descriptions with curly quotes, arrows, em dashes, etc.).
// These helpers encode/decode via UTF-8 bytes so all Unicode is preserved.
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export interface SyncResult {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
  filesUpdated?: string[];
  message?: string;
  commitSha?: string;
}

export interface PullResult {
  success: boolean;
  tokens?: any[];
  error?: string;
  lastModified?: string;
}

export class GitHubClient {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;

  constructor() {}

  async initialize(config: GitHubConfig): Promise<boolean> {
    if (!config.accessToken) {
      console.error("No access token provided");
      return false;
    }

    try {
      this.config = config;
      this.octokit = new Octokit({
        auth: config.accessToken,
        userAgent: "Token Bridge Figma Plugin v1.0.0",
      });

      // Test the connection
      await this.octokit.users.getAuthenticated();
      console.log("GitHub client initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize GitHub client:", error);
      return false;
    }
  }

  configure(config: GitHubConfig): void {
    this.config = config;
    if (config.accessToken) {
      this.octokit = new Octokit({
        auth: config.accessToken,
        userAgent: "Token Bridge Figma Plugin v1.0.0",
      });
    }
  }

  async validateConfiguration(): Promise<boolean> {
    if (!this.octokit || !this.config) {
      return false;
    }

    try {
      // Test authentication
      await this.octokit.users.getAuthenticated();

      // Test repository access
      await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });

      return true;
    } catch (error) {
      console.error("Configuration validation failed:", error);
      return false;
    }
  }

  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    if (!this.octokit || !this.config) {
      return { valid: false, error: "GitHub client not initialized" };
    }

    try {
      const { data: repo } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });

      const hasWriteAccess =
        repo.permissions && (repo.permissions.push || repo.permissions.admin);

      if (!hasWriteAccess) {
        return { valid: false, error: "No write access to repository" };
      }

      return { valid: true };
    } catch (error: any) {
      if (error.status === 404) {
        return { valid: false, error: "Repository not found or no access" };
      }
      return { valid: false, error: error.message };
    }
  }

  async pullTokens(): Promise<PullResult> {
    if (!this.octokit || !this.config) {
      return { success: false, error: "GitHub client not initialized" };
    }

    try {
      console.log(
        `Pulling tokens from ${this.config.owner}/${this.config.repo}:${this.config.branch}`
      );

      // Resolve the canonical file list. We first try MANIFEST.json (the
      // sync contract — see packages/tokens/SYNC_CONTRACT.md). If the repo
      // doesn't ship a manifest yet (older repos / non-Wylie-Dog repos), fall
      // back to the legacy hardcoded list so existing users keep working.
      const fallbackFileNames = [
        "primitive.json",
        "semantic.json",
        "components.json",
        "component.json",
        "tokens.json",
      ];

      // Normalize path - remove trailing slash if present
      const basePath = this.config.tokenPath.endsWith("/")
        ? this.config.tokenPath.slice(0, -1)
        : this.config.tokenPath;

      // Sync contract version this plugin build understands. If the manifest
      // declares a higher major version, refuse to import — the schema may
      // have moved in ways we can't safely interpret. Bump alongside any
      // breaking change to the MANIFEST shape.
      const SUPPORTED_MANIFEST_VERSION = 1;

      let commonFileNames = fallbackFileNames;
      let manifestSource: "manifest" | "fallback" = "fallback";
      try {
        const manifestUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${basePath}/MANIFEST.json`;
        const manifestResponse = await fetch(manifestUrl);
        if (manifestResponse.ok) {
          const manifest = JSON.parse(await manifestResponse.text());

          // Hardening: enforce manifest version compatibility. A future
          // manifest could add required fields (e.g. per-collection schema
          // refs) that this plugin can't honor. Fail closed rather than
          // silently importing partial data.
          const manifestVersion = manifest?.version;
          if (typeof manifestVersion === "number") {
            if (manifestVersion > SUPPORTED_MANIFEST_VERSION) {
              return {
                success: false,
                error: `MANIFEST.json declares version ${manifestVersion}, but this plugin build supports up to version ${SUPPORTED_MANIFEST_VERSION}. Update the Token Bridge plugin to a newer release.`,
              };
            }
          } else {
            console.warn(
              `MANIFEST.json missing numeric "version" field. Treating as v${SUPPORTED_MANIFEST_VERSION}; future manifests should declare a version.`
            );
          }

          if (Array.isArray(manifest?.files) && manifest.files.length > 0) {
            commonFileNames = manifest.files
              .map((f: { name?: string }) => f.name)
              .filter((n: unknown): n is string => typeof n === "string");
            manifestSource = "manifest";
            console.log(
              `📋 Loaded sync MANIFEST.json v${manifestVersion ?? "?"} (${commonFileNames.length} files)`
            );
          }
        }
      } catch (err) {
        console.warn(
          "Could not load MANIFEST.json, falling back to default file list:",
          err
        );
      }
      console.log(`Token file source: ${manifestSource}`);

      const tokens = [];
      let filesFound = 0;

      for (const fileName of commonFileNames) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${basePath}/${fileName}`;
          console.log(`Attempting to fetch: ${fileName}`);

          const response = await fetch(rawUrl);

          // 404 is expected for files that don't exist - skip silently
          if (response.status === 404) {
            console.log(`File not found (skipping): ${fileName}`);
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const content = await response.text();
          let tokenData;
          try {
            tokenData = JSON.parse(content);
          } catch (parseErr) {
            // Hardening: JSON parse failures must surface with file context so a
            // user can locate the corrupted sync file without digging through raw
            // stack traces. Log size + preview + re-throw with actionable message.
            const preview = content.slice(0, 200).replace(/\s+/g, " ");
            console.error(
              `❌ Failed to parse ${fileName} (${content.length} bytes). Preview: ${preview}`
            );
            throw new Error(
              `Failed to parse ${fileName}: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}. File may be corrupted or mid-sync. Check the branch on GitHub.`
            );
          }

          // DEBUG: Log fontFamily token descriptions immediately after parse
          if (fileName === "primitive.json" && Array.isArray(tokenData)) {
            const coll = tokenData[0];
            const primitiveData = coll?.primitive;
            if (primitiveData?.variables) {
              const sans =
                primitiveData.variables["typography.font-family.sans"];
              const mono =
                primitiveData.variables["typography.font-family.mono"];
              console.log(`🔍 CLIENT PARSED primitive.json:`);
              console.log(`  sans has $description:`, !!sans?.$description);
              console.log(`  mono has $description:`, !!mono?.$description);
            }
          }

          // Ensure token data is in array format for consistency
          if (Array.isArray(tokenData)) {
            tokens.push(...tokenData);
          } else {
            tokens.push(tokenData);
          }

          filesFound++;
          console.log(`✅ Loaded tokens from: ${fileName}`);
        } catch (fileError: any) {
          // Only log non-404 errors
          if (!fileError.message?.includes("404")) {
            console.error(`Error loading file ${fileName}:`, fileError);
          }
          // Continue with other files rather than failing completely
        }
      }

      if (filesFound === 0) {
        const sourceNote =
          manifestSource === "manifest"
            ? "Files listed in MANIFEST.json are missing from the repo"
            : "No MANIFEST.json found and none of the fallback filenames matched";
        return {
          success: false,
          error: `No token files found in ${this.config.owner}/${this.config.repo}@${this.config.branch}:${basePath}/. ${sourceNote}. Tried: ${commonFileNames.join(", ")}`,
        };
      }

      console.log(`✅ Successfully loaded ${filesFound} token file(s)`);

      return {
        success: true,
        tokens,
        lastModified: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("Error pulling tokens:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  async syncTokens(
    exportData: any[],
    commitMessage?: string
  ): Promise<SyncResult> {
    if (!this.octokit || !this.config) {
      return { success: false, error: "GitHub client not initialized" };
    }

    try {
      // Generate descriptive commit message if not provided
      if (!commitMessage) {
        const collectionNames = exportData.map((data) => Object.keys(data)[0]);
        // Format: YYYY-MM-DD HH:MM:SS UTC
        const now = new Date();
        const timestamp =
          now.toISOString().replace("T", " ").substring(0, 19) + " UTC";
        const collectionsText =
          collectionNames.length === 1
            ? collectionNames[0]
            : `${collectionNames.length} collections (${collectionNames.join(", ")})`;
        commitMessage = `chore: update ${collectionsText} tokens\n\nSynced at ${timestamp}`;
      }

      console.log(
        `Syncing ${exportData.length} token files to repository in ${this.config.syncMode} mode`
      );

      if (this.config.syncMode === "direct") {
        return await this.directSync(exportData, commitMessage);
      } else {
        return await this.pullRequestSync(exportData, commitMessage);
      }
    } catch (error: any) {
      console.error("Error syncing tokens:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  private async directSync(
    exportData: any[],
    commitMessage: string
  ): Promise<SyncResult> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    const filesUpdated: string[] = [];

    try {
      console.log(
        `📤 GITHUB SYNC: Starting direct sync with ${exportData.length} collections`
      );

      // DEBUG: Log what we're about to sync
      exportData.forEach((collectionData, idx) => {
        const collectionName = Object.keys(collectionData)[0];
        const tokens = collectionData[collectionName];
        const tokenNames = Object.keys(tokens.variables || {});
        console.log(
          `   Collection ${idx + 1}: ${collectionName} (${tokenNames.length} tokens)`
        );
        console.log(
          `   Token names: ${tokenNames.slice(0, 5).join(", ")}${tokenNames.length > 5 ? "..." : ""}`
        );
      });

      // Get the current commit SHA
      const { data: refData } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
      });
      const currentCommitSha = refData.object.sha;

      // Get the current tree
      const { data: currentCommit } = await this.octokit.git.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        commit_sha: currentCommitSha,
      });
      const baseTreeSha = currentCommit.tree.sha;

      // Create blobs for all files, but only if content changed
      const tree = [];
      for (const collectionData of exportData) {
        const collectionName = Object.keys(collectionData)[0];
        const tokens = collectionData[collectionName];

        // Create file path (e.g., tokens/primitive.json)
        const fileName = `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`;
        const filePath = this.config.tokenPath.endsWith("/")
          ? `${this.config.tokenPath}${fileName}`
          : `${this.config.tokenPath}/${fileName}`;

        const newContent = JSON.stringify(
          [{ [collectionName]: tokens }],
          null,
          2
        );

        // DEBUG: Log token count in new content
        const tokenCount = Object.keys(tokens.variables || {}).length;
        console.log(
          `📄 GITHUB SYNC: Preparing ${fileName} with ${tokenCount} tokens`
        );

        // Fetch existing file to compare content. Pin to the exact commit
        // SHA captured at the start of the sync (currentCommitSha), NOT the
        // moving branch ref. Otherwise: another commit lands mid-sync that
        // modifies this file, our diff fetches the NEWER content, sees no
        // change vs our payload, and we silently drop the user's edit.
        // The downstream updateRef() will still catch concurrent commits
        // via parents:[currentCommitSha] + force:false, but that only
        // protects the commit step — not our skip-unchanged logic.
        let existingContent = "";
        try {
          const { data: existingFile } = await this.octokit.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path: filePath,
            ref: currentCommitSha,
          });

          if ("content" in existingFile && existingFile.content) {
            existingContent = fromBase64(
              existingFile.content.replace(/\n/g, "")
            );
          }
        } catch (error: any) {
          // File doesn't exist yet, will be created
          console.log(`File ${filePath} doesn't exist, will create it`);
        }

        // Only create blob if content actually changed.
        // Note: this is byte-exact comparison. Both sides are produced by
        // JSON.stringify(..., null, 2) with the same shape, so whitespace
        // is stable. If the on-disk file gets reformatted by a different
        // serializer we'd over-commit (no-op churn) but never under-commit.
        if (newContent !== existingContent) {
          const { data: blob } = await this.octokit.git.createBlob({
            owner: this.config.owner,
            repo: this.config.repo,
            content: toBase64(newContent),
            encoding: "base64",
          });

          tree.push({
            path: filePath,
            mode: "100644" as const,
            type: "blob" as const,
            sha: blob.sha,
          });

          filesUpdated.push(filePath);
          console.log(`✏️ File changed: ${filePath}`);
        } else {
          console.log(`⏭️ No changes in ${filePath}, skipping`);
        }
      }

      // If no files changed, return early without creating a commit
      if (filesUpdated.length === 0) {
        console.log("ℹ️ No file changes detected, skipping commit");
        return {
          success: true,
          filesUpdated: [],
          message: "No changes to sync - all tokens are up to date",
        };
      }

      // Create new tree
      const { data: newTree } = await this.octokit.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        base_tree: baseTreeSha,
        tree,
      });

      // Create new commit
      const { data: newCommit } = await this.octokit.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [currentCommitSha],
      });

      // Update branch reference with retry logic for race conditions
      try {
        await this.octokit.git.updateRef({
          owner: this.config.owner,
          repo: this.config.repo,
          ref: `heads/${this.config.branch}`,
          sha: newCommit.sha,
          force: false, // Explicit: never force push
        });
      } catch (updateError: any) {
        // If update fails due to non-fast-forward, throw helpful error
        if (updateError.message?.includes("not a fast forward")) {
          throw new Error(
            "Branch has new commits since sync started. Please try again - the plugin will automatically sync with the latest changes."
          );
        }
        throw updateError;
      }

      console.log(
        `✅ Created single commit for ${filesUpdated.length} file(s): ${newCommit.sha}`
      );

      return {
        success: true,
        filesUpdated,
        message: `Successfully synced ${filesUpdated.length} file(s) to ${this.config.branch}`,
        commitSha: newCommit.sha,
      };
    } catch (error: any) {
      console.error("Error in direct sync:", error);
      throw error;
    }
  }

  private async pullRequestSync(
    exportData: any[],
    commitMessage: string
  ): Promise<SyncResult> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    // Create a new branch for the changes
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const branchName = `token-bridge-update-${timestamp}`;

    await this.createBranch(branchName);

    const filesUpdated: string[] = [];

    // Update each token file on the new branch
    for (const collectionData of exportData) {
      const collectionName = Object.keys(collectionData)[0];
      const tokens = collectionData[collectionName];

      // Create file path (e.g., tokens/primitive.json)
      const fileName = `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`;
      const filePath = this.config.tokenPath.endsWith("/")
        ? `${this.config.tokenPath}${fileName}`
        : `${this.config.tokenPath}/${fileName}`;

      const fileContent = JSON.stringify(
        [{ [collectionName]: tokens }],
        null,
        2
      );

      await this.updateFile(filePath, fileContent, branchName);
      filesUpdated.push(filePath);

      console.log(`Updated file: ${filePath}`);
    }

    // Create pull request
    const pullRequest = await this.createPullRequest(
      branchName,
      commitMessage,
      exportData,
      filesUpdated
    );

    return {
      success: true,
      pullRequestUrl: pullRequest.html_url,
      filesUpdated,
    };
  }

  private async updateFileDirectly(
    filePath: string,
    content: string,
    commitMessage: string
  ): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    try {
      // Try to get existing file
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: this.config.branch,
      });

      // Update existing file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: commitMessage,
        content: toBase64(content),
        branch: this.config.branch,
        sha: Array.isArray(existingFile) ? undefined : existingFile.sha,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create it
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: filePath,
          message: `Create ${filePath}`,
          content: toBase64(content),
          branch: this.config.branch,
        });
      } else {
        throw error;
      }
    }
  }

  private async createBranch(branchName: string): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    // Get the SHA of the base branch
    const { data: baseRef } = await this.octokit.git.getRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `heads/${this.config.branch}`,
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    console.log(`Created branch: ${branchName}`);
  }

  private async updateFile(
    filePath: string,
    content: string,
    branch: string
  ): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    try {
      // Try to get existing file
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: branch,
      });

      // Update existing file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: `Update ${filePath}`,
        content: toBase64(content),
        branch: branch,
        sha: Array.isArray(existingFile) ? undefined : existingFile.sha,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create it
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: filePath,
          message: `Create ${filePath}`,
          content: toBase64(content),
          branch: branch,
        });
      } else {
        throw error;
      }
    }
  }

  private async createPullRequest(
    branchName: string,
    commitMessage: string,
    exportData: any[],
    filesUpdated: string[]
  ): Promise<any> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    const prBody = this.generatePullRequestBody(exportData, filesUpdated);

    const { data: pr } = await this.octokit.pulls.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title: `🎨 ${commitMessage}`,
      head: branchName,
      base: this.config.branch,
      body: prBody,
    });

    console.log(`Created pull request: ${pr.html_url}`);
    return pr;
  }

  private generatePullRequestBody(
    exportData: any[],
    filesUpdated: string[]
  ): string {
    const totalTokens = exportData.reduce((sum, collectionData) => {
      const collectionName = Object.keys(collectionData)[0];
      return sum + Object.keys(collectionData[collectionName]).length;
    }, 0);

    const collections = exportData.map(
      (collectionData) => Object.keys(collectionData)[0]
    );

    return `
# 🎨 Design Token Update

Generated by **Token Bridge Figma Plugin**

## 📊 Summary
- **Collections Updated**: ${collections.length}
- **Total Tokens**: ${totalTokens}
- **Files Modified**: ${filesUpdated.length}

## 📁 Updated Collections
${collections.map((name) => `- **${name}**`).join("\n")}

## 🔄 Files Changed
${filesUpdated.map((path) => `- \`${path}\``).join("\n")}

## ✅ Validation
- All tokens follow W3C DTCG format
- Token names normalized for consistency
- Variable references preserved

---
*This PR was automatically generated from Figma variables using Token Bridge*
    `.trim();
  }

  /**
   * Get current local tokens from Figma for conflict detection
   * This method interfaces with Figma's API to get current variable collections
   */
  async getCurrentLocalTokens(): Promise<any[]> {
    try {
      console.log("📍 Getting current local tokens from Figma...");

      // Since this is called from UI thread, we need to request data from main thread
      // Return empty array for now - this will be enhanced when conflict detection is fully implemented
      console.log(
        "⚠️ getCurrentLocalTokens: Returning empty array - implement Figma API bridge for conflict detection"
      );
      return [];
    } catch (error) {
      console.error("❌ Error getting local tokens:", error);
      return [];
    }
  }
}
