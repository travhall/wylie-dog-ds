# Baseline: before the primary colour changes

Measured 2026-10-29 on `main` at `f81bf319`, with primary still blue. Screenshots in this folder were taken from a production build of the showcase (port 3099) and the running Storybook (port 6006), at 1280 x 900, in Light and Dark.

## The primary token chain

Six semantic tokens carry the primary role. Everything in the UI that is "primary" reaches blue through them.

| Semantic token                      | Light value (OKLCH)  | Dark value (OKLCH)   | Ramp step              |
| ----------------------------------- | -------------------- | -------------------- | ---------------------- |
| `color.background.primary`          | `0.546 0.215 262.91` | `0.546 0.215 262.91` | blue 600               |
| `color.background.primary-muted`    | `0.97 0.014 254.82`  | `0.282 0.087 267.94` | blue 50 / blue 950     |
| `color.background.primary-emphasis` | `0.488 0.217 264.41` | `0.488 0.217 264.41` | blue 700               |
| `color.foreground.primary`          | `0.991 0.003 264.42` | `0.991 0.003 264.42` | gray 50 (text on fill) |
| `color.foreground.primary-muted`    | `0.488 0.217 264.41` | `0.714 0.143 254.65` | blue 700 / blue 400    |
| `color.border.primary`              | `0.546 0.215 262.91` | `0.546 0.215 262.91` | blue 600               |

Reach: 117 lines in `components.json` mention primary (the button's default variant and others bind to these six); 25 files in `packages/ui/src` and `apps/showcase/src` reference it.

## The target palette

The five brand palettes already exist as primitives, unused by any semantic token: `fiery-coral`, `polar-night`, `sandcastle`, `petrified-wood`, `black-bear`. The plan is fiery-coral for primary, with the other four placed elsewhere afterwards.

Fiery-coral against the light foreground (gray 50), the pair every solid primary fill must hold at 4.5:1 for text:

| Step | Fiery-coral | Blue (current) |
| ---- | ----------- | -------------- |
| 500  | 3.37:1      | 3.59:1         |
| 600  | **3.98:1**  | 5.04:1         |
| 700  | 6.02:1      | 6.54:1         |
| 800  | 8.50:1      | 8.52:1         |

Primary solid fill is step 600 today. Fiery-coral 600 measures 3.98:1, below the 4.5:1 minimum. The blue ramp was lightness-aligned in October so a role could swap hue and keep its step; the five named palettes were deliberately left untouched, so fiery-coral is not aligned. Prediction: a straight swap to fiery-coral 600 fails the contrast check on the button, and the fix is a design decision (use step 700 for the fill, or retune the ramp), not a code edit.

## Guard rails, before

`pnpm check:contrast`: 145 declared foregrounds, 404 checks (Light and Dark), 0 known failures.

## Screenshots

| Surface                | Light                                 | Dark                                 |
| ---------------------- | ------------------------------------- | ------------------------------------ |
| Showcase home          | `showcase-home-light.png`             | `showcase-home-dark.png`             |
| Showcase components    | `showcase-components-light.png`       | `showcase-components-dark.png`       |
| Showcase token colours | `showcase-tokens-colors-light.png`    | `showcase-tokens-colors-dark.png`    |
| Storybook button       | `storybook-button-variants-light.png` | `storybook-button-variants-dark.png` |
| Storybook badge        | `storybook-badge-light.png`           | `storybook-badge-dark.png`           |

Not tokens, so they will not follow the change on their own: the Wylie Dog logo (an image with a blue square) and any raster artwork.
