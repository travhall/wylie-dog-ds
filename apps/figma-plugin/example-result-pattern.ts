// Example conversion of GitHub client method to use Result pattern
import { Result, ResultHelper, ErrorHandler } from '../../shared/result';
import { ErrorType } from '../../shared/error-handler';

// Before: throws errors
private async directSyncOld(exportData: any[], commitMessage: string): Promise<SyncResult> {
  if (!this.octokit || !this.config) {
    throw new Error('GitHub client not initialized');
  }
  // ... rest of method
}

// After: returns Result
private async directSync(exportData: any[], commitMessage: string): Promise<Result<SyncResult>> {
  if (!this.octokit || !this.config) {
    return ResultHelper.error(ErrorHandler.createError(
      ErrorType.AUTHENTICATION_ERROR,
      'GitHub client not initialized',
      undefined,
      ['Configure GitHub settings', 'Check access token']
    ));
  }

  try {
    const filesUpdated: string[] = [];
    
    for (const collectionData of exportData) {
      const collectionName = Object.keys(collectionData)[0];
      const tokens = collectionData[collectionName];
      
      const fileName = `${collectionName.toLowerCase().replace(/\s+/g, '-')}.json`;
      const filePath = this.config.tokenPath.endsWith('/') 
        ? `${this.config.tokenPath}${fileName}`
        : `${this.config.tokenPath}/${fileName}`;
      
      const fileContent = JSON.stringify([{ [collectionName]: tokens }], null, 2);
      
      const updateResult = await this.updateFileDirectly(filePath, fileContent, commitMessage);
      if (!updateResult.success) {
        return updateResult;
      }
      
      filesUpdated.push(filePath);
    }
    
    return ResultHelper.success({
      success: true,
      filesUpdated
    });
    
  } catch (error) {
    return ResultHelper.error(ErrorHandler.fromException(error));
  }
}

// Usage in calling code
async function handleSync() {
  const result = await githubClient.directSync(exportData, 'Update tokens');
  
  if (result.success) {
    console.log('Sync completed:', result.data.filesUpdated);
  } else {
    // Use existing EnhancedErrorDisplay component
    setError(result.error);
  }
}
