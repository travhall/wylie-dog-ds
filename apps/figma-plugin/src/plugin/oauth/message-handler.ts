/**
 * OAuth message handler for plugin code
 * Handles OAuth-related messages from the UI
 */

import { oauthHandler, type OAuthProvider } from "./handler";
import { getAccessToken } from "./token-storage";
import type { GitHubConfig } from "../../shared/types";
import { parseGitHubUrl } from "../../ui/utils/parseGitHubUrl";

/**
 * Handle OAuth initiation message from UI
 */
export async function handleOAuthInitiate(
  provider: OAuthProvider,
  repoUrl?: string
): Promise<void> {
  try {
    // Initiate OAuth flow
    const tokens = await oauthHandler.initiateOAuth(provider);

    // If repoUrl provided, create and test config
    if (repoUrl) {
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed) {
        throw new Error("Invalid repository URL");
      }

      const config: GitHubConfig = {
        owner: parsed.owner,
        repo: parsed.repo,
        branch: "main",
        tokenPath: "tokens",
        accessToken: tokens.accessToken,
        authMethod: "oauth",
        syncMode: "direct",
      };

      // Send success with config
      figma.ui.postMessage({
        type: "oauth-success",
        provider,
        config,
      });
    } else {
      // Just send success
      figma.ui.postMessage({
        type: "oauth-success",
        provider,
      });
    }
  } catch (error: any) {
    console.error("OAuth initiation failed:", error);
    figma.ui.postMessage({
      type: "oauth-error",
      error: error.message || "OAuth failed",
    });
  }
}

/**
 * Handle OAuth sign out
 */
export async function handleOAuthSignOut(): Promise<void> {
  try {
    await oauthHandler.signOut();
    figma.ui.postMessage({
      type: "oauth-signout-success",
    });
  } catch (error: any) {
    console.error("OAuth sign out failed:", error);
    figma.ui.postMessage({
      type: "oauth-signout-error",
      error: error.message || "Sign out failed",
    });
  }
}

/**
 * Check if user is authenticated with OAuth
 */
export async function handleOAuthStatus(): Promise<void> {
  try {
    const isAuth = await oauthHandler.isAuthenticated();
    const token = isAuth ? await getAccessToken() : null;

    figma.ui.postMessage({
      type: "oauth-status",
      authenticated: isAuth,
      hasToken: !!token,
    });
  } catch (error: any) {
    console.error("OAuth status check failed:", error);
    figma.ui.postMessage({
      type: "oauth-status",
      authenticated: false,
      hasToken: false,
    });
  }
}

/**
 * Get current access token (refreshing if needed)
 */
export async function handleGetAccessToken(): Promise<void> {
  try {
    const token = await oauthHandler.getAccessToken();

    figma.ui.postMessage({
      type: "access-token",
      token,
    });
  } catch (error: any) {
    console.error("Get access token failed:", error);
    figma.ui.postMessage({
      type: "access-token-error",
      error: error.message || "Failed to get access token",
    });
  }
}
