# Source-Control Provider Architecture (design)

**Status:** Design / not yet implemented. Captures the seam for adding GitLab,
Bitbucket, etc. alongside the current GitHub integration while keeping **both**
PAT and OAuth auth. Deliberately not built yet (YAGNI) — extract the interface
when the second provider becomes real; this doc makes that a small, safe step.

## Current coupling (as of 2026-07-02)

GitHub is reasonably contained, which is why this is cheap to generalize later:

- `plugin/github/client.ts` (~827 LOC) — the only real API surface; the sole
  `@octokit/rest` consumer. Clean operation set already:
  `configure` / `validateConfiguration` / `validateRepository` / `listFiles` /
  `fetchFile` / `pushFiles` / `pullTokens` / `syncTokens`.
- `plugin/github/project-detector.ts` — repo auto-detection.
- `plugin/oauth/*` — GitHub **device-flow** OAuth (GitHub client id, `oauth-server`).
- `shared/types` → `GitHubConfig` (`owner`/`repo`/`branch`/`tokenPath`/
  `authMethod: "oauth" | "pat"`/`accessToken`).
- Message types are `github-*` (`github-sync-tokens`, `github-pull-tokens`, …).

Only ~6 hardcoded `github.com` URLs. The token **format adapters**
(`variables/adapters/*` with a registry) are the pattern to mirror here.

## Target architecture

### 1. `SourceControlProvider` interface

Extract the client's operation set into an interface; `GitHubClient implements`
it unchanged. New providers implement the same contract.

```ts
export interface SourceControlProvider {
  readonly id: "github" | "gitlab" | "bitbucket";
  configure(config: RepoConfig, auth: AuthCredential): void;
  validateConfiguration(): Promise<boolean>;
  validateRepository(): Promise<{ valid: boolean; error?: string }>;
  listFiles(): Promise<string[]>;
  fetchFile(path: string): Promise<string>;
  pushFiles(files: FileChange[], message: string): Promise<PushResult>;
  pullTokens(): Promise<PullResult>;
  syncTokens(files: FileChange[], opts: SyncOptions): Promise<SyncResult>;
}
```

### 2. Generalize the config

`GitHubConfig` → `RepoConfig` with a discriminator; keep a GitHub alias for
back-compat during migration.

```ts
interface RepoConfig {
  provider: "github" | "gitlab" | "bitbucket";
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
  tokenFiles?: string;
  authMethod: "oauth" | "pat";
  syncMode: SyncMode;
}
```

### 3. Auth stays per-provider (keep PAT **and** OAuth)

Auth is NOT consolidated — each provider ships both:

```ts
interface AuthStrategy {
  readonly provider: string;
  readonly methods: ("pat" | "oauth")[];
  initiateOAuth(): Promise<AuthCredential>; // device/PKCE flow per provider
  fromToken(token: string): AuthCredential; // PAT
}
```

OAuth details differ per host (GitHub device flow ≠ GitLab). The existing
`oauth/` module becomes `GitHubAuthStrategy`. The `oauth-server` stays and gains
per-provider routes as needed.

### 4. Registry + factory

Mirror the token-adapter registry: `getProvider(config.provider)` returns the
right `SourceControlProvider`; handlers and UI talk to the interface, not
`GitHubClient`. Message types generalize `github-*` → `scm-*` (with back-compat).

## Migration path (incremental, non-breaking)

1. **Seam:** define `SourceControlProvider`; `GitHubClient implements` it. No
   behavior change. _(do this when provider #2 is committed to)_
2. **Config:** introduce `RepoConfig` (alias `GitHubConfig`); add `provider`
   defaulting to `"github"`.
3. **Registry:** route handlers through `getProvider()`; keep `github-*` message
   types as aliases.
4. **Auth:** wrap `oauth/` as `GitHubAuthStrategy` behind `AuthStrategy`.
5. **Provider #2:** implement `GitLabClient` + `GitLabAuthStrategy`; add the UI
   provider selector.

## Recommendation

Do **not** build the framework now. Steps 1–2 are cheap and safe but still
speculative with a single provider. Implement 1–4 as the first slice of the work
that adds provider #2, using this doc as the blueprint. Related: OAuth UI is
currently orphaned (see onboarding cleanup) — re-mounting it (`QuickGitHubSetup`
does PAT+OAuth) is a prerequisite for exercising the OAuth path at all.
