# A design system that said it passed accessibility, until something measured it

**Origin:** Code investigation — found while auditing an existing feature
**Status:** Draft — see "Open items for this draft" at the bottom

> Wylie Dog is a design system: a shared library of colors, spacing, and
> components that keeps a product's design file and its code in sync. Its
> colors are **design tokens** — named values such as "text-tertiary" that every
> component reads from one place, so changing a token changes it everywhere.
> **Storybook** is the workshop where each component is shown and tested on its
> own page (a "story"). **WCAG** (the Web Content Accessibility Guidelines) is
> the international standard for accessible web content. Its **AA** level asks
> that normal-size text have a **contrast ratio** of at least 4.5:1 against its
> background (a scale that runs from 1:1, invisible, to 21:1, black on white),
> so that people with low vision or in bright light can read it.
> **axe** is an open-source tool that measures this automatically.

## The problem

The design system's text colors looked fine and its own documentation said they
were fine. They were not. Gray caption text in light mode measured 3.65:1, and
the blue link color in dark mode measured 3.81:1, both below the 4.5:1 minimum.
Anyone with low vision, or anyone reading on a phone in sunlight, would have
struggled with exactly the text designers use for hints, captions and links.
Nobody had noticed, because the failing text was still readable on a good
monitor, and the system's own contrast page carried a green "AA" badge on every
pair.

## How it surfaced

Storybook has an Accessibility panel that runs axe against whatever story is
open. Opening the Colors page in light mode, the panel reported one serious
"color contrast" violation on 35 elements. The cause was the same on all of
them: 12-pixel caption text in the `--color-text-tertiary` token, a gray of
`#828487` on a near-white `#fbfcfe` page. Switching the Storybook theme to dark
and opening the typography page produced a second one: the link color
`#2563eb` on `#080b10`, measured at 3.81:1.

The part that stung was the page documenting the problem. A story called
"Color contrast — semantic token pairs" listed each text color on its
background with a green AA badge. The badges were typed in by hand. The
page's own footnote said they "reflect design intent." The design system was
claiming a result nobody had measured.

## The investigation

**Light mode was one number.** The tertiary text token had a lightness of 0.613
in the OKLCH color notation the tokens use. Darkening it to 0.52 moved the
contrast from 3.65:1 to 5.37:1 and fixed all 35 places at once, because every
caption read the same token. This is what tokens are for, and it happened on
2026-07-03.

**Then the check had to become permanent.** An accessibility panel that
someone has to remember to open is a suggestion. The test setup already ran
axe over every story, but only as a warning. Switching it to a failure meant
86 story tests failed at once. They fell in two passes: 86 to 63 by fixing
colors, then 63 to 0 by fixing structure. The structural failures were more
instructive than the colors. The most common was a dropdown that showed
readable text on screen but had no name a screen reader could announce, because
the ARIA rules for that kind of control do not let a name come from its
visible text. Icon-only buttons with no label, and links that looked disabled
but could still be tabbed to, were the next most common. All 411 stories
passed, and the check became blocking for good.

**The blind spot was the mode.** Everything above ran in light mode. The test
runner was told to repeat the whole suite in dark mode on 2026-07-05. It
produced 264 failures in 55 story files, all contrast.

It would be easy to read that as 264 separate bugs. It was one mistake. The
system has a token called `text-inverse`, built to flip with the theme so it
always contrasts with the inverted background it sits on, which is its one
correct use, in tooltips. Twelve other tokens, for buttons, badges, toasts, the
selected calendar day and similar, had borrowed it for text sitting on a
saturated blue, green, orange or red fill that does not change with the theme.
In dark mode `text-inverse` flipped to near-black while the fill stayed blue:
near-black text on blue, at 3.42:1 to 3.67:1.

The fix was to add a different token for a different job. `text-on-solid` is
near-white in both modes and was checked against all four fills: 5.04:1 on the
blue, 4.89:1 on the green, 5.06:1 on the orange and 4.71:1 on the red. The
twelve consumers were repointed to it. That alone took the dark run from 264
failures to 205, and four more rounds the same day closed the rest, including
two token bugs nobody had known about.

## The fix

Two decisions shaped it:

- **Fix the token, not the story.** Where a failure came from a token used for
  the wrong job, the repair was to the token and its consumers, so every
  product built on the system inherits it. Story-only fixes were reserved for
  demos that had their own wrong color choices.
- **Say what was left.** Decorative uses of white and black (avatar borders, a
  play-button overlay, a modal backdrop) were left alone, and three uncertain
  cases were noted for follow-up rather than guessed at.

## Proof it works

|                                                      | Before                    | After                                                                               |
| ---------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| Light caption text (`text-tertiary`)                 | 3.65:1 on 35 elements     | 5.37:1                                                                              |
| Dark link color on the page                          | 3.81:1 (panel: "serious") | 8.09:1 today (measured live); July's fix was verified by the dark suite going green |
| Text on a blue, green, orange or red fill, dark mode | 3.42:1 to 3.67:1          | 4.71:1 to 5.06:1                                                                    |
| Story tests failing in dark mode                     | 264 across 55 files       | 0                                                                                   |
| Accessibility check                                  | advisory                  | blocking, in light and dark                                                         |

The July numbers come from the commits and the measurements above. The
`after/` screenshots were recaptured on 2026-11-03 from today's Storybook, so
they show the current palette and names (coral, `foreground.faint`), not
July's blue. They prove the same thing at today's state:

- **`before/`** shows the Accessibility panel reporting each failure: `06` the
  light caption text on 35 elements, `05` the dark link at 3.81:1, and `03`
  the contrast page with its hand-typed AA badges.
- **`after/05` and `after/06`** show the same panel on the same two stories,
  dark and light, reading "No accessibility violations found" (0 violations,
  4 passes in dark and 18 in light).
- **`after/03`** is the contrast page in dark mode with every ratio measured
  from the rendered colors: body text 18.67:1, muted text 12.30:1, error text
  7.31:1, link 8.09:1.
- **`after/01`, `02`, `04`, `07`** are the pages themselves in both modes, and
  **`08`, `09`** the showcase home page.

## Epilogue: what it became

This was written from July's state of the system, so the names have moved on.
`text-tertiary` is now `foreground.faint`; `text-on-solid` was replaced by the paired
`foreground.*` tokens; the blue primary became coral (see the primary-color
case study). What lasted is the idea the July fix proved.

- **The contract is checked on every change.** A script, `pnpm check:contrast`,
  reads a list of declared text-and-background pairs and checks each in light
  and dark. It currently covers 158 text colors and 516 checks, and it fails on
  any component text color that is neither declared nor deliberately exempt.
- **Names that were corrected stay corrected.** A documentation check fails on
  the old names (`tertiary`, `on-solid`), so stale advice cannot creep back.
- **Passing the math is not the same as reading well.** A second measure,
  APCA, caught dark text on mid-tone coral that passed WCAG 2 at 4.83:1 but
  scored low on perceived contrast, which led to white text on solid fills.
- **The hand-typed badges are gone.** The "semantic token pairs" page now
  measures each ratio in the browser from the colors on screen, shows it in the
  badge (`AA · 8.09:1`, or `FAIL` in red), and has a test that fails if any
  pair drops below AA in either mode. `after/03` shows it in dark mode.

## Why this matters

A design system's accessibility claims are only as good as the last time
something measured them. The July work found that three ways: a documentation
page that asserted a result nobody had checked, a check that only ran in one of
two modes, and a token whose name promised one job and was used for another.
The remedy in each case was the same: replace the assertion with a measurement,
run it in every mode, and make failing it block the build.

---

## Open items for this draft (delete before finishing)

- The dark-link row mixes eras: 3.81:1 is July's blue link, 8.09:1 is today's
  polar-night link. July's post-fix ratio for the blue link was not recorded.
  Either keep the note in the cell, or drop the row's "after" value.
- Confirm tone and length for a portfolio reader; the investigation section is
  the longest and could be cut (kept for now).
