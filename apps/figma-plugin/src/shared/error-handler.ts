// Enhanced error handling for the Figma plugin
import {
  classifyFailure,
  SyncFailureError,
  type FailureAction,
  type FailureKind,
  type SyncFailure,
} from "./sync-failure";

export interface PluginError {
  type: ErrorType;
  message: string;
  details?: unknown;
  suggestions?: string[];
  recoverable: boolean;
  /** Set when the error was classified (see sync-failure.ts). */
  kind?: FailureKind;
  /** The one thing that fixes it, when there is one. */
  action?: FailureAction;
  /** Rate limited: when GitHub allows requests again (ISO time). */
  retryAt?: string;
}

export enum ErrorType {
  NETWORK_ERROR = "network-error",
  AUTHENTICATION_ERROR = "authentication-error",
  REPOSITORY_ERROR = "repository-error",
  TOKEN_FORMAT_ERROR = "token-format-error",
  CONFLICT_ERROR = "conflict-error",
  FIGMA_API_ERROR = "figma-api-error",
  VALIDATION_ERROR = "validation-error",
  UNKNOWN_ERROR = "unknown-error",
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: unknown,
    suggestions?: string[]
  ): PluginError {
    return {
      type,
      message,
      details,
      suggestions: suggestions || this.getDefaultSuggestions(type),
      recoverable: this.isRecoverable(type),
    };
  }

  /** A classified failure as a PluginError. Its message already says what to do. */
  static fromFailure(failure: SyncFailure): PluginError {
    const type = ((): ErrorType => {
      switch (failure.kind) {
        case "token-rejected":
        case "no-access":
          return ErrorType.AUTHENTICATION_ERROR;
        case "rate-limited":
        case "offline":
          return ErrorType.NETWORK_ERROR;
        case "repo-not-found":
        case "folder-not-found":
        case "file-not-found":
        case "not-found":
          return ErrorType.REPOSITORY_ERROR;
        case "bad-file":
          return ErrorType.TOKEN_FORMAT_ERROR;
        case "branch-moved":
          return ErrorType.CONFLICT_ERROR;
        default:
          return ErrorType.UNKNOWN_ERROR;
      }
    })();
    return {
      type,
      message: failure.message,
      details: failure.detail,
      suggestions: [],
      recoverable: true,
      kind: failure.kind,
      ...(failure.action && { action: failure.action }),
      ...(failure.retryAt && { retryAt: failure.retryAt }),
    };
  }

  /**
   * What to show for a failed result: its classification when the client made
   * one, else its text, else the fallback.
   */
  static fromResult(
    result: { error?: string; failure?: SyncFailure },
    fallback: string
  ): PluginError | string {
    return result.failure
      ? this.fromFailure(result.failure)
      : result.error || fallback;
  }

  static fromException(error: unknown): PluginError {
    if (error instanceof SyncFailureError)
      return this.fromFailure(error.failure);

    const message = error instanceof Error ? error.message : String(error);

    // The HTTP status, not a number inside the text, decides what it was
    const failure = classifyFailure(error);
    if (failure.kind !== "other") return this.fromFailure(failure);

    if (message.includes("conflict")) {
      return this.createError(
        ErrorType.CONFLICT_ERROR,
        "Token conflicts detected",
        error,
        [
          "Resolve conflicts manually",
          "Pull latest changes first",
          "Use conflict resolution tool",
        ]
      );
    }

    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      message || "An unexpected error occurred",
      error
    );
  }

  private static getDefaultSuggestions(type: ErrorType): string[] {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return [
          "Check internet connection",
          "Try again later",
          "Verify repository access",
        ];

      case ErrorType.AUTHENTICATION_ERROR:
        return [
          "Check access token",
          "Verify permissions",
          "Re-configure GitHub",
        ];

      case ErrorType.REPOSITORY_ERROR:
        return [
          "Verify repository exists",
          "Check permissions",
          "Confirm file paths",
        ];

      case ErrorType.TOKEN_FORMAT_ERROR:
        return [
          "Validate JSON format",
          "Check token structure",
          "Try different export",
        ];

      case ErrorType.CONFLICT_ERROR:
        return ["Resolve conflicts", "Pull latest changes", "Use merge tools"];

      case ErrorType.FIGMA_API_ERROR:
        return [
          "Refresh plugin",
          "Check Figma variables",
          "Try reloading collections",
        ];

      case ErrorType.VALIDATION_ERROR:
        return [
          "Check token values",
          "Verify references",
          "Review validation report",
        ];

      default:
        return [
          "Try again",
          "Check console for details",
          "Contact support if issue persists",
        ];
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
      case ErrorType.NETWORK_ERROR:
        return "🌐";
      case ErrorType.AUTHENTICATION_ERROR:
        return "🔑";
      case ErrorType.REPOSITORY_ERROR:
        return "📁";
      case ErrorType.TOKEN_FORMAT_ERROR:
        return "📄";
      case ErrorType.CONFLICT_ERROR:
        return "🔄";
      case ErrorType.FIGMA_API_ERROR:
        return "🎨";
      case ErrorType.VALIDATION_ERROR:
        return "⚠️";
      default:
        return "❌";
    }
  }

  static getErrorColor(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return "#ef4444";
      case ErrorType.AUTHENTICATION_ERROR:
        return "#f59e0b";
      case ErrorType.REPOSITORY_ERROR:
        return "#6366f1";
      case ErrorType.TOKEN_FORMAT_ERROR:
        return "#8b5cf6";
      case ErrorType.CONFLICT_ERROR:
        return "#f59e0b";
      case ErrorType.FIGMA_API_ERROR:
        return "#ec4899";
      case ErrorType.VALIDATION_ERROR:
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  }
}
