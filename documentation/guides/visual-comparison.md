# Comparing Storybook before and after a change

`scripts/visual-compare.mjs` screenshots every story in two static Storybook builds, in Light and Dark, and reports the stories that differ. Use it for changes that should not alter how anything looks (a token restructure, a rename, a refactor) and to find out what a change that should alter things actually altered.

It is separate from the Playwright baselines in `tests/visual.spec.ts`: those compare one build with stored images; this compares two builds with each other and stores nothing in the repo.

## Build the two Storybooks

Build the base and the change from separate checkouts, so neither build touches your working tree. From the repository root, with `main` as the base:

```bash
git worktree add --detach /tmp/sb-base main
```

```bash
cd /tmp/sb-base && pnpm install --frozen-lockfile && pnpm exec turbo run build --filter="storybook..."
```

Build the branch you are testing the same way (in its own worktree, or in your checkout). Each build leaves `apps/storybook/storybook-static`. Unset `NODE_ENV` first if your shell sets it. Remove the base worktree afterwards with `git worktree remove --force /tmp/sb-base`.

## Prove the noise first

Some stories differ from one load of the same build to the next: interaction stories with timers, play functions that move focus, fonts that load late. Compare the base build with itself before trusting a difference:

```bash
pnpm visual:compare --noise /tmp/sb-base/apps/storybook/storybook-static --label base-noise
```

`--noise` serves the one build twice and compares it with itself. Any story that differs here is noise. A story that differs between base and change and is not in this list is a real change.

## Compare base with change

```bash
pnpm visual:compare /tmp/sb-base/apps/storybook/storybook-static apps/storybook/storybook-static --label my-change
```

The summary prints on stdout: stories compared, shots (two per story), shots that differ, stories that differ, and the stories present in only one build. `results.json` and an `__a.png` / `__b.png` pair for every differing shot are written to `/tmp/visual-compare/<label>` (change it with `--out`).

Options:

- `--only=<regex>` limits the run to story ids that match. Write it with `=`, because a value that starts with a hyphen is read as an option, for example `--only=-button--`.
- `--threshold=<percent>` sets how much of a screenshot must differ before it counts (default `0.2`).

## How a shot is compared

Each story loads in an 800 by 600 viewport with the theme global set (`globals=theme:light` or `theme:dark`), animations and transitions disabled, and a short settle wait. The PNGs are compared pixel by pixel; a pixel counts as different when any colour channel differs by more than 8. A shot of a different size counts as 100 percent different.
