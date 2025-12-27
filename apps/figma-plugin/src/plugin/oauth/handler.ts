/**
 * Figma OAuth Handler
 * Manages OAuth flow for authenticating with GitHub, GitLab, and Bitbucket
 */

import { generateCodeVerifier, generateCodeChallenge } from "./pkce";
import {
  storeTokens,
  storeSessionData,
  clearSessionData,
  getAccessToken,
  getRefreshToken,
  getExpiresAt,
  getProvider,
  isTokenExpired,
  clearTokens,
  type StoredTokens,
} from "./token-storage";
import { OAUTH_CONFIG } from "./config";

export type OAuthProvider = "github" | "gitlab" | "bitbucket";

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope: string;
  tokenType: "Bearer";
}

export interface OAuthStatus {
  status: "pending" | "completed" | "error";
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
  error?: string;
}

export class FigmaOAuthHandler {
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || OAUTH_CONFIG.serverUrl;
  }

  /**
   * Initiate OAuth flow
   * Opens browser window and starts polling for completion
   */
  async initiateOAuth(provider: OAuthProvider): Promise<TokenResponse> {
    try {
      // 1. Generate PKCE values using Web Crypto API
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const sessionId = crypto.randomUUID();

      // 2. Store session data for later
      await storeSessionData(sessionId, codeVerifier);

      // 3. Build authorization URL
      const authUrl = new URL(
        `${this.serverUrl}/api/auth/${provider}/authorize`
      );
      authUrl.searchParams.set("session", sessionId);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      // 4. Open browser for user authorization
      // Note: This opens in user's default browser, not within Figma
      const opened = window.open(authUrl.toString(), "_blank");

      if (!opened) {
        throw new Error(
          "Failed to open authentication window. Please check your popup blocker settings."
        );
      }

      // 5. Poll for completion
      const tokens = await this.pollForCompletion(sessionId, provider);

      // 6. Clean up session data
      await clearSessionData();

      return tokens;
    } catch (error) {
      // Clean up on error
      await clearSessionData();
      throw error;
    }
  }

  /**
   * Poll OAuth server for token completion
   */
  private async pollForCompletion(
    sessionId: string,
    provider: OAuthProvider
  ): Promise<TokenResponse> {
    const { intervalMs, maxAttempts } = OAUTH_CONFIG.polling;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait before polling
      await this.sleep(intervalMs);

      try {
        const response = await fetch(
          `${this.serverUrl}/api/auth/status/${sessionId}`
        );

        // 202 = Still pending
        if (response.status === 202) {
          continue;
        }

        // 200 = Completed
        if (response.ok) {
          const data: OAuthStatus = await response.json();

          if (data.status === "completed" && data.accessToken) {
            // Store tokens securely
            await storeTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: data.expiresAt,
              scope: data.scope || "",
              provider,
            });

            return {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: data.expiresAt,
              scope: data.scope || "",
              tokenType: data.tokenType || "Bearer",
            };
          }

          if (data.status === "error") {
            throw new Error(data.error || "OAuth failed");
          }
        }

        // Other status codes indicate errors
        if (response.status >= 400) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || `OAuth failed with status ${response.status}`
          );
        }
      } catch (error: any) {
        // If we're on the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }

        // Otherwise, log and continue polling
        console.error("Poll attempt failed:", error);
      }
    }

    throw new Error(
      "OAuth timeout - Please try again. Make sure you completed the authorization in your browser."
    );
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getAccessToken();
    return !!token;
  }

  /**
   * Get current access token, refreshing if needed
   */
  async getAccessToken(): Promise<string | null> {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    // Check if token needs refresh
    const needsRefresh = await isTokenExpired();
    if (needsRefresh) {
      try {
        const newToken = await this.refreshToken();
        return newToken;
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Token refresh failed, user needs to re-authenticate
        return null;
      }
    }

    return token;
  }

  /**
   * Refresh expired token
   */
  async refreshToken(): Promise<string> {
    const provider = await getProvider();
    const refreshToken = await getRefreshToken();

    if (!provider || !refreshToken) {
      throw new Error("No refresh token available - please re-authenticate");
    }

    const response = await fetch(`${this.serverUrl}/api/refresh/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed - please re-authenticate");
    }

    const tokens = await response.json();

    // Store new tokens
    await storeTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      provider: provider as OAuthProvider,
    });

    return tokens.accessToken;
  }

  /**
   * Sign out (clear all tokens)
   */
  async signOut(): Promise<void> {
    await clearTokens();
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const oauthHandler = new FigmaOAuthHandler();
