# Auditing the showcase for accessibility and layout

`scripts/audit-showcase.mjs` runs axe-core over every showcase route and reports what a keyboard or screen-reader user, or a 375 pixel phone, would trip on. It is run by hand before a release; it is not part of CI.

## Running it

Build and start the showcase, then run the script from the repo root:

```bash
pnpm build
```

```bash
pnpm --filter showcase exec next start --port 3099
```

```bash
node scripts/audit-showcase.mjs
```

Options: `--base <url>` (default `http://localhost:3099`), `--only <regex>` to limit routes, `--json <file>` to keep the raw results.

It covers 12 routes (`/`, `/components`, `/patterns`, `/architecture`, `/plugin`, `/tokens` and its six subpages) in Light and Dark at 1280 and 375 pixels, 48 runs, using the axe tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` and `best-practice`. The theme is set through the `wd-theme` local-storage key the site itself uses.

The report lists violations by rule (nodes, runs, one example selector), horizontal page overflow with the offending elements that are not inside a scroll container, console errors and failed requests, pages without exactly one `<h1>`, images without `alt`, and the count of text nodes under 12px. The script exits 1 if any critical or serious violation or any horizontal overflow remains. The sub-12px count is information only; the type size policy belongs to Plan 212.

## Rules for new showcase markup

- Demo UI inside a page is not page structure: no `<main>`, no headings (use `<p>` with the same classes), no unlabelled icon-only buttons (give each an `aria-label` matching its icon).
- Scrollable wrappers (`overflow-x-auto`) around tables get `tabIndex={0}`, `role="region"`, an `aria-label` and a visible focus outline, so the keyboard can reach them.
- A grid that only gets columns at a breakpoint needs `grid-cols-1` below it; without it the single implicit column grows to its widest content and the page scrolls sideways.
- Text on a tinted or filled chip uses a declared pair from the semantic layer (`foreground-X` on `background-X`, for example `foreground-success-muted` on `background-success-muted`, or `foreground-primary` on `background-primary`), not a colour mixed from a transparent tint. `foreground-inverse` flips dark in Dark mode, so it is wrong on a fill that stays blue.
- Code and terminal mocks sit on a fixed dark ground: use `gray-400` for quiet text (6.82:1 on `#101828`, 7.32:1 on `#041215`), never `gray-500` (3.66 and 3.93).

## Decisions (owner, 2026-10-27, Plan 210)

1. **Icon-only demo buttons** get real accessible names (Previous, Next, Dismiss, Bold, Italic, Text style, Justify, Align right, Align right narrow, Continue with Google, GitHub and Apple); the home Select trigger is named "Theme". The demos stay keyboard-reachable.
2. **Heading order:** labels and headings inside mock UI become non-headings with unchanged classes (home hero card, a patterns error demo, the spacing demo card). The shared footer's `h3` column titles stay as they are in the UI package; the two token pages with an `h1` and no `h2` (`/tokens/elevation`, `/tokens/spacing`) get real `h2` section headings from their existing labels.
3. **Contrast** moves to declared pairs and a documented dark code palette, with no change of text size.
4. **The audit script is hand-run**, not wired into CI (that would need a showcase build, a server and Chromium in the workflow).

## Measured on 2026-10-27

Before: 134 `color-contrast` nodes in 26 runs, 56 `button-name` (critical), 16 `heading-order`, 8 `scrollable-region-focusable`, 4 each of `landmark-main-is-top-level`, `landmark-no-duplicate-main`, `landmark-unique` and `list`, and horizontal scroll at 375px on `/patterns` (394px) and `/tokens` (408px). After: none, on all 48 runs.

| Pair                       | Before        | After       |
| -------------------------- | ------------- | ----------- |
| Success chip, Light        | 4.40          | 5.48        |
| Blue chip, Light           | 4.27          | 6.15        |
| Warning chip, Light        | 1.69          | 5.92        |
| Neutral chip, Light / Dark | 3.45 / 3.05   | 7.26 / 9.06 |
| Text on blue fill, Dark    | 3.43 and 2.64 | 5.04        |
| Code captions on `#101828` | 3.66          | 6.82        |
| Code captions on `#041215` | 3.93          | 7.32        |

At 1280 pixels the before and after screenshots differ in 0.00 to 0.11% of pixels (the chip colours). At 375 pixels `/tokens` and `/patterns` reflow where they used to overflow.
