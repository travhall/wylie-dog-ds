# Accessibility Guide

Token Bridge is designed to be accessible to all users, adhering to **WCAG 2.1 Level AA** standards. This guide outlines our accessibility features and guidelines for developers.

## Key Features

### 1. Keyboard Navigation

The entire plugin is fully navigable using a keyboard.

#### Global navigation

- **Tab**: Move focus to the next interactive element.
- **Shift+Tab**: Move focus to the previous interactive element.
- **Enter/Space**: Activate buttons and links.

#### Component-specific behavior

**Main Navigation (Tabs):**

- **Arrow Left/Right**: Move focus between tabs (Tokens, Import, Sync).
- **Home**: Move focus to the first tab.
- **End**: Move focus to the last tab.

**Modals & Dialogs:**

- **Trace Focus**: Focus is constrained (trapped) within the modal while it is open.
- **Escape**: Close the modal and return focus to the triggering element.
- **Initial Focus**: When a modal opens, focus is automatically set to the first interactive element or the close button.

### 2. Screen Reader Support

We use Semantic HTML and ARIA attributes to ensure compatibility with screen readers (VoiceOver, NVDA, JAWS).

- **Landmarks**: Proper use of `<main>`, `<nav>`, `<header>` regions.
- **Labels**: All interactive elements have descriptive `aria-label` or visible text.
- **Status Updates**: `aria-live="polite"` is used for dynamic content updates (e.g., sync progress, validation results).
- **Dialogs**: Modals use `role="dialog"` and `aria-modal="true"` instructions.

### 3. Visual Accessibility

- **Color Contrast**: All text meets the 4.5:1 contrast ratio.
- **Theming**: Supports both Light and Dark modes via Figma's theme API.
- **Focus Indicators**: Clearly visible focus rings for all interactive elements.

## Developer Guidelines

When contributing to the codebase, follow these rules to maintain accessibility:

### Semantics First

Use native HTML elements whenever possible:

- Use `<button>` for actions, NOT `<div onClick>`.
- Use `<a>` for navigation.
- Use `<h1>`-`<h6>` for logical document structure.

### ARIA Patterns

Only use ARIA when native HTML is insufficient.

**Tooltips:**

```tsx
<div role="tooltip" aria-live="polite" id="help-tooltip">
  Help content...
</div>
```

**Modals:**

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Settings</h2>
  {/* Focus trap logic required via useEffect */}
</div>
```

### Focus Management

- **Modals**: Focus must be trapped within the modal when open.
- **Closing**: Focus should return to the element that opened the modal.
- **Route Changes**: Focus should move to a logical starting point.

### Testing

Run these checks before submitting a PR:

1. **Tab traversal**: Can you reach every element?
2. **Focus visibility**: Is it clear which element is active?
3. **Screen reader**: Does it announce helpful names for buttons?
4. **Zoom**: Does the UI break at 200% zoom?

## Known Issues

- Complex data grids may require advanced keyboard navigation patterns.

For a detailed audit of the current state, see `docs/ACCESSIBILITY_AUDIT.md`.
