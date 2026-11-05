# Comparing the Figma library with the UI

`pnpm check:figma-parity` compares a component's _properties_ (is there a `size` axis, does it match the code). This comparison checks what is _drawn_: for every variant in the Figma library it renders the same variant in Storybook and compares size, padding, gap, radius, border, fill, opacity and shadow, and for the first text layer the font family, size, weight, line height, letter spacing, decoration and colour. A hover or pressed variant is measured with the mouse hovering or pressed, so the states are compared too.

It exists because earlier audits compared sizes, colours and spacing by hand and missed the Badge's font family, the Command shortcut's tracking, the Tabs shadow and the Calendar's button opacity. Every one of those is a column in this report.

## Run it

1. **Measure Figma.** Open `scripts/figma/measure-library.js`, set `PAGE_NAME`, `SET_NAMES` (empty means every set on the page) and `MODE` (`light` or `dark`; the file's variable mode must match), and run its body as one `use_figma` call. It writes nothing. Run it once per page that holds component sets and merge the `items` arrays. Save the result as `figma-metrics.json`.
2. **Measure the UI.** Start Storybook, restart it first if the tokens changed (the dev server can serve a stale generated stylesheet), then:

```bash
node scripts/figma/harvest-ui.mjs figma-metrics.json > code-metrics.json
```

3. **Compare.**

```bash
pnpm compare:ui figma-metrics.json code-metrics.json
```

The harvester takes the theme from the `mode` in the Figma file, so both sides are measured in the same one. The report groups what differs by component and variant, with both values. It exits 1 on any open finding.

## Adding a component

`scripts/figma/compare-ui.config.json` says how a Figma set is rendered: the story, the element to measure (`root`), how Figma variant properties become story args (`args`, with `values` where the names differ) and which property is the interaction state (`state`: `default`, `hover` or `pressed`). Button and Badge are mapped; add a set by naming its story and root. A set with no entry is skipped and listed.

## Tolerances and accepted differences

A size, padding, gap, radius, border width, font size, line height or shadow offset may differ by 1px; a colour by 3 of 255 per channel; opacity by 0.02; letter spacing by 0.1px. A radius is capped at half the smaller side on both sides, so a pill compares equal whether it is drawn as 9999 or as half the height.

A difference the owner accepts goes in the `allow` list with a reason (`set`, `property`, and optionally `scope` or a `variant` substring). An entry that matches nothing fails the run, so the list cannot rot.

## What it does not see yet

Layers after the first text (a second label, an icon), hover and pressed states of components whose variants have no `state` axis (Button is the first), the focus ring, and Radix content that exists only when open (menus, dialogs). Each needs its own measuring rule and is added with its component.
