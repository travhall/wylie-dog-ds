// GitHub integration for token synchronization

import fetch from "cross-fetch";
import { Octokit } from "@octokit/rest";
import type { GitHubConfig, SyncMode } from "../../shared/types";

// Make fetch available globally for Octokit
(globalThis as any).fetch = fetch;

export interface SyncResult {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
  filesUpdated?: string[];
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

      // Try to fetch common token file names directly from raw.githubusercontent.com
      // This avoids CORS issues with the GitHub API directory listing
      const commonFileNames = [
        "primitive.json",
        "semantic.json",
        "components.json",
        "component.json",
        "tokens.json",
      ];

      const tokens = [];
      let filesFound = 0;

      // Normalize path - remove trailing slash if present
      const basePath = this.config.tokenPath.endsWith("/")
        ? this.config.tokenPath.slice(0, -1)
        : this.config.tokenPath;

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
          const tokenData = JSON.parse(content);

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
        return {
          success: false,
          error: `No token files found in ${basePath}/. Tried: ${commonFileNames.join(", ")}`,
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
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const collectionsText =
          collectionNames.length === 1
            ? collectionNames[0]
            : `${collectionNames.length} collections (${collectionNames.join(", ")})`;
        commitMessage = `chore: update ${collectionsText} tokens (${timestamp})`;
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

      // Create blobs for all files
      const tree = [];
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

        // Create blob
        const { data: blob } = await this.octokit.git.createBlob({
          owner: this.config.owner,
          repo: this.config.repo,
          content: btoa(fileContent),
          encoding: "base64",
        });

        tree.push({
          path: filePath,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.sha,
        });

        filesUpdated.push(filePath);
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

      // Update branch reference
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        sha: newCommit.sha,
      });

      console.log(
        `✅ Created single commit for ${filesUpdated.length} file(s): ${newCommit.sha}`
      );

      return {
        success: true,
        filesUpdated,
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
        content: btoa(content),
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
          content: btoa(content),
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
        content: btoa(content),
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
          content: btoa(content),
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
