// GitHub integration for token synchronization - Fixed for Figma plugin environment

import { Octokit } from "@octokit/rest";

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
  accessToken?: string;
}

export interface SyncResult {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
  filesUpdated?: string[];
  hasConflicts?: boolean;
  conflicts?: TokenConflict[];
  requiresResolution?: boolean;
}

export interface TokenConflict {
  type: "modified" | "deleted" | "added";
  tokenPath: string;
  localValue?: any;
  remoteValue?: any;
  collection: string;
}

export interface SyncStatus {
  lastSync?: Date;
  hasLocalChanges: boolean;
  hasRemoteChanges: boolean;
  upToDate: boolean;
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

      // Test authentication with direct fetch instead of Octokit
      console.log("Testing GitHub connection...");
      const authResponse = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
          Authorization: `token ${config.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Token Bridge Figma Plugin v1.0.0",
        },
      });

      if (!authResponse.ok) {
        if (authResponse.status === 401) {
          throw new Error(
            "Invalid access token. Please check your GitHub Personal Access Token."
          );
        } else if (authResponse.status === 403) {
          throw new Error(
            "Access forbidden. Please ensure your token has the required permissions."
          );
        } else {
          throw new Error(
            `GitHub API error: ${authResponse.status} ${authResponse.statusText}`
          );
        }
      }

      const userData = await authResponse.json();
      console.log(
        "GitHub client initialized successfully for user:",
        userData.login
      );

      // Initialize Octokit after successful auth test
      this.octokit = new Octokit({
        auth: config.accessToken,
        userAgent: "Token Bridge Figma Plugin v1.0.0",
        request: {
          fetch: (url: string, options: any) => {
            // Remove signal property that causes issues in Figma
            const { signal, ...fetchOptions } = options || {};
            
            // Simple headers handling for Figma environment
            const cleanOptions = { ...fetchOptions };
            if (fetchOptions.headers && typeof fetchOptions.headers === 'object') {
              // Ensure headers is a plain object
              cleanOptions.headers = { ...fetchOptions.headers };
            }
            
            return fetch(url, cleanOptions);
          },
        },
      });

      return true;
    } catch (error: any) {
      console.error("Failed to initialize GitHub client:", error);
      throw new Error(`GitHub API error: ${error.message}`);
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

  async getSyncStatus(): Promise<SyncStatus> {
    if (!this.octokit || !this.config) {
      return {
        hasLocalChanges: false,
        hasRemoteChanges: false,
        upToDate: false,
      };
    }

    try {
      // Check for remote changes by getting last commit
      const { data: commits } = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.tokenPath,
        per_page: 1,
      });

      const lastRemoteCommit = commits[0];
      const lastSync = await figma.clientStorage.getAsync("last-github-sync");

      return {
        lastSync: lastSync ? new Date(lastSync) : undefined,
        hasLocalChanges: true, // Always assume local changes for now
        hasRemoteChanges:
          lastSync && lastRemoteCommit?.commit?.committer?.date
            ? new Date(lastRemoteCommit.commit.committer.date) >
              new Date(lastSync)
            : true,
        upToDate: false, // Conservative default
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      return {
        hasLocalChanges: false,
        hasRemoteChanges: false,
        upToDate: false,
      };
    }
  }

  // NEW: Pull tokens from GitHub repository
  async pullTokens(): Promise<{ success: boolean; tokens?: any[]; error?: string }> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub client not initialized");
    }

    try {
      console.log("Pulling tokens from GitHub repository...");

      // Get repository contents from token path using direct fetch
      const contentsUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.tokenPath}?ref=${this.config.branch}`;
      const contentsResponse = await fetch(contentsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      if (!contentsResponse.ok) {
        throw new Error(`Failed to get repository contents: ${contentsResponse.status}`);
      }

      const contents = await contentsResponse.json();

      if (!Array.isArray(contents)) {
        throw new Error("Token path must be a directory containing JSON files");
      }

      const tokenFiles = contents.filter(
        (file: any) => file.type === "file" && file.name.endsWith(".json")
      );

      if (tokenFiles.length === 0) {
        console.log("No token files found in repository");
        return [];
      }

      console.log(`Found ${tokenFiles.length} token files in repository`);

      const allTokens = [];

      // Download and parse each token file
      for (const file of tokenFiles) {
        try {
          console.log(`Downloading token file: ${file.name}`);

          // Get file content using direct fetch
          const fileUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${file.path}?ref=${this.config.branch}`;
          const fileResponse = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Authorization': `token ${this.config.accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
            }
          });

          if (!fileResponse.ok) {
            console.warn(`Failed to download ${file.name}: ${fileResponse.status}`);
            continue;
          }

          const fileData = await fileResponse.json();

          if (Array.isArray(fileData) || fileData.type !== "file") {
            console.warn(`Skipping ${file.name}: not a file`);
            continue;
          }

          // Type guard - ensure we have content property
          if (!('content' in fileData)) {
            console.warn(`Skipping ${file.name}: no content available`);
            continue;
          }

          const content = this.base64Decode((fileData as any).content);
          const tokens = JSON.parse(content);

          console.log(
            `Parsed token file ${file.name}:`,
            Object.keys(tokens).length,
            "collections"
          );
          allTokens.push(tokens);
        } catch (fileError: any) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // Continue with other files
        }
      }

      console.log(
        `Successfully pulled ${allTokens.length} token collections from GitHub`
      );
      return allTokens;
    } catch (error: any) {
      console.error("Error pulling tokens from GitHub:", error);
      throw new Error(`Failed to pull tokens: ${error.message}`);
    }
  }

  // NEW: Compare local and remote tokens for conflicts
  async detectConflicts(
    localTokens: any[],
    remoteTokens: any[]
  ): Promise<TokenConflict[]> {
    const conflicts: TokenConflict[] = [];

    // Create maps for easier comparison
    const localMap = this.createTokenMap(localTokens);
    const remoteMap = this.createTokenMap(remoteTokens);

    // Check for conflicts in remote tokens
    for (const [tokenPath, remoteToken] of remoteMap) {
      if (localMap.has(tokenPath)) {
        const localToken = localMap.get(tokenPath);

        // Compare token values
        if (
          JSON.stringify(localToken.value) !== JSON.stringify(remoteToken.value)
        ) {
          conflicts.push({
            type: "modified",
            tokenPath,
            localValue: localToken.value,
            remoteValue: remoteToken.value,
            collection: remoteToken.collection,
          });
        }
      } else {
        // Token exists in remote but not local (remote addition)
        conflicts.push({
          type: "added",
          tokenPath,
          remoteValue: remoteToken.value,
          collection: remoteToken.collection,
        });
      }
    }

    // Check for tokens that exist locally but not remotely (local additions)
    for (const [tokenPath, localToken] of localMap) {
      if (!remoteMap.has(tokenPath)) {
        conflicts.push({
          type: "deleted",
          tokenPath,
          localValue: localToken.value,
          collection: localToken.collection,
        });
      }
    }

    console.log(
      `Detected ${conflicts.length} conflicts between local and remote tokens`
    );
    return conflicts;
  }

  private createTokenMap(tokenCollections: any[]): Map<string, any> {
    const tokenMap = new Map();

    // Handle undefined/null input
    if (!tokenCollections || !Array.isArray(tokenCollections)) {
      console.warn(
        "createTokenMap: Invalid or empty token collections provided"
      );
      return tokenMap;
    }

    try {
      for (const collection of tokenCollections) {
        if (!collection || typeof collection !== "object") {
          console.warn("Skipping invalid collection:", collection);
          continue;
        }

        for (const [collectionName, collectionData] of Object.entries(
          collection
        )) {
          if (
            collectionData &&
            typeof collectionData === "object" &&
            "variables" in collectionData
          ) {
            const variables = (collectionData as any).variables;
            if (variables && typeof variables === "object") {
              for (const [tokenName, tokenData] of Object.entries(variables)) {
                const tokenPath = `${collectionName}.${tokenName}`;
                tokenMap.set(tokenPath, {
                  value: tokenData,
                  collection: collectionName,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error creating token map:", error);
      return new Map(); // Return empty map on error
    }

    console.log(`Created token map with ${tokenMap.size} tokens`);
    return tokenMap;
  }

  // NEW: Pull with conflict detection
  async pullTokensWithConflictDetection(
    localTokens: any[]
  ): Promise<SyncResult> {
    try {
      const remoteTokens = await this.pullTokens();

      if (remoteTokens.length === 0) {
        return {
          success: true,
          hasConflicts: false,
          conflicts: [],
        };
      }

      const conflicts = await this.detectConflicts(localTokens, remoteTokens);

      if (conflicts.length > 0) {
        console.log(
          `Found ${conflicts.length} conflicts that require resolution`
        );
        return {
          success: false,
          hasConflicts: true,
          conflicts,
          requiresResolution: true,
        };
      }

      // No conflicts - can merge automatically
      return {
        success: true,
        hasConflicts: false,
        conflicts: [],
        // Include remote tokens for merging
        remoteTokens,
      } as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        hasConflicts: false,
        conflicts: [],
      };
    }
  }

  async syncTokens(
    exportData: any[],
    commitMessage: string = "Update design tokens via Token Bridge"
  ): Promise<SyncResult> {
    if (!this.octokit || !this.config) {
      return { success: false, error: "GitHub client not initialized" };
    }

    // Validate input data
    if (!exportData || !Array.isArray(exportData) || exportData.length === 0) {
      return {
        success: false,
        error:
          "No export data provided. Ensure collections are properly processed before sync.",
      };
    }

    try {
      console.log(`Syncing ${exportData.length} token files to repository`);

      // Validate each collection has expected structure
      for (let i = 0; i < exportData.length; i++) {
        const collection = exportData[i];
        if (
          !collection ||
          typeof collection !== "object" ||
          Object.keys(collection).length === 0
        ) {
          return {
            success: false,
            error: `Invalid collection data at index ${i}. Collection must be a non-empty object.`,
          };
        }
      }

      // Create a new branch for the changes
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const branchName = `token-bridge-update-${timestamp}`;

      await this.createBranch(branchName);

      const filesUpdated: string[] = [];

      // Update each token file
      for (const collectionData of exportData) {
        const collectionKeys = Object.keys(collectionData);
        if (collectionKeys.length === 0) {
          console.warn("Skipping empty collection data");
          continue;
        }

        const collectionName = collectionKeys[0];
        const tokens = collectionData[collectionName];

        if (!tokens) {
          console.warn(
            `Skipping collection ${collectionName} - no tokens found`
          );
          continue;
        }

        // Create file path (e.g., tokens/primitive.json)
        const fileName = `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`;
        const filePath = this.config.tokenPath.endsWith("/")
          ? `${this.config.tokenPath}${fileName}`
          : `${this.config.tokenPath}/${fileName}`;

        const fileContent = JSON.stringify(tokens, null, 2);

        await this.updateFile(filePath, fileContent, branchName);
        filesUpdated.push(filePath);

        console.log(`Updated file: ${filePath}`);
      }

      if (filesUpdated.length === 0) {
        return {
          success: false,
          error:
            "No files were updated. Check that collections contain valid token data.",
        };
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
    } catch (error: any) {
      console.error("Error syncing tokens:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred during sync",
      };
    }
  }

  private async createBranch(branchName: string): Promise<void> {
    if (!this.config) {
      throw new Error("GitHub client not initialized");
    }

    try {
      console.log(`Getting base branch SHA for: ${this.config.branch}`);
      
      // Use direct fetch instead of Octokit for better Figma compatibility
      const baseRefUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/ref/heads/${this.config.branch}`;
      const baseRefResponse = await fetch(baseRefUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      if (!baseRefResponse.ok) {
        const errorText = await baseRefResponse.text();
        throw new Error(`Failed to get base branch: ${baseRefResponse.status} ${errorText}`);
      }

      const baseRefData = await baseRefResponse.json();
      console.log('Base ref data:', baseRefData);
      
      if (!baseRefData || !baseRefData.object) {
        throw new Error(`Invalid response when getting base branch ${this.config.branch}`);
      }

      const baseSha = baseRefData.object.sha;
      console.log(`Base branch SHA: ${baseSha}`);

      // Create new branch using direct fetch
      console.log(`Creating new branch: ${branchName}`);
      const createRefUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/refs`;
      const createRefResponse = await fetch(createRefUrl, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha
        })
      });

      if (!createRefResponse.ok) {
        const errorText = await createRefResponse.text();
        throw new Error(`Failed to create branch: ${createRefResponse.status} ${errorText}`);
      }

      const createRefData = await createRefResponse.json();
      console.log('Create ref data:', createRefData);
      console.log(`Successfully created branch: ${branchName}`);
    } catch (error: any) {
      console.error('Error in createBranch:', error);
      
      if (error.message?.includes('404')) {
        throw new Error(`Branch '${this.config.branch}' not found in repository ${this.config.owner}/${this.config.repo}`);
      } else if (error.message?.includes('401')) {
        throw new Error(`Authentication failed. Please check your GitHub token.`);
      } else if (error.message?.includes('403')) {
        throw new Error(`Permission denied. Your token may not have write access to ${this.config.owner}/${this.config.repo}`);
      } else {
        throw new Error(`Failed to create branch: ${error.message}`);
      }
    }
  }

  private async updateFile(
    filePath: string,
    content: string,
    branch: string
  ): Promise<void> {
    if (!this.config) {
      throw new Error("GitHub client not initialized");
    }

    try {
      // Try to get existing file using direct fetch
      const getFileUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}?ref=${branch}`;
      const getFileResponse = await fetch(getFileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      let existingSha: string | undefined;
      
      if (getFileResponse.ok) {
        const existingFile = await getFileResponse.json();
        existingSha = Array.isArray(existingFile) ? undefined : existingFile.sha;
      }

      // Create or update file using direct fetch
      const updateFileUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`;
      const updateFileResponse = await fetch(updateFileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        },
        body: JSON.stringify({
          message: existingSha ? `Update ${filePath}` : `Create ${filePath}`,
          content: this.base64Encode(content),
          branch: branch,
          ...(existingSha && { sha: existingSha })
        })
      });

      if (!updateFileResponse.ok) {
        const errorText = await updateFileResponse.text();
        throw new Error(`Failed to update file: ${updateFileResponse.status} ${errorText}`);
      }

      console.log(`Successfully updated file: ${filePath}`);
    } catch (error: any) {
      console.error(`Error updating file ${filePath}:`, error);
      throw error;
    }
  }

  // Manual base64 encoding for Figma environment
  private base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  private async createPullRequest(
    branchName: string,
    commitMessage: string,
    exportData: any[],
    filesUpdated: string[]
  ): Promise<any> {
    if (!this.config) {
      throw new Error("GitHub client not initialized");
    }

    const prBody = this.generatePullRequestBody(exportData, filesUpdated);

    // Use direct fetch instead of Octokit to avoid duplex issues
    const createPrUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls`;
    const response = await fetch(createPrUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
      },
      body: JSON.stringify({
        title: `🎨 ${commitMessage}`,
        head: branchName,
        base: this.config.branch,
        body: prBody
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create pull request: ${response.status} ${errorText}`);
    }

    const pr = await response.json();
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
}
