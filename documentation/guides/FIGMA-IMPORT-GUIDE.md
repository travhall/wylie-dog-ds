# Figma Token Import Guide

How to get the design tokens into a Figma file as Figma Variables, using the Token Bridge plugin (`apps/figma-plugin`).

## Source files

The tokens live in `packages/tokens/io/sync/`. Each file is one Figma variable collection:

| File              | Collection   | Modes           | Contents                                         |
| ----------------- | ------------ | --------------- | ------------------------------------------------ |
| `primitive.json`  | `primitive`  | `Value`         | Raw values (colors in OKLCH, spacing, type, ...) |
| `semantic.json`   | `semantic`   | `Light`, `Dark` | Meaning-based tokens that alias primitives       |
| `components.json` | `components` | `Light`, `Dark` | Component tokens that alias semantic tokens      |

For the current token counts see `packages/tokens/dist/manifest.json` or run `pnpm check:docs`.

## Import order

Import the files in this order so aliases resolve: `primitive`, then `semantic`, then `components`. References look like `{color.gray.50}`: a semantic token points at a primitive, and a component token points at a semantic token.

## Importing

1. Open the Token Bridge plugin in the Figma file.
2. Go to the **Sync** tab and choose **Import from file**, then select a file from `packages/tokens/io/sync/`.
3. Review the transformation summary and confirm the import. The plugin detects the file format automatically.
4. Repeat for the next file in the order above.

If the file's repository is already connected, you can instead use **Pull** on the Sync tab to bring the files in from GitHub. See [apps/figma-plugin/README.md](../../apps/figma-plugin/README.md) for authentication and sync details.

## File format

The `io/sync` files use the plugin's native format: an array with one object per collection, holding its `modes` and a flat `variables` map keyed by dot-separated token name. Each variable has `$type` and `$value`; aliases are written as `{token.name}`:

```json
{
  "semantic": {
    "modes": [{ "name": "Light" }, { "name": "Dark" }],
    "variables": {
      "color.background.default": {
        "$type": "color",
        "$value": "{color.gray.50}"
      }
    }
  }
}
```

The plugin also accepts standard nested W3C DTCG files and other formats it can detect; see [W3C-DTCG-ADAPTER-REFACTORING.md](W3C-DTCG-ADAPTER-REFACTORING.md) and the plugin README.

## Colors and browser support

Color tokens use OKLCH. Minimum browser versions are listed in [packages/tokens/BROWSER_SUPPORT.md](../../packages/tokens/BROWSER_SUPPORT.md).

## Going the other way

To send changes made in Figma back to code, use the **Tokens** tab to export (download JSON or push to GitHub). Variables the exporter cannot represent are listed in a notice after the export; see the plugin's `docs/API.md`.

## References

- [W3C DTCG Specification](https://tr.designtokens.org/format/)
- [OKLCH Color Picker](https://oklch.com/)
