# Source-Control Provider Architecture (design)

**Status:** Design / not yet implemented. Captures the seam for adding GitLab,
Bitbucket, etc. alongside the current GitHub integration. Auth is **PAT-only**
— a Figma plugin can't hold a client secret without a hosted backend, which is
disproportionate for this project. Deliberately not built yet (YAGNI) — extract
the interface when the second provider becomes real; this doc makes that a
small, safe step.

## Current coupling (as of 2026-07-03)

GitHub is reasonably contained, which is why this is cheap to generalize later:

- `plugin/github/client.ts` (~827 LOC) — the only real API surface; the sole
  `@octokit/rest` consumer. Clean operation set already:
  `configure` / `validateConfiguration` / `validateRepository` / `listFiles` /
  `fetchFile` / `pushFiles` / `pullTokens` / `syncTokens`.
- `plugin/github/project-detector.ts` — repo auto-detection.
- `shared/types` → `GitHubConfig` (`owner`/`repo`/`branch`/`tokenPath`/
  `authMethod: "pat"`/`accessToken`).
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
  authMethod: "pat";
  syncMode: SyncMode;
}
```

Auth is PAT-only, entered per provider — the user pastes a personal access
token scoped to that provider (e.g. a GitHub PAT for GitHub, a GitLab PAT for
GitLab). A Figma plugin runs client-side and can't hold a client secret, and
standing up a hosted auth backend isn't justified for a solo public plugin.

### 3. Registry + factory

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
4. **Provider #2:** implement `GitLabClient`; add the UI provider selector,
   using the existing PAT-entry pattern from `SetupWizard.tsx`.

## Recommendation

Do **not** build the framework now. Steps 1–2 are cheap and safe but still
speculative with a single provider. Implement 1–3 as the first slice of the work
that adds provider #2, using this doc as the blueprint.
