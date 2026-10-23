# Token Cheatsheet

Names and values below were read from the built CSS in `packages/tokens/dist/`. For the full list, see `dist/manifest.json`, or run `pnpm --filter @wyliedog/tokens build` and open `dist/tokens.css`.

## Tiers

| Tier      | Purpose                                | Example                             |
| --------- | -------------------------------------- | ----------------------------------- |
| Primitive | Raw scale values                       | `--color-blue-500`, `--space-200`   |
| Semantic  | Meaning, with light and dark values    | `--color-foreground-default`        |
| Component | Per-component values aliasing semantic | `--color-button-primary-background` |

In components, use the `-(--token-name)` Tailwind syntax, for example `bg-(--color-background-default)`.

## Color

Primitive palettes: `blue`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `sandcastle`, `yellow`, with steps such as `--color-blue-500`.

Semantic groups:

| Group                                     | Tokens                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Background                                | `--color-background-{default,muted,emphasis,raised,overlay,inverse}`                                                                                                                                                                                                     |
| Foreground                                | `--color-foreground-{default,muted,faint,inverse}`                                                                                                                                                                                                                       |
| Border                                    | `--color-border-{default,muted,emphasis,focus}`                                                                                                                                                                                                                          |
| Roles (primary, danger, success, warning) | `--color-background-{role}` (solid), `--color-background-{role}-muted` (tint), `--color-background-{role}-emphasis` (stronger solid), `--color-foreground-{role}` (text over the solid), `--color-foreground-{role}-muted` (text over the tint), `--color-border-{role}` |
| Info                                      | `--color-background-info-muted`, `--color-foreground-info-muted`                                                                                                                                                                                                         |

`--color-foreground-inverse` flips with the theme, so pair it only with `--color-background-inverse`. Text over a solid role fill uses that role foreground, for example `--color-foreground-danger` over `--color-background-danger`. There are no hover, active or disabled semantic tokens: a component token supplies the state and references a tone.

## Spacing

Primitive scale `--space-*`. Values are pixels, not rem.

| Token         | Value  |
| ------------- | ------ |
| `--space-100` | `8px`  |
| `--space-200` | `16px` |
| `--space-300` | `24px` |
| `--space-400` | `32px` |

Component spacing tokens follow `--space-<component>-*`.

## Radius

`--border-radius-{none,sm,md,lg,xl,2xl,full}` (`sm` is `2px`, `md` is `4px`, `lg` is `8px`, `full` is `9999px`).

## Shadow

`--shadow-{none,sm,base,md,lg,xl,inner}`.

## Typography, motion, layering

| Family      | Pattern               | Example                                 |
| ----------- | --------------------- | --------------------------------------- |
| Font size   | `--font-size-*`       | `--font-size-2xl`                       |
| Font weight | `--font-weight-*`     | component tokens, per element           |
| Line height | `--line-height-*`     | CSS only; not synced to Figma Variables |
| Duration    | `--duration-<ms>`     | `--duration-200`                        |
| Opacity     | `--opacity-<percent>` | `--opacity-50`                          |
| Z-index     | `--z-index-*`         | `--z-index-100`                         |

## Dark mode

Dark values live in `semantic-dark.css` under the `.dark` class. Put the class on `<html>`; the showcase sets it before first paint from `localStorage` key `wd-theme`, falling back to `prefers-color-scheme`. A `prefers-color-scheme` media query alone does not switch these tokens.

## Using tokens from JavaScript

```ts
import { color, spacing, borderRadius } from "@wyliedog/tokens/hierarchical";

color.blue[500]; // "oklch(0.623 0.188 259.83)"
spacing[200]; // "16px"
borderRadius.md; // "4px"
```

Exports in `hierarchical`: `borderRadius`, `color`, `duration`, `fontSize`, `fontWeight`, `lineHeight`, `shadow`, `spacing`.

`@wyliedog/tokens` is a workspace package; it is not published to npm.
