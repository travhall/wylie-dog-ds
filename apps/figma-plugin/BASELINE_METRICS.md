# Token Bridge - Baseline Metrics

**Date**: December 26, 2025
**Pre-UX Enhancement Refactor**

## Bundle Sizes (Pre-Optimization)

### Plugin Bundle

- **File**: `dist/plugin.js`
- **Size**: 126.63 kB
- **Gzip**: 37.78 kB
- ✅ **Status**: Excellent (plugin logic only)

### UI Bundle

- **File**: `dist/src/ui/index.html` (single-file build)
- **Size**: 239.85 kB
- **Gzip**: 55.29 kB
- ✅ **Status**: Good (includes Preact + all UI components)

### Total Bundle

- **Combined**: 366.48 kB
- **Combined Gzip**: 93.07 kB
- ✅ **Target**: <400KB (PASSING)

## Code Metrics

### App.tsx

- **Lines**: 2,143 lines
- **Target**: <400 lines
- **Reduction Needed**: ~1,743 lines (81% reduction)

### Component Count

- **Existing**: 13 UI components
- **Planned**: +8 new components (tabs, layout, helpers)
- **Total Target**: 21 components

## Typography

### Before

- **Font**: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Loading**: Instant (no network)

### After

- **Font**: Manrope Variable Font (200-800 weight range)
- **Source**: Google Fonts
- **Loading**: Preconnected for performance
- **Fallback**: System fonts maintained
- **Network Domains Added**: `fonts.googleapis.com`, `fonts.gstatic.com`

## Design System

### CSS Variables Added

- ✅ Typography scale (7 sizes: xs → 2xl)
- ✅ Spacing scale (4px grid: 1 → 10)
- ✅ Color tokens (light theme: 30+ tokens)
- ✅ Dark mode support (`@media (prefers-color-scheme: dark)`)
- ✅ Shadow system (sm → xl)
- ✅ Transition timings (fast, base, slow)
- ✅ Border radius scale (sm → xl)

## Performance Targets

- [ ] Bundle size: <400KB (✅ Currently: 366KB)
- [ ] Gzip size: <100KB (✅ Currently: 93KB)
- [ ] Load time: <2s (to be measured in Figma)
- [ ] App.tsx: <400 lines (❌ Currently: 2,143 lines)

## Next Steps

1. ✅ Manrope font integrated
2. ✅ CSS variable system established
3. ✅ Dark mode foundation ready
4. 🚀 Begin Phase 1: Consolidate onboarding
