// Enhanced error handling for the Figma plugin
export interface PluginError {
  type: ErrorType;
  message: string;
  details?: any;
  suggestions?: string[];
  recoverable: boolean;
}

export enum ErrorType {
  NETWORK_ERROR = 'network-error',
  AUTHENTICATION_ERROR = 'authentication-error',
  REPOSITORY_ERROR = 'repository-error',
  TOKEN_FORMAT_ERROR = 'token-format-error',
  CONFLICT_ERROR = 'conflict-error',
  FIGMA_API_ERROR = 'figma-api-error',
  VALIDATION_ERROR = 'validation-error',
  UNKNOWN_ERROR = 'unknown-error'
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: any,
    suggestions?: string[]
  ): PluginError {
    return {
      type,
      message,
      details,
      suggestions: suggestions || this.getDefaultSuggestions(type),
      recoverable: this.isRecoverable(type)
    };
  }

  static fromException(error: any): PluginError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Network connection failed',
        error,
        ['Check your internet connection', 'Verify repository URL', 'Try again in a few moments']
      );
    }

    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return this.createError(
        ErrorType.AUTHENTICATION_ERROR,
        'GitHub authentication failed',
        error,
        ['Check your access token', 'Verify repository permissions', 'Re-configure GitHub settings']
      );
    }

    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      return this.createError(
        ErrorType.REPOSITORY_ERROR,
        'Repository or file not found',
        error,
        ['Verify repository name and owner', 'Check token file path', 'Ensure repository exists']
      );
    }

    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      return this.createError(
        ErrorType.TOKEN_FORMAT_ERROR,
        'Invalid token file format',
        error,
        ['Check JSON syntax', 'Verify token file structure', 'Try a different export format']
      );
    }

    if (error.message?.includes('conflict')) {
      return this.createError(
        ErrorType.CONFLICT_ERROR,
        'Token conflicts detected',
        error,
        ['Resolve conflicts manually', 'Pull latest changes first', 'Use conflict resolution tool']
      );
    }

    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      error
    );
  }

  private static getDefaultSuggestions(type: ErrorType): string[] {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return ['Check internet connection', 'Try again later', 'Verify repository access'];
      
      case ErrorType.AUTHENTICATION_ERROR:
        return ['Check access token', 'Verify permissions', 'Re-configure GitHub'];
      
      case ErrorType.REPOSITORY_ERROR:
        return ['Verify repository exists', 'Check permissions', 'Confirm file paths'];
      
      case ErrorType.TOKEN_FORMAT_ERROR:
        return ['Validate JSON format', 'Check token structure', 'Try different export'];
      
      case ErrorType.CONFLICT_ERROR:
        return ['Resolve conflicts', 'Pull latest changes', 'Use merge tools'];
      
      case ErrorType.FIGMA_API_ERROR:
        return ['Refresh plugin', 'Check Figma variables', 'Try reloading collections'];
      
      case ErrorType.VALIDATION_ERROR:
        return ['Check token values', 'Verify references', 'Review validation report'];
      
      default:
        return ['Try again', 'Check console for details', 'Contact support if issue persists'];
    }
  }

  private static isRecoverable(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.TOKEN_FORMAT_ERROR:
      case ErrorType.CONFLICT_ERROR:
        return true;
      
      case ErrorType.REPOSITORY_ERROR:
      case ErrorType.FIGMA_API_ERROR:
      case ErrorType.VALIDATION_ERROR:
        return true;
      
      default:
        return false;
    }
  }

  static getErrorIcon(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK_ERROR: return '🌐';
      case ErrorType.AUTHENTICATION_ERROR: return '🔑';
      case ErrorType.REPOSITORY_ERROR: return '📁';
      case ErrorType.TOKEN_FORMAT_ERROR: return '📄';
      case ErrorType.CONFLICT_ERROR: return '🔄';
      case ErrorType.FIGMA_API_ERROR: return '🎨';
      case ErrorType.VALIDATION_ERROR: return '⚠️';
      default: return '❌';
    }
  }

  static getErrorColor(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK_ERROR: return '#ef4444';
      case ErrorType.AUTHENTICATION_ERROR: return '#f59e0b';
      case ErrorType.REPOSITORY_ERROR: return '#6366f1';
      case ErrorType.TOKEN_FORMAT_ERROR: return '#8b5cf6';
      case ErrorType.CONFLICT_ERROR: return '#f59e0b';
      case ErrorType.FIGMA_API_ERROR: return '#ec4899';
      case ErrorType.VALIDATION_ERROR: return '#f59e0b';
      default: return '#ef4444';
    }
  }
}
