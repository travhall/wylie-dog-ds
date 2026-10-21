# [Case study title — short, plain-language, describes the outcome not the mechanism]

**Origin:** Code investigation — found while auditing an existing feature
_(or)_ Figma/design decision — started from a change in the design file
**Status:** Draft

> Written for an outside reader. Assume no familiarity with this repo, Storybook,
> or design-token tooling — explain acronyms and internal tool names the first
> time they appear. Code/config is supporting evidence, not the main narrative.

---

## The problem

What was actually wrong, described in terms of the experience or outcome —
not the internal mechanism yet. Who would have noticed this, and why did it
matter? (1 short paragraph.)

## How it surfaced

What prompted looking here — a user report, a routine audit, a design change
that exposed it. What was the first visible symptom?

## The investigation

The process of narrowing it down: what was tried, what looked promising but
wasn't the real cause, what the actual root cause turned out to be. This is
the section allowed to get technical — but keep translating back to "why this
mattered" as you go rather than leaving it as a pure code log.

Include short before/after code snippets or config diffs here if they help
tell the story, not as a full patch dump.

## The fix

What changed, and why this approach over the alternatives that were on the
table. If a decision was made to _not_ fix something (scope it out, defer it),
say so and why.

## Proof it works

How it was verified — screenshots (reference `before/` and `after/` in this
case study's folder), a measurement, a computed value, a reproduction steps
list. Show, don't just assert.

## Why this matters

Tie back to the bigger picture — what this says about the maturity of the
design system, the value of the process used to find it, or a pattern worth
watching for elsewhere. This is the "so what" for a reader who doesn't work
on this codebase.

---

_Screenshots and other artifacts for this case study live in `before/` and
`after/` subfolders next to this file._
