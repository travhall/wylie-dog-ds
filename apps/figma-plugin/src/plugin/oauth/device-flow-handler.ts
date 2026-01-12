/**
 * GitHub Device Flow OAuth Handler
 * Implements OAuth Device Flow for serverless authentication
 *
 * Device Flow is perfect for Figma plugins because:
 * - No backend server required (zero cost!)
 * - Designed for devices without browsers
 * - User enters a code on GitHub's website
 * - Plugin polls GitHub for completion
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

import {
  storeTokens,
  getAccessToken,
  isTokenExpired,
  clearTokens,
} from "./token-storage";
import { GITHUB_CLIENT_ID } from "./oauth-config";
import { proxyFetch } from "../utils/network-proxy";

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DeviceTokenResponse {
  access_token: string;
  token_type: "bearer";
  scope: string;
}

export interface DeviceFlowStatus {
  status: "pending" | "completed" | "error" | "expired";
  userCode?: string;
  verificationUri?: string;
  expiresIn?: number;
  accessToken?: string;
  error?: string;
}

/**
 * GitHub Device Flow OAuth Handler
 * Handles serverless OAuth using GitHub's Device Flow
 */
export class GitHubDeviceFlowHandler {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Initiate Device Flow
   * Returns device code and user code for authorization
   */
  async initiateDeviceFlow(): Promise<DeviceCodeResponse> {
    try {
      console.log(
        "[DeviceFlow] Initiating device flow with client ID:",
        this.clientId.substring(0, 10) + "..."
      );

      // Use proxy fetch to bypass CORS restrictions
      const response = await proxyFetch(
        "https://github.com/login/device/code",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: this.clientId,
            scope: "repo", // Permission to read/write repository contents
          }),
        }
      );

      console.log("[DeviceFlow] Response status:", response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error("[DeviceFlow] GitHub API error:", error);
        throw new Error(`Failed to initiate device flow: ${error}`);
      }

      const data: DeviceCodeResponse = await response.json();
      console.log("[DeviceFlow] Device flow initiated successfully");
      return data;
    } catch (error: any) {
      console.error("[DeviceFlow] Fetch error:", error);
      // Re-throw with more details
      throw new Error(
        `Network error initiating device flow: ${error.message || "Unknown error"}`
      );
    }
  }

  /**
   * Poll GitHub for device authorization completion
   * Continues polling until user authorizes or timeout occurs
   */
  async pollForAuthorization(
    deviceCode: string,
    interval: number,
    expiresIn: number
  ): Promise<DeviceTokenResponse> {
    const startTime = Date.now();
    const expiresAt = startTime + expiresIn * 1000;

    while (Date.now() < expiresAt) {
      // Wait for the interval before polling
      await this.sleep(interval * 1000);

      try {
        // Use proxy fetch to bypass CORS restrictions
        const response = await proxyFetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: this.clientId,
              device_code: deviceCode,
              grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Polling failed with status ${response.status}`);
        }

        const data = await response.json();

        // Handle different response scenarios
        if (data.error) {
          switch (data.error) {
            case "authorization_pending":
              // User hasn't authorized yet, continue polling
              continue;

            case "slow_down":
              // Increase polling interval as requested
              interval += 5;
              continue;

            case "expired_token":
              throw new Error("Device code expired - please try again");

            case "access_denied":
              throw new Error("Authorization was denied");

            default:
              throw new Error(
                `OAuth error: ${data.error_description || data.error}`
              );
          }
        }

        // Success! We have an access token
        if (data.access_token) {
          return {
            access_token: data.access_token,
            token_type: data.token_type || "bearer",
            scope: data.scope || "repo",
          };
        }
      } catch (error) {
        // On error, continue polling unless we're out of time
        console.error("Poll attempt failed:", error);
        if (Date.now() >= expiresAt) {
          throw error;
        }
      }
    }

    throw new Error("Device authorization timeout - please try again");
  }

  /**
   * Complete device flow (initiate + poll + store)
   * This is the main entry point for OAuth
   */
  async authenticate(): Promise<DeviceFlowStatus> {
    try {
      // Step 1: Get device code and user code
      const deviceData = await this.initiateDeviceFlow();

      // Step 2: Return status with user code for display
      // The UI will show this to the user
      const status: DeviceFlowStatus = {
        status: "pending",
        userCode: deviceData.user_code,
        verificationUri: deviceData.verification_uri,
        expiresIn: deviceData.expires_in,
      };

      // Step 3: Start polling in background
      // We'll return immediately so UI can show the code
      this.pollForAuthorization(
        deviceData.device_code,
        deviceData.interval,
        deviceData.expires_in
      )
        .then(async (tokens) => {
          // Store tokens securely
          await storeTokens({
            accessToken: tokens.access_token,
            scope: tokens.scope,
            provider: "github",
          });

          // Notify UI of success
          figma.ui.postMessage({
            type: "oauth-success",
            provider: "github",
            accessToken: tokens.access_token,
          });
        })
        .catch((error) => {
          // Notify UI of error
          figma.ui.postMessage({
            type: "oauth-error",
            error: error.message || "Device flow failed",
          });
        });

      return status;
    } catch (error: any) {
      return {
        status: "error",
        error: error.message || "Failed to start device flow",
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    const expired = await isTokenExpired();
    return !expired;
  }

  /**
   * Get current access token
   * Note: GitHub device flow tokens don't expire (no refresh needed)
   */
  async getAccessToken(): Promise<string | null> {
    return await getAccessToken();
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

/**
 * Create handler instance
 * Client ID will be configured via environment or settings
 */
export function createDeviceFlowHandler(
  clientId: string
): GitHubDeviceFlowHandler {
  return new GitHubDeviceFlowHandler(clientId);
}

/**
 * Default handler instance using configured Client ID
 * See oauth-config.ts for setup instructions
 */
export const deviceFlowHandler = createDeviceFlowHandler(GITHUB_CLIENT_ID);
