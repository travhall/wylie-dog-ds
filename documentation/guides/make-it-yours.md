# Make it yours

Wylie Dog is a Foundation: you take the repository and own it. This guide is the path from a fresh fork to a system that is yours. Do the steps in order and run the [guardrails](guardrails.md) after each one, so you always know which change broke what. Terms are in the [glossary](../../GLOSSARY.md).

## 1. Fork or use the template

Use the GitHub "Use this template" button, or fork. Then install and confirm a clean baseline:

```bash
pnpm install
pnpm build
pnpm check:tokens
pnpm check:contrast
pnpm test
```

Everything should pass before you change anything. If it does not, that is a bug worth reporting.

## 2. Rename the package scope

The packages are named `@wyliedog/ui` and `@wyliedog/tokens`. Replace the scope everywhere with one command. Preview first:

```bash
node scripts/rename-scope.mjs @your-scope --dry-run
node scripts/rename-scope.mjs @your-scope
pnpm install
pnpm build
```

The script rewrites tracked text files only and does not touch the script itself. It does not rename `wylie-dog-ds`, `wyliedog.com`, the Storybook domain or the visible brand, so search for `Wylie Dog` and `wyliedog` afterwards.

## 3. Swap the brand tokens

Tokens live in `packages/tokens/io/sync/` as `primitive.json`, `semantic.json` and `components.json`. In this project's three-tier standard:

1. **Primitive tokens** hold the raw values. Replace the color scales (`fiery-coral`, `polar-night` and the rest) with your own, and adjust the type, spacing and radius scales.
2. **Semantic tokens** give those values roles, such as `color.background.primary`. Repoint a role at your scale rather than renaming it, and the components follow.
3. **Component tokens** bind a component to a semantic token. Leave these alone unless a component should look different from its role.

Rebuild and check after each batch:

```bash
pnpm --filter @wyliedog/tokens build
pnpm check:tokens
pnpm check:contrast
```

`check:contrast` is the one to watch: it fails when a foreground and background pair no longer reads in Light or Dark. See the [token pipeline](../tokens/token-pipeline.md) and the [semantic pairing model](../tokens/semantic-pairing-model.md) for how the layers relate.

## 4. Change the structure if you want to

The three-tier hierarchy is this project's standard, not a requirement. If your team prefers a different shape, the token files are DTCG JSON and yours to restructure. The guardrail that encodes the standard is `check-token-structure.mjs`; rewrite or delete it first, then adjust the others in the [guardrails catalog](guardrails.md) that reference token names.

## 5. Keep the components you need

A component is more than its source file. It is spread across:

- the file in `packages/ui/src` and its test in `packages/ui/src/__tests__`
- its story under `apps/storybook/stories/Components`
- its `exports` entry in `packages/ui/package.json`
- its `<name>.*` component tokens in `packages/tokens/io/sync/components.json`
- its entry in `.size-limit.json`
- every other component or story that imports it. Find them with `git grep -l "ui/<name>"`; a Separator, for example, is used by ten other stories.

Use `git rm` so the guardrails, which list tracked files, stop seeing it. Remove the tokens, rebuild them (`pnpm --filter @your-scope/tokens build`), then run `pnpm build`, `pnpm test` and `pnpm check:docs`. The last one fails until the README component count matches the story count, which is how you know you got them all.

To add one, `pnpm generate:component <name>` scaffolds the file, test and story and updates the exports.

## 6. Remove what you do not use

| If you do not want | Remove                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The showcase site  | `apps/showcase`; `check-showcase-palette.mjs` and `check-showcase-theme.mjs` from the `check:tokens` script in `package.json`; `--filter=showcase` from `.github/workflows/test.yml` (turbo fails on an unknown package); the `dev:showcase` script and the `showcase#dev` entry in `turbo.json`; and any link into it that `check:docs` reports, such as the one in `documentation/STYLING_ARCHITECTURE.md`                                                 |
| A Figma library    | `figma/`, `scripts/check-figma-parity.mjs`, `scripts/figma-parity.config.json` and `scripts/figma/`; the `check:figma-parity` and `compare:ui` scripts in `package.json`; the parity step in `.github/workflows/build.yml`; the tests that cover them, which fail otherwise: `check-figma-parity.test.mjs`, `figma-manifest.test.mjs` and the Icon glyphs test in `icon-glyphs.test.mjs`; and `.claude/skills/wylie-dog-figma`, the maintainer's Figma skill |
| The Netlify config | `netlify.toml`; point your own hosting at `apps/storybook/storybook-static`                                                                                                                                                                                                                                                                                                                                                                                  |

Use `git rm -r` for every removal. The guardrails list tracked files, so a file you only deleted from disk still counts and they fail with `ENOENT`.

After each removal, run `pnpm check:tokens`, `pnpm check:docs` and `pnpm test:scripts`, and fix what they report.

## 7. Make the docs yours

Replace the README, the glossary and the Storybook introduction pages. `check:docs` fails when a doc quotes a count, version or token that no longer exists, so stale text does not survive a change quietly. Add your own decisions as ADRs in `docs/adr/`.
