/**
 * OAuth message handler for plugin code
 * Handles OAuth-related messages from the UI
 */

import { deviceFlowHandler } from "./device-flow-handler";
import { getAccessToken } from "./token-storage";
import { validateOAuthConfig } from "./oauth-config";
import type { GitHubConfig } from "../../shared/types";
import { parseGitHubUrl } from "../../ui/utils/parseGitHubUrl";

export type OAuthProvider = "github" | "gitlab" | "bitbucket";

/**
 * Handle OAuth initiation message from UI
 * Uses GitHub Device Flow for serverless authentication
 */
export async function handleOAuthInitiate(
  provider: OAuthProvider,
  repoUrl?: string
): Promise<void> {
  try {
    // Only GitHub is supported with Device Flow
    if (provider !== "github") {
      throw new Error(
        `Device Flow only supports GitHub. ${provider} coming soon!`
      );
    }

    // Validate OAuth configuration before attempting
    const validation = validateOAuthConfig();
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    console.log("[OAuth] Starting device flow authentication...");

    // Initiate device flow
    const status = await deviceFlowHandler.authenticate();

    if (status.status === "error") {
      throw new Error(status.error || "Failed to start authentication");
    }

    // Send device code info to UI for display
    figma.ui.postMessage({
      type: "oauth-device-code",
      provider,
      userCode: status.userCode,
      verificationUri: status.verificationUri,
      expiresIn: status.expiresIn,
      repoUrl, // Pass through for later
    });

    // The polling happens in background and will send oauth-success when complete
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
    await deviceFlowHandler.signOut();
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
    const isAuth = await deviceFlowHandler.isAuthenticated();
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
 * Get current access token
 * Note: Device Flow tokens don't expire, so no refresh needed
 */
export async function handleGetAccessToken(): Promise<void> {
  try {
    const token = await deviceFlowHandler.getAccessToken();

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
