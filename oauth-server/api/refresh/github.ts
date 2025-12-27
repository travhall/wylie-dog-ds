/**
 * GitHub Token Refresh Endpoint
 * Refreshes expired GitHub App tokens (not needed for OAuth Apps)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProviderCredentials } from "../../lib/providers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Missing refresh token",
      });
    }

    // Get OAuth credentials
    const { clientId, clientSecret } = getProviderCredentials("github");

    // Refresh the access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error("Token refresh failed:", tokenResponse.statusText);
      return res.status(401).json({
        error: "Token refresh failed",
      });
    }

    const tokens = await tokenResponse.json();

    // Check for errors
    if (tokens.error) {
      console.error("Token error:", tokens.error_description || tokens.error);
      return res.status(401).json({
        error: tokens.error_description || tokens.error,
      });
    }

    // Return new tokens
    return res.status(200).json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? Date.now() + tokens.expires_in * 1000
        : undefined,
      scope: tokens.scope,
      tokenType: "Bearer",
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}
