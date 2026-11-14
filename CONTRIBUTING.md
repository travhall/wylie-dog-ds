# Contributing

Wylie Dog is a Foundation: a repository you fork and make your own, not a package you install (see [ADR 0001](docs/adr/0001-foundation-not-published-packages.md)). It is also a portfolio project with one maintainer, so scope is kept deliberately small. Terms used here are defined in the [glossary](GLOSSARY.md).

## What is welcome

Open a pull request directly for:

- Bug fixes in components, tokens, scripts or docs
- Accessibility fixes
- Documentation corrections

Open an issue first, and wait for the maintainer to agree, for:

- A new component, pattern or composition
- Any change to token names, tiers or values
- A change to a guardrail's rules or thresholds
- Anything in `apps/figma-plugin` (Token Bridge). It is experimental and not yet ready for outside contributions.

A pull request that skips this step may be closed, however good the code is. The reason is coherence, not gatekeeping: the system, its case studies and its docs have to keep telling the same story.

## Setup

Requires Node.js 22+ and pnpm 10+.

```bash
git clone https://github.com/travhall/wylie-dog-ds.git
cd wylie-dog-ds
pnpm install
pnpm dev:storybook
```

## Before you open a pull request

CI runs the [guardrails](documentation/guides/guardrails.md). Run the ones relevant to your change first:

```bash
pnpm lint
pnpm typecheck
pnpm check:tokens
pnpm check:contrast
pnpm test
pnpm format
```

Two rules catch most first-time failures:

- Components bind only to component tokens. Use the `-(--token-name)` Tailwind syntax, never a palette class or raw value. See [Token Usage in Components](README.md#token-usage-in-components).
- Every component needs a Storybook story and a test. `pnpm generate:component <name>` scaffolds both.

## Reporting a problem

Use the issue templates. For accessibility bugs, include the component, the assistive technology or browser, and what you expected to happen.
