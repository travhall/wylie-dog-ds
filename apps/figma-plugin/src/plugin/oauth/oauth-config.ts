/**
 * OAuth Configuration
 *
 * GitHub Device Flow Configuration
 *
 * To set up GitHub OAuth:
 * 1. Go to https://github.com/settings/developers
 * 2. Click "New OAuth App"
 * 3. Fill in:
 *    - Application name: "Wylie Dog Design Tokens" (or your preferred name)
 *    - Homepage URL: "https://github.com/YOUR_USERNAME/wylie-dog-ds" (or your repo)
 *    - Authorization callback URL: "http://127.0.0.1" (required but not used for device flow)
 * 4. After creating, click "Enable Device Flow" in the app settings
 * 5. Copy the Client ID
 * 6. Set it in your environment or directly in this file (for open source, use env var)
 *
 * For open-source distribution:
 * - The Client ID is NOT a secret (it's safe to commit)
 * - Users can use your Client ID or create their own
 * - No Client Secret is needed for Device Flow
 */

/**
 * GitHub OAuth Client ID
 *
 * Option 1: Set via environment variable (recommended for contributors)
 * Option 2: Set directly here for distribution
 * Option 3: Leave as default placeholder - users will need to configure
 */
export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID ||
  // TODO: Replace with your actual Client ID when publishing
  // For now, this is a placeholder that will show helpful error
  "CONFIGURE_GITHUB_CLIENT_ID";

/**
 * Validate configuration
 */
export function validateOAuthConfig(): { valid: boolean; error?: string } {
  if (!GITHUB_CLIENT_ID || GITHUB_CLIENT_ID === "CONFIGURE_GITHUB_CLIENT_ID") {
    return {
      valid: false,
      error: `GitHub OAuth is not configured.

To set up:
1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Enable Device Flow in the app settings
3. Set GITHUB_CLIENT_ID environment variable with your Client ID

For more details, see: apps/figma-plugin/docs/OAUTH_SETUP.md`,
    };
  }

  return { valid: true };
}
