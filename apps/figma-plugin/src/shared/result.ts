// Result type for standardized error handling - Quick Win #12
import type { PluginError } from './error-handler';

export type Result<T, E = PluginError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export class ResultHelper {
  static success<T>(data: T): Result<T> {
    return { success: true, data };
  }

  static error<T>(error: PluginError): Result<T> {
    return { success: false, error };
  }

  static fromPromise<T>(
    promise: Promise<T>,
    errorTransform?: (error: any) => PluginError
  ): Promise<Result<T>> {
    return promise
      .then(data => ResultHelper.success(data))
      .catch(error => ResultHelper.error(
        errorTransform ? errorTransform(error) : error
      ));
  }

  static unwrap<T>(result: Result<T>): T {
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    return result.success ? result.data : defaultValue;
  }

  static map<T, U>(
    result: Result<T>, 
    transform: (data: T) => U
  ): Result<U> {
    return result.success 
      ? ResultHelper.success(transform(result.data))
      : result;
  }

  static mapError<T>(
    result: Result<T>,
    transform: (error: PluginError) => PluginError
  ): Result<T> {
    return result.success 
      ? result
      : ResultHelper.error(transform(result.error));
  }

  static chain<T, U>(
    result: Result<T>,
    transform: (data: T) => Result<U>
  ): Result<U> {
    return result.success ? transform(result.data) : result;
  }

  static combine<T extends readonly unknown[]>(
    ...results: { [K in keyof T]: Result<T[K]> }
  ): Result<T> {
    for (const result of results) {
      if (!result.success) {
        return result as Result<T>;
      }
    }
    return ResultHelper.success(
      results.map(r => (r as any).data) as T
    );
  }
}

// Convenience functions for common patterns
export const ok = ResultHelper.success;
export const err = ResultHelper.error;
export const fromPromise = ResultHelper.fromPromise;
