# Comparing the Figma library with the UI

`pnpm check:figma-parity` compares a component's _properties_ (is there a `size` axis, does it match the code). This comparison checks what is _drawn_: for every variant in the Figma library it renders the same variant in Storybook and compares size, padding, gap, radius, border, fill, opacity and shadow, and for the first text layer the font family, size, weight, line height, letter spacing, decoration and colour, and for the first icon the stroke width it draws. A hover or pressed variant is measured with the mouse hovering or pressed, so the states are compared too.

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

The harvester lower-cases variant names and values and turns spaces into hyphens (`State=With Ellipsis` becomes `state=with-ellipsis`), because the library is Title Case (`Variant=Default`; see [naming in Figma](figma-naming.md)) and the config and stories use the code's names. An `allow` entry's `variant` text is matched the same way, so write it the code's way (`state=with-selection`). It takes the theme from the `mode` in the Figma file, so both sides are measured in the same one. The report groups what differs by component and variant, with both values. It exits 1 on any open finding.

## Adding a component

`scripts/figma/compare-ui.config.json` says how a Figma set is rendered: the story, the element to measure (`root`), how Figma variant properties become story args (`args`, with `values` where the names differ) and which property is the interaction state (`state`: `default`, `hover` or `pressed`). The config maps 47 of the 49 sets (Icon is a glyph set and Aspect Ratio has no Figma set; Navigation Menu is not mapped, see the limits below) (see the file for the list); add a set by naming its story and root. A set with no entry is skipped and listed.

Two optional keys cover a Figma value that does not map to one story arg. `valueArgs` gives the whole args string for one value (a property with only `valueArgs`, like Input's `filled`, needs no `args` entry; the Select, Input and Textarea `filled=true` render a selected or typed value through `defaultValue`) (Checkbox's `checked=error` is an unchecked box with `error` on: `"valueArgs": { "checked": { "error": "error:!true;checked:!false" } }`). `valueStories` points one value at another story when the main story does not render it (Toast's default variant).

A set whose Figma root is a wrapper and whose look sits in inner layers (Slider: track, range, thumb) uses `parts`: a map from a Figma layer name to an absolute CSS selector. Set the same layer names in `PARTS` in `measure-library.js` (`{ Slider: ["track", "range", "thumb"] }`). Each part is compared as its own item named `<variant> :: <part>`; the harvester measures it with its parent variant and skips part items when it walks the Figma file. A layer name that repeats (Tabs' `tabs-row-row`) takes an index, `tabs-row-row#1` for the second one, in both `PARTS` and `parts`. A part selector can name a Figma property in braces, like `root` (`[data-orientation={orientation}]`). A text layer's fill is its text colour, so the measurer leaves a text part's box fill empty. Only send the Figma variants the story can render (a variant with an axis the story cannot reach would be compared against the default and report false drift).

Overlays and menus (Dialog, Alert Dialog, Sheet, Popover, Hover Card, Tooltip, Dropdown Menu, Context Menu, Menubar) are closed by default, so a set's `open` key says how the story opens them before measuring: `{ "click": "<selector>" }`, `{ "hover": "<selector>" }` or `{ "contextmenu": "<selector>" }`, with an optional `wait` in milliseconds and `when`. Reduced motion is emulated, so nothing animates. The `root` is then the portal content (`[role=dialog]`, `[role=menu]`).

`open` can also be a list of steps, each with its own `when`, a `repeat` count and `leave` (move the mouse off the control so its hover style is not measured): the Carousel reaches its middle state with one click on Next and its end state with four.

Four more optional keys keep a story's limits out of the findings. `unrenderable` maps a Figma property to the values its story cannot draw (`"Tabs": { "size": ["sm", "lg"] }`, Command `with-results`, Pagination `with-many-pages`, Accordion `open`, Radio `checked: true`); the harvester skips them and the report lists them as having no UI measurement, so they never show up as false drift. `stateTarget` is an element to hover or press instead of the root (a menu's first item, so Dropdown Menu and Context Menu hover states reach the item). Parts are read while the mouse is still on the target, so a hover or pressed state reaches them too. `ONLY_PARTS` in `measure-library.js` (`["Select"]` with `PARTS = { Select: ["trigger"] }`) emits only a set's parts, for a set whose root is a bare wrapper; the harvester then drives the story from a parts-only work item for the parent variant.

`SHOW` in `measure-library.js` (`{ Badge: ["Show Icon", "Show Dismiss"], Button: ["Show Icon"] }`) measures a set's optional parts, which sit behind a boolean property and are hidden in every variant, so the plain rows never draw them. For each resting variant and each listed boolean it creates a temporary instance, turns the boolean on, measures it as `<variant>, Show Icon=True` (or `Show Dismiss=True`) together with the icon's drawn size, and deletes the instance. The config's `valueStories` renders that row from another story (`"show-icon": { "true": "components-content-display-badge--with-icon" }`, `"show-dismiss"` the same way), and the report then compares the icon's size as well as its stroke (an `icon size` finding). A Figma row measured without a size skips the size check, so earlier runs stay valid.

A `use_figma` call returns at most 48,000 bytes and cannot write a file, so a large measurement goes out in chunks of compact rows (`[set, variant, w, h, [pad x4], gap, radius, border, stroke, fill, opacity, [[x, y, blur, spread, color]], [chars, family, size, weight, lineHeight, tracking, decoration, color] or null, and optionally [icon stroke, icon size]]`). Save them as a JSON array and turn them into the metrics file with `node scripts/figma/rows-to-metrics.mjs rows.json figma-metrics.json dark` (or `light`).

## Tolerances and accepted differences

A size, padding, gap, radius, border width, font size, line height or shadow offset may differ by 1px; a colour by 3 of 255 per channel; opacity by 0.02; letter spacing by 0.1px; an icon stroke by 0.1px (a flat 2px and a 1.33px stroke must not pass). A radius is capped at half the smaller side on both sides, so a pill compares equal whether it is drawn as 9999 or as half the height.

A difference the owner accepts goes in the `allow` list with a reason (`set`, `property`, and optionally `scope` or a `variant` substring). A `variant` ending in `$` must match the end of the name (`":: select-stack$"` covers the menu and not `:: select-stack-row`). An entry that matches nothing fails the run, so the list cannot rot.

## Wiring hover and press without a rebuild

Button has a `state` axis (`default`, `hover`, `pressed`), and the builder wires the transitions between those variants when it runs. To wire an existing library instead, run the body of `scripts/figma/wire-state-reactions.js` through `use_figma`. It **writes**, so run it only when you mean to. It sets Default to Hover on hover, Default to Pressed on press and Hover to Pressed on press, each with Smart Animate and the duration and curve of `transition/duration/fast` and `transition/easing/default`. Figma will not bind a variable to a transition, so those are literal values read when it runs; run it again after the tokens change. It also underlines the link's hover and pressed labels. Those labels carry no text style: the labels of a Button share one text property, and on a label with a style a decoration set on one spreads to all of them, so the script first clears any spread underline and then removes the style from just those labels before underlining them.

It refuses unless those two variables are native TIMING and EASING (Pull the tokens with the current Token Bridge first), says why, and changes nothing. Running it twice is safe: each variant's reactions are replaced.

## Full pass of 2026-11-06 (plan 218)

After the last rebuild of the library, every mapped set was measured in dark (600 variants, 48 sets) and in light (298 variants, sizes `md` and `default` only, since a size does not change a colour), and compared with the UI: 0 open findings in both, every allow entry carries a reason, and no entry is stale. The `Open (owner decision)` entries are the owner's open calls, listed by `grep "Open (owner" scripts/figma/compare-ui.config.json`. Alpha modifiers on token colours stay as they are (the Section Hero gradient and the Section Features icon tiles, 10% each): Figma reproduces them as 10% paint opacity on token-bound fills.

To repeat the run: set the sections' variable modes (the `components` and `semantic` collections) to Dark or Light, preload every font on the page plus Roboto, Besley and Noto Sans Symbols2, measure in chunks of about 150 rows, convert with `rows-to-metrics.mjs`, harvest against a running Storybook on :6006, then `pnpm compare:ui`. The component builder (`apps/figma-plugin/wylie-dog-figma-builder/code.js`, owner-run, in git) is **frozen after the final rebuild**: it duplicates components if it is run again, so later fixes in Figma are made by hand or through Token Bridge, and then re-measured.

## Known limits

Not measured, and why:

- **Navigation Menu** is mapped by its parts: the list, three rows (a link, a trigger with the chevron, a link) and the open viewport box (border, radius, shadow, fill). The story's open content is a bespoke grid with story-only gradient classes, so the viewport's size and first text are allowed, as are the list width (the story's own labels) and the gap (the code spaces with margins). `State=Active` is not rendered by the story (`unrenderable`). The viewport is portalled to the body (inside a Radix popper wrapper), so its selector starts at the wrapper, not at the story root. The `Orientation=Vertical` variants (added 2026-11-12) map to the story's `orientation` arg and have not been compared yet; the first run may need allow entries for the story's own labels, as for the horizontal ones.
- **Dialog `size=full`**: the story sizes it to the viewport (855px at the 900px harvest viewport) while Figma draws 1200px (allow entries).
- **Site Header `size=sm`**: the story ignores the `size` URL arg, so the sm rows compare against the default size (allow entries).
- **Variants a story cannot render** (`unrenderable`): Scrollbar horizontal, Command with results, Pagination many pages, Accordion open, Tabs sm and lg, Radio checked, Toggle Group vertical pressed.
- **Table selected row**: the table story renders no selected row.
- **Hover and pressed inside overlays**: Dropdown Menu and Context Menu hover (first item) are measured with `stateTarget`; pressed and the Menubar items are not.
- **Icon stroke** is compared for the first stroked icon only, and only when both sides have one. The Badge's Show Icon and Show Dismiss rows also compare the icon's drawn size (`badge.icon-size.sm|md|lg`: 12, 12 and 16px). The UI side is the width actually drawn: `icon.stroke-width.sm|md|lg` (1.5, 2, 2.5px) is non-scaling in the `Icon` (`vector-effect: non-scaling-stroke`), so it draws the same pixels in Figma and in code, and each component passes the `size` that matches its icon. A component that draws its own svg (Checkbox) must do the same, and where the stroke should differ by size it gets one token per size (`checkbox.icon-stroke-width.sm`, `.md`, `.lg`: 1.5, 2.5, 3.5px), drawn as written and bound to the same variable in Figma. The `Icon` set itself is not mapped.
- The focus ring, a second text layer or icon (beyond the stroke), and the Input and Textarea placeholder colour (an attribute in the UI, a text layer in Figma) are not compared.
