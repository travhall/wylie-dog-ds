# Token Bridge OAuth Server

OAuth authentication server for the Token Bridge Figma Plugin. Provides secure OAuth flows for GitHub, GitLab, and Bitbucket integrations.

## Features

- ✅ **PKCE Security** - Proof Key for Code Exchange prevents token interception
- ✅ **Multiple Providers** - Supports GitHub, GitLab, and Bitbucket
- ✅ **Session Management** - 10-minute TTL with automatic cleanup
- ✅ **Token Refresh** - Automatic token refresh for providers that require it
- ✅ **Vercel KV** - Fast, reliable Redis-compatible storage

## Architecture

```
Plugin → OAuth Server → GitHub/GitLab/Bitbucket
   ↓          ↓                    ↓
Polling ← Vercel KV ← Callback & Tokens
```

1. Plugin initiates OAuth with PKCE challenge
2. User authorizes in browser
3. Server exchanges code for tokens
4. Tokens stored in Vercel KV (10min TTL)
5. Plugin polls and retrieves tokens

## Setup

### Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **OAuth Applications** registered for each provider:
   - GitHub: https://github.com/settings/developers
   - GitLab: https://gitlab.com/-/profile/applications
   - Bitbucket: https://bitbucket.org/account/settings/oauth-consumers/new

### Environment Variables

Create OAuth applications and configure these environment variables in Vercel:

```bash
# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/github/callback

# GitLab
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/gitlab/callback

# Bitbucket
BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/bitbucket/callback

# Security
SESSION_SECRET=random_32_byte_string
```

### Deployment

```bash
# Install dependencies
pnpm install

# Deploy to preview
pnpm deploy

# Deploy to production
pnpm deploy:prod

# Setup Vercel KV
vercel kv create oauth-sessions
```

### DNS Configuration

Point your subdomain to Vercel:

```
oauth.token-bridge.app → cname.vercel-dns.com
```

## API Endpoints

### GitHub OAuth

- `GET /api/auth/github/authorize` - Initiate OAuth flow
- `GET /api/auth/github/callback` - OAuth callback handler
- `POST /api/refresh/github` - Refresh expired tokens

### GitLab OAuth

- `GET /api/auth/gitlab/authorize` - Initiate OAuth flow
- `GET /api/auth/gitlab/callback` - OAuth callback handler
- `POST /api/refresh/gitlab` - Refresh expired tokens

### Bitbucket OAuth

- `GET /api/auth/bitbucket/authorize` - Initiate OAuth flow
- `GET /api/auth/bitbucket/callback` - OAuth callback handler
- `POST /api/refresh/bitbucket` - Refresh expired tokens

### Status

- `GET /api/auth/status/[sessionId]` - Poll for OAuth completion

## Security

- **PKCE** - All flows use PKCE to prevent token interception
- **State Parameter** - CSRF protection on all callbacks
- **Session TTL** - 10-minute expiration on sessions
- **One-Time Tokens** - Tokens deleted after retrieval
- **HTTPS Only** - All communication encrypted
- **CORS** - Configured for Figma plugin origin

## Development

```bash
# Install Vercel CLI
pnpm add -g vercel

# Run dev server
pnpm dev

# Access at http://localhost:3000
```

## Monitoring

Key metrics to track:

- OAuth success rate (target: >95%)
- Average completion time (target: <30s)
- Session timeout rate (target: <5%)
- Token refresh success (target: >99%)

## License

MIT
