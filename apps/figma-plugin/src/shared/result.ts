// Standardized Result Pattern - Quick Win #12
// Provides consistent error handling across the plugin

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E; suggestions?: string[] };

export class ResultHandler {
  static success<T>(data: T): Result<T> {
    return { success: true, data };
  }

  static failure<T, E = string>(
    error: E,
    suggestions?: string[]
  ): Result<T, E> {
    return { success: false, error, suggestions };
  }

  static fromPromise<T>(promise: Promise<T>): Promise<Result<T>> {
    return promise
      .then((data) => ResultHandler.success(data))
      .catch((error) => ResultHandler.failure(error.message || String(error)));
  }

  static map<T, U>(result: Result<T>, mapper: (data: T) => U): Result<U> {
    if (result.success) {
      return ResultHandler.success(mapper(result.data));
    }
    return result as Result<U>;
  }

  static flatMap<T, U>(
    result: Result<T>,
    mapper: (data: T) => Result<U>
  ): Result<U> {
    if (result.success) {
      return mapper(result.data);
    }
    return result as Result<U>;
  }

  static isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
    return result.success;
  }

  static isFailure<T>(
    result: Result<T>
  ): result is { success: false; error: any; suggestions?: string[] } {
    return !result.success;
  }

  // Helper for async operations with error suggestions
  static async asyncOperation<T>(
    operation: () => Promise<T>,
    errorContext: string,
    suggestions: string[] = []
  ): Promise<Result<T>> {
    try {
      const data = await operation();
      return ResultHandler.success(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return ResultHandler.failure(
        `${errorContext}: ${errorMessage}`,
        suggestions.length > 0
          ? suggestions
          : [
              "Check your internet connection",
              "Verify your credentials",
              "Try again in a moment",
            ]
      );
    }
  }
}

// Specialized result types for common operations
export type ValidationResult = Result<
  { valid: true; data: any },
  {
    valid: false;
    errors: string[];
    warnings: string[];
  }
>;

export type GitHubOperationResult<T> = Result<
  T,
  {
    type:
      | "network"
      | "auth"
      | "permission"
      | "not-found"
      | "rate-limit"
      | "unknown";
    message: string;
    statusCode?: number;
  }
>;

export type TokenProcessingResult<T> = Result<
  T,
  {
    type: "parsing" | "validation" | "format" | "reference" | "conflict";
    message: string;
    context?: any;
  }
>;
