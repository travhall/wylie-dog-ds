# Naming in the Figma library

One rule for every component set, so the panel reads the same everywhere and the tools can map a Figma name to the code without a lookup table.

## The rule

| What                                | Written as                                                 | Examples                                                    |
| ----------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Component set                       | Title Case words, the component's name                     | `Button`, `Alert Dialog`, `Hover Card`                      |
| Property name (any type)            | Title Case words                                           | `Variant`, `Show Icon`, `Body Text`, `Custom Body`          |
| Boolean that shows an optional part | `Show` plus the part                                       | `Show Icon`, `Show Footer`, `Show Cancel Button`            |
| Boolean state drawn as a variant    | the adjective, values `True` and `False`                   | `Disabled`, `Loading`, `Checked`, `Pressed`                 |
| The main text                       | `Label` (it is `children` in code)                         | Button, Badge, Toggle, Label                                |
| Other text                          | the part's name                                            | `Title`, `Description`, `Content`, `Placeholder`, `Message` |
| Variant value                       | Title Case words, spaces for hyphens                       | `Default`, `With Ellipsis`, `Cards`                         |
| Size value                          | the code's size token, lower case                          | `xs`, `sm`, `md`, `lg`, `xl`, `icon`, `default`             |
| Number value                        | as is                                                      | `2`, `3`, `4`                                               |
| Icon name (Icon set)                | Title Case of the icon's name                              | `Heart`, `Chevron Down`, `Circle X`                         |
| Layer name                          | lower case, hyphenated, like a class name (not a property) | `dialog-footer`, `cancel-button`, `spinner`                 |

Size values stay lower case because they are the code's own scale (`size="md"`), and mixing `Default | sm | lg` reads worse than one vocabulary.

## How a Figma name maps to the code

Tools do not need a table, only these two functions (`scripts/figma/export-manifest.js` applies them when it writes `figma/manifest.json`):

- **Property name**: split on spaces, lower-case the first word and capitalise the rest, join: `Show Icon` becomes `showIcon`, `Body Text` becomes `bodyText`.
- **Variant value**: lower-case, spaces to hyphens: `With Ellipsis` becomes `with-ellipsis`, `True` becomes `true`.

The parity check, the comparison harvester (`harvest-ui.mjs`) and the manifest all ignore case and separators, so a name that follows the rule never needs an allow-list entry for its spelling.

Where the Figma name has no code twin on purpose, it is allow-listed in `scripts/figma-parity.config.json` with a reason: `Show Icon` and the other `Show` booleans (the part is a child in code, not a prop), `Body Text`, `Custom Body`, and so on. `Label` is the one name the check treats as the content prop (`children`) without an entry.

## Changing a name

Rename in place; never delete and recreate a set or variant (the variant key is lost and instances in other files stop reconnecting):

- a property: `set.editComponentProperty(key, { name })`
- a variant property or value: rename each variant layer (`Variant=Default, Size=md, State=Default`)

Then update `figma/manifest.json` (re-export with `scripts/figma/export-manifest.js`), the allow-list entries that name the property, and run `pnpm check:figma-parity`. The names are also what a Code Connect mapping would refer to (see the Figma skill), so treat a rename as a breaking change for anything built on them.

## The component builder

`apps/figma-plugin/wylie-dog-figma-builder/code.js` is frozen and still creates lower-case property names and values. Do not rerun it over the library; if it is ever run in a fresh file, rename the result with the rule above.
