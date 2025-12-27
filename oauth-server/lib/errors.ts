/**
 * OAuth error types and utilities
 */

export class OAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "OAuthError";
  }
}

export const OAuthErrors = {
  INVALID_REQUEST: (message: string) =>
    new OAuthError(message, "invalid_request", 400),
  INVALID_SESSION: () =>
    new OAuthError("Invalid or expired session", "invalid_session", 401),
  INVALID_CODE: () =>
    new OAuthError("Invalid authorization code", "invalid_code", 401),
  TOKEN_EXCHANGE_FAILED: () =>
    new OAuthError("Failed to exchange code for tokens", "server_error", 500),
  PROVIDER_NOT_FOUND: (provider: string) =>
    new OAuthError(`Provider not found: ${provider}`, "invalid_provider", 404),
  MISSING_CREDENTIALS: () =>
    new OAuthError("Missing OAuth credentials", "server_error", 500),
};
