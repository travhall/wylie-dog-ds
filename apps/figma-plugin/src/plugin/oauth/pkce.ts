/**
 * PKCE (Proof Key for Code Exchange) helpers for Figma plugin
 * Uses Web Crypto API (available in Figma plugin environment)
 */

/**
 * Generate a random code verifier for PKCE
 * @returns Base64-URL encoded random string
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate a code challenge from a verifier using SHA-256
 * @param verifier - The code verifier
 * @returns Base64-URL encoded SHA-256 hash
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64-URL encode a byte array (no padding)
 * @param buffer - Byte array to encode
 * @returns Base64-URL encoded string
 */
function base64URLEncode(buffer: Uint8Array): string {
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...buffer));

  // Convert to base64url (RFC 4648)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
