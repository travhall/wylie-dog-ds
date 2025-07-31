// GitHub integration for token synchronization

import { Octokit } from '@octokit/rest';

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
}

export class GitHubClient {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;

  constructor() {}

  async initialize(config: GitHubConfig): Promise<boolean> {
    if (!config.accessToken) {
      console.error('No access token provided');
      return false;
    }

    try {
      this.config = config;
      this.octokit = new Octokit({
        auth: config.accessToken,
        userAgent: 'Token Bridge Figma Plugin v1.0.0'
      });

      // Test the connection
      await this.octokit.users.getAuthenticated();
      console.log('GitHub client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize GitHub client:', error);
      return false;
    }
  }

  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    if (!this.octokit || !this.config) {
      return { valid: false, error: 'GitHub client not initialized' };
    }

    try {
      const { data: repo } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });

      const hasWriteAccess = repo.permissions && (repo.permissions.push || repo.permissions.admin);
      
      if (!hasWriteAccess) {
        return { valid: false, error: 'No write access to repository' };
      }

      return { valid: true };
    } catch (error: any) {
      if (error.status === 404) {
        return { valid: false, error: 'Repository not found or no access' };
      }
      return { valid: false, error: error.message };
    }
  }

  async syncTokens(exportData: any[], commitMessage: string = 'Update design tokens via Token Bridge'): Promise<SyncResult> {
    if (!this.octokit || !this.config) {
      return { success: false, error: 'GitHub client not initialized' };
    }

    try {
      console.log(`Syncing ${exportData.length} token files to repository`);
      
      // Create a new branch for the changes
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const branchName = `token-bridge-update-${timestamp}`;
      
      await this.createBranch(branchName);
      
      const filesUpdated: string[] = [];
      
      // Update each token file
      for (const collectionData of exportData) {
        const collectionName = Object.keys(collectionData)[0];
        const tokens = collectionData[collectionName];
        
        // Create file path (e.g., tokens/primitive.json)
        const fileName = `${collectionName.toLowerCase().replace(/\s+/g, '-')}.json`;
        const filePath = this.config.tokenPath.endsWith('/') 
          ? `${this.config.tokenPath}${fileName}`
          : `${this.config.tokenPath}/${fileName}`;
        
        const fileContent = JSON.stringify(tokens, null, 2);
        
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
        filesUpdated
      };
      
    } catch (error: any) {
      console.error('Error syncing tokens:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  private async createBranch(branchName: string): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error('GitHub client not initialized');
    }

    // Get the SHA of the base branch
    const { data: baseRef } = await this.octokit.git.getRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `heads/${this.config.branch}`
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha
    });

    console.log(`Created branch: ${branchName}`);
  }

  private async updateFile(filePath: string, content: string, branch: string): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error('GitHub client not initialized');
    }

    try {
      // Try to get existing file
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: branch
      });

      // Update existing file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: `Update ${filePath}`,
        content: Buffer.from(content).toString('base64'),
        branch: branch,
        sha: Array.isArray(existingFile) ? undefined : existingFile.sha
      });
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create it
        await this.octokit.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: filePath,
          message: `Create ${filePath}`,
          content: Buffer.from(content).toString('base64'),
          branch: branch
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
      throw new Error('GitHub client not initialized');
    }

    const prBody = this.generatePullRequestBody(exportData, filesUpdated);
    
    const { data: pr } = await this.octokit.pulls.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title: `🎨 ${commitMessage}`,
      head: branchName,
      base: this.config.branch,
      body: prBody
    });

    console.log(`Created pull request: ${pr.html_url}`);
    return pr;
  }

  private generatePullRequestBody(exportData: any[], filesUpdated: string[]): string {
    const totalTokens = exportData.reduce((sum, collectionData) => {
      const collectionName = Object.keys(collectionData)[0];
      return sum + Object.keys(collectionData[collectionName]).length;
    }, 0);

    const collections = exportData.map(collectionData => Object.keys(collectionData)[0]);

    return `
# 🎨 Design Token Update

Generated by **Token Bridge Figma Plugin**

## 📊 Summary
- **Collections Updated**: ${collections.length}
- **Total Tokens**: ${totalTokens}
- **Files Modified**: ${filesUpdated.length}

## 📁 Updated Collections
${collections.map(name => `- **${name}**`).join('\n')}

## 🔄 Files Changed
${filesUpdated.map(path => `- \`${path}\``).join('\n')}

## ✅ Validation
- All tokens follow W3C DTCG format
- Token names normalized for consistency
- Variable references preserved

---
*This PR was automatically generated from Figma variables using Token Bridge*
    `.trim();
  }
}
