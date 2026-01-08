# GitHub Configuration Scope & Behavior

## How GitHub Config Storage Works

The Token Bridge plugin uses **`figma.clientStorage`** to store GitHub configuration. This has specific scope implications:

### Storage Scope: **Per User, Per Plugin**

```typescript
// From src/plugin/main.ts:410
await figma.clientStorage.getAsync("github-config");
```

**What this means:**

1. **Shared across ALL Figma files** for the same user
2. **NOT shared across different users** (even on the same computer)
3. **Plugin-specific** (other plugins cannot access this data)
4. **Persists across Figma sessions** (survives app restart)

---

## Behavior Scenarios

### ✅ Scenario 1: Multiple Files, Same User

**Question**: Does GitHub config carry through all Figma files?

**Answer**: **YES** - Configuration is shared!

```
User: Travis
├── Project A / Design System.fig
│   └── GitHub Config: travishall/wylie-dog-ds ✅
├── Project B / Marketing.fig
│   └── GitHub Config: travishall/wylie-dog-ds ✅ (same config)
└── Project C / App Redesign.fig
    └── GitHub Config: travishall/wylie-dog-ds ✅ (same config)
```

**Why**: `clientStorage` is user-scoped, not file-scoped.

---

### ✅ Scenario 2: Sign Out in One File, Sign In to Another

**Question**: What happens if I sign out in one file and sign in to another?

**Answer**: Sign-out affects ALL files!

**Example Flow**:

1. Open `design-system.fig` → Connected to `travishall/repo-a`
2. Switch to `marketing.fig` → Still connected to `travishall/repo-a`
3. In `marketing.fig`: Disconnect from GitHub
4. Switch back to `design-system.fig` → **Now disconnected** (config deleted)
5. In `design-system.fig`: Connect to `travishall/repo-b`
6. Switch to any other file → **Now connected to `travishall/repo-b`**

**Code Reference**:

```typescript
// src/plugin/main.ts:423
case "disconnect-github":
  await figma.clientStorage.deleteAsync("github-config");
  // ☝️ This affects ALL files for this user
```

---

### ✅ Scenario 3: Multiple Users, Same File

**Question**: What about across projects? (Multiple team members)

**Answer**: Each user has their OWN config!

```
design-system.fig (shared file)
├── User: Travis
│   └── GitHub Config: travishall/wylie-dog-ds
├── User: Designer A
│   └── GitHub Config: designera/design-tokens
└── User: Developer B
    └── GitHub Config: NOT CONFIGURED
```

**Why**: `clientStorage` is user-scoped, not file-scoped.

---

## Current Limitations

### ❌ Cannot Configure Different Repos Per File

**Problem**: User wants to sync different files to different repositories.

**Current Behavior**: Last configured repo applies to ALL files.

**Workaround**: None - architectural limitation.

**Future Enhancement**: Could implement file-specific overrides using:

```typescript
// Hypothetical future enhancement
const fileId = figma.fileKey;
const config = await figma.clientStorage.getAsync(`github-config-${fileId}`);
```

---

### ❌ Team Members Cannot Share Config

**Problem**: Design team wants everyone to use the same GitHub repo.

**Current Behavior**: Each user must configure individually.

**Workaround**:

- Share setup instructions
- Consider documenting standard repo URL in file description
- Use onboarding flow to guide users

**Future Enhancement**: Could implement team-shared config using:

- Figma Variables (shared across team)
- Plugin data attached to file
- Or explicit "Import team settings" feature

---

## Config Data Structure

**Stored as JSON in clientStorage:**

```typescript
interface GitHubConfig {
  owner: string; // "travishall"
  repo: string; // "wylie-dog-ds"
  branch: string; // "main"
  tokenPath: string; // "tokens"
  accessToken: string; // "ghp_xxxxxxxxxxxx" (encrypted in storage)
  syncMode: SyncMode; // "direct" | "pull-request"
}
```

**Storage Key**: `"github-config"`

**Location**: User's local Figma app data (not in .fig file)

---

## Security Considerations

### ✅ Access Token Safety

**Good**:

- Tokens stored in user's local `clientStorage` (not in .fig file)
- Not accessible to other plugins
- Not visible to other users
- Not committed to version control

**Risks**:

- Stored in plain text in Figma's local storage
- Could be accessed if someone gains access to user's computer
- No encryption at rest (relies on OS-level security)

**Best Practices**:

1. Use personal access tokens with minimal scope (just `repo`)
2. Revoke tokens when no longer needed
3. Don't share tokens across team members
4. Use fine-grained tokens (limit to specific repos)

---

## Recommendations

### For Current Implementation

**DO**:

- ✅ Document that config is user-wide, not file-specific
- ✅ Show clear "Connected to {repo}" indicators
- ✅ Warn users when disconnecting (affects all files)
- ✅ Provide easy way to view/edit current config

**DON'T**:

- ❌ Assume users understand scope
- ❌ Silently change config without user action
- ❌ Store tokens in file-scoped storage (would expose to team)

### For Future Enhancements

**Consider Adding**:

1. **File-specific overrides** - "Use different repo for this file"
2. **Team config sharing** - Import team's standard settings
3. **Multiple saved configs** - Quick-switch between repos
4. **Config profiles** - "Work", "Personal", "Client X"
5. **Visual scope indicator** - "This config applies to all your Figma files"

---

## Testing Scenarios

**To verify current behavior**:

1. **Test 1: Cross-file persistence**
   - Configure GitHub in File A
   - Open File B → Verify same config appears

2. **Test 2: Disconnect propagation**
   - Configure GitHub in File A
   - Open File B → Disconnect
   - Return to File A → Verify disconnected

3. **Test 3: Multi-user isolation**
   - User A configures GitHub
   - User B opens same file → Verify no config appears

---

## Code Locations

**Config Storage**:

- Read: `src/plugin/main.ts:410`
- Write: `src/plugin/main.ts:451`
- Delete: `src/plugin/main.ts:423`

**Sync Data** (separate from config):

- `github-last-sync` - timestamp of last successful sync
- Also uses `clientStorage`, same scope rules apply

---

## Quick Reference

| Question                      | Answer                        |
| ----------------------------- | ----------------------------- |
| **Scope**                     | Per user, per plugin          |
| **Shared across files?**      | Yes                           |
| **Shared across users?**      | No                            |
| **Persists after quit?**      | Yes                           |
| **Stored in .fig file?**      | No                            |
| **Team can see it?**          | No                            |
| **Different repos per file?** | Not currently supported       |
| **Security**                  | Local storage (not encrypted) |

---

## Summary

**Current Behavior**: GitHub configuration is **user-wide and plugin-specific**. Once you configure GitHub, that configuration applies to **all Figma files you open**, but **only for you** (other team members won't see it).

**Implication**: If you work on multiple projects that need different GitHub repos, you'll need to manually reconfigure when switching between projects.

**Future Enhancement Opportunity**: File-specific config overrides could be added to support multi-repo workflows.
