/**
 * Vercel KV storage wrapper for OAuth sessions and tokens
 */

import { kv } from "@vercel/kv";

export interface OAuthSession {
  provider: "github" | "gitlab" | "bitbucket";
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  createdAt: number;
  expiresAt: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope: string;
  tokenType: "Bearer";
  status: "completed";
}

/**
 * Store OAuth session with TTL
 * @param sessionId - Unique session identifier
 * @param session - Session data
 * @param ttlSeconds - Time to live in seconds (default: 600 = 10 minutes)
 */
export async function storeSession(
  sessionId: string,
  session: OAuthSession,
  ttlSeconds: number = 600
): Promise<void> {
  await kv.set(`session:${sessionId}`, session, { ex: ttlSeconds });
}

/**
 * Get OAuth session by ID
 * @param sessionId - Session identifier
 * @returns Session data or null if not found/expired
 */
export async function getSession(
  sessionId: string
): Promise<OAuthSession | null> {
  return await kv.get<OAuthSession>(`session:${sessionId}`);
}

/**
 * Delete OAuth session
 * @param sessionId - Session identifier
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await kv.del(`session:${sessionId}`);
}

/**
 * Store tokens with TTL
 * @param sessionId - Session identifier
 * @param tokens - Token data
 * @param ttlSeconds - Time to live in seconds (default: 600 = 10 minutes)
 */
export async function storeTokens(
  sessionId: string,
  tokens: TokenData,
  ttlSeconds: number = 600
): Promise<void> {
  await kv.set(`tokens:${sessionId}`, tokens, { ex: ttlSeconds });
}

/**
 * Get tokens by session ID
 * @param sessionId - Session identifier
 * @returns Token data or null if not found/expired
 */
export async function getTokens(sessionId: string): Promise<TokenData | null> {
  return await kv.get<TokenData>(`tokens:${sessionId}`);
}

/**
 * Delete tokens (one-time retrieval)
 * @param sessionId - Session identifier
 */
export async function deleteTokens(sessionId: string): Promise<void> {
  await kv.del(`tokens:${sessionId}`);
}
