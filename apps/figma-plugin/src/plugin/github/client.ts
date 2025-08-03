// GitHub integration for token synchronization

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
  accessToken?: string;
}

interface SyncResult {
  success: boolean;
  pullRequestUrl?: string;
  error?: string;
  filesUpdated?: string[];
}

export class GitHubClient {
  private config: GitHubConfig | null = null;
  private baseUrl = 'https://api.github.com';

  constructor() {}

  async initialize(config: GitHubConfig): Promise<boolean> {
    if (!config.accessToken) {
      console.error('No access token provided');
      return false;
    }

    try {
      this.config = config;
      
      // Test the connection with basic fetch
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`);
      }

      const user = await response.json();
      console.log('GitHub client initialized successfully for user:', user.login);
      return true;
    } catch (error) {
      console.error('Failed to initialize GitHub client:', error);
      return false;
    }
  }

  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    if (!this.config) {
      return { valid: false, error: 'GitHub client not initialized' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      if (response.status === 404) {
        return { valid: false, error: 'Repository not found or no access' };
      }

      if (!response.ok) {
        return { valid: false, error: `API error: ${response.status} ${response.statusText}` };
      }

      const repo = await response.json();
      const hasWriteAccess = repo.permissions && (repo.permissions.push || repo.permissions.admin);
      
      if (!hasWriteAccess) {
        return { valid: false, error: 'No write access to repository' };
      }

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  async syncTokens(exportData: any[], commitMessage: string = 'Update design tokens via Token Bridge'): Promise<SyncResult> {
    if (!this.config) {
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
    if (!this.config) {
      throw new Error('GitHub client not initialized');
    }

    // Get the SHA of the base branch
    const refResponse = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${this.config.branch}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
      }
    });

    if (!refResponse.ok) {
      throw new Error(`Failed to get base branch: ${refResponse.status} ${refResponse.statusText}`);
    }

    const baseRef = await refResponse.json();

    // Create new branch
    const createResponse = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Token Bridge Figma Plugin v1.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create branch: ${createResponse.status} ${createResponse.statusText}`);
    }

    console.log(`Created branch: ${branchName}`);
  }

  private async updateFile(filePath: string, content: string, branch: string): Promise<void> {
    if (!this.config) {
      throw new Error('GitHub client not initialized');
    }

    try {
      // Try to get existing file
      const getResponse = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}?ref=${branch}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0'
        }
      });

      let existingSha = null;
      if (getResponse.ok) {
        const existingFile = await getResponse.json();
        existingSha = existingFile.sha;
      }

      // Update or create file
      const updateResponse = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Token Bridge Figma Plugin v1.0.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: existingSha ? `Update ${filePath}` : `Create ${filePath}`,
          content: btoa(content), // Base64 encode
          branch: branch,
          sha: existingSha
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update file: ${updateResponse.status} ${updateResponse.statusText}`);
      }
    } catch (error: any) {
      console.error(`Error updating file ${filePath}:`, error);
      throw error;
    }
  }

  private async createPullRequest(
    branchName: string,
    commitMessage: string,
    exportData: any[],
    filesUpdated: string[]
  ): Promise<any> {
    if (!this.config) {
      throw new Error('GitHub client not initialized');
    }

    const prBody = this.generatePullRequestBody(exportData, filesUpdated);
    
    const response = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Token Bridge Figma Plugin v1.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `🎨 ${commitMessage}`,
        head: branchName,
        base: this.config.branch,
        body: prBody
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create pull request: ${response.status} ${response.statusText}`);
    }

    const pr = await response.json();
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

export { GitHubConfig, SyncResult };
