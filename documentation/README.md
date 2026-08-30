# Wylie Dog Design System Documentation

Central documentation hub for the Wylie Dog Design System.

## Quick Links

- [Component Workflow Guide](guides/component-workflow.md) - Step-by-step guide for creating components
- [Accessibility Guide](guides/accessibility-guide.md) - Accessibility standards and testing
- [Performance Monitoring](guides/performance.md) - Performance budgets and CI/CD integration
- [Testing Coverage Report](reference/testing-coverage.md) - Current test coverage status
- [Case Studies](case-studies/TEMPLATE.md) - Problem/process/solution write-ups of real design-system issues

## Documentation Structure

```text
documentation/
├── guides/          # Development guides and best practices
├── reference/       # Technical reference documentation
├── case-studies/    # Problem/process/solution write-ups, one folder per case
└── archive/         # Historical implementation reports
```

## Guides

### [Component Workflow](guides/component-workflow.md)

Complete guide for component development including:

- Automated component generation
- TypeScript patterns and variant systems
- Storybook story development
- Testing requirements
- Build and export configuration

### [Accessibility](guides/accessibility-guide.md)

Accessibility standards and implementation:

- Current compliance status (98% WCAG 2.1 AA)
- Component-specific guidelines
- Testing procedures (automated and manual)
- CI/CD integration

### [Performance](guides/performance.md)

Performance monitoring and optimization:

- Web Vitals targets and budgets
- Bundle size tracking
- Lighthouse CI integration
- Build performance with Turbo

## Reference

### [Testing Coverage](reference/testing-coverage.md)

Comprehensive testing status report:

- Current coverage: 95.41% overall
- Component-by-component breakdown
- Skipped portal tests explanation
- Testing infrastructure details

## Case Studies

Real problems found and solved in this design system, written up as
problem/process/solution narratives for an outside reader (portfolio-facing,
not internal-only). Each case study is its own folder under `case-studies/`
with a `README.md` (start from [`TEMPLATE.md`](case-studies/TEMPLATE.md)) plus
`before/` and `after/` sub-folders for screenshots and other artifacts.

Case studies can originate from either direction — a bug or gap found while
auditing code (e.g. a token that wasn't actually wired to what it claimed to
represent), or a change that started in Figma and worked its way into code.

- `a11y-tertiary/` - Before/after screenshots from a dark-mode contrast fix (write-up pending)
- [`spacing-scale-gap/`](case-studies/spacing-scale-gap/README.md) - Missing 2px spacing token, traced through Figma → code → Figma via Token Bridge (in progress)

## Archive

Historical implementation reports documenting completed milestones:

- `2025-12-14-implementation-summary.md` - CI/CD and testing infrastructure setup
- `2025-12-17-testing-setup.md` - Testing infrastructure establishment
- `2025-12-17-testing-fixes.md` - ESLint and component test fixes
- `2025-12-17-accessibility-improvements.md` - Accessibility enhancements

## Contributing

When adding documentation:

1. **Guides** - Place tutorial and how-to content in `guides/`
2. **Reference** - Place technical specifications and reports in `reference/`
3. **Archive** - Move completed milestone reports to `archive/` with date prefix

Follow the existing format and maintain consistency with project standards.

## Project Links

- **Main README**: [../README.md](../README.md)
- **Storybook**: [Live Demo](https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/)
- **Repository**: [GitHub](https://github.com/travhall/wylie-dog-ds)

---

**Last Updated**: December 2025
