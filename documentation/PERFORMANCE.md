# Performance Monitoring

This document outlines the performance monitoring strategy for the Wylie Dog Design System.

## Overview

The design system uses multiple free, open-source tools to ensure optimal performance:

- **Lighthouse CI**: Automated performance, accessibility, and best practices audits
- **size-limit**: Bundle size tracking and enforcement
- **Turbo**: Build performance optimization with intelligent caching

## Performance Budgets

Our performance budgets are defined in `.performance-budgets.json` and enforced through CI/CD:

### Web Vitals

| Metric  | Target | Limit | Description              |
| ------- | ------ | ----- | ------------------------ |
| **FCP** | 1.8s   | 2.0s  | First Contentful Paint   |
| **LCP** | 2.0s   | 2.5s  | Largest Contentful Paint |
| **CLS** | 0.05   | 0.1   | Cumulative Layout Shift  |
| **TBT** | 200ms  | 300ms | Total Blocking Time      |
| **SI**  | 2.5s   | 3.0s  | Speed Index              |
| **TTI** | 3.0s   | 3.5s  | Time to Interactive      |

### Bundle Size

- **Individual Components**: Maximum 15KB gzipped
- **Tokens Package**: Maximum 5KB

All bundle sizes are tracked in `.size-limit.json` and enforced on every pull request.

### Quality Scores

- **Accessibility**: Minimum 95/100
- **Best Practices**: Minimum 90/100
- **Performance**: Minimum 90/100

## Monitoring Tools

### 1. Lighthouse CI

Lighthouse CI runs automated audits on every pull request and push to main.

**Configuration**: `lighthouserc.json`

**What it checks**:

- Performance metrics (FCP, LCP, CLS, TBT, SI, TTI)
- Accessibility compliance
- Best practices adherence
- Core Web Vitals

**Running locally**:

```bash
# Build Storybook
pnpm --filter storybook build

# Serve Storybook
pnpm --filter storybook preview-storybook

# In another terminal, run Lighthouse CI
npx @lhci/cli@latest autorun
```

**Results**: Published to temporary public storage with shareable links on each PR.

### 2. size-limit

Tracks bundle sizes for all components and enforces size budgets.

**Configuration**: `.size-limit.json`

**Running locally**:

```bash
pnpm size
```

**What it checks**:

- Individual component bundle sizes (43 components tracked)
- Tokens package size
- Dependencies are properly excluded from size calculations

**Results**: Posted as a comment on pull requests showing size changes.

### 3. Turbo

Provides intelligent build caching and performance optimization.

**Configuration**: `turbo.json`

**What it does**:

- Caches build outputs for faster subsequent builds
- Parallelizes tasks across the monorepo
- Tracks task dependencies to optimize build order
- Provides build performance insights

**Running with performance tracking**:

```bash
# Enable performance profiling
pnpm build --profile

# View build timeline
pnpm dlx @turbo/gen --show-all
```

## CI/CD Integration

All performance monitoring runs automatically in GitHub Actions:

### Pull Requests

- ✅ Lighthouse CI audit
- ✅ Bundle size check
- ✅ Performance budget enforcement
- ✅ Accessibility validation

### Main Branch

- ✅ Performance baseline updates
- ✅ Historical performance tracking

## Performance Best Practices

### For Component Development

1. **Keep components small**: Target < 5KB for simple components
2. **Lazy load when possible**: Use dynamic imports for heavy components
3. **Minimize dependencies**: Only import what you need from Radix UI
4. **Test bundle impact**: Run `pnpm size` before committing
5. **Profile performance**: Use React DevTools Profiler for runtime performance

### For Token Updates

1. **Minimize token bloat**: Only add tokens that will be used
2. **Test generated CSS size**: Check `dist/index.css` after token changes
3. **Use semantic tokens**: Prefer semantic over primitive tokens

### For Build Performance

1. **Leverage Turbo cache**: Don't disable caching unless necessary
2. **Scope your builds**: Use `--filter` to build specific packages
3. **Keep dependencies updated**: Newer versions often have performance improvements

## Troubleshooting

### Lighthouse CI Fails

1. Check the Lighthouse report link in the PR comment
2. Review failing assertions in `.github/workflows/lighthouse.yml`
3. Test locally using the commands above
4. Adjust budgets in `lighthouserc.json` if legitimately needed

### Bundle Size Exceeded

1. Run `pnpm size` locally to see the exact size
2. Identify which dependencies are included
3. Check if dependencies can be marked as `peerDependencies`
4. Consider code-splitting or lazy loading
5. Update limit in `.size-limit.json` only if absolutely necessary

### Build Performance Issues

1. Check Turbo cache hit rate in CI logs
2. Review task dependencies in `turbo.json`
3. Ensure inputs/outputs are correctly configured
4. Consider breaking up large tasks

## Updating Budgets

Performance budgets should be updated conservatively:

1. **Document the reason**: Add a comment explaining why
2. **Get team approval**: Open a PR with the budget change
3. **Update documentation**: Update this file if limits change
4. **Monitor impact**: Watch for regressions after budget increases

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [size-limit Documentation](https://github.com/ai/size-limit)
- [Turbo Documentation](https://turbo.build/repo/docs)
