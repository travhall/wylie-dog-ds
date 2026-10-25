/**
 * Utility functions for the Wylie Dog Design System
 */

import { extendTailwindMerge } from "tailwind-merge";

/**
 * Matches this repo's `-(--space-token-name)` arbitrary-property convention
 * with no explicit `length:` type hint — e.g. `border-(--space-x)`,
 * `border-l-(--space-x)`. Used below to teach `tailwind-merge` that these
 * are border-*width* values, not border-*color* values (see comment on
 * `twMerge`).
 */
const isSpaceToken = (value: string): boolean =>
  /^\(--space-[\w-]+\)$/.test(value);

/**
 * `tailwind-merge`'s default config already recognizes this repo's Tailwind
 * v4 arbitrary-property token syntax (e.g. `bg-(--color-x)`,
 * `text-(length:--font-size-x)`) as belonging to the same conflict group as
 * the plain utility it corresponds to — verified against every
 * `-(--token-name)` pattern in use across `packages/ui/src`. Two default
 * behaviors needed overriding, though:
 *
 * 1. Out of the box, tailwind-merge treats any `font-size` class as also
 *    overriding an earlier `leading` (line-height) class, because
 *    Tailwind's built-in `text-*` size presets (e.g. `text-lg`) set both
 *    font-size AND a paired default line-height together. This repo never
 *    uses those presets — every font size is
 *    `text-(length:--font-size-token)`, an arbitrary value that sets
 *    *only* font-size, with line-height always set separately and
 *    explicitly via its own `leading-(--line-height-token)` class
 *    (confirmed: zero literal `text-{sm,base,lg,...}` classes exist in
 *    `packages/ui/src`). Without this override, `cn()` would silently drop
 *    a component's explicit `leading-*` class whenever a
 *    `text-(length:...)` class appeared after it in the same call (e.g.
 *    `dialog.tsx`'s `DialogTitle`, `badge.tsx`'s size variants) — a real
 *    behavior regression, not just a style-order nicety.
 *
 * 2. tailwind-merge can't tell a bare `border(-t|-r|-b|-l)?-(--x)` (no
 *    `length:`/`color:` hint) apart from a border-*color* arbitrary value —
 *    its border-width matcher requires an explicit `length:` hint, so an
 *    unhinted bare value only matches the border-*color* group's looser
 *    "any arbitrary variable" rule. This repo's border-width tokens are
 *    never hinted (they're always named `--space-*`, e.g.
 *    `border-l-(--space-alert-border-left-width)` in `alert.tsx`,
 *    `border-(--space-switch-track-border-width)` in `switch.tsx`), so by
 *    default they get misclassified as border-*color* values — meaning
 *    `cn()` would silently drop a real border-width class (or an unrelated
 *    `border-transparent`) whenever a genuine border-color class appeared
 *    in the same call, which happens throughout this repo (`alert.tsx`,
 *    `table.tsx`, `tabs.tsx`, `switch.tsx`). `isSpaceToken` re-registers
 *    these as border-width values so they no longer collide with
 *    border-color.
 */
const twMerge = extendTailwindMerge({
  override: {
    conflictingClassGroups: {
      "font-size": [],
    },
    conflictingClassGroupModifiers: {
      "font-size": [],
    },
  },
  extend: {
    classGroups: {
      "border-w": [{ border: [isSpaceToken] }],
      "border-w-t": [{ "border-t": [isSpaceToken] }],
      "border-w-r": [{ "border-r": [isSpaceToken] }],
      "border-w-b": [{ "border-b": [isSpaceToken] }],
      "border-w-l": [{ "border-l": [isSpaceToken] }],
    },
  },
});

/**
 * Combine class names, filtering out falsy values, then resolve conflicting
 * Tailwind utility classes so the last one wins (e.g. a consumer's
 * `className` reliably overrides a component's own default classes).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

/**
 * The focus indicator (Plan 197): a two-tone outline. An outline in the
 * `color.focus.ring` tone sits `focus.offset` away from the control, and a
 * halo in the `color.focus.halo` tone fills the gap and extends
 * `focus.halo-width` beyond the outline, so the outline is separated from
 * any fill or surface it sits on and reaches 3:1 on every one of them.
 *
 * It is a real outline, so forced-colors mode draws it natively; the halo is a
 * box-shadow, which forced-colors mode drops. It shows for keyboard focus only
 * (`focus-visible`). The outline style is set explicitly, because
 * `outline-hidden` elsewhere sets it to none, and the transition is cancelled so
 * the outline does not fade in from the text colour.
 *
 * Every arbitrary value carries a type hint (`color:`, `length:`). Without
 * one Tailwind v4 reads a bare `--space-*` variable as a colour and the
 * utility silently does nothing.
 */
export const focusRingClasses =
  "focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none";

/**
 * The same indicator drawn inside the element, for items whose parent clips an
 * outside indicator (menu, select and command items, nav links in a bar).
 */
export const focusRingInsetClasses =
  "focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:-outline-offset-(length:--space-focus-width) focus-visible:shadow-[inset_0_0_0_calc(var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none";
