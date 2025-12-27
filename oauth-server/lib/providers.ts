/**
 * OAuth provider configurations
 */

export interface ProviderConfig {
  name: string;
  authEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
  requiresPKCE: boolean;
}

export const providers: Record<string, ProviderConfig> = {
  github: {
    name: "GitHub",
    authEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    scopes: ["repo", "user:email"],
    requiresPKCE: false, // Optional for GitHub OAuth Apps
  },
  gitlab: {
    name: "GitLab",
    authEndpoint: "https://gitlab.com/oauth/authorize",
    tokenEndpoint: "https://gitlab.com/oauth/token",
    scopes: ["api", "read_user"],
    requiresPKCE: true, // Mandatory for GitLab
  },
  bitbucket: {
    name: "Bitbucket",
    authEndpoint: "https://bitbucket.org/site/oauth2/authorize",
    tokenEndpoint: "https://bitbucket.org/site/oauth2/access_token",
    scopes: ["repository", "repository:write"],
    requiresPKCE: false, // Optional for Bitbucket
  },
};

/**
 * Get provider configuration
 * @param provider - Provider name
 * @returns Provider config or null if not found
 */
export function getProviderConfig(provider: string): ProviderConfig | null {
  return providers[provider] || null;
}

/**
 * Get OAuth client credentials for a provider
 * @param provider - Provider name
 * @returns Client ID and secret from environment variables
 */
export function getProviderCredentials(provider: string): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const envPrefix = provider.toUpperCase();

  const clientId = process.env[`${envPrefix}_CLIENT_ID`];
  const clientSecret = process.env[`${envPrefix}_CLIENT_SECRET`];
  const redirectUri = process.env[`${envPrefix}_REDIRECT_URI`];

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(`Missing credentials for provider: ${provider}`);
  }

  return { clientId, clientSecret, redirectUri };
}
