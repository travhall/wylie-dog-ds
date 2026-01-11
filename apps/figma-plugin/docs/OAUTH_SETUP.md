# GitHub OAuth Setup Guide

This guide explains how to set up GitHub OAuth authentication for the Wylie Dog Figma Plugin using GitHub's **Device Flow** - a serverless, zero-cost authentication method perfect for open-source projects.

## Why Device Flow?

- ✅ **Zero server costs** - No backend infrastructure required
- ✅ **Completely free** - Perfect for open-source projects
- ✅ **Secure** - Uses GitHub's official OAuth implementation
- ✅ **User-friendly** - Simple code-based authentication
- ✅ **No secrets needed** - Client ID is safe to commit (though we use env vars)

## Quick Start

### For Users (Using the Pre-configured App)

If you're using the official Wylie Dog plugin, OAuth is pre-configured! Just:

1. Click "Connect with GitHub" in the plugin
2. Enter the code shown on GitHub's authorization page
3. Approve access
4. Done! 🎉

### For Contributors (Testing Locally)

If you're developing the plugin locally, you'll need to create your own GitHub OAuth App:

#### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"** (or "New GitHub App" - either works!)
3. Fill in the form:
   - **Application name**: `Wylie Dog Tokens (Dev)` (or your preferred name)
   - **Homepage URL**: `https://github.com/YOUR_USERNAME/wylie-dog-ds`
   - **Application description**: `Design token sync for Figma` (optional)
   - **Authorization callback URL**: `http://127.0.0.1`
     - ⚠️ This is required by GitHub but NOT used by Device Flow
     - Just use `http://127.0.0.1` as a placeholder

4. Click **"Register application"**

#### Step 2: Enable Device Flow

After creating the app:

1. In your new OAuth App settings page
2. Look for **"Enable Device Flow"** checkbox
3. ✅ Check it to enable
4. Click **"Update application"**

#### Step 3: Get Your Client ID

1. On the OAuth App settings page
2. Copy the **Client ID** (it looks like: `Iv1.abc123def456`)
3. Note: The Client Secret is NOT needed for Device Flow!

#### Step 4: Configure the Plugin

Set the Client ID as an environment variable:

```bash
# Add to your .env file or shell profile
export GITHUB_CLIENT_ID="Iv1.your_client_id_here"
```

Or for a quick test:

```bash
# Run with inline env var
GITHUB_CLIENT_ID="Iv1.your_client_id_here" pnpm dev
```

#### Step 5: Build and Test

```bash
# Build the plugin
cd apps/figma-plugin
pnpm install
pnpm build

# The build will include your Client ID
```

Then test the OAuth flow in Figma!

## For Maintainers (Publishing the Plugin)

When publishing the official plugin to the Figma Community:

### Option 1: Environment Variable (Recommended)

Keep the Client ID as an environment variable in your CI/CD:

```bash
# In GitHub Actions or your build environment
GITHUB_CLIENT_ID="Iv1.your_production_client_id" pnpm build
```

### Option 2: Hardcode for Distribution

If you want users to use your OAuth app (recommended for convenience):

1. Edit `apps/figma-plugin/src/plugin/oauth/oauth-config.ts`
2. Replace the placeholder with your actual Client ID:

```typescript
export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || "Iv1.your_actual_client_id_here"; // <-- Add your Client ID
```

3. Commit the change
4. Build and publish

⚠️ **Note**: The Client ID is NOT a secret and is safe to commit to public repos. GitHub designed it this way for device flow and browser-based apps.

## How Device Flow Works

Understanding the flow helps debug issues:

```
1. User clicks "Connect with GitHub"
   ↓
2. Plugin calls GitHub's /login/device/code endpoint
   ↓
3. GitHub returns:
   - device_code (internal, for polling)
   - user_code (e.g., "ABCD-1234")
   - verification_uri (https://github.com/login/device)
   ↓
4. Plugin shows user_code to user
   ↓
5. User visits github.com/login/device and enters code
   ↓
6. Plugin polls GitHub's /oauth/access_token endpoint
   ↓
7. User authorizes on GitHub
   ↓
8. GitHub returns access token on next poll
   ↓
9. Plugin stores token securely in Figma's encrypted storage
   ↓
10. Done! Token is used for GitHub API calls
```

## Scopes and Permissions

The plugin requests the following GitHub scope:

- **`repo`** - Full control of private and public repositories
  - Needed to read/write token files in your design system repo
  - Required for the sync functionality

Users will see this permission request when authorizing.

## Troubleshooting

### "GitHub OAuth is not configured"

**Problem**: The GITHUB_CLIENT_ID is not set or is still the placeholder.

**Solution**:

1. Create a GitHub OAuth App (see Step 1 above)
2. Set the GITHUB_CLIENT_ID environment variable
3. Rebuild the plugin

### "Failed to initiate device flow"

**Problem**: The Client ID is invalid or the OAuth app doesn't exist.

**Solution**:

1. Verify your Client ID is correct (check GitHub settings)
2. Ensure Device Flow is enabled in the OAuth app settings
3. Try creating a new OAuth app if the issue persists

### "Device authorization timeout"

**Problem**: User didn't authorize within the time limit (~15 minutes).

**Solution**:

1. Click "Connect" again to get a new code
2. Complete the authorization faster this time
3. Check that you're logged into the correct GitHub account

### "Authorization was denied"

**Problem**: User clicked "Cancel" or "Deny" on GitHub's authorization page.

**Solution**:

1. Click "Connect" again
2. Click "Authorize" on GitHub this time
3. If you're concerned about permissions, review the [Scopes section](#scopes-and-permissions)

## Security Notes

### Is the Client ID a secret?

**No!** The Client ID is explicitly designed to be public. From GitHub's documentation:

> "Client IDs are not secret. They can be embedded in mobile apps and single-page applications."

This is why Device Flow exists - it's designed for scenarios where you can't keep a secret secure.

### Where are tokens stored?

Tokens are stored in **Figma's encrypted client storage** using `figma.clientStorage`. Figma automatically encrypts all stored data, and it's isolated per-plugin and per-user.

### Can someone steal my token?

Not easily:

- Tokens are stored encrypted by Figma
- They never leave the plugin sandbox
- The plugin only uses them for GitHub API calls
- Users can revoke access anytime at https://github.com/settings/applications

### What if my Client ID is compromised?

Since it's not a secret, "compromise" doesn't really apply. However:

- Users still need to explicitly authorize your app
- You can revoke the OAuth app on GitHub to invalidate all tokens
- Create a new OAuth app if needed

## Advanced Configuration

### Using a Custom OAuth App

Users can create their own OAuth app instead of using yours:

1. Follow Steps 1-3 above
2. Set their own GITHUB_CLIENT_ID
3. Build the plugin locally
4. Install in Figma from local build

### Multiple Environments

You can create separate OAuth apps for dev/staging/production:

```bash
# Development
export GITHUB_CLIENT_ID="Iv1.dev_client_id"

# Production
export GITHUB_CLIENT_ID="Iv1.prod_client_id"
```

This helps track usage and separate concerns.

## Testing

To test the OAuth flow:

1. **Unit Tests**: Test the device flow handler logic

```bash
cd apps/figma-plugin
pnpm test
```

2. **Integration Test**: Test the full flow in Figma

- Build and load the plugin in Figma
- Click "Connect with GitHub"
- Verify the device code appears
- Complete authorization on GitHub
- Verify token is stored and works

3. **Manual API Test**: Verify token works with GitHub API

```bash
# Get your token from Figma storage (via plugin console)
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

## Resources

- [GitHub Device Flow Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [GitHub OAuth Apps Settings](https://github.com/settings/developers)
- [Figma Plugin API: clientStorage](https://www.figma.com/plugin-docs/api/figma-clientStorage/)
- [OAuth 2.0 Device Flow Spec (RFC 8628)](https://datatracker.ietf.org/doc/html/rfc8628)

## Support

If you encounter issues:

1. Check the [Troubleshooting section](#troubleshooting)
2. Review the browser console in Figma (Plugins → Development → Open Console)
3. Open an issue at https://github.com/YOUR_USERNAME/wylie-dog-ds/issues
4. Include: error message, steps to reproduce, and your Figma version

---

**Happy token syncing!** 🎨🔗✨
