---
target: /tokens sub-page family (hub + colors/spacing/typography/borders/elevation/motion) - re-critique
total_score: 27
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-09-08T15-55-29Z
slug: apps-showcase-src-app-tokens
---

Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                                                                                                                                                                                                                  |
| --------- | ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Active pill in lateral nav + hub's scroll-spy both confirmed working via live click-through                                                                                                                                                                                                                |
| 2         | Match System / Real World       | 3         | Content now token-accurate on 5/6 pages; `/tokens/colors`' new blank Shadow/Duration/Easing swatches break this on the 6th                                                                                                                                                                                 |
| 3         | User Control and Freedom        | 3         | "All Tokens" back-link + 6-page lateral nav confirmed functional (Colors→Motion→Spacing→Radius→Elevation→Typography click-chain tested live)                                                                                                                                                               |
| 4         | Consistency and Standards       | 2         | Outer shell (breadcrumb/eyebrow/headline/nav) now byte-identical across all 6 pages — that gap is closed. Inner content styling still split: colors/typography use `Card`/glass panels, spacing/borders/elevation/motion use plain bordered boxes — a smaller, un-addressed inconsistency one layer deeper |
| 5         | Error Prevention                | 2         | Same fabrication pattern flagged (and fixed) for spacing in the last critique recurs: the hub's elevation ladder still hardcodes `--shadow-xs`, which doesn't exist in the real token set                                                                                                                  |
| 6         | Recognition Rather Than Recall  | 3         | Token names, values, variables shown side by side throughout                                                                                                                                                                                                                                               |
| 7         | Flexibility and Efficiency      | 2         | No search/filter anywhere; colors page's 143-swatch grid and spacing's 22 flat rows have no way to jump to a specific token                                                                                                                                                                                |
| 8         | Aesthetic and Minimalist Design | 3         | Generally clean; legible at desktop width                                                                                                                                                                                                                                                                  |
| 9         | Error Recovery                  | 3         | Static content, nothing to recover from                                                                                                                                                                                                                                                                    |
| 10        | Help and Documentation          | 3         | Per-token descriptions present where the manifest supplies them                                                                                                                                                                                                                                            |
| **Total** |                                 | **27/40** | **Acceptable (68%)**                                                                                                                                                                                                                                                                                       |

## Trend for `apps-showcase-src-app-tokens`

**21/36 (58%, first run) → 27/40 (68%, this run)** — different heuristic maxima (heuristic 9 was `n/a` last time, scored this time), so not a strict apples-to-apples number, but both land in the "Acceptable" band on a percentage basis, moved up meaningfully.

## Design Specificity Verdict

**LLM assessment**: Elevation and motion genuinely no longer duplicate the hub — confirmed both in source and live rendering. `/tokens/elevation` iterates `manifest.semantics.shadow` (7 real entries) with live `boxShadow` previews; `/tokens/motion` pulls real easing/duration data plus a reduced-motion-respecting interactive demo. This is real, substantive progress on the top-priority finding from the first run.

But the same manifest expansion that made this possible **introduced a new regression**: `/tokens/colors`' semantic-mapping loop iterates every non-empty `manifest.semantics.*` group generically, so it now also picks up the newly-exposed `shadow`, `duration`, and `easing` groups and tries to render them as color swatches (`backgroundColor: var(--shadow-sm)`, `var(--transition-duration-instant)` — invalid CSS for a background). Confirmed live: blank/hollow cards under headings literally labeled "Shadow Sm," "Transition Duration Instant" on a page about color.

A second, independent regression: **the hub's static headline copy now disagrees with its own sub-pages' real counts.** Hub: "**Five** shadow steps — one stacking story." / Sub-page: "**7** shadow steps." Hub: "**Four** curves and **three** durations cover everything." / Sub-page's own table: 4 durations, not 3. The sub-pages now correctly enumerate real data; the hub's hand-written headline text was never updated to match.

**Deterministic scan**: 0 findings across all 8 files (7 pages + the new shell component) — the previously-flagged `layout-transition` hit on the spacing bar chart is confirmed gone (the `scaleX()` fix landed as claimed).

**Visual overlays**: Partial — the browser pane again reported "hidden" intermittently (same environment issue as the first run), so screenshots for elevation/motion/typography specifically could not be captured; DOM/text extraction substituted reliably for those three. Clean screenshots were captured for the hub, colors, spacing, and borders, confirming the lateral nav's active-pill highlighting renders correctly.

## Overall Impression

The top-priority fix from the first run — elevation/motion no longer being verbatim hub copies — genuinely landed, and the shell unification closed the "typography and elevation don't match" complaint at the structural level (breadcrumb, eyebrow, headline, nav are now identical across all 6). But this pass surfaces the next layer down: the same class of problem (fabricated/stale token references, generic-loop side effects) recurred in two new spots the moment the underlying data model changed. The pattern to watch going forward: every time `manifest.json`'s shape changes, anything that iterates it generically (like the colors page's semantic loop) needs re-auditing, not just the page that motivated the change.

## What's Working

1. Elevation and motion are now honest, complete references — real data, live shadow previews, a working interactive motion demo that respects `prefers-reduced-motion`.
2. The shared `TokensSubpageShell` genuinely unifies the outer chrome across all 6 pages — verified live, not just in source.
3. Typography's restructure (24-row triplicated list → one matrix table, sizes as rows / families as columns) is a real cognitive-load win, with genuine `scope="col"`/`scope="row"` table semantics.

## Priority Issues

**[P1] `/tokens/colors` renders broken swatches for Shadow/Duration/Easing tokens.** The page's generic semantic-group loop wasn't scoped to color-typed tokens after Plan 106 exposed shadow/duration/easing in the same `manifest.semantics` object. Live, user-visible bug on the page most likely to be screenshotted. Fix: filter the colors page's semantic-mapping loop to `token.type === "color"` (or iterate only the known color-role groups) instead of iterating every key in `manifest.semantics`.

**[P1] Hub and sub-page headline copy disagree on token counts.** Hub: "Five shadow steps" vs. sub-page's real 7; "Four curves and three durations" vs. sub-page's real 4 durations. Fix: make the hub's headline pull the live count from the manifest (matching how the sub-pages already do it) instead of a hand-typed number, so this can't drift again — the same fix pattern Plan 112 already applied to the Composed-tokens callout.

**[P2] Hub's elevation ladder hardcodes a fabricated `--shadow-xs` token.** Real shadow tokens are `none/sm/base/md/lg/xl/inner` — there is no `xs`. Same fabrication class Plan 112 fixed for spacing, missed here because it's on the hub, not the sub-page that was in scope.

**[P2] `/tokens/colors` has a leftover extra `max-w-7xl p-4 lg:p-8 xl:p-12` wrapper around just "Primitive Palettes"**, visually indenting that section relative to the header and "Semantic Mapping" below it — copy-paste residue from before the shared shell existed.

**[P3] Inner content styling still two visual languages under one shell** — colors/typography use `Card`/glass panels, spacing/borders/elevation/motion use plain bordered boxes with mono labels. The shell fix closed the outer-chrome gap, not this one.

**[P3] Typography's new matrix table has a heading-order regression** — `CardTitle` renders as `<h3>`, and "Size scale"/"Weights"/"Attributes" are nested as sibling `<h3>`s under it rather than `<h4>`s, reintroducing the heading-order pattern this project's own accessibility notes flag as a recurring root cause.

**Minor, informational**: two different primitive spacing tokens, `--space-1700` and `--space-1800`, both resolve to `576px` — a possible source-data duplicate, outside any single page's responsibility to fix, worth a quick sanity check upstream.

## Persona Red Flags

**Jordan (first-timer)**: reads the hub's Elevation blurb ("Five shadow steps"), clicks through, sees a 7-row table — the mismatch reads as either the hub or the reference being wrong, undermining trust right after the previous run's exact failure mode was supposedly fixed.

**Alex (power user)**: opens `/tokens/colors` for a quick token lookup, sees three broken/blank cards under "Shadow Sm," "Transition Duration Instant" — on the one page in the family that previously scored well, a new visible defect.

## Questions to Consider

- Since two of this run's issues are the _same class_ of bug as the first run's headline finding (a page trusting the manifest's shape without validating it fits that page's assumptions) — is a small shared "manifest field guard" (a type check before rendering any manifest-driven swatch/value) worth adding once, rather than re-discovering this per page?
- Now that 5 of 6 sub-pages are genuinely solid, is the remaining inner-content style split (Card/glass vs. plain-box) worth its own follow-up, or is "good enough, ship it" the right call at this point given diminishing returns?
