## What and why

<!-- What does this change, and what problem does it solve? Link the issue. -->

## Checklist

- [ ] This is a bug fix, an accessibility fix or a docs correction, **or** a maintainer agreed to it in an issue first (new components and token changes need that; see [CONTRIBUTING.md](../CONTRIBUTING.md))
- [ ] I ran the relevant [guardrails](../documentation/guides/guardrails.md) (`pnpm lint`, `pnpm typecheck`, `pnpm check:tokens`, `pnpm check:contrast`, `pnpm test`)
- [ ] Components bind only to component tokens, with no raw values
- [ ] New or changed components have a story and a test
- [ ] Docs are updated where the change affects them
