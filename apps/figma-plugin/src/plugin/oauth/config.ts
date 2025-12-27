/**
 * OAuth configuration
 */

export const OAUTH_CONFIG = {
  // OAuth server URL
  // For local development: http://localhost:3000
  // For production: https://oauth.token-bridge.app
  serverUrl:
    process.env.NODE_ENV === "production"
      ? "https://oauth.token-bridge.app"
      : "http://localhost:3000",

  // Polling configuration
  polling: {
    intervalMs: 3000, // Poll every 3 seconds
    maxAttempts: 60, // 60 attempts = 3 minutes max
    timeoutMs: 180000, // 3 minutes
  },
} as const;
