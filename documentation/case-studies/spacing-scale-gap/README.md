# Fixing a gap in the spacing scale — and watching the fix flow from code into Figma

**Origin:** Code investigation — found while auditing an existing feature
**Status:** In progress — code-side steps 1-4 complete, changeset step
intentionally skipped for this case study, commit/push and the Figma pull
(steps 6-7) still to come

> Wylie Dog is a design system: a shared library of colors, spacing, and
> components that keeps a product's design file and its code in sync. It's
> built with **design tokens** — named values like "space.200 = 16px" that
> both Figma and the codebase read from the same source, so a designer and an
> engineer are always looking at the same number. **Token Bridge** is a
> custom Figma plugin built for this project that pulls token changes from
> GitHub into the design file, run from inside Figma once a code change has
> been pushed.

## The problem

Wylie Dog's spacing scale — the set of approved gaps and padding sizes a
designer or engineer can pick from — has a real gap in it. The scale goes
0px → 1px → 4px → 8px → 12px → 16px... but there's no 2px option. That
matters more than it sounds: 2px is a genuinely useful size (a subtle
border offset, a tight icon gap), and its absence means someone needing it
either fudges a nearby value or breaks out of the system with a one-off
number — exactly the kind of small crack that erodes a design system's
credibility over time.

The 1px value that _does_ exist can't just be renamed to 2px, either —
it's already in real use (see Investigation), so it has to be preserved
under a new name while the "correct" name gets freed up for 2px.

## How it surfaced

Not from a bug report — from an accessibility-adjacent audit. Wylie Dog's
Storybook documentation includes an interactive "Spacing Playground" meant
to demonstrate every step of the token spacing scale live. While auditing
that page for accuracy, the step that should have represented 2px was
found to be silently missing — the scale's naming convention has a
placeholder at `025` for 1px, then jumps straight to `050` for 4px, with
nothing in between.

## The investigation

**Confirming it's a real gap, not a display bug.** The spacing scale lives
in `packages/tokens/io/sync/primitive.json` — the actual source of truth,
synced from Figma via Token Bridge. Checking it directly confirmed the gap
exists at the source: `space.025 = 1px`, next entry `space.050 = 4px`.
Nothing sits between them. This isn't a Storybook rendering issue; it's a
missing token.

**Why the scale's naming makes this confusing.** Most of the scale follows
a loose formula — key name ÷ 100 × 8px ≈ value (`space.200` = 2 × 8 = 16px,
`space.300` = 3 × 8 = 24px, and so on). Under that formula, `025` (0.25 ×
8 = 2px) _should_ be the 2px step. Instead it's being used as a 1px
"hairline" exception — a value the formula doesn't actually predict. The
scale was never perfectly mathematical to begin with (`space.700` is 64px,
not the 56px the formula would predict), but `025` is the one place the
exception and the "correct" formula value collide on the same name.

**Finding every place the current 1px meaning is actually used.** Before
touching anything, every reference to `space.025` across the token system
and codebase was traced, to know exactly what would break if its value
changed out from under it:

| Layer                                          | Reference                                       | Risk if `space.025` silently becomes 2px                                                       |
| ---------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `packages/tokens/io/sync/components.json:4635` | `scroll-area.scrollbar-padding` → `{space.025}` | The only real behavioral consumer. Scrollbar padding would silently double, 1px → 2px.         |
| `packages/tokens/io/sync/semantic.json`        | _(no references found)_                         | None — nothing at the semantic layer depends on this value.                                    |
| `apps/storybook/.../spacing.stories.tsx`       | `SPACING_SCALE_KEYS`, `playgroundSteps`         | Documentation only — needs updating to reflect the new meaning, not "fixed" to avoid breakage. |
| `apps/storybook/.../overview.mdx:330`          | Prose example citing `--space-025`              | Documentation only, same as above.                                                             |

One consumer, one place to update. Small, contained blast radius — which is
what made this a good first case study rather than a risky one.

**A second, unrelated scale already solves half this problem —
differently.** While tracing references, `primitive.json` turned out to
already contain a _separate_ `border-width` scale: `border-width.1` = 1px,
`border-width.2` = 2px, `border-width.4`, `border-width.8` — named by their
literal pixel value, not a scaled code. It's in active use: 6 references in
`semantic.json`, 72 in `components.json`. So the system had already solved
"how do you name a small dimension token" once, with a _different naming
philosophy_ than the spacing scale uses. That doesn't change where 1px/2px
_spacing_ values belong — `space` is the scale referenced everywhere
spacing is needed (795 aliases in `components.json` alone, versus
`border-width`'s narrower structural-border use) — but it means this fix
sits next to a naming inconsistency worth naming out loud, not pretending
the eventual choice happened in a vacuum.

## The fix

**Naming decision:** reclaim `025` for its formula-correct value (2px), and
move the existing 1px hairline value to a new key, `010` — chosen over the
more literal `001` because it visually matches the digit-width of its
neighbors (`010`, `025`, `050`) rather than reading like an unrelated ID,
while still sorting correctly before `025` both numerically and
alphabetically.

**Why this approach over the alternatives considered:** the other options
on the table were (a) inserting an odd new key like `037` for 2px and
leaving `025` alone, or (b) not touching the spacing primitives at all and
handling 2px as a one-off component exception. Both were faster, but both
would have left the underlying naming confusion in place for the next
person who hits it. This fix is more work — it's a rename with an audit
attached, not just an addition — but it's the one that actually resolves
the root problem instead of routing around it.

**Steps, in order** (code is the origin here — Figma catches up to it, not
the other way around; Token Bridge pulls from GitHub into Figma on demand,
it doesn't push automatically):

1. In `packages/tokens/io/sync/primitive.json`, add a new `space.010` entry
   (value 1px), and change the existing `space.025` entry's value from 1px
   to 2px (name stays the same — only the value changes).
2. In `packages/tokens/io/sync/components.json`, repoint
   `scroll-area.scrollbar-padding` from `{space.025}` to `{space.010}`, so
   its rendered padding stays 1px instead of silently doubling.
3. Rebuild tokens locally to verify: `pnpm --filter @wyliedog/tokens build`
   — check the Storybook Spacing Playground and the scroll area's rendered
   padding before pushing anything.
4. Update the two Storybook-only references (`SPACING_SCALE_KEYS`,
   `playgroundSteps` in `spacing.stories.tsx`, and the `overview.mdx`
   prose example) to include `010` and reflect `025`'s new value.
5. _(Skipped for this case study — no external consumers depend on this
   repo's published version yet, so a real release changeset wasn't
   necessary here. In a shipping design system, this step is not
   optional: a Changeset marking a **major** version bump for
   `@wyliedog/tokens` would be required, since `space.025`'s raw exported
   value is changing meaning — a breaking change for anyone importing
   `spacing["025"]` directly rather than through a semantic/component
   token.)_
6. Commit and push to GitHub.
7. In Figma, run Token Bridge to pull the updated `primitive.json` from
   GitHub — this creates the new `010` variable and updates `025`'s value,
   bringing the design file in line with what code now says.

## Proof it works

_To be filled in after the fix is run:_

- Screenshot of the Figma `space` collection, after running Token Bridge's
  GitHub pull, showing both `010` (1px) and `025` (2px) as distinct
  variables — confirming the design file caught up to the code change.
- Before/after screenshot of the Storybook Spacing Playground showing the
  new `010` step alongside the corrected `025` step.
- Before/after screenshot or measurement of the scroll area's scrollbar
  padding, confirming it's still 1px after the repoint (not silently 2px).
- Output of `packages/tokens`' own `pnpm audit` script
  (`scripts/audit-tokens.js`) run before and after, as an automated check
  that nothing else in the token set got missed.

## Why this matters

This is really a story about what "the tokens are the source of truth"
costs in practice, not just what it promises. It would have been faster to
just add a 2px value somewhere and move on — but that would have left a
key whose name lied about its value, and the next engineer or designer to
touch it would've inherited the same confusion, one layer deeper. The
audit step — tracing every real consumer before changing a value that
already means something — is the actual engineering work here, and it's
exactly the kind of quiet, unglamorous rigor that keeps a design system
trustworthy as it grows. It's also a clean demonstration of the system's
two-way promise: a fix made in code, verified against real component
usage, flows cleanly back into the design file a designer works in every
day — not just the other way around.

---

_Screenshots and other artifacts for this case study live in `before/` and
`after/` subfolders next to this file._
