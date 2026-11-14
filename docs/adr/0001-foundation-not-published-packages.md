# Distribute as a forkable Foundation, not published packages

Wylie Dog is distributed as a public template repository that adopters fork and own, not as versioned npm packages or a copy-in CLI. Adopters are solo designer-developers and very small teams who change tokens, components and structure to their own preference, so a package would force them to fight upstream versions and a brand (coral primary, warm neutrals) they intend to replace. The `@wyliedog/*` names stay as workspace-internal names and `packages/ui` no longer sets `publishConfig`.

## Considered Options

- **npm packages**: rejected. Semver, a release pipeline (removed October 2026) and support for unpinned versions, for code adopters are meant to modify.
- **Copy-in CLI (shadcn style)**: deferred. A second product to build and maintain; revisit if real adopters ask.

## Consequences

- Outside PRs are welcome for bug fixes, accessibility fixes and docs; new components and token changes need an issue and maintainer agreement first.
- Token Bridge stays in the repo but unadvertised: it is not in the README headline, the make-it-yours guide or the announcement until it has had a UX overhaul and an outside user's feedback. At launch the token contract is plain DTCG JSON that adopters sync with any DTCG-capable tool.
- Adopters rename the `@wyliedog/*` scope; a rename script belongs in a "make it yours" guide.
