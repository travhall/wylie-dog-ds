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

| Group                    | Tokens                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ground background        | `--color-background-{default,subtle,strong,raised,overlay}`; states `--color-background-default-{hover,active,disabled}` and `--color-background-subtle-active` |
| Ground foreground        | `--color-foreground-{default,muted,faint}` and `--color-foreground-default-disabled`                                                                            |
| Ground border            | `--color-border-{default,subtle,strong}`; the focus ring is `--color-focus-ring`                                                                                |
| Primary                  | `--color-primary-background-{default,subtle}` (default has `-hover` and `-active`), `--color-primary-foreground-{default,subtle}`                               |
| Danger, success, warning | `--color-{role}-background-{default,subtle}` (default has `-hover`), `--color-{role}-foreground-{default,subtle}`, `--color-{role}-border-default`              |
| Info                     | `--color-info-background-subtle`, `--color-info-foreground-subtle`                                                                                              |
| Inverse                  | `--color-inverse-background-default`, `--color-inverse-foreground-default`                                                                                      |

`--color-inverse-foreground-default` flips with the theme, so pair it only with `--color-inverse-background-default`. Text on a solid role fill uses that role's foreground, for example `--color-danger-foreground-default` on `--color-danger-background-default`.

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
