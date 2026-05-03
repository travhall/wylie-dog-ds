# Sync Contract

This document defines the **JSON data format** for token files used by the Figma plugin and build pipeline. It is a format contract, not a file-list contract.

```text
┌──────────────────┐  read/write   ┌──────────────────┐  read   ┌──────────────────┐
│  Figma Plugin    │ ◄───────────► │  token files     │ ──────► │  Build pipeline  │
│ (apps/figma-     │  via storage  │  (any .json in   │         │  (process-token- │
│  plugin)         │  adapter      │   configured dir)│         │   io.js → SD)    │
└──────────────────┘               └──────────────────┘         └──────────────────┘
```

**File discovery is open:** consumers can put any number of `.json` files in any directory they configure. The plugin discovers them automatically, or users can specify an explicit list in plugin settings. No manifest file is required.

**Any change to the data format requires coordinated updates in:**

- `packages/tokens/scripts/process-token-io.js` (consumer)
- `apps/figma-plugin/src/plugin/github/client.ts` (consumer/producer)
- `apps/figma-plugin/src/plugin/variables/{importer,processor,reference-resolver}.ts`
- `apps/figma-plugin/test-data/` fixtures

---

## Wylie Dog default file layout

The reference implementation uses three files, but this is not required of consumers:

| File              | Collection name | Modes               | Purpose                                                                          |
| ----------------- | --------------- | ------------------- | -------------------------------------------------------------------------------- |
| `primitive.json`  | `primitive`     | 1 (`Value`)         | Raw scales: color palettes, spacing scale, type scale, radii, durations, easings |
| `semantic.json`   | `semantic`      | 2 (`Light`, `Dark`) | Intent-named tokens that reference primitives                                    |
| `components.json` | `components`    | 2 (`Light`, `Dark`) | Component-specific tokens that reference semantic (and occasionally primitive)   |

---

## Document shape

Every sync file is a **JSON array containing exactly one element**. The element is an object with a single key (the collection name) whose value is a _Collection_.

```jsonc
[
  {
    "<collectionName>": {
      "modes": [
        /* Mode[] */
      ],
      "variables": {
        /* TokenName → Token */
      },
    },
  },
]
```

The array wrapper is a Figma plugin requirement (multiple collections per file were originally anticipated). Do not remove it without coordinating the plugin and `process-token-io.js`.

### Collection

```ts
type Collection = {
  modes: Mode[]; // 1 for primitive, 2 for semantic/components
  variables: Record<TokenName, Token>;
};
```

### Mode

```ts
type Mode = {
  modeId: string; // e.g. "mode:semantic:light" — stable, human-readable, unique within file
  name: string; // e.g. "Light" | "Dark" | "Value" — used as key in valuesByMode
};
```

**Canonical mode IDs:**

- Primitive: `mode:primitive:value` (name: `Value`)
- Semantic: `mode:semantic:light` (name: `Light`), `mode:semantic:dark` (name: `Dark`)
- Components: `mode:components:light` (name: `Light`), `mode:components:dark` (name: `Dark`)

### Token

W3C DTCG-aligned shape:

```ts
type Token = {
  $type: TokenType; // see § Type vocabulary
  $value: TokenValue; // primitive value OR reference; see § Values & references
  $description?: string; // optional human-readable note
  $extensions?: Record<string, unknown>; // namespaced metadata; preserved verbatim by all consumers
  valuesByMode?: Record<string, TokenValue>; // REQUIRED for multi-mode collections; OMITTED for primitive
};
```

**Single-mode tokens (primitive)** use only `$value`:

```json
"color.gray.500": {
  "$type": "color",
  "$value": "oklch(0.55 0 0)"
}
```

**Multi-mode tokens (semantic, components)** use both `$value` and `valuesByMode`. The top-level `$value` is set to the **Light** mode value (or the first available mode) for backwards compatibility with single-mode consumers; the authoritative source is `valuesByMode`:

```json
"color.background.primary": {
  "$type": "color",
  "$value": "{color.gray.50}",
  "valuesByMode": {
    "Light": "{color.gray.50}",
    "Dark":  "{color.gray.950}"
  },
  "$description": "Main page background color"
}
```

**Producer rule:** always emit both. **Consumer rule:** for multi-mode collections, prefer `valuesByMode[modeName]` and ignore top-level `$value`.

---

## Token names

- Lowercase, dot-separated path: `color.background.primary`, `space.button.height.md`
- Path components: lowercase, alphanumeric, hyphen-separated within a component (`fiery-coral`, `polar-night`)
- No leading/trailing dots, no consecutive dots, no whitespace
- Names are **stable identifiers** — renames are breaking changes (see [§ Versioning](#versioning))

The dot-notation is converted to slash-notation for Figma (`color/background/primary`) by the plugin and back. Both consumers must round-trip cleanly.

---

## Type vocabulary

Token types are W3C DTCG with a constrained subset:

| `$type`         | `$value` shape                                                                 | Notes                                                                                                   |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `color`         | `oklch(L C H)` string OR reference                                             | OKLCH is the only canonical color format. Hex is accepted on import (auto-converted) but never emitted. |
| `dimension`     | `"<number><unit>"` string OR reference                                         | Units: `px`, `rem`, `em`, `%`.                                                                          |
| `number`        | numeric OR reference                                                           | Unitless (line-height, opacity scalar).                                                                 |
| `fontFamily`    | string OR `string[]` OR reference                                              | Array = font stack.                                                                                     |
| `fontWeight`    | numeric (100–900) OR keyword string OR reference                               |                                                                                                         |
| `fontSize`      | dimension OR reference                                                         | Subtype of dimension; kept distinct for tooling.                                                        |
| `lineHeight`    | number OR dimension OR reference                                               |                                                                                                         |
| `letterSpacing` | dimension OR reference                                                         |                                                                                                         |
| `duration`      | `"<number>ms"` string OR reference                                             |                                                                                                         |
| `cubicBezier`   | `[n,n,n,n]` array OR reference                                                 | For easing tokens.                                                                                      |
| `shadow`        | object `{color, offsetX, offsetY, blur, spread}` OR array of such OR reference | Composite.                                                                                              |
| `border`        | object `{color, width, style}` OR reference                                    | Composite.                                                                                              |
| `string`        | string                                                                         | Fallback only. Avoid for design values.                                                                 |

**Composite types** (`shadow`, `border`, `typography` if introduced) may have references **inside** their sub-fields:

```json
"shadow.elevation.2": {
  "$type": "shadow",
  "$value": {
    "color": "{color.shadow.default}",
    "offsetX": "0px",
    "offsetY": "2px",
    "blur": "4px",
    "spread": "0px"
  }
}
```

---

## Values & references

### Reference syntax

A reference is a string of the form `{<dot.path.to.token>}` — exactly one set of curly braces, no whitespace, dot-notation matching a token name elsewhere in the same or an upstream file.

```json
"$value": "{color.gray.500}"
```

### Reference resolution rules

1. **Layer order:** `components` may reference `semantic` and `primitive`. `semantic` may reference `primitive`. `primitive` MUST NOT contain references. This enforces the 3-tier architecture.
2. **Chained refs are allowed** but discouraged. Maximum chain depth: **5**. Consumers MUST detect and reject deeper chains.
3. **Circular refs are forbidden** and MUST be detected and rejected by both producer and consumer.
4. **Type compatibility:** a reference's resolved type MUST match the referencing token's `$type`. Mismatches MUST be reported as errors.
5. **Missing refs** MUST surface a clear error naming the source token, missing target, and source file.

### Math, expressions, aliases

**Not supported.** No `calc()`, no arithmetic, no SCSS/CSS variable syntax, no `$ref` objects. References are the only indirection.

---

## Invariants

A sync file is **valid** if and only if:

1. Top-level value is a single-element JSON array.
2. The array element is an object with exactly one key matching the manifest's declared collection name for that filename.
3. The collection has a `modes` array whose `name` values match the manifest's declared modes for that file.
4. The collection has a `variables` object.
5. Every entry in `variables` is a Token with a valid `$type` (see [§ Type vocabulary](#type-vocabulary)).
6. Every multi-mode token has a `valuesByMode` object whose keys are exactly the declared mode names.
7. Every reference in `$value` or `valuesByMode` resolves per [§ Reference resolution rules](#reference-resolution-rules).
8. Token names match the [naming rules](#token-names).
9. Layer-order rule (primitive references nothing; semantic references only primitive; components references semantic + primitive) holds.

Validation is owned by `packages/tokens/scripts/validate-tokens.js` and the plugin's `src/plugin/variables/validation.ts`. Both must enforce **the same rules**.

---

## Versioning

The contract is versioned via the `$schema` URL. Compatibility policy:

- **Patch / minor (additive)** — new optional fields, new `$type` values, new tokens. Old consumers ignore unknown fields and continue to work.
- **Major (breaking)** — removing a field, renaming a field, changing semantics of a field, restructuring the document shape, removing a `$type` value. Requires:
  1. Bump major in `$schema` URL.
  2. Migration script in `packages/tokens/scripts/migrations/v{old}-to-v{new}.js`.
  3. Coordinated release of `packages/tokens` and `apps/figma-plugin` with matching `$schema` support.
  4. Entry in `CHANGELOG.md` of both packages.

Producers always write the latest version. Consumers MUST validate the version and refuse to operate on a major version they don't understand, with an actionable error pointing to the migration script.

### Token rename = major

Renaming a token is a breaking change for downstream consumers (UI components, app CSS), even though the file shape is unchanged. Renames go through a migration step (see Phase 3 of the project plan).

---

## Coordination checklist

When changing this contract:

- [ ] Update this document
- [ ] Bump `$schema` version if breaking
- [ ] Update `packages/tokens/scripts/process-token-io.js`
- [ ] Update `packages/tokens/scripts/validate-tokens.js`
- [ ] Update `apps/figma-plugin/src/plugin/github/client.ts`
- [ ] Update `apps/figma-plugin/src/plugin/variables/importer.ts`
- [ ] Update `apps/figma-plugin/src/plugin/variables/processor.ts`
- [ ] Update `apps/figma-plugin/src/plugin/variables/reference-resolver.ts`
- [ ] Refresh fixtures in `apps/figma-plugin/test-data/`
- [ ] Add migration script if breaking
- [ ] Update `CHANGELOG.md` in both packages
