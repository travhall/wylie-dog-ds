# Token Bridge UX Polish Plan

**Goal**: Transform from engineer-built to designer-friendly tool
**Timeline**: Incremental improvements
**Status**: In Progress

## Latest Updates (December 25, 2024)

### Completed in This Session ✅

1. **Language Simplification** - Removed all technical jargon:
   - "Load Variable Collections" → "Show My Tokens" (then removed entirely)
   - "Pull/Push" → "Get from GitHub/Save to GitHub"
   - "Import Tokens" → "Add Tokens"
   - "Exporting tokens" → "Preparing your tokens"
   - "Syncing" → "Saving" / "Getting"

2. **Navigation Improvements**:
   - Removed redundant "Show My Tokens" button
   - Made FirstRunOnboarding the default home screen when no tokens exist
   - Fixed hidden content issue in onboarding modal (scroll overflow)

3. **Modal System Fixes**:
   - Increased all modal z-indexes to 10000+ (SetupWizard, OnboardingModal, FormatGuidelinesDialog)
   - Prevents app from showing behind modals

4. **Visual Hierarchy Enhancements**:
   - Wrapped token list in card with white background and border
   - Improved card styling with consistent padding (16px)
   - Enhanced selected state with 2px blue border
   - Added icon emoji to section headers (📦, 💾, 📥)
   - Consistent typography: 13px bold headers, #1f2937 color
   - Better visual separation between sections

5. **Loading States**:
   - "Exporting tokens" → "Preparing your tokens"
   - "Fetching from GitHub" → "Getting from GitHub"
   - "Checking for conflicts" → "Checking for changes"
   - "Uploading to GitHub" → "Saving to GitHub"
   - "Importing tokens to Figma" → "Adding tokens to Figma"
   - "Applying conflict resolutions" → "Saving your choices"

6. **Error & Success States**:
   - "Can't connect to GitHub. Check your internet connection" → "Can't reach GitHub right now. Check your internet connection"
   - "Successfully imported X variables" → "Added X tokens to Figma"
   - "Tokens synced directly to repository" → "Saved to GitHub successfully"
   - "Tokens pulled from GitHub" → "Got your tokens from GitHub"
   - Removed technical jargon like "configuration", "variables", "synced", "repository"
   - Added friendly language: "All set!", "Let's resolve this", "Don't worry"

7. **Micro-Interactions & Accessibility** (Week 4 - December 25, 2024):
   - **Hover States**: All buttons now have smooth hover transitions with:
     - Background color changes (darker on hover)
     - Subtle elevation (translateY -1px to -2px)
     - Box shadow on hover (0 2px-4px rgba)
     - 0.2s ease transitions for smooth feel
   - **ARIA Labels**: Added descriptive labels to all interactive elements:
     - "Add tokens from file", "Get tokens from GitHub", "Save tokens to GitHub"
     - "Settings menu" with aria-expanded and aria-haspopup
     - "Switch to Simple/Advanced mode"
     - Dynamic labels for onboarding options
   - **Focus States**: Keyboard navigation support:
     - 2px solid blue outline (#0ea5e9) on focus
     - 2px outline offset for visual clarity
     - Removed default outline, replaced with custom accessible styles
   - **Menu Roles**: Proper ARIA roles for dropdown menus (role="menu", role="menuitem")
   - **Disabled States**: Proper aria-disabled attributes for unavailable options
   - **Visual Feedback**: All buttons provide immediate visual feedback on interaction

### Build Status

✅ All changes built successfully (3rd iteration)
✅ Micro-interactions and accessibility improvements complete
📦 Ready for testing in Figma

---

## Core Philosophy

> "Design tokens should feel as natural as styles and components"

**Principles**:

- Speak the designer's language (not engineer's)
- Show, don't tell (visual over text)
- Guide without hand-holding
- Make the common case trivial
- Hide complexity until needed

---

## UX Audit Findings

### 🔴 Critical Issues

1. **Technical Jargon Everywhere**
   - "Variable Collections"
   - "Export tokens"
   - "Sync mode: direct/pull-request"
   - "JSON files"
   - "W3C DTCG format"

2. **Unclear Workflows**
   - No clear path from "I have nothing" to "I have tokens"
   - No guidance on Export vs Import vs Sync
   - Advanced/Simple mode feels arbitrary

3. **Poor Visual Hierarchy**
   - Everything looks equally important
   - GitHub and Local Export compete visually
   - Collections list is overwhelming

### 🟡 Important Issues

1. **Empty States**
   - Blank screen with technical instructions
   - No visual guidance

2. **Button Copy**
   - "Load Variable Collections" is confusing
   - "Import Tokens" doesn't explain format
   - "Download JSON (3)" is technical

3. **Error Messages**
   - Technical error logs shown to users
   - No recovery guidance

### 🟢 Nice to Have

1. Success animations
2. Onboarding tooltips
3. Keyboard shortcuts
4. Dark mode

---

## Redesign Strategy

### Phase 1: Language Simplification ✅ CURRENT

**Before → After**:

- "Variable Collections" → "Your Design Tokens"
- "Load Variable Collections" → "Show My Tokens"
- "Import Tokens" → "Add Tokens"
- "Export tokens" → "Save Tokens"
- "GitHub Sync" → "Save to GitHub" / "Get from GitHub"
- "Download JSON" → "Download Files"
- "Advanced Mode" → Remove concept entirely
- "Sync Mode: direct" → "Auto-sync"
- "Sync Mode: pull-request" → "Review changes"

**Technical Terms to Eliminate**:

- ❌ Collections → ✅ Token Sets or Groups
- ❌ Variables → ✅ Tokens
- ❌ Sync → ✅ Save/Get
- ❌ Export → ✅ Download
- ❌ Import → ✅ Add/Upload
- ❌ Pull/Push → ✅ Get/Save
- ❌ JSON → ✅ File(s)

### Phase 2: Visual Redesign

**Information Hierarchy**:

```
1. Primary Actions (what you do most)
   - Show my tokens
   - Add tokens

2. Secondary Actions (periodic)
   - Save to GitHub
   - Download files

3. Settings (one-time)
   - GitHub setup
   - Mode preferences
```

**Card-Based Layout**:

```
┌─────────────────────────────────────┐
│ 📦 Your Design Tokens               │
├─────────────────────────────────────┤
│ [Show My Tokens] [Add New Tokens]   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ ✓ Colors (24 tokens)        │   │
│ │ ✓ Spacing (12 tokens)       │   │
│ │ ✓ Typography (8 tokens)     │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💾 Save Your Work                   │
├─────────────────────────────────────┤
│ ✅ Connected to GitHub              │
│ wylie-dog-ds/main                   │
│                                     │
│ [Get from GitHub] [Save to GitHub]  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📥 Download                         │
├─────────────────────────────────────┤
│ Save token files to your computer   │
│                                     │
│ [Download 3 Files]                  │
└─────────────────────────────────────┘
```

### Phase 3: Empty States & Guidance

**No Tokens Yet**:

```
┌─────────────────────────────────────┐
│         🎨                          │
│   No design tokens yet              │
│                                     │
│   Get started by:                   │
│   • Trying demo tokens              │
│   • Adding tokens from a file       │
│   • Getting from GitHub             │
│                                     │
│   [Get Started]                     │
└─────────────────────────────────────┘
```

**After Loading Tokens**:

```
┌─────────────────────────────────────┐
│ 🎉 3 token groups loaded!           │
│                                     │
│ Next steps:                         │
│ • Review your tokens below          │
│ • Save to GitHub for backup         │
│ • Download files to use elsewhere   │
└─────────────────────────────────────┘
```

### Phase 4: Workflow Clarity

**Remove "Advanced Mode"**

Instead of showing/hiding features, show them progressively:

- Start simple (just tokens)
- Reveal GitHub when configured
- Show details on hover/expand

**Simplify GitHub Setup**:

```
Current:
┌─────────────────────────────────────┐
│ Owner: [___________]                │
│ Repo:  [___________]                │
│ Branch: [___________]               │
│ Token Path: [___________]           │
│ Sync Mode: [direct ▼]               │
│ Access Token: [___________]         │
│                                     │
│ [Test] [Cancel] [Save]              │
└─────────────────────────────────────┘

Proposed:
┌─────────────────────────────────────┐
│ GitHub Repository                   │
│ [owner/repo ▼]                      │
│                                     │
│ Access Token                        │
│ [•••••••••••••••]                   │
│ Don't have one? Get a token →       │
│                                     │
│ [Connect]                           │
└─────────────────────────────────────┘
```

### Phase 5: Better Feedback

**Loading States**:

- Show what's happening (not just "Loading...")
- "Finding your tokens..."
- "Reading colors..." (with progress)
- "Almost there..."

**Success States**:

- Brief celebration
- Clear next step
- No technical details

**Error States**:

- Plain language
- What went wrong (simple)
- How to fix it
- Not: stack traces or error codes

---

## Implementation Checklist

### Week 1: Language & Copy ✅ COMPLETED

- [x] Replace all "Collections" with "Token Sets" → "Your Design Tokens"
- [x] Rename all buttons to action verbs
- [x] Remove technical jargon (Pull/Push → Get/Save, etc.)
- [x] Update onboarding copy
- [x] Remove redundant UI elements

### Week 2: Visual Hierarchy ✅ COMPLETED

- [x] Fix modal z-index hierarchy (all modals now use z-index 10000+)
- [x] Improve empty state with clear CTA
- [x] Card-based layout for sections (Token list, GitHub, Download)
- [x] Clearer visual separation (borders, padding, spacing)
- [x] Better typography scale (consistent font sizes, weights, colors)
- [x] Consistent spacing (16px cards, 12px internal spacing)
- [x] Icons for visual scanning (📦, 💾, 📥)

### Week 3: Empty States ✅ COMPLETED

- [x] Helpful empty state for no tokens
- [x] FirstRunOnboarding as default home screen
- [x] Loading state improvements (designer-friendly messages)
- [x] Success states after actions (removed technical terms)
- [x] Error state redesigns (friendly, conversational tone)

### Week 4: Micro-Interactions & Accessibility ✅ COMPLETED

- [x] Micro-interactions on all buttons (hover states, transitions)
- [x] Keyboard navigation (focus states with visible outlines)
- [x] Accessibility improvements (ARIA labels, roles, states)
- [x] Visual feedback on all interactions
- [ ] Advanced Mode remains (user requested to keep as standard)
- [ ] Progressive disclosure (deferred - Advanced Mode is the default)

### Week 5: Additional Polish (Optional)

- [ ] Success animations (confetti, checkmarks)
- [ ] Loading state animations (spinner improvements)
- [ ] Simplify GitHub setup wizard further
- [ ] Add tooltips for complex features
- [ ] Dark mode support

---

## Success Metrics

**Before**:

- Users confused by "Variable Collections"
- Can't find GitHub setup
- Don't understand modes
- Technical errors confuse users

**After**:

- Clear what tokens are
- Obvious how to save work
- No modes to understand
- Errors are actionable

**Measurement**:

- Time to first success < 2 minutes
- Support questions reduced by 80%
- User satisfaction > 4.5/5
- Return usage > 60% within 7 days
