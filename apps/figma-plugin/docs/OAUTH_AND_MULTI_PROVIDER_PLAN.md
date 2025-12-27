# OAuth & Multi-Provider Sync Implementation Plan

**Created:** 2025-12-27
**Status:** Ready for Implementation
**Priority:** Medium (v3.0 Enhancement)

---

## Executive Summary

This document outlines the plan to enhance Token Bridge with **OAuth authentication** and **multi-provider sync support** (GitHub, GitLab, Bitbucket). Currently, the plugin uses Personal Access Tokens (PAT) for GitHub sync, which works but has limitations around user experience and security.

**Current State:**

- ✅ GitHub sync works with Personal Access Tokens
- ✅ Full push/pull functionality
- ❌ Users must manually create and paste tokens
- ❌ No automatic token refresh
- ❌ Only GitHub supported

**Target State:**

- ✅ One-click OAuth authentication
- ✅ Automatic token refresh
- ✅ Support for GitHub, GitLab, and Bitbucket
- ✅ Provider-agnostic sync architecture
- ✅ Enhanced security with PKCE

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Prerequisites](#prerequisites)
3. [Technical Constraints](#technical-constraints)
4. [Architecture Overview](#architecture-overview)
5. [Implementation Phases](#implementation-phases)
6. [Provider Specifications](#provider-specifications)
7. [Backend Infrastructure](#backend-infrastructure)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Success Metrics](#success-metrics)
12. [Appendix: Code Examples](#appendix-code-examples)

---

## Problem Statement

### Current User Experience Issues

**PAT Authentication Problems:**

1. Users must navigate to GitHub settings
2. Create a new Personal Access Token
3. Select correct permissions (not obvious which)
4. Copy/paste token into plugin
5. Token never expires (security risk)
6. Token gives access to ALL repositories (over-permissioned)

**Single Provider Limitation:**

- Teams using GitLab or Bitbucket cannot use sync features
- 40-50% of enterprise teams use GitLab
- Bitbucket popular in Atlassian ecosystems

### Business Impact

- **Reduced adoption**: Complex setup deters non-technical users
- **Security concerns**: Long-lived PATs are organizational risk
- **Market limitation**: Missing 40-50% of potential enterprise users
- **Support burden**: 60% of support requests are authentication-related

---

## Prerequisites

Before beginning implementation, ensure the following accounts and credentials are ready:

### Required OAuth Applications

**1. GitHub OAuth App:**

- Register at: https://github.com/settings/developers
- Callback URL: `https://oauth.token-bridge.app/api/auth/github/callback`
- Scopes needed: `repo`, `user:email`
- Save Client ID and Client Secret

**2. GitLab OAuth Application:**

- Register at: https://gitlab.com/-/profile/applications
- Callback URL: `https://oauth.token-bridge.app/api/auth/gitlab/callback`
- Scopes needed: `api`, `read_user`
- Save Application ID and Secret

**3. Bitbucket OAuth Consumer:**

- Register at: https://bitbucket.org/account/settings/oauth-consumers/new
- Callback URL: `https://oauth.token-bridge.app/api/auth/bitbucket/callback`
- Permissions needed: `repository`, `repository:write`
- Save Key and Secret

### Required Infrastructure

**4. Vercel Account:**

- Sign up at: https://vercel.com
- Install Vercel CLI: `pnpm add -g vercel`
- Provision Vercel KV for session storage

**5. Domain Configuration:**

- Subdomain: `oauth.token-bridge.app`
- DNS access to create CNAME record pointing to Vercel

---

## Technical Constraints

### Figma Plugin Sandbox Limitations

Figma plugins run in a **severely restricted environment** that makes standard OAuth impossible:

```
❌ No browser redirect support (plugin runs in Electron/minimal browser)
❌ No window.opener (browser opens separately, no communication channel)
❌ No localStorage (Figma provides figma.clientStorage instead)
❌ No IndexedDB
❌ Null origin (limits CORS and API access)
❌ No client secrets (all code is inspectable)
❌ Split execution context (main thread vs UI thread)
❌ Limited crypto APIs (must use Web Crypto API, not Node crypto)
```

**Implication:** Standard OAuth flows (redirect-based) **will not work**. We need a custom architecture.

### Available APIs in Figma Environment

**✅ Available:**

- `crypto.subtle` (Web Crypto API for SHA-256, random values)
- `crypto.randomUUID()` (for session IDs)
- `TextEncoder` / `TextDecoder`
- `fetch()` (with CORS limitations)
- `window.open()` (opens external browser)
- `figma.clientStorage` (encrypted key-value storage)
- `btoa()` / `atob()` (Base64 encoding)

**❌ Not Available:**

- `crypto.randomBytes()` (Node.js only)
- `crypto.createHash()` (Node.js only)
- Direct access to `localStorage`
- Cookie manipulation

### Required Architecture Pattern

```
┌─────────────────┐
│  Figma Plugin   │
│   (UI Thread)   │
└────────┬────────┘
         │ 1. Initiate OAuth
         │ window.open()
         ▼
┌─────────────────┐
│  User's Browser │ ◄──┐
│  (Separate)     │    │ 2. Redirect to provider
└────────┬────────┘    │    (GitHub/GitLab/etc)
         │             │
         │ 3. Approve  │
         ▼             │
┌─────────────────────┐│
│  OAuth Server       ││
│  (Vercel/Netlify)   ││
│  - Callback Handler │┘
│  - Token Exchange   │
│  - Temp Storage     │
└────────┬────────────┘
         │ 4. Store tokens
         │    (Vercel KV, 10min TTL)
         ▼
┌─────────────────┐
│  Figma Plugin   │
│  Polls for      │ ◄─── 5. Poll every 3s
│  completion     │      until tokens available
└─────────────────┘
```

**Key Points:**

- OAuth happens in user's browser (outside plugin)
- Server handles callback and token exchange
- Plugin polls server to retrieve tokens
- Tokens stored temporarily (10-minute TTL)
- PKCE prevents token interception

---

## Architecture Overview

### Component Diagram

```
apps/figma-plugin/
├── src/
│   ├── plugin/
│   │   ├── providers/
│   │   │   ├── base.ts              # GitProvider interface
│   │   │   ├── factory.ts           # ProviderFactory
│   │   │   ├── github.ts            # GitHubProvider
│   │   │   ├── gitlab.ts            # GitLabProvider
│   │   │   ├── bitbucket.ts         # BitbucketProvider
│   │   │   └── rate-limiter.ts      # Rate limiting
│   │   ├── oauth/
│   │   │   ├── handler.ts           # FigmaOAuthHandler
│   │   │   ├── pkce.ts              # PKCE helpers (Web Crypto)
│   │   │   └── token-storage.ts     # figma.clientStorage wrapper
│   │   └── sync/
│   │       └── unified-client.ts    # Replaces GitHubClient
│   └── ui/
│       └── components/
│           ├── ProviderSelector.tsx # Choose GitHub/GitLab/Bitbucket
│           └── OAuthSetup.tsx       # OAuth flow UI
│
oauth-server/                        # New Vercel project
├── api/
│   ├── auth/
│   │   ├── [provider]/
│   │   │   ├── authorize.ts         # Initiate OAuth
│   │   │   └── callback.ts          # Handle callback
│   │   └── status/
│   │       └── [sessionId].ts       # Poll endpoint
│   └── refresh/
│       └── [provider].ts            # Token refresh
├── lib/
│   ├── providers.ts                 # Provider configs
│   ├── pkce.ts                      # PKCE validation (Node crypto)
│   └── storage.ts                   # Vercel KV wrapper
└── vercel.json                      # Deployment config
```

### Data Flow

**1. OAuth Initiation:**

```typescript
// User clicks "Connect GitHub"
const handler = new FigmaOAuthHandler();
await handler.initiateOAuth("github");

// Generates using Web Crypto API:
// - sessionId: crypto.randomUUID()
// - codeVerifier: random string via crypto.getRandomValues()
// - codeChallenge: SHA256(codeVerifier) via crypto.subtle.digest()
// - state: CSRF protection token

// Opens browser:
// https://oauth.token-bridge.app/auth/github/authorize?
//   session=abc123&
//   redirect_uri=https://oauth.token-bridge.app/auth/github/callback
```

**2. Provider Authorization:**

```
User's Browser → GitHub OAuth
                 ↓
             Approves
                 ↓
Redirects to: https://oauth.token-bridge.app/auth/github/callback?
                code=xyz&
                state=abc123
```

**3. Token Exchange (Server-Side):**

```typescript
// oauth-server/api/auth/github/callback.ts
const tokens = await fetch("https://github.com/login/oauth/access_token", {
  method: "POST",
  body: JSON.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
    code_verifier: session.codeVerifier, // PKCE
  }),
});

// Store in Vercel KV with 10-minute TTL
await kv.set(`tokens:${sessionId}`, tokens, { ex: 600 });

// Show success page to user
return res.redirect("/auth/success");
```

**4. Plugin Token Retrieval:**

```typescript
// Plugin polls every 3 seconds
for (let i = 0; i < 60; i++) {
  await sleep(3000);

  const response = await fetch(
    `https://oauth.token-bridge.app/auth/status/${sessionId}`
  );

  if (response.ok) {
    const { accessToken, refreshToken } = await response.json();

    // Store in Figma client storage (encrypted by Figma)
    await figma.clientStorage.setAsync("oauth_access_token", accessToken);
    await figma.clientStorage.setAsync("oauth_refresh_token", refreshToken);

    return { success: true };
  }
}

throw new Error("OAuth timeout");
```

---

## Implementation Phases

### Phase 1: Backend Infrastructure

**Goal:** Deploy OAuth server with GitHub support

**Tasks:**

1. **Setup Vercel Project**
   - Create `oauth-server` directory at repository root
   - Initialize with `pnpm create vercel`
   - Configure environment variables (GitHub OAuth credentials)
   - Setup Vercel KV for session storage

2. **Implement GitHub OAuth Endpoints**

   ```
   ✓ /api/auth/github/authorize - Initiate OAuth flow
   ✓ /api/auth/github/callback - Handle GitHub callback
   ✓ /api/auth/status/[sessionId] - Poll for completion
   ✓ /api/refresh/github - Refresh tokens (GitHub Apps only)
   ```

3. **PKCE Implementation**
   - Code verifier generation (Node crypto.randomBytes)
   - Code challenge creation (SHA256 via crypto.createHash)
   - Server-side validation
   - Test suite

4. **Session Management**
   - Vercel KV integration
   - 10-minute TTL enforcement
   - Cleanup of expired sessions
   - Security audit

5. **Testing & Deployment**
   - Unit tests for OAuth flow
   - Integration tests with GitHub
   - Deploy to Vercel production
   - DNS configuration (oauth.token-bridge.app)

**Deliverables:**

- ✅ OAuth server live at `https://oauth.token-bridge.app`
- ✅ GitHub OAuth working end-to-end
- ✅ PKCE security implemented
- ✅ 95%+ test coverage

---

### Phase 2: Plugin OAuth Integration

**Goal:** Replace PAT setup with OAuth in plugin

**Tasks:**

1. **OAuth Handler Service**
   - Create `FigmaOAuthHandler` class
   - Implement PKCE client-side using Web Crypto API
   - Polling mechanism with timeout
   - Error handling and retry logic

2. **Token Storage**
   - Wrapper for `figma.clientStorage`
   - Token refresh logic
   - Expiration tracking

3. **UI Components**
   - `OAuthSetup.tsx` - OAuth flow interface
   - `ProviderSelector.tsx` - Choose GitHub/GitLab/etc
   - Loading states during OAuth
   - Error display and retry

4. **Integration with Existing Sync**
   - Update `GitHubClient` to use OAuth tokens
   - Fallback to PAT for backward compatibility
   - Migration path for existing users
   - Update QuickGitHubSetup component

5. **Testing**
   - OAuth flow end-to-end
   - Token refresh scenarios
   - Error handling (timeout, denied, etc.)
   - User acceptance testing

**Deliverables:**

- ✅ One-click OAuth working in plugin
- ✅ Automatic token refresh
- ✅ Backward compatible with PAT
- ✅ Improved user experience

---

### Phase 3: Provider Abstraction

**Goal:** Create unified architecture for multiple providers

**Tasks:**

1. **GitProvider Interface**

   ```typescript
   interface GitProvider {
     initialize(config: ProviderConfig): Promise<void>;
     validateAuth(): Promise<boolean>;
     refreshToken(): Promise<string>;
     getFile(...): Promise<FileContent>;
     createOrUpdateFile(...): Promise<FileCommit>;
     createBranch(...): Promise<Branch>;
     createPullRequest(...): Promise<PullRequest>;
   }
   ```

2. **GitHub Adapter**
   - Migrate existing `GitHubClient` to `GitHubProvider`
   - Implement `GitProvider` interface
   - Maintain backward compatibility
   - Add GitHub App support (optional)

3. **GitLab Adapter**
   - Implement `GitLabProvider`
   - Handle 2-hour token expiration
   - API endpoint mapping
   - Rate limiting (600/hour)

4. **Bitbucket Adapter**
   - Implement `BitbucketProvider`
   - Handle multipart file uploads
   - API differences (commit-based updates)
   - Rate limiting (1000/hour)

5. **Provider Factory**
   - `ProviderFactory.create(config)`
   - Dynamic provider instantiation
   - Configuration validation
   - Error handling

6. **Rate Limiting**
   - Per-provider rate limiters
   - Automatic backoff
   - Queue management
   - Progress feedback to user

**Deliverables:**

- ✅ Common interface for all providers
- ✅ GitHub, GitLab, Bitbucket supported
- ✅ Provider-agnostic sync code
- ✅ Automatic rate limiting

---

### Phase 4: Multi-Provider OAuth

**Goal:** Add OAuth for GitLab and Bitbucket

**Tasks:**

1. **GitLab OAuth Backend**
   - `/api/auth/gitlab/authorize`
   - `/api/auth/gitlab/callback`
   - Token refresh endpoint
   - PKCE validation (mandatory for GitLab)

2. **Bitbucket OAuth Backend**
   - `/api/auth/bitbucket/authorize`
   - `/api/auth/bitbucket/callback`
   - Token refresh endpoint
   - Handle 2-hour token expiration

3. **UI Updates**
   - Provider selection screen
   - Provider-specific setup instructions
   - Multi-account support (future)
   - Settings management

4. **Unified Sync Client**
   - Replace `ConflictAwareGitHubClient` with `UnifiedGitClient`
   - Works with any provider
   - Provider switching
   - Conflict resolution (provider-agnostic)

5. **Testing & Polish**
   - Test all three providers
   - Cross-provider compatibility
   - Migration testing
   - Performance optimization

**Deliverables:**

- ✅ Full OAuth for GitHub, GitLab, Bitbucket
- ✅ Provider selection UI
- ✅ Unified sync architecture
- ✅ Production-ready

---

## Provider Specifications

### GitHub

**OAuth Flow:** Authorization Code (with optional PKCE)
**Token Lifetime:** No expiration (OAuth Apps) | 1 hour (GitHub Apps)
**Rate Limit:** 5,000 requests/hour (authenticated)

**Endpoints:**

```
Authorize:  https://github.com/login/oauth/authorize
Token:      https://github.com/login/oauth/access_token
API Base:   https://api.github.com
```

**Scopes Required:**

- `repo` - Full repository access (read/write)
- `user:email` - Read user email

**File Operations:**

```typescript
// Get file
GET /repos/{owner}/{repo}/contents/{path}?ref={branch}

// Create/Update file (content must be base64)
PUT /repos/{owner}/{repo}/contents/{path}
{
  message: string,
  content: string (base64),
  branch: string,
  sha?: string (for updates)
}

// Create PR
POST /repos/{owner}/{repo}/pulls
{
  title: string,
  body: string,
  head: string (branch),
  base: string (target branch)
}
```

**Notes:**

- OAuth Apps: Tokens never expire, no refresh needed
- GitHub Apps: Tokens expire in 1 hour, must refresh
- Recommend GitHub Apps for production
- Use `btoa()` for base64 encoding in plugin

---

### GitLab

**OAuth Flow:** Authorization Code + PKCE (required)
**Token Lifetime:** 2 hours
**Rate Limit:** 600 requests/hour (default, configurable)

**Endpoints:**

```
Authorize:  https://gitlab.com/oauth/authorize
Token:      https://gitlab.com/oauth/token
API Base:   https://gitlab.com/api/v4
```

**Scopes Required:**

- `api` - Full API access
- `read_user` - Read user profile

**File Operations:**

```typescript
// Get file
GET /projects/{id}/repository/files/{path}?ref={branch}
// Response includes: content (base64), encoding, blob_id

// Create file
POST /projects/{id}/repository/files/{path}
{
  branch: string,
  content: string (base64),
  commit_message: string,
  encoding: 'base64'
}

// Update file
PUT /projects/{id}/repository/files/{path}
{
  branch: string,
  content: string (base64),
  commit_message: string,
  encoding: 'base64'
}

// Create Merge Request (PR)
POST /projects/{id}/merge_requests
{
  source_branch: string,
  target_branch: string,
  title: string,
  description: string
}
```

**Notes:**

- **PKCE is mandatory** (not optional like GitHub)
- Project ID can be numeric or `namespace/project` encoded
- Tokens expire in 2 hours, refresh required
- Rate limits are per-user, per-project
- Use `btoa()` for base64 encoding

---

### Bitbucket

**OAuth Flow:** Authorization Code
**Token Lifetime:** 2 hours
**Rate Limit:** 1,000 requests/hour (repository data)

**Endpoints:**

```
Authorize:  https://bitbucket.org/site/oauth2/authorize
Token:      https://bitbucket.org/site/oauth2/access_token
API Base:   https://api.bitbucket.org/2.0
```

**Scopes Required:**

- `repository` - Read repositories
- `repository:write` - Write to repositories

**File Operations:**

```typescript
// Get file (different pattern!)
GET /repositories/{workspace}/{repo}/src/{branch}/{path}
// Returns raw file content, not JSON

// Create/Update file (uses commits API)
POST /repositories/{workspace}/{repo}/src
Content-Type: multipart/form-data
{
  message: string,
  branch: string,
  [path]: File (actual file content)
}

// Create Pull Request
POST /repositories/{workspace}/{repo}/pullrequests
{
  title: string,
  description: string,
  source: { branch: { name: string } },
  destination: { branch: { name: string } }
}
```

**Notes:**

- API structure significantly different from GitHub/GitLab
- File operations use multipart/form-data (not JSON)
- Refresh tokens don't expire (unlike access tokens)
- Workspace = organization/user account

---

## Backend Infrastructure

### Technology Stack

**Platform:** Vercel Serverless Functions
**Runtime:** Node.js 18+
**Storage:** Vercel KV (Redis-compatible)
**Language:** TypeScript

**Why Vercel?**

- ✅ Zero config deployment
- ✅ Automatic HTTPS
- ✅ Edge functions for low latency
- ✅ Built-in KV storage
- ✅ Generous free tier (100GB-hours)
- ✅ Git-based deployments

**Alternatives Considered:**

- Netlify Functions: Similar capabilities, slightly slower cold starts
- AWS Lambda: More complex setup, higher cold start latency
- Self-hosted: Requires server management, SSL certificates

### Directory Structure

```
oauth-server/
├── api/
│   ├── auth/
│   │   ├── github/
│   │   │   ├── authorize.ts      # Start OAuth flow
│   │   │   └── callback.ts       # Handle GitHub redirect
│   │   ├── gitlab/
│   │   │   ├── authorize.ts
│   │   │   └── callback.ts
│   │   ├── bitbucket/
│   │   │   ├── authorize.ts
│   │   │   └── callback.ts
│   │   └── status/
│   │       └── [sessionId].ts    # Poll for completion
│   └── refresh/
│       ├── github.ts             # Refresh GitHub tokens
│       ├── gitlab.ts             # Refresh GitLab tokens
│       └── bitbucket.ts          # Refresh Bitbucket tokens
├── lib/
│   ├── providers.ts              # Provider configurations
│   ├── pkce.ts                   # PKCE helpers (Node crypto)
│   ├── storage.ts                # Vercel KV wrapper
│   └── errors.ts                 # Error types
├── public/
│   ├── auth/
│   │   ├── success.html          # OAuth success page
│   │   └── error.html            # OAuth error page
│   └── index.html                # Landing page
├── package.json
├── tsconfig.json
└── vercel.json                   # Deployment config
```

### Environment Variables

```bash
# GitHub OAuth App
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/github/callback

# GitLab OAuth App
GITLAB_CLIENT_ID=your_client_id
GITLAB_CLIENT_SECRET=your_client_secret
GITLAB_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/gitlab/callback

# Bitbucket OAuth Consumer
BITBUCKET_CLIENT_ID=your_client_id
BITBUCKET_CLIENT_SECRET=your_client_secret
BITBUCKET_REDIRECT_URI=https://oauth.token-bridge.app/api/auth/bitbucket/callback

# Vercel KV (auto-provisioned)
KV_REST_API_URL=https://your-kv-instance.vercel.app
KV_REST_API_TOKEN=your_token

# Security
SESSION_SECRET=random_32_byte_string
ALLOWED_ORIGINS=https://www.figma.com
```

### Deployment Configuration

**vercel.json:**

```json
{
  "version": 2,
  "env": {
    "GITHUB_CLIENT_ID": "@github-client-id",
    "GITHUB_CLIENT_SECRET": "@github-client-secret",
    "GITLAB_CLIENT_ID": "@gitlab-client-id",
    "GITLAB_CLIENT_SECRET": "@gitlab-client-secret",
    "BITBUCKET_CLIENT_ID": "@bitbucket-client-id",
    "BITBUCKET_CLIENT_SECRET": "@bitbucket-client-secret"
  },
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### Storage Schema

**Vercel KV Keys:**

```typescript
// OAuth sessions (TTL: 10 minutes)
`session:${sessionId}` → {
  provider: 'github' | 'gitlab' | 'bitbucket',
  codeVerifier: string,
  state: string,
  createdAt: number,
  expiresAt: number
}

// Tokens (TTL: 10 minutes, one-time retrieval)
`tokens:${sessionId}` → {
  accessToken: string,
  refreshToken?: string,
  expiresAt?: number,
  scope: string,
  tokenType: 'Bearer'
}

// Rate limiting (TTL: 1 hour)
`ratelimit:${userId}:${provider}` → {
  requests: number[],  // timestamps
  resetAt: number
}
```

---

## Security Considerations

### PKCE (Proof Key for Code Exchange)

**Why PKCE?**

- Prevents authorization code interception
- Essential when client secret cannot be kept confidential
- Figma plugins have no secure storage for secrets

**Implementation (Client-Side - Web Crypto API):**

```typescript
// apps/figma-plugin/src/plugin/oauth/pkce.ts

class PKCEHelper {
  /**
   * Generate code verifier using Web Crypto API
   */
  static generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Generate code challenge using Web Crypto API
   */
  static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  /**
   * Base64-URL encode (no padding)
   */
  private static base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

// Usage
const verifier = PKCEHelper.generateCodeVerifier();
const challenge = await PKCEHelper.generateCodeChallenge(verifier);

// Store verifier in Figma client storage (needed for validation)
await figma.clientStorage.setAsync("pkce_verifier", verifier);

// Send challenge to OAuth provider
const authUrl =
  `https://github.com/login/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `code_challenge=${challenge}&` +
  `code_challenge_method=S256`;
```

**Implementation (Server-Side - Node Crypto):**

```typescript
// oauth-server/lib/pkce.ts
import crypto from "crypto";

export function validatePKCE(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  // Recreate challenge from verifier
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const computedChallenge = hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return computedChallenge === codeChallenge;
}
```

### State Parameter (CSRF Protection)

**Purpose:** Prevent Cross-Site Request Forgery attacks

```typescript
// Generate state using Web Crypto API (client-side)
const state = crypto.randomUUID();

// Server-side: Store in session
await kv.set(
  `session:${state}`,
  {
    provider: "github",
    codeVerifier: verifier,
    createdAt: Date.now(),
  },
  { ex: 600 }
); // 10-minute expiration

// Include in OAuth URL
const authUrl = `...&state=${state}`;

// Validate on callback
const session = await kv.get(`session:${state}`);
if (!session) {
  throw new Error("Invalid state - potential CSRF attack");
}
```

### Token Storage

**Use Figma's Encrypted Client Storage:**

```typescript
// ✅ GOOD: Use Figma's encrypted client storage
await figma.clientStorage.setAsync("oauth_access_token", accessToken);
await figma.clientStorage.setAsync("oauth_refresh_token", refreshToken);

// ❌ BAD: Don't hardcode tokens in code
// const TOKEN = 'ghp_...'; // EXPOSED IN CODE
```

**Note:** Figma's `clientStorage` automatically encrypts data at rest. No additional encryption layer is needed in the plugin.

### HTTPS Only

- ✅ All OAuth endpoints must use HTTPS
- ✅ Vercel provides HTTPS automatically
- ✅ Redirect HTTP → HTTPS in production
- ❌ Never transmit tokens over HTTP

### CORS Configuration

```typescript
// Figma plugins have null origin
// Must allow * for API calls to work
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

// For sensitive endpoints, validate Referer header
const referer = req.headers.referer;
if (referer && !referer.startsWith("https://www.figma.com")) {
  return res.status(403).json({ error: "Forbidden" });
}
```

### Rate Limiting

**Prevent Abuse:**

```typescript
import { kv } from "@vercel/kv";

async function rateLimit(
  userId: string,
  limit: number = 100
): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const requests = (await kv.get<number>(key)) || 0;

  if (requests >= limit) {
    return false; // Rate limit exceeded
  }

  await kv.incr(key);
  await kv.expire(key, 3600); // Reset in 1 hour

  return true;
}
```

### Security Audit Checklist

- [ ] PKCE implemented for all OAuth flows
- [ ] State parameter validated on all callbacks
- [ ] Tokens stored in Figma client storage (encrypted by Figma)
- [ ] All endpoints use HTTPS
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Session TTL enforced (10 minutes)
- [ ] Tokens cleared after retrieval (one-time use)
- [ ] Client secrets stored in environment variables
- [ ] No secrets in client-side code
- [ ] Error messages don't leak sensitive data
- [ ] Logging doesn't include tokens

---

## Testing Strategy

### Unit Tests

**OAuth Server:**

```typescript
// tests/pkce.test.ts
describe("PKCE", () => {
  it("generates valid code verifier", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });

  it("validates PKCE correctly", () => {
    const verifier = "test_verifier";
    const challenge = generateChallenge(verifier);
    expect(validatePKCE(verifier, challenge)).toBe(true);
    expect(validatePKCE("wrong", challenge)).toBe(false);
  });
});

// tests/session.test.ts
describe("Session Management", () => {
  it("stores session with TTL", async () => {
    const sessionId = "test-session-123";
    await storeSession(sessionId, { provider: "github" });

    const session = await getSession(sessionId);
    expect(session).toBeDefined();
    expect(session.provider).toBe("github");
  });

  it("expires sessions after TTL", async () => {
    const sessionId = "test-session-456";
    await storeSession(sessionId, { provider: "github" }, 1); // 1 second TTL

    await sleep(2000);
    const session = await getSession(sessionId);
    expect(session).toBeNull();
  });
});
```

**Plugin Integration:**

```typescript
// tests/oauth-handler.test.ts
describe("FigmaOAuthHandler", () => {
  it("initiates OAuth flow", async () => {
    const handler = new FigmaOAuthHandler();
    const promise = handler.initiateOAuth("github");

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("oauth.token-bridge.app"),
      "_blank"
    );
  });

  it("polls for token completion", async () => {
    const handler = new FigmaOAuthHandler();

    // Mock successful token retrieval
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false }) // First poll: pending
      .mockResolvedValueOnce({ ok: false }) // Second poll: pending
      .mockResolvedValueOnce({
        // Third poll: success
        ok: true,
        json: async () => ({
          status: "completed",
          accessToken: "test_token",
        }),
      });

    const result = await handler.pollForCompletion("session-123");
    expect(result.accessToken).toBe("test_token");
  });

  it("times out after max attempts", async () => {
    const handler = new FigmaOAuthHandler();

    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(handler.pollForCompletion("session-456")).rejects.toThrow(
      "OAuth timeout"
    );
  });
});
```

### Integration Tests

**End-to-End OAuth Flow:**

```typescript
describe("GitHub OAuth E2E", () => {
  it("completes full OAuth flow", async () => {
    // 1. Start OAuth
    const { sessionId, authUrl } = await startOAuth("github");

    // 2. Simulate user authorization
    const code = await simulateUserAuth(authUrl);

    // 3. Server handles callback
    const tokens = await handleCallback("github", code, sessionId);
    expect(tokens.accessToken).toBeDefined();

    // 4. Plugin retrieves tokens
    const status = await checkStatus(sessionId);
    expect(status.status).toBe("completed");
    expect(status.accessToken).toBe(tokens.accessToken);
  });
});
```

### Provider-Specific Tests

**Test Against Real APIs:**

```typescript
describe("GitHub Provider", () => {
  it("gets file from repository", async () => {
    const provider = new GitHubProvider();
    await provider.initialize({
      provider: "github",
      accessToken: process.env.TEST_GITHUB_TOKEN!,
    });

    const file = await provider.getFile("octocat", "Hello-World", "README");

    expect(file.content).toBeDefined();
    expect(file.path).toBe("README");
  });

  it("creates file in repository", async () => {
    const provider = new GitHubProvider();
    await provider.initialize({
      provider: "github",
      accessToken: process.env.TEST_GITHUB_TOKEN!,
    });

    const commit = await provider.createOrUpdateFile(
      "test-user",
      "test-repo",
      "test-file.json",
      '{"test": true}',
      "Test commit",
      "main"
    );

    expect(commit.sha).toBeDefined();
  });
});
```

### Manual Testing Checklist

**OAuth Flow:**

- [ ] Click "Connect GitHub" → Browser opens
- [ ] Authorize on GitHub → Success page shown
- [ ] Plugin shows "Connected" status
- [ ] Token stored in Figma client storage
- [ ] Can sync tokens after OAuth

**Provider Switching:**

- [ ] Can connect to GitHub
- [ ] Can connect to GitLab
- [ ] Can connect to Bitbucket
- [ ] Can switch between providers
- [ ] Tokens don't leak between providers

**Error Handling:**

- [ ] User denies OAuth → Error shown
- [ ] OAuth times out → Timeout error shown
- [ ] Invalid token → Re-auth prompted
- [ ] Network error → Retry option shown

**Token Refresh:**

- [ ] GitLab token expires → Auto-refreshes
- [ ] Bitbucket token expires → Auto-refreshes
- [ ] Refresh failure → Re-auth prompted

---

## Deployment Plan

### Pre-Deployment

**1. Create OAuth Applications:**

See [Prerequisites](#prerequisites) section for detailed OAuth app setup instructions.

**2. Setup Vercel:**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link project
cd oauth-server
vercel link

# Setup environment variables
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel env add GITLAB_CLIENT_ID
vercel env add GITLAB_CLIENT_SECRET
vercel env add BITBUCKET_CLIENT_ID
vercel env add BITBUCKET_CLIENT_SECRET
vercel env add SESSION_SECRET

# Provision Vercel KV
vercel kv create oauth-sessions
```

### Deployment Steps

**1. Deploy OAuth Server:**

```bash
cd oauth-server

# Deploy to preview (staging)
vercel

# Test preview deployment
curl https://oauth-server-preview.vercel.app/api/health

# Deploy to production
vercel --prod

# Verify production
curl https://oauth.token-bridge.app/api/health
```

**2. Update Plugin:**

```bash
cd apps/figma-plugin

# Update OAuth server URL in config
# src/plugin/oauth/config.ts
export const OAUTH_SERVER_URL = 'https://oauth.token-bridge.app';

# Build plugin
pnpm build

# Upload to Figma
# (Manual upload via Figma desktop app)
```

**3. DNS Configuration:**

```
# Add CNAME record
oauth.token-bridge.app → cname.vercel-dns.com

# Verify SSL certificate
curl -I https://oauth.token-bridge.app
```

### Rollback Plan

**If Issues Occur:**

1. **Revert to PAT-only:**

   ```typescript
   // Feature flag to disable OAuth
   const OAUTH_ENABLED = false;

   if (!OAUTH_ENABLED) {
     return <PATSetup />; // Fall back to old flow
   }
   ```

2. **Rollback Vercel Deployment:**

   ```bash
   # List deployments
   vercel list

   # Promote previous deployment
   vercel promote <deployment-url>
   ```

3. **Notify Users:**
   - Show in-plugin message about temporary PAT requirement
   - Update documentation
   - Fix issues
   - Re-deploy when ready

### Monitoring

**Setup Vercel Analytics:**

```bash
vercel analytics enable
```

**Key Metrics to Track:**

- OAuth success rate (target: >95%)
- Average time to complete OAuth (target: <30s)
- Token refresh success rate (target: >99%)
- API error rate by provider (target: <1%)
- Session timeout rate (target: <5%)

---

## Success Metrics

### User Experience Metrics

**Adoption:**

- 60%+ of new users choose OAuth over PAT (Month 1)
- 80%+ of new users choose OAuth over PAT (Month 3)
- 40%+ of existing users migrate to OAuth (Month 6)

**Completion Rate:**

- 95%+ OAuth flows complete successfully
- <5% timeout rate
- <2% user cancellation rate

**Time to Setup:**

- Average time to connect: <30 seconds (vs. 3-5 minutes with PAT)
- 90th percentile: <60 seconds

### Technical Metrics

**Reliability:**

- 99.9%+ uptime for OAuth server
- <1% API error rate per provider
- 99%+ token refresh success rate

**Performance:**

- OAuth server response time: <500ms (p95)
- Token retrieval: <3 seconds (p95)
- Rate limiting: 0% blocked legitimate requests

**Security:**

- 0 token leaks or security incidents
- 100% PKCE compliance
- 100% HTTPS traffic

### Business Metrics

**Multi-Provider Usage:**

- 20%+ of teams use GitLab (Month 3)
- 10%+ of teams use Bitbucket (Month 3)
- 30%+ of enterprise users use non-GitHub providers (Month 6)

**Support Reduction:**

- 50% reduction in auth-related support tickets
- 70% reduction in "how to setup" questions

**User Satisfaction:**

- 85%+ CSAT score for setup process
- <1% churn rate related to auth complexity

---

## Appendix: Code Examples

### A. Complete OAuth Handler (Web Crypto API)

```typescript
// apps/figma-plugin/src/plugin/oauth/handler.ts

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope: string;
  tokenType: "Bearer";
}

export class FigmaOAuthHandler {
  private serverUrl: string;

  constructor(serverUrl: string = "https://oauth.token-bridge.app") {
    this.serverUrl = serverUrl;
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(provider: string): Promise<TokenResponse> {
    // 1. Generate PKCE values using Web Crypto API
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const sessionId = crypto.randomUUID();

    // 2. Store verifier for later
    await figma.clientStorage.setAsync("pkce_verifier", codeVerifier);
    await figma.clientStorage.setAsync("oauth_session_id", sessionId);

    // 3. Build authorization URL
    const authUrl = new URL(`${this.serverUrl}/api/auth/${provider}/authorize`);
    authUrl.searchParams.set("session", sessionId);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // 4. Open browser for user authorization
    window.open(authUrl.toString(), "_blank");

    // 5. Poll for completion
    return this.pollForCompletion(sessionId);
  }

  /**
   * Poll OAuth server for token completion
   */
  private async pollForCompletion(
    sessionId: string,
    maxAttempts: number = 60,
    intervalMs: number = 3000
  ): Promise<TokenResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.sleep(intervalMs);

      try {
        const response = await fetch(
          `${this.serverUrl}/api/auth/status/${sessionId}`
        );

        if (!response.ok) {
          continue; // Still pending
        }

        const data = await response.json();

        if (data.status === "completed") {
          // Store tokens securely
          await this.storeTokens(data);

          // Cleanup session data
          await figma.clientStorage.deleteAsync("pkce_verifier");
          await figma.clientStorage.deleteAsync("oauth_session_id");

          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresAt,
            scope: data.scope,
            tokenType: "Bearer",
          };
        }

        if (data.status === "error") {
          throw new Error(data.error || "OAuth failed");
        }
      } catch (error) {
        console.error("Poll error:", error);
        // Continue polling
      }
    }

    throw new Error("OAuth timeout - please try again");
  }

  /**
   * Store tokens securely in Figma client storage
   */
  private async storeTokens(tokens: TokenResponse): Promise<void> {
    await figma.clientStorage.setAsync(
      "oauth_access_token",
      tokens.accessToken
    );

    if (tokens.refreshToken) {
      await figma.clientStorage.setAsync(
        "oauth_refresh_token",
        tokens.refreshToken
      );
    }

    if (tokens.expiresAt) {
      await figma.clientStorage.setAsync("oauth_expires_at", tokens.expiresAt);
    }

    await figma.clientStorage.setAsync("oauth_scope", tokens.scope);
  }

  /**
   * Generate PKCE code verifier using Web Crypto API
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Generate PKCE code challenge using Web Crypto API
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  /**
   * Base64-URL encode (no padding)
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await figma.clientStorage.getAsync("oauth_access_token");
    return !!token;
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return await figma.clientStorage.getAsync("oauth_access_token");
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded(provider: string): Promise<string> {
    const expiresAt = await figma.clientStorage.getAsync("oauth_expires_at");

    if (!expiresAt || Date.now() < expiresAt - 300000) {
      // 5 min buffer
      return (await this.getAccessToken()) || "";
    }

    // Token expired or expiring soon, refresh it
    const refreshToken = await figma.clientStorage.getAsync(
      "oauth_refresh_token"
    );

    if (!refreshToken) {
      throw new Error("No refresh token available - please re-authenticate");
    }

    const response = await fetch(`${this.serverUrl}/api/refresh/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed - please re-authenticate");
    }

    const tokens = await response.json();
    await this.storeTokens(tokens);

    return tokens.accessToken;
  }

  /**
   * Sign out (clear tokens)
   */
  async signOut(): Promise<void> {
    await figma.clientStorage.deleteAsync("oauth_access_token");
    await figma.clientStorage.deleteAsync("oauth_refresh_token");
    await figma.clientStorage.deleteAsync("oauth_expires_at");
    await figma.clientStorage.deleteAsync("oauth_scope");
  }
}
```

### B. OAuth Server Callback Handler

```typescript
// oauth-server/api/auth/github/callback.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

interface Session {
  provider: string;
  codeVerifier: string;
  state: string;
  createdAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect("/auth/error?message=Missing+code+or+state");
  }

  try {
    // 1. Validate session
    const session = await kv.get<Session>(`session:${state}`);

    if (!session) {
      return res.redirect("/auth/error?message=Invalid+or+expired+session");
    }

    // 2. Exchange code for tokens
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code as string,
          code_verifier: session.codeVerifier, // PKCE
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // 3. Store tokens with TTL (10 minutes, one-time retrieval)
    await kv.set(
      `tokens:${state}`,
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? Date.now() + tokens.expires_in * 1000
          : undefined,
        scope: tokens.scope,
        tokenType: "Bearer",
      },
      { ex: 600 } // 10 minutes
    );

    // 4. Clean up session
    await kv.del(`session:${state}`);

    // 5. Redirect to success page
    return res.redirect("/auth/success");
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return res.redirect(
      `/auth/error?message=${encodeURIComponent(error.message)}`
    );
  }
}
```

### C. Provider Interface Implementation

```typescript
// apps/figma-plugin/src/plugin/providers/base.ts

export interface GitProvider {
  // Core
  initialize(config: ProviderConfig): Promise<void>;
  validateAuth(): Promise<boolean>;
  refreshToken?(): Promise<string>;

  // Repository
  getRepository(owner: string, repo: string): Promise<Repository>;
  listBranches(owner: string, repo: string): Promise<Branch[]>;

  // Files
  getFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<FileContent>;

  createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    sha?: string
  ): Promise<FileCommit>;

  // Branches
  createBranch(
    owner: string,
    repo: string,
    branch: string,
    fromBranch: string
  ): Promise<Branch>;

  // Pull Requests
  createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<PullRequest>;
}

export interface ProviderConfig {
  provider: "github" | "gitlab" | "bitbucket";
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface FileContent {
  path: string;
  content: string;
  sha: string;
  encoding: "base64" | "utf-8";
}

export interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface PullRequest {
  id: number;
  title: string;
  url: string;
  state: "open" | "closed" | "merged";
  head: string;
  base: string;
}

export interface FileCommit {
  sha: string;
  url: string;
}
```

---

## References

**Figma Plugin Development:**

- [OAuth with Plugins | Figma Developer Docs](https://developers.figma.com/docs/plugins/oauth-with-plugins/)
- [How to make next-level Figma plugins | Evil Martians](https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more)

**OAuth Specifications:**

- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitLab OAuth 2.0](https://docs.gitlab.com/api/oauth2/)
- [Bitbucket OAuth 2.0](https://developer.atlassian.com/cloud/bitbucket/oauth-2/)

**Security:**

- [OAuth 2.0 for Native Apps (RFC 8252)](https://datatracker.ietf.org/doc/html/rfc8252)
- [PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
- [Token Best Practices | Auth0](https://auth0.com/docs/secure/tokens/token-best-practices)

**Infrastructure:**

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)

---

## Next Steps

1. **Review Prerequisites** - Ensure all OAuth applications are registered
2. **Setup Vercel Project** and provision KV storage
3. **Begin Phase 1** - Backend Infrastructure
4. **Iterative Development** with testing at each phase

---

_Document Version: 2.0_
_Last Updated: 2025-12-27_
_Changes: Removed timeline estimates, fixed crypto API usage, added prerequisites section_
