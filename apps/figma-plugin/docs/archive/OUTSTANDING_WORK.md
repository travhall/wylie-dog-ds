# Outstanding Work - Token Bridge Plugin

**Date**: December 26, 2025
**Current Status**: Options A & B Complete ✅

---

## 🎯 Dark Mode Refinement

**Location**: `/apps/figma-plugin/src/ui/index.html` (lines 101-117)

**Current Dark Mode Variables:**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --surface-primary: #1e1e1e; /* Main background */
    --surface-secondary: #2d2d2d; /* Cards, input backgrounds */
    --surface-tertiary: #404040; /* Hover states */
    --surface-overlay: rgba(0, 0, 0, 0.7);

    --text-primary: #e5e7eb; /* Main text */
    --text-secondary: #9ca3af; /* Secondary text */
    --text-tertiary: #6b7280; /* Disabled text */
    --text-inverse: #111827; /* Text on colored backgrounds */

    --border-light: #2d2d2d; /* Subtle borders */
    --border-default: #404040; /* Default borders */
    --border-strong: #525252; /* Strong borders */
  }
}
```

**What's Missing:**

- Dark mode variants for semantic colors (success, error, warning, info)
- Dark mode hover states for accent colors
- Possibly lighter backgrounds for better contrast

**You can adjust these directly in the file!**

---

## 🔄 Remaining Components to Update (Option B Completion)

These components still use hardcoded colors and need CSS variable conversion:

### High Priority (Frequently Used):

1. **ConflictResolutionDisplay.tsx** - Shown during GitHub sync conflicts
2. **ValidationDisplay.tsx** - Shows token validation results
3. **ProgressFeedback.tsx** - Loading states during operations
4. **EnhancedErrorDisplay.tsx** - Error messages

### Medium Priority:

5. **SetupWizard.tsx** - GitHub setup wizard
6. **FirstRunOnboarding.tsx** - First-time user onboarding
7. **ContextualHelp.tsx** - Help tooltips

### Already Complete ✅:

- ✅ TabBar.tsx
- ✅ TokensTab.tsx
- ✅ ImportTab.tsx
- ✅ ExportTab.tsx
- ✅ SyncTab.tsx
- ✅ GitHubConfig.tsx
- ✅ QuickGitHubSetup.tsx

---

## 📋 Testing Infrastructure (Optional Enhancement)

**Status**: Manual testing only via `READY_FOR_TESTING.md`

**Potential Additions:**

- [ ] Unit tests for utilities (Vitest)
- [ ] Component tests (Testing Library)
- [ ] Visual regression tests (Storybook + Chromatic)
- [ ] Pre-commit test hooks

**See**: `TESTING_OPTIONS.md` for detailed implementation guide

---

## 🏗️ Future Enhancements (Phase 3+)

From the original UX Enhancement Plan:

### State Management Refactor:

- [ ] Extract `usePluginMessages` hook
- [ ] Implement UI state reducer
- [ ] Reduce App.tsx to <400 lines (currently ~1,500)

### Performance Optimizations:

- [ ] Code splitting for rarely-used components
- [ ] Lazy loading for tab content
- [ ] Memoization for expensive calculations

### Advanced Features:

- [ ] Undo/redo for token edits
- [ ] Token search and filtering
- [ ] Bulk token operations
- [ ] Token preview in Figma canvas

---

## ✅ What You Can Do Now

### 1. **Refine Dark Mode Colors** (5-10 minutes)

Edit `src/ui/index.html` lines 101-117 to adjust:

- Background shades (lighter/darker)
- Text contrast (increase/decrease)
- Border visibility
- Add dark variants for semantic colors

### 2. **Test the Plugin in Figma** (15-20 minutes)

Follow `READY_FOR_TESTING.md`:

- Load plugin in Figma
- Test all 4 tabs
- Verify dark mode switches properly
- Check for any visual issues

### 3. **Update Remaining Components** (30-45 minutes)

Convert the 7 remaining components to use CSS variables:

- Same pattern as GitHubConfig.tsx
- Replace hardcoded colors with `var(--*)` tokens
- Test in both light and dark mode

### 4. **Set Up Automated Tests** (Optional, 15 minutes)

I can set up basic testing infrastructure if you'd like automated validation

---

## 🚀 Next Steps (In Order)

1. **You**: Refine dark mode colors in `index.html`
2. **You**: Test plugin in Figma, report any issues
3. **Me** (if needed): Fix any bugs found during testing
4. **Me**: Update remaining 7 components with CSS variables
5. **Both**: Final review and polish
6. **Me**: Create final commit and update documentation

---

## 📍 Current Bundle Status

- **Size**: 233.79 kB (gzip: 53.32 kB)
- **Target**: <400 kB (gzip <100 kB)
- **Status**: ✅ Well under budget!

---

## 📞 Questions to Answer

Before I proceed with remaining component updates:

1. **Dark mode colors**: Do you want to refine these yourself, or should I suggest improved values?
2. **Testing**: Should I set up automated tests, or is manual testing sufficient?
3. **Component updates**: Should I update the remaining 7 components now, or wait for your testing feedback?
4. **Priority**: What's most important to you right now?
   - Visual polish (dark mode + remaining components)
   - Testing setup
   - Performance optimization
   - Documentation

Let me know your preferences, and I'll prioritize accordingly!
