/**
 * GitHub OAuth - Callback Endpoint
 * Handles the OAuth callback, exchanges code for tokens, and stores them
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSession,
  deleteSession,
  storeTokens,
} from "../../../lib/storage.js";
import { getProviderCredentials } from "../../../lib/providers.js";
import { OAuthErrors } from "../../../lib/errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state } = req.query;

    // Validate required parameters
    if (!code || !state) {
      return res.redirect("/auth/error?message=Missing+code+or+state");
    }

    const sessionId = state as string;

    // Retrieve and validate session
    const session = await getSession(sessionId);
    if (!session) {
      return res.redirect("/auth/error?message=Invalid+or+expired+session");
    }

    // Verify session hasn't expired
    if (Date.now() > session.expiresAt) {
      await deleteSession(sessionId);
      return res.redirect("/auth/error?message=Session+expired");
    }

    // Get OAuth credentials
    const { clientId, clientSecret } = getProviderCredentials("github");

    // Exchange authorization code for access token
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
          code: code as string,
          // Note: GitHub OAuth Apps don't require code_verifier
          // GitHub Apps would need it for PKCE
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenResponse.statusText);
      return res.redirect("/auth/error?message=Token+exchange+failed");
    }

    const tokens = await tokenResponse.json();

    // Check for errors in token response
    if (tokens.error) {
      console.error("Token error:", tokens.error_description || tokens.error);
      return res.redirect(
        `/auth/error?message=${encodeURIComponent(
          tokens.error_description || tokens.error
        )}`
      );
    }

    // Store tokens for plugin to retrieve
    await storeTokens(sessionId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? Date.now() + tokens.expires_in * 1000
        : undefined,
      scope: tokens.scope,
      tokenType: "Bearer",
      status: "completed",
    });

    // Clean up session
    await deleteSession(sessionId);

    // Redirect to success page
    return res.redirect("/auth/success");
  } catch (error: any) {
    console.error("GitHub callback error:", error);
    return res.redirect(
      `/auth/error?message=${encodeURIComponent(
        error.message || "Internal+server+error"
      )}`
    );
  }
}
