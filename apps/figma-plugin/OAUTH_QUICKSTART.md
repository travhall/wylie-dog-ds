# OAuth Quick Start Guide

🎉 **OAuth is 100% complete and ready to use!**

## What You Need to Do (5 Minutes)

### Step 1: Create a GitHub OAuth App (2 minutes)

1. Go to **[GitHub Developer Settings](https://github.com/settings/developers)**
2. Click **"New OAuth App"**
3. Fill in the form:

   ```markdown
   Application name: Wylie Dog Design Tokens
   Homepage URL: https://github.com/YOUR_USERNAME/wylie-dog-ds
   Authorization callback URL: http://127.0.0.1
   Description: Design token sync for Figma (optional)
   ```

4. Click **"Register application"**
5. On the settings page, check **"Enable Device Flow"**
6. Click **"Update application"**
7. **Copy your Client ID** (starts with `Iv1.`)

### Step 2: Configure the Plugin (1 minute)

**Option A: Quick Test** (Environment Variable)

```bash
export GITHUB_CLIENT_ID="Iv1.your_client_id_here"
cd apps/figma-plugin
pnpm build
```

**Option B: Permanent** (Hardcode for Distribution)

Edit this file: `apps/figma-plugin/src/plugin/oauth/oauth-config.ts`

```typescript
export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || "Iv1.your_actual_client_id_here"; // <-- Paste your Client ID here
```

Then build:

```bash
cd apps/figma-plugin
pnpm build
```

### Step 3: Test in Figma (2 minutes)

1. Open Figma Desktop App
2. **Plugins** → **Development** → **Import plugin from manifest**
3. Select `apps/figma-plugin/manifest.json`
4. Open the plugin
5. Click **"Connect with GitHub"**
6. You'll see a code like `ABCD-1234`
7. Click **"Open GitHub"** button
8. Enter the code and click **"Authorize"**
9. Return to Figma - you're connected! 🎉

## What Just Happened?

You implemented **GitHub Device Flow OAuth** - a serverless, zero-cost authentication method perfect for open-source projects!

**No backend server needed!** ✨

The plugin:

1. Generates a unique code
2. Shows it to the user
3. User authorizes on GitHub
4. Plugin polls GitHub for approval
5. Stores token securely in Figma

## Is the Client ID a Secret?

**NO!** The Client ID is designed to be public. From GitHub's docs:

> "Client IDs are not secret. They can be embedded in mobile apps and single-page applications."

So it's **100% safe to commit** your Client ID to the repo!

## Need Help?

See the full documentation:

- **[docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md)** - Complete setup guide with troubleshooting
- **[docs/OAUTH_IMPLEMENTATION_SUMMARY.md](docs/OAUTH_IMPLEMENTATION_SUMMARY.md)** - Technical details

## What's Different About Device Flow?

**Traditional OAuth (what other plugins use):**

- ❌ Requires a backend server ($$$)
- ❌ Need to deploy and maintain infrastructure
- ❌ Complex setup with secrets and callbacks

**Device Flow (what you just got):**

- ✅ Zero server costs (completely free!)
- ✅ No infrastructure to maintain
- ✅ Simple setup (just a Client ID)
- ✅ Perfect for open-source projects

## Ready to Publish?

Once you've tested and it works:

1. **Build:** `pnpm build`
2. **Publish:** Submit to Figma Community
3. **Share:** Users can authenticate immediately - no setup required on their end!

---

**That's it!** You now have a fully functional, zero-cost OAuth system. 🚀
