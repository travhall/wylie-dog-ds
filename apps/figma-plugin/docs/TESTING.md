# Testing Infrastructure Setup Complete ✅

**Date**: December 26, 2025

---

## Summary

Automated testing infrastructure has been successfully set up for the Token Bridge Figma plugin using **Vitest** + **Testing Library** with **GitHub Actions CI/CD**.

---

## What Was Installed

### Testing Framework

- **Vitest v3.0.0** - Fast unit test framework with native ESM support
- **@vitest/ui v3.0.0** - Interactive UI for running tests
- **jsdom v26.0.0** - DOM environment for testing UI components

### Testing Utilities

- **@testing-library/preact v3.2.4** - Testing utilities for Preact components
- **@testing-library/jest-dom v6.6.3** - Custom matchers for DOM assertions

---

## Files Created

### Configuration Files

**`vitest.config.ts`**

- Vitest configuration with Preact support
- jsdom environment setup
- Coverage configuration (v8 provider)
- Path aliases (`@` → `./src`)

**`src/__tests__/setup.ts`**

- Global test setup file
- Figma API mocks (clientStorage, ui, variables)
- Automatic cleanup after each test
- jest-dom matchers integration

### Test Files (Examples)

**`src/ui/utils/__tests__/parseGitHubUrl.test.ts`**

- Unit tests for GitHub URL parsing utility
- 8 test cases covering various URL formats
- Edge case handling (trailing slashes, .git extension, etc.)

**`src/ui/components/layout/__tests__/TabBar.test.tsx`**

- Component tests for TabBar navigation
- Accessibility testing (ARIA attributes, keyboard navigation)
- Click event handling
- Conditional rendering based on GitHub connection status

### CI/CD

**`.github/workflows/figma-plugin-test.yml`**

- GitHub Actions workflow for automated testing
- Runs on push to `main`/`develop` branches
- Runs on pull requests
- Steps:
  1. Type checking (`tsc --noEmit`)
  2. Linting (`eslint`)
  3. Unit tests (`vitest run`)
  4. Coverage report generation
  5. Upload coverage to Codecov
  6. PR comment with coverage stats

---

## NPM Scripts Added

```json
{
  "test": "vitest", // Run tests in watch mode
  "test:ui": "vitest --ui", // Run tests with interactive UI
  "test:run": "vitest run", // Run tests once (for CI)
  "test:coverage": "vitest run --coverage" // Generate coverage report
}
```

---

## How to Use

### Run Tests Locally

```bash
# Watch mode (reruns on file changes)
pnpm --filter figma-plugin test

# Interactive UI
pnpm --filter figma-plugin test:ui

# Single run (for CI)
pnpm --filter figma-plugin test:run

# With coverage report
pnpm --filter figma-plugin test:coverage
```

### Write New Tests

**Unit Test Example:**

```typescript
// src/ui/utils/__tests__/myUtil.test.ts
import { describe, it, expect } from "vitest";
import { myUtil } from "../myUtil";

describe("myUtil", () => {
  it("should do something", () => {
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
    render(<MyComponent prop="value" />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

---

## Figma API Mocking

The test setup (`src/__tests__/setup.ts`) includes mocks for the Figma Plugin API:

```typescript
global.figma = {
  clientStorage: {
    getAsync: vi.fn(),
    setAsync: vi.fn(),
    deleteAsync: vi.fn(),
  },
  ui: {
    postMessage: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    resize: vi.fn(),
  },
  currentPage: { selection: [] },
  variables: {
    getLocalVariablesAsync: vi.fn().mockResolvedValue([]),
    getLocalVariableCollections: vi.fn().mockReturnValue([]),
  },
};
```

To customize mocks in individual tests:

```typescript
import { vi } from "vitest";

it("should handle storage", async () => {
  vi.mocked(figma.clientStorage.getAsync).mockResolvedValue({ foo: "bar" });
  // Your test code...
});
```

---

## Coverage Goals

Current setup generates coverage reports in multiple formats:

- **Text** - Terminal output
- **HTML** - `coverage/index.html` (browse locally)
- **JSON** - `coverage/coverage-final.json` (for CI tools)

**Recommended Coverage Targets:**

- Overall: **>80%**
- Utilities: **>90%** (pure functions, easy to test)
- Components: **>70%** (UI components, harder to test)
- Integration: **>60%** (complex interactions)

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- ✅ Every push to `main` or `develop`
- ✅ Every pull request
- ✅ Changes to `apps/figma-plugin/**` files

### Pull Request Workflow

1. Developer opens PR
2. GitHub Actions runs:
   - Type check
   - Lint
   - Tests
   - Coverage report
3. Coverage report posted as PR comment
4. CI must pass before merge

---

## Next Steps (Optional Enhancements)

### 1. Increase Test Coverage

**High Priority:**

- ✅ `parseGitHubUrl` utility (completed)
- ✅ `TabBar` component (completed)
- ⏳ `TokensTab`, `ImportTab`, `ExportTab`, `SyncTab` components
- ⏳ Sync engine (`src/plugin/sync/`)
- ⏳ Token processor (`src/plugin/processor/`)

**Medium Priority:**

- Modal components (ConflictResolutionDisplay, ValidationDisplay, etc.)
- Error handling (ErrorHandler class)
- GitHub integration (`src/plugin/github/`)

**Low Priority:**

- Edge cases in UI components
- Integration tests for full workflows

### 2. Visual Regression Testing (Storybook + Chromatic)

```bash
# Install Storybook
npx storybook@latest init

# Add Chromatic for visual regression
npx chromatic --project-token=<token>
```

### 3. E2E Testing (Playwright)

For testing full user workflows in Figma environment:

- Requires Figma plugin testing environment
- More complex setup
- Better suited for critical user paths

### 4. Continuous Monitoring

- Set up Codecov account for coverage tracking
- Add coverage badges to README
- Set coverage thresholds in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
},
```

---

## Troubleshooting

### Issue: Tests fail with "ReferenceError: figma is not defined"

**Solution**: Import setup file is configured in `vitest.config.ts`. If still failing:

```typescript
// Add to top of test file
import "../__tests__/setup";
```

### Issue: Preact components not rendering

**Solution**: Ensure `@vitejs/plugin-react` is in vitest config:

```typescript
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // ...
});
```

### Issue: Coverage not generating

**Solution**: Run with `--coverage` flag and ensure `@vitest/coverage-v8` is installed:

```bash
pnpm add -D @vitest/coverage-v8
pnpm test:coverage
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library (Preact)](https://testing-library.com/docs/preact-testing-library/intro/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## Summary

The Token Bridge plugin now has:

- ✅ Unit testing framework (Vitest)
- ✅ Component testing utilities (Testing Library)
- ✅ Mocked Figma API
- ✅ Example tests (utility + component)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Coverage reporting
- ✅ Interactive test UI

**Ready to test!** Run `pnpm --filter figma-plugin test` to get started.

# Automated Testing Options for Figma Plugins

## 1. Unit Tests (Currently Possible)

**What:** Test individual functions and utilities in isolation
**Tools:** Vitest (already configured in the project)

```bash
# Add test script to package.json
pnpm add -D @testing-library/preact @testing-library/preact-hooks
```

**Example test structure:**

```typescript
// src/ui/utils/parseGitHubUrl.test.ts
import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "./parseGitHubUrl";

describe("parseGitHubUrl", () => {
  it("parses standard GitHub URLs", () => {
    expect(parseGitHubUrl("https://github.com/owner/repo")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });
});
```

## 2. Component Tests (Recommended)

**What:** Test UI components without Figma
**Tools:** Vitest + Testing Library

```typescript
// src/ui/components/tabs/TokensTab.test.tsx
import { render, fireEvent } from '@testing-library/preact';
import { TokensTab } from './TokensTab';

describe('TokensTab', () => {
  it('calls onToggleCollection when collection clicked', () => {
    const mockToggle = vi.fn();
    const { getByText } = render(
      <TokensTab
        collections={[{ id: '1', name: 'Test', modes: [], variableIds: [] }]}
        selectedCollections={new Set()}
        onToggleCollection={mockToggle}
        // ... other props
      />
    );

    fireEvent.click(getByText('Test'));
    expect(mockToggle).toHaveBeenCalledWith('1');
  });
});
```

## 3. Integration Tests with Figma (Advanced)

**What:** Test plugin in real Figma environment
**Tools:** Figma Plugin API + Playwright/Puppeteer

**Limitation:** Requires Figma Desktop app automation, complex setup

**Alternative:** Use Figma's `figma.clientStorage` for E2E state verification

## 4. Visual Regression Testing (Best for UI)

**What:** Capture screenshots and compare changes
**Tools:**

- Storybook + Chromatic
- Percy
- Playwright with screenshot comparison

**Setup for this project:**

```bash
# Install Storybook
pnpm add -D @storybook/preact vite-plugin-storybook

# Create stories
// src/ui/components/tabs/TokensTab.stories.tsx
export default {
  title: 'Tabs/TokensTab',
  component: TokensTab,
};

export const Default = {
  args: {
    collections: [...],
    selectedCollections: new Set(),
    // ...
  },
};
```

## 5. Recommended Testing Strategy for This Project

### Phase 1: Unit Tests (Quick Win)

- ✅ Test `parseGitHubUrl` utility
- ✅ Test GitHub config validation
- ✅ Test format adapters (already complex logic)

### Phase 2: Component Tests

- ✅ Test tab navigation
- ✅ Test selection state
- ✅ Test form validation

### Phase 3: Manual E2E Checklist (Current approach)

- Use `READY_FOR_TESTING.md` as manual test protocol
- Consider creating GitHub Actions workflow to remind on PR

### Phase 4 (Optional): Storybook

- Visual component library
- Manual interaction testing
- Screenshot testing with Chromatic

## Current Status

**What we have:**

- Manual testing checklist in `READY_FOR_TESTING.md`
- Build validation (TypeScript, ESLint)
- Bundle size tracking

**What we could add quickly:**

1. Vitest config for unit tests
2. Testing Library setup for component tests
3. GitHub Actions to run tests on PR

## Quick Setup (5 minutes)

Want me to set up basic testing infrastructure? I can:

1. Add Vitest config
2. Install Testing Library
3. Create example tests for utilities
4. Add `pnpm test` script

This would enable:

- Pre-commit test hooks
- CI/CD test validation
- TDD for new features

Let me know if you'd like me to proceed with automated testing setup!
