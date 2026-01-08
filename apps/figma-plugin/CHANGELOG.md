# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-01-08

### Added

- **Help Menu**: New `HelpMenu` component in the app header providing quick access to documentation, issue reporting, and plugin reset.
- **Visual Onboarding**: Enhanced `FirstRunOnboarding` experience with high-quality SVG illustrations and a direct link to documentation.
- **Smart Error Links**: `EnhancedErrorDisplay` now provides specific "Read Docs" links based on the error type (e.g., format errors link to formatting guide).
- **Virtual Scrolling**: Implemented virtualization for token lists to support datasets with 1000+ tokens efficiently.
- **Loading Skeletons**: Added skeleton loading states for better perceived performance during async operations.

### Changed

- **layout**: Refactored `ConflictResolutionDisplay` to use a robust flexbox layout with a fixed footer, ensuring "Cancel" and "Confirm" buttons are always accessible on all screen sizes.
- **performance**: Optimized bundle size by lazy-loading `jszip` only when needed for export.
- **ui**: Visual polish on batch action buttons and conflict summary stats.

### Fixed

- Fixed an accessibility issue where conflict resolution buttons could be pushed off-screen in crowded lists.
- Added missing `scaleIn` animation for smoother modal entrances.

## [0.1.0] - Initial Release

- Basic token import/export (DeepToken, W3C DTCG, Tokens Studio).
- GitHub sync with conflict detection.
- Dark mode support.
- Tab-based navigation system.
