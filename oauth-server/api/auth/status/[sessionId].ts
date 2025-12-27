/**
 * OAuth Status Endpoint
 * Allows the plugin to poll for OAuth completion
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTokens, deleteTokens } from "../../../lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        error: "Missing or invalid session ID",
        status: "error",
      });
    }

    // Check if tokens are available
    const tokens = await getTokens(sessionId);

    if (!tokens) {
      // Tokens not ready yet - plugin should continue polling
      return res.status(202).json({
        status: "pending",
        message: "Authorization pending",
      });
    }

    // Tokens are ready - return them and delete (one-time retrieval)
    await deleteTokens(sessionId);

    return res.status(200).json({
      status: "completed",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      tokenType: tokens.tokenType,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
}
