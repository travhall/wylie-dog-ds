# Token formats

What Token Bridge reads and writes, and how your repository's files are laid out. Connect a file first: [Setup](SETUP.md).

## Supported formats

Import detects the format of a file by itself and shows a summary of what it will do before importing anything.

| Format                      | Import | Export | Notes                                                         |
| --------------------------- | ------ | ------ | ------------------------------------------------------------- |
| **W3C DTCG**                | yes    | yes    | The standard `$type` / `$value` format, nested groups         |
| **Wylie Dog native**        | yes    | yes    | One collection per file, with `modes` and a flat variable map |
| **Tokens Studio**           | yes    | no     | Flat and grouped exports                                      |
| **Style Dictionary flat**   | yes    | no     | Flat dot-notation keys                                        |
| **Style Dictionary nested** | yes    | no     | Hierarchical structure                                        |
| **Generic JSON**            | yes    | no     | The fallback when nothing else matches                        |

If a file in the repository isn't valid JSON, the error names it.

## What a Push writes

A Push writes the layout your token folder already has, and never switches it:

- **DTCG layout**, when the folder has a `tokens.resolver.json`: standard DTCG token files, one per collection (and per mode where a collection has several), plus the resolver file. The resolver is merged, not rewritten, so its order, extra sets and modifiers, and any extensions it carries are kept. A token the format can't hold is left out and reported; it stays in Figma.
- **Native layout**, otherwise: one `<collection>.json` per collection, such as `primitive.json`.

The DTCG layout follows the W3C Design Tokens format with a resolver file for modes. The exact shapes, one example per token type and the resolver layout are in the [token contract](../../../documentation/tokens/dtcg-contract.md).

A Push writes only files whose content changed. A changed file is rewritten in the plugin's format (2-space indent); files it didn't change keep your formatting.

## Import a file

1. Open the **Sync** tab and choose **Import from file**.
2. Pick one or more `.json` files. The plugin detects the format.
3. Read the summary of what it will do.
4. Confirm.

A backup downloaded before a Pull is a zip of native `.json` files: unzip it and import the files here.

## Export

On the **Tokens** tab, tick the collections to export and choose **Download** for one JSON file per collection, or push them to GitHub. A download holds the native collection object, whatever your repository's layout.

## Optional Wylie Dog conventions

The token format fixes only the files. Two behaviours are this project's own and apply only when the setup's "Use Wylie Dog conventions" is on (see [Setup](SETUP.md#wylie-dog-conventions)):

- **Picker scopes** decide which Figma pickers list a variable. They are derived from token names and re-applied on every Pull.
- **Hidden from publishing:** the `primitive` and `components` collections are hidden so a library consumer sees only `semantic`.

Without them, a new variable gets the scope its type implies, scopes a designer set are never overwritten by a Pull, and no collection is hidden.

Two more extras need their own file in the repository and do nothing without it:

- **Text styles** need the "Text styles" box ticked on the Sync tab and a text styles definitions file next to the token folder.
- **Code syntax** on variables needs a `code-syntax/web.json` next to the token folder.
