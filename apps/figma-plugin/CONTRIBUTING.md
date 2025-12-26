# Contributing to Token Bridge

Thank you for your interest in contributing to Token Bridge! This guide will help you get started.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ with pnpm 10.26.0
- **Figma Desktop App** (for plugin development)
- **Git** for version control

### Setup

```bash
# Clone the repository
git clone https://github.com/travishall/wylie-dog-ds.git
cd wylie-dog-ds

# Install dependencies
pnpm install

# Start development (from repo root)
cd apps/figma-plugin
pnpm dev
```

### Development Workflow

1. **Make changes** in `src/` directory
2. **Build** runs automatically (watch mode)
3. **Load plugin** in Figma: Plugins → Development → Import plugin from manifest
4. **Test changes** by reloading plugin in Figma

---

## 📁 Project Structure

```
apps/figma-plugin/
├── src/
│   ├── plugin/           # Plugin thread (Figma API access)
│   │   ├── main.ts       # Entry point
│   │   ├── github/       # GitHub sync logic
│   │   ├── sync/         # Conflict detection
│   │   └── variables/    # Token processing
│   ├── ui/               # UI thread (Preact components)
│   │   ├── App.tsx       # Main app
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Helper functions
│   └── shared/           # Shared types & utilities
├── docs/                 # Documentation
├── dist/                 # Build output (git-ignored)
└── manifest.json         # Figma plugin manifest
```

---

## 🎨 Architecture Overview

### Two-Thread Architecture

Token Bridge uses Figma's plugin architecture with two separate JavaScript contexts:

**Plugin Thread** (`src/plugin/main.ts`)

- Has access to Figma API (`figma.variables`, `figma.clientStorage`, etc.)
- Runs in sandboxed environment
- Handles token processing, GitHub sync, file operations

**UI Thread** (`src/ui/App.tsx`)

- Preact-based UI (not React!)
- No Figma API access
- Displays interface, handles user interactions

**Communication:** Message bus via `postMessage`

```typescript
// UI → Plugin
parent.postMessage({ pluginMessage: { type: "sync-tokens" } }, "*");

// Plugin → UI
figma.ui.postMessage({ type: "sync-complete", data: {...} });
```

### Key Technologies

- **Preact 10.27.0** (not React) - Lightweight UI framework
- **TypeScript 5.8** - Type safety
- **Vite 7** - Build tool with single-file output
- **Vitest 3** - Testing framework
- **@octokit/rest** - GitHub API client

---

## 🧪 Testing

### Run Tests

```bash
# Watch mode (recommended for development)
pnpm test

# Single run (for CI)
pnpm test:run

# With coverage
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

### Writing Tests

**Unit Test Example:**

```typescript
// src/ui/utils/__tests__/myUtil.test.ts
import { describe, it, expect } from "vitest";
import { myUtil } from "../myUtil";

describe("myUtil", () => {
  it("should process input correctly", () => {
    expect(myUtil("input")).toBe("expected");
  });
});
```

**Component Test Example:**

```typescript
// src/ui/components/__tests__/MyComponent.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

See `docs/TESTING.md` for comprehensive testing guide.

---

## 🎯 Code Style

### TypeScript

- Use **strict mode** (enabled in tsconfig.json)
- Prefer **interfaces** over types for object shapes
- Use **discriminated unions** for state/actions
- Avoid `any` - use `unknown` if truly dynamic

### Preact (Not React!)

```typescript
// ✅ Correct
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

// ❌ Wrong
import { useState, useEffect } from "react";
```

### CSS Variables

Use design tokens instead of hardcoded values:

```typescript
// ✅ Correct
style={{
  padding: "var(--space-3)",
  color: "var(--text-primary)",
  borderRadius: "var(--radius-md)",
}}

// ❌ Wrong
style={{
  padding: "12px",
  color: "#374151",
  borderRadius: "6px",
}}
```

### File Naming

- **Components**: PascalCase (e.g., `TabBar.tsx`)
- **Utilities**: camelCase (e.g., `parseGitHubUrl.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx`
- **Types**: `types.ts` or inline in component files

---

## 🔧 Common Tasks

### Adding a New Component

1. Create component file in appropriate directory
2. Use CSS variables for styling
3. Add JSDoc comments for props
4. Write tests in `__tests__/` subdirectory
5. Export from parent index if needed

### Adding a Message Type

1. Define type in `src/shared/types/index.ts`
2. Add handler in `src/plugin/main.ts`
3. Update UI listener in `src/ui/App.tsx` or hook
4. Test message flow end-to-end

### Modifying GitHub Sync

⚠️ **Caution**: GitHub sync is complex with conflict detection

1. Read `src/plugin/sync/conflict-aware-github-client.ts`
2. Understand `ConflictDetector` and `ConflictResolver`
3. Preserve `GitHubConfig` interface (breaking change!)
4. Test with real GitHub repository
5. Test conflict scenarios

---

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Run `pnpm type-check` (no errors)
- [ ] Run `pnpm lint` (no warnings)
- [ ] Run `pnpm test:run` (all passing)
- [ ] Test plugin in Figma (load and verify)
- [ ] Update docs if adding features
- [ ] Add tests for new code

### PR Description Template

```markdown
## Summary

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Added/updated tests
- [ ] Tested manually in Figma
- [ ] All tests passing

## Screenshots (if UI changes)

[Attach screenshots]

## Related Issues

Fixes #123
```

### Review Process

1. CI checks must pass (type-check, lint, tests)
2. At least one maintainer approval
3. No merge conflicts
4. Documentation updated if needed

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**

1. Open plugin
2. Click X
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**

- Figma version: [e.g., Desktop 124.0.0]
- OS: [e.g., macOS 14.1]
- Plugin version: [e.g., 0.1.0]

**Screenshots**
[If applicable]

**Error Messages**
[Console logs or error messages]
```

---

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check existing issues first (avoid duplicates)
2. Describe the problem you're trying to solve
3. Explain your proposed solution
4. Consider implementation complexity
5. Label as `enhancement`

---

## 🏗️ Architecture Constraints

### What You Can't Do

❌ **Access Figma API from UI thread**

- Figma API only available in plugin thread
- Use message passing instead

❌ **Use external CSS files**

- Vite creates single-file build
- Use inline styles with CSS variables

❌ **Import React instead of Preact**

- Preact is intentional (smaller bundle)
- Different import paths

❌ **Make network calls except to GitHub**

- Figma sandboxing limits network access
- Only `api.github.com` and `github.com` allowed
- Google Fonts CDN is allowed for typography

❌ **Modify GitHubConfig interface**

- Breaking change for sync system
- Wrap with adapter if needed

### What You Should Preserve

✅ **Format Adapter System** - 7+ token formats supported
✅ **Conflict Detection** - Pre-sync conflict checking
✅ **Result<T> Pattern** - Standardized error handling
✅ **Message Bus Architecture** - Plugin ↔ UI communication
✅ **Progressive Disclosure** - Advanced mode toggle

---

## 📚 Resources

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Preact Documentation](https://preactjs.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Project Plan](docs/PLAN.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Testing Guide](docs/TESTING.md)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions
- Keep discussions professional

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## ❓ Questions?

- Check `docs/` folder for detailed guides
- Open a GitHub Discussion for questions
- Review existing issues for similar problems
- Read the code - it's well-documented!

Thank you for contributing! 🎉
