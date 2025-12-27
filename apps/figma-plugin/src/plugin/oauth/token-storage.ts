/**
 * Secure token storage wrapper for figma.clientStorage
 * Figma's clientStorage automatically encrypts data at rest
 */

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope: string;
  provider: "github" | "gitlab" | "bitbucket";
}

const KEYS = {
  ACCESS_TOKEN: "oauth_access_token",
  REFRESH_TOKEN: "oauth_refresh_token",
  EXPIRES_AT: "oauth_expires_at",
  SCOPE: "oauth_scope",
  PROVIDER: "oauth_provider",
  SESSION_ID: "oauth_session_id",
  CODE_VERIFIER: "pkce_verifier",
} as const;

/**
 * Store OAuth tokens securely
 */
export async function storeTokens(tokens: StoredTokens): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.ACCESS_TOKEN, tokens.accessToken);
  await figma.clientStorage.setAsync(KEYS.PROVIDER, tokens.provider);
  await figma.clientStorage.setAsync(KEYS.SCOPE, tokens.scope);

  if (tokens.refreshToken) {
    await figma.clientStorage.setAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  if (tokens.expiresAt) {
    await figma.clientStorage.setAsync(KEYS.EXPIRES_AT, tokens.expiresAt);
  }
}

/**
 * Get stored access token
 */
export async function getAccessToken(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.REFRESH_TOKEN);
}

/**
 * Get token expiration timestamp
 */
export async function getExpiresAt(): Promise<number | null> {
  return await figma.clientStorage.getAsync(KEYS.EXPIRES_AT);
}

/**
 * Get stored provider
 */
export async function getProvider(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.PROVIDER);
}

/**
 * Get stored scope
 */
export async function getScope(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.SCOPE);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

/**
 * Check if token is expired or expiring soon
 * @param bufferMs - Buffer time in milliseconds (default: 5 minutes)
 */
export async function isTokenExpired(
  bufferMs: number = 300000
): Promise<boolean> {
  const expiresAt = await getExpiresAt();
  if (!expiresAt) {
    return false; // No expiration (e.g., GitHub OAuth App tokens)
  }
  return Date.now() >= expiresAt - bufferMs;
}

/**
 * Clear all stored tokens (sign out)
 */
export async function clearTokens(): Promise<void> {
  await figma.clientStorage.deleteAsync(KEYS.ACCESS_TOKEN);
  await figma.clientStorage.deleteAsync(KEYS.REFRESH_TOKEN);
  await figma.clientStorage.deleteAsync(KEYS.EXPIRES_AT);
  await figma.clientStorage.deleteAsync(KEYS.SCOPE);
  await figma.clientStorage.deleteAsync(KEYS.PROVIDER);
}

/**
 * Store OAuth session data during flow
 */
export async function storeSessionData(
  sessionId: string,
  codeVerifier: string
): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.SESSION_ID, sessionId);
  await figma.clientStorage.setAsync(KEYS.CODE_VERIFIER, codeVerifier);
}

/**
 * Get stored session ID
 */
export async function getSessionId(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.SESSION_ID);
}

/**
 * Get stored code verifier
 */
export async function getCodeVerifier(): Promise<string | null> {
  return await figma.clientStorage.getAsync(KEYS.CODE_VERIFIER);
}

/**
 * Clear OAuth session data
 */
export async function clearSessionData(): Promise<void> {
  await figma.clientStorage.deleteAsync(KEYS.SESSION_ID);
  await figma.clientStorage.deleteAsync(KEYS.CODE_VERIFIER);
}
