/**
 * PKCE (Proof Key for Code Exchange) helpers for server-side validation
 * Uses Node.js crypto module (not available in browser)
 */

import crypto from "crypto";

/**
 * Validate PKCE code verifier against code challenge
 * @param codeVerifier - The code verifier from the OAuth flow
 * @param codeChallenge - The code challenge that was sent to the provider
 * @returns true if valid, false otherwise
 */
export function validatePKCE(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  if (!codeVerifier || !codeChallenge) {
    return false;
  }

  try {
    // Recreate challenge from verifier using SHA-256
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();

    // Convert to base64url (no padding)
    const computedChallenge = hash
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return computedChallenge === codeChallenge;
  } catch (error) {
    console.error("PKCE validation error:", error);
    return false;
  }
}

/**
 * Generate a random state token for CSRF protection
 * @returns A random hex string
 */
export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}
