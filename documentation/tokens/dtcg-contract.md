# DTCG token contract

**Status:** specification for the target format. Today's `packages/tokens/io/sync/*.json` files still use the native Wylie Dog layout described in [SYNC_CONTRACT.md](../../packages/tokens/SYNC_CONTRACT.md). The converter, the build and Token Bridge move to this format in the later steps of the Token Bridge release plan. Nothing reads these files yet; the schemas and their tests exist so the format is fixed before the code changes.

The **token contract** (see the [glossary](../../GLOSSARY.md)) is the set of files that code and Figma both read and write. This page defines its format: standard [W3C DTCG 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) token files, plus a [Resolver](https://www.designtokens.org/tr/drafts/resolver/) file that says which files apply in which mode. It is a strict subset of the standard, so any DTCG-capable tool can read it.

Two JSON Schemas enforce it:

- [token-file.schema.json](../../packages/tokens/schema/token-file.schema.json) for token files
- [resolver.schema.json](../../packages/tokens/schema/resolver.schema.json) for the resolver file

`pnpm --filter @wyliedog/tokens test:tokens` checks the schemas against valid and invalid examples, and the same valid examples also pass the official DTCG 2025.10 schemas.

## Layout

One token file per collection and mode, plus one resolver file. A collection with more than one mode gets a file per mode, named `<collection>.<context>.json`. The Wylie Dog default:

```text
packages/tokens/io/sync/
├── tokens.resolver.json     # which files apply in which mode
├── primitive.json           # one mode: a plain set
├── semantic.light.json      # semantic, theme = light
├── semantic.dark.json       # semantic, theme = dark
├── components.light.json
└── components.dark.json
```

The three-tier hierarchy (primitive, semantic, component) is this project's standard, not part of the contract. An adopter may use any number of files and any structure; the contract only fixes the file format.

## Token files

A token file is a tree of groups and tokens.

**Names.** Group and token names are strings that do not start with `$` and do not contain `.`, `{` or `}`. The path to a token is its groups joined with dots, so `color.fiery-coral.600` is a token `600` in group `fiery-coral` in group `color`. A name cannot be both a token and a group.

**Tokens.** Every token has `$type` and `$value`, and may have `$description`. The contract requires an explicit `$type` on each token; it does not use group-level type inheritance, which the standard allows.

```json
{
  "color": {
    "fiery-coral": {
      "600": {
        "$type": "color",
        "$value": { "colorSpace": "oklch", "components": [0.61, 0.169, 37.68] },
        "$description": "Brand fill."
      }
    }
  }
}
```

### Supported types

| `$type`       | `$value`                                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`       | `{ "colorSpace", "components": [3 numbers or "none"], "alpha"?, "hex"? }`. Project colours are `oklch`; shadow colours with alpha are `srgb`. `hex` is omitted. |
| `dimension`   | `{ "value": number, "unit": "px" or "rem" }`                                                                                                                    |
| `duration`    | `{ "value": number, "unit": "ms" or "s" }`                                                                                                                      |
| `cubicBezier` | `[x1, y1, x2, y2]`, with x1 and x2 in 0 to 1                                                                                                                    |
| `number`      | a JSON number                                                                                                                                                   |
| `fontFamily`  | a string, or an array of strings in order of preference                                                                                                         |
| `shadow`      | a shadow object, or an array of them. A shadow has `color`, `offsetX`, `offsetY`, `blur`, `spread` and optional `inset`                                         |

Other standard types (`gradient`, `typography`, `border`, `transition`, `strokeStyle`, `fontWeight`) are valid DTCG but not used here, so the schema rejects them until a token needs one.

### References

A `$value` that is a reference to another token is a string in braces holding the token's dotted path, such as `"{color.fiery-coral.600}"`. A reference is allowed for any type, and a shadow layer's `color` and its dimensions may be references too. The target must be a whole token. JSON Pointer `$ref` between tokens is valid DTCG but not used.

## Modes

Figma modes (Light and Dark) are not part of the token format. They live in the resolver file, which lists the token files and says which apply for each context.

```json
{
  "version": "2025.10",
  "name": "Wylie Dog tokens",
  "sets": {
    "primitive": { "sources": [{ "$ref": "primitive.json" }] }
  },
  "modifiers": {
    "theme": {
      "contexts": {
        "light": [
          { "$ref": "semantic.light.json" },
          { "$ref": "components.light.json" }
        ],
        "dark": [
          { "$ref": "semantic.dark.json" },
          { "$ref": "components.dark.json" }
        ]
      },
      "default": "light"
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/primitive" },
    { "$ref": "#/modifiers/theme" }
  ]
}
```

Rules:

- A **set** is a list of files that always apply. A collection with one mode (primitive) is a set.
- A **modifier** has at least two **contexts**, each a list of files. Light and Dark are contexts of one modifier named `theme`.
- Collections whose mode names match share one modifier. A collection with a different mode set gets its own modifier, named after the collection.
- Context names are the Figma mode names in lower case: `Light` is `light`.
- Sources are file references only; the contract does not allow inline tokens in the resolver file.
- `resolutionOrder` lists sets and modifiers; a later entry overrides an earlier one.

## Extensions

Tool-specific data goes in `$extensions` under a reverse-domain key, which other tools must preserve. The contract reserves `com.wyliedog.tokens`. Scopes are inferred from names in Token Bridge, and code syntax and text styles are generated, so none of those are stored in the files. The key holds three things, each only where needed:

- **On a token, `category`** (`"spacing"` or `"fontSize"`): the native type that DTCG has no name for. The build derives the CSS variable prefix from it (spacing becomes the `space` prefix, fontSize the `font-size` prefix), so dropping it changes the generated CSS. Every such token carries it.
- **On a token, `unit`** (`"em"`): see letter spacing below.
- **On a resolver set, `mode`; on a resolver modifier, `modes`**: the original Figma mode names. A set records its single mode (`"Value"`); a modifier maps each lower-case context to its mode name (`"light": "Light"`). Figma mode names keep their case this way, with no guessing.

## Converting from the native layout

| Native (`io/sync`)                                 | Contract                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| An array with one object per collection            | One file per collection and mode, plus the resolver file                                   |
| Flat keys such as `color.fiery-coral.600`          | Nested groups                                                                              |
| `valuesByMode: { Light, Dark }`                    | One token per mode file, same path                                                         |
| `"oklch(0.61 0.169 37.68)"`                        | `{ "colorSpace": "oklch", "components": [0.61, 0.169, 37.68] }`                            |
| `$type: "spacing"` or `"fontSize"`, value `"12px"` | `$type: "dimension"`, value `{ "value": 12, "unit": "px" }`, plus the `category` extension |
| `$type: "number"`, value `"12"` or `12`            | `$type: "number"`, value `12` (converting back writes the string)                          |
| `$type: "duration"`, value `"150ms"`               | `{ "value": 150, "unit": "ms" }`                                                           |
| `"cubic-bezier(0.4, 0, 0.2, 1)"`                   | `[0.4, 0, 0.2, 1]`                                                                         |
| A CSS shadow string, with layers and `inset`       | A shadow object, or an array for layers; `inset` is a boolean                              |
| The `none` shadow                                  | One fully transparent zero shadow; the build turns it back into `none`                     |
| `rgb(0 0 0 / 0.05)` in a shadow                    | `{ "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.05 }`                         |
| `{typography.font-size.6xl}` and other aliases     | The same string, unchanged                                                                 |

### One value the standard cannot hold: letter spacing in `em`

Six primitives, `typography.tracking.*`, are in `em` (for example `-0.05em`). A DTCG dimension allows only `px` and `rem`, and `em` cannot be converted because it is relative to the font size. **Decided (2026-11-14):** store them as `number` tokens holding the em fraction (`-0.05`), with `"$extensions": { "com.wyliedog.tokens": { "unit": "em" } }`, so the build writes `-0.05em` and Token Bridge shows a percent text style as it does today. A token that aliases one of these (27 component tokens do) is also a `number` with the same marker, because in DTCG a reference takes its target's type. Converting to `rem` was rejected: `em` is relative to the element's font size and `rem` to the root, so tracking would render differently at every size and no longer map to Figma's percent letter spacing.

```json
{
  "typography": {
    "tracking": {
      "tighter": {
        "$type": "number",
        "$value": -0.05,
        "$extensions": { "com.wyliedog.tokens": { "unit": "em" } }
      }
    }
  }
}
```

## Not covered

Group-level `$type` inheritance, `$extends`, JSON Pointer references between tokens, the other composite types, and inline tokens in the resolver file. Add them only when a token needs one, with a test.
