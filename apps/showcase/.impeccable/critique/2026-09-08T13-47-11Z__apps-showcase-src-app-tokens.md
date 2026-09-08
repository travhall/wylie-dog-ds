---
target: /tokens sub-page family (hub + colors/spacing/typography/borders/elevation/motion)
total_score: 21
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 1
timestamp: 2026-09-08T13-47-11Z
slug: apps-showcase-src-app-tokens
---

Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                                                                                                                                                                                                                                                  |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of System Status     | 2         | No page indicates where you are within the 6-page family beyond a static eyebrow label; the hub's sticky scrollspy subnav has no sub-page counterpart.                                                                                                                                                                                     |
| 2         | Match System / Real World       | 3         | Token names, OKLCH math, role-based descriptions are domain-accurate throughout.                                                                                                                                                                                                                                                           |
| 3         | User Control and Freedom        | 2         | Only one exit per sub-page ("← All Tokens"); no lateral jump to a sibling category, no in-page anchors on longer pages.                                                                                                                                                                                                                    |
| 4         | Consistency and Standards       | 1         | Confirmed split: colors/spacing/typography/borders share one header structure (numbered eyebrow, `text-4xl sm:text-5xl` h1, `space-y-16` wrapper); elevation/motion share a visibly different, simpler one (unnumbered eyebrow, `text-3xl sm:text-4xl` h1, `space-y-12` wrapper, extra `max-w-2xl` constraint). No shared template exists. |
| 5         | Error Prevention                | 3         | Static reference content, low error surface, no broken states found.                                                                                                                                                                                                                                                                       |
| 6         | Recognition Rather Than Recall  | 2         | Elevation/motion are literal restatements of the hub — a user who already read the hub gets zero new recognition cues, only "haven't I seen this?"                                                                                                                                                                                         |
| 7         | Flexibility and Efficiency      | 2         | No token search/filter, no copy-to-clipboard, no anchor jump links on any sub-page.                                                                                                                                                                                                                                                        |
| 8         | Aesthetic and Minimalist Design | 2         | Typography page repeats a full 8-size list under each of 3 font families — 24 near-identical rows with no visual differentiation between families.                                                                                                                                                                                         |
| 9         | Error Recovery                  | n/a       | No error states in scope for static reference pages.                                                                                                                                                                                                                                                                                       |
| 10        | Help and Documentation          | 2         | No page explains how to consume a token (which CSS var / Tailwind class); the hub's own "Composed tokens" callout (`--space-card-padding` etc.) isn't carried onto `/tokens/spacing` at all.                                                                                                                                               |
| **Total** |                                 | **21/36** | **Acceptable (58%)**                                                                                                                                                                                                                                                                                                                       |

Heuristic 9 scored n/a (no error states exist on static reference pages); total renormalized to /36.

## Design Specificity Verdict

**LLM assessment**: The maintainer's complaint is accurate, and `/tokens/elevation` is worse than "similar to" the hub — it is a near-verbatim copy-paste of the hub's elevation section (identical JSX structure, identical demo copy: "packages/ui"/"Button.tsx", "View changelog/Copy token/Open in Figma", "Tokens published · v1.4.1", the "Invite teammate" form, and the full 5-step elevation ladder). `/tokens/motion` is thinner still — 36 lines total, its only content is the exact same `<MotionPreview />` instance the hub already renders, with zero token enumeration despite the hub's CTA promising "All 11 motion tokens →."

By contrast, `/tokens/colors`, `/tokens/typography`, and `/tokens/borders` do real deep-reference work: they read `@wyliedog/tokens/manifest.json` and enumerate every primitive/semantic token programmatically — content that exists nowhere on the hub. `/tokens/spacing` is a partial case: it also renders the hub's own `<SpacingDemo />` before adding a genuinely new raw-primitives list.

Root cause, confirmed against the actual data: `packages/tokens/dist/manifest.json`'s `primitives` object contains `colors`, `spacing`, `borderRadius`, `borderWidth`, `typography` — but no `shadow` or `motion`/`duration`/`easing` entries. Colors/typography/borders had a ready-made enumeration source to build a real sub-page from; elevation/motion didn't, and the path of least resistance was reusing the hub's JSX instead of hand-authoring a token table.

**Deterministic scan**: The bundled detector's regex pass (Puppeteer-based render scanning was unavailable in this environment — not installed) found exactly one finding across all 7 files: `apps/showcase/src/app/tokens/page.tsx:820`, a `transition: width` animation on the spacing-scale bar chart (real match for the "layout-transition" anti-pattern — animating `width` causes layout thrash; low-severity given it's a small decorative bar, but a legitimate, fixable finding). No other automated hits on any of the 6 sub-pages — the redundancy problem is a content/IA issue, not something a markup-pattern scanner can catch.

**Visual overlays**: Not available this run — the browser pane rendered hidden throughout Assessment B's session (screenshots returned blank). Assessment B substituted DOM/text extraction, which reliably confirmed the elevation/motion pages' body text is **word-for-word identical** to their hub sections, and quantified the two-pattern header split above — but cannot catch a purely pixel-level defect (color rendering, misalignment). No visual defects were found by the methods available, with that caveat.

## Overall Impression

Four of six sub-pages do their job well: manifest-driven, self-updating, genuinely deeper than the hub. Two of six (elevation, motion) don't do their job at all — they restate the hub verbatim, which breaks the implicit promise every "All N tokens →" link makes and, once a reader is burned by one, erodes trust in the other five. The single biggest opportunity is closing the manifest gap (no shadow/motion primitives exist in the token data) so those two pages can do the same enumeration the other four already do — that's both the content fix and the consistency fix in one move, since a shared enumeration pattern naturally produces a shared layout.

## What's Working

1. **Manifest-driven enumeration** on colors/typography/borders is a strong pattern — system-derived, self-updating as tokens change, does real reference work no hub-length page could.
2. **The hub's tier explanation** (Primitive → Semantic → Component with a live "Renders →" example) is a specific, well-composed piece of IA worth protecting — and worth echoing (a one-line "Tier N primitive" tag per token) rather than duplicating on sub-pages.
3. **The elevation demo's honest-stacking-order concept** is genuinely good design — it just needs to exist in one place, referenced from the other, not pasted twice.

## Priority Issues

**[P0] Elevation and motion sub-pages are verbatim duplicates of their hub sections, not deeper references**

- **Why it matters**: this is the most visible violation of what a sub-page is for, and it undermines trust in the four sub-pages that do work correctly.
- **Fix**: expose `shadow` and `motion` (duration/easing) as manifest primitives, mirroring how `borderRadius`/`borderWidth` already work, so both pages can enumerate real token data — a full table of all 5 shadow tokens with raw box-shadow values + the dark-mode override behavior (currently only mentioned in a hub aside, never surfaced on the sub-page), and the actual ~13+ motion tokens (4 easing + 4 semantic durations + the raw 0–1000ms scale), not just the 4×4 grid the interactive demo happens to expose.
- **Suggested command**: `/impeccable shape` (plan the manifest + page restructure) or `/impeccable distill` (once content exists, strip the copy-pasted demo down to what's sub-page-appropriate).

**[P1] No shared sub-page template — six independently-built layouts split into two inconsistent patterns**

- **Why it matters**: this is the "typography and elevation don't match" complaint stated precisely (confirmed by DOM comparison: 4 pages share one header shape, 2 share a visibly smaller/simpler one), and it means every future token category gets built ad hoc again.
- **Fix**: extract one shared layout shell (numbered eyebrow matching hub numbering, consistent `h1` sizing, a consistent primitive-table component, a consistent "Composed/semantic usage" callout), then re-skin all 6 pages onto it, keeping their content differences.
- **Suggested command**: `/impeccable layout`, then `/impeccable extract` to pull the shell into a reusable component.

**[P2] Typography sub-page repeats a full 8-size list under each of 3 font families — a 24-row wall**

- **Why it matters**: a reader scanning for "what's the Mono scale" must visually parse past two other families' worth of near-identical rows first — a textbook cognitive-load "wall of options" failure.
- **Fix**: restructure to a single 8-row size scale with a family switcher/tabs, or a matrix (sizes × families) instead of three sequential full lists.
- **Suggested command**: `/impeccable distill`, then `/impeccable layout`.

**[P2] No lateral navigation between sibling sub-pages**

- **Why it matters**: fails "user control and freedom" — a reader two levels into Spacing has no way to jump to Radius without returning to the hub and re-finding the section; worse than the hub itself, which has a persistent scrollspy subnav.
- **Fix**: add a lightweight, persistent cross-links row (prev/next category or a compact 6-item pill nav) reusing `SectionSubnav`'s visual language, pointing at sibling routes instead of hub anchors.
- **Suggested command**: `/impeccable layout`.

**[P3] Sub-pages don't inherit the hub's most useful supplementary content**

- **Why it matters**: inverts the expected information gradient — the "quick overview" hub has content (e.g. spacing's "Composed tokens" callout: `--space-card-padding`, `--space-input-x`, `--space-stack-sm`) that the "deep reference" sub-page lacks.
- **Fix**: audit each hub section for callouts/asides not yet mirrored on its sub-page, migrate (not duplicate) them so the hub stays lean and the sub-page stays complete.
- **Suggested command**: `/impeccable clarify`.

**[P3] `transition: width` layout-thrash pattern on the hub's spacing bar chart**

- **Why it matters**: minor performance smell (animating `width` triggers layout recalculation); low severity given the small element, but free to fix.
- **Fix**: swap to `transform: scaleX()` with a fixed-width track, or `grid-template-columns` animation.
- **Suggested command**: `/impeccable optimize`.

## Persona Red Flags

**Alex (Power User / reference lookup)**: Alex opens `/tokens/motion` specifically to find the exact `--duration-*` scale values for a component they're building. They find only the same 4-curve interactive demo already seen on the hub — no table, no copy-to-clipboard, no way to scan all values at once. Alex leaves and greps the CSS source directly instead of trusting the docs site.

**Jordan (First-timer learning the system)**: Jordan reads the hub top to bottom, then dutifully clicks "All 9 shadow tokens →" expecting to learn more. They get word-for-word the same content. Jordan now second-guesses whether the other four "All N tokens →" links are worth clicking at all — one bad link poisons trust in the pattern site-wide.

**Sam (Accessibility-dependent / structured scanning)**: Sam uses a screen reader to navigate the typography page by heading. The 24-row repeated size list under 3 families offers no distinguishing heading structure between families beyond a small caption — Sam cannot skip-navigate to "just the Mono scale" without reading through Sans and Serif's full 8 rows first via linear tab order.

## Minor Observations

- The elevation/motion header pattern's extra `max-w-2xl` wrapper (absent on the other 4 pages) is a small but visible tell that these two were copy-pasted from the hub's own section markup (which uses that same wrapper for its narrower two-column layout) rather than authored for a full-width sub-page.
- Puppeteer isn't installed in this environment, so the detector's URL/render-based scan mode is unavailable — worth adding to the repo's dev dependencies if `/impeccable audit`/`critique` will be run again, since it catches rendered-CSS issues the regex pass can't.

## Questions to Consider

- If the hub's job is an inviting overview and the sub-page's job is the complete reference, why do the hub's Spacing/Motion sections contain interactive demos heavier than four of the six actual sub-pages? Should those demos move to the sub-pages and the hub show a lighter static teaser instead?
- Would a single unified `/tokens/[category]` dynamic route — driven by manifest data plus a small per-category config for copy/demo — eliminate this consistency problem structurally, instead of relying on six hand-maintained files staying in sync by discipline alone?
