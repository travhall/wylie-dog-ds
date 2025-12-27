/**
 * GitHub OAuth - Authorize Endpoint
 * Initiates the OAuth flow by storing session and redirecting to GitHub
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storeSession } from "../../../lib/storage.js";
import {
  getProviderConfig,
  getProviderCredentials,
} from "../../../lib/providers.js";
import { OAuthErrors } from "../../../lib/errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session, code_challenge, code_challenge_method } = req.query;

    // Validate required parameters
    if (!session || !code_challenge || code_challenge_method !== "S256") {
      throw OAuthErrors.INVALID_REQUEST(
        "Missing required parameters: session, code_challenge, code_challenge_method"
      );
    }

    const sessionId = session as string;
    const codeChallenge = code_challenge as string;

    // Get provider configuration
    const providerConfig = getProviderConfig("github");
    if (!providerConfig) {
      throw OAuthErrors.PROVIDER_NOT_FOUND("github");
    }

    // Get OAuth credentials
    const { clientId, redirectUri } = getProviderCredentials("github");

    // Generate state for CSRF protection
    const state = sessionId; // Use session ID as state for simplicity

    // Store session with code challenge
    await storeSession(sessionId, {
      provider: "github",
      codeVerifier: "", // Will be provided by the plugin during callback
      codeChallenge,
      state,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000, // 10 minutes
    });

    // Build GitHub authorization URL
    const authUrl = new URL(providerConfig.authEndpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", providerConfig.scopes.join(" "));
    authUrl.searchParams.set("state", state);

    // Add PKCE parameters (optional for GitHub OAuth Apps, but recommended)
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // Redirect to GitHub
    return res.redirect(authUrl.toString());
  } catch (error: any) {
    console.error("GitHub authorize error:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({
      error: message,
      code: error.code || "server_error",
    });
  }
}
