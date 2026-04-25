# Browser Support

The Wylie Dog Design System targets **modern, OKLCH-capable browsers**. This is an explicit, intentional choice — not an oversight.

## Supported

| Browser              | Minimum version | Released   |
| -------------------- | --------------- | ---------- |
| Chrome / Edge        | 111             | March 2023 |
| Safari (macOS / iOS) | 15.4            | March 2022 |
| Firefox              | 113             | May 2023   |
| Samsung Internet     | 22              | July 2023  |
| Opera                | 97              | March 2023 |

This covers approximately **95% of global browser usage** as of 2026 ([caniuse: oklch](https://caniuse.com/?search=oklch)).

## Why OKLCH-only

All color tokens are authored and shipped in the [OKLCH color space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch). OKLCH provides:

- **Perceptual uniformity** — equal numeric changes produce equal visual changes, unlike sRGB/HSL
- **Wider gamut** — Display-P3 colors are natively expressible without separate fallback chains
- **Better interpolation** — gradients and animations between colors avoid the muddy mid-tones of sRGB
- **Future-proofing** — aligns with the modern CSS Color Module Level 4 direction

Shipping sRGB fallbacks for every color would:

1. **Double the CSS payload** (~200KB → ~400KB) for browsers we don't support anyway
2. **Lose Display-P3 fidelity** on capable hardware (P3 displays would render the sRGB fallback even when OKLCH is supported)
3. **Force tooling complexity** — every transformation, every consumer would have to handle two-color paths

## Unsupported (and why we're OK with that)

- **Internet Explorer (any version)** — End of life June 2022. Microsoft's own support is gone.
- **Safari 15.3 and older** — Pre-March 2022. macOS Big Sur and earlier require updating Safari, which is bundled with macOS updates.
- **Chrome / Edge 110 and older** — Pre-March 2023.
- **Firefox 112 and older** — Pre-May 2023.
- **In-app browsers and embedded WebViews** older than the above versions.

If a user lands on a Wylie Dog interface in an unsupported browser, OKLCH colors will be **invalid CSS** and fall back to the browser's default `color`/`background-color` (typically inherited or black/white). Layout, spacing, typography, and interactivity will still work — only color rendering degrades.

## Defense in depth

The design tokens CSS entry includes an `@supports` guard at the top:

```css
@supports not (color: oklch(0 0 0)) {
  :root::before {
    content: "This site requires a modern browser. Please upgrade to Chrome 111+, Safari 15.4+, or Firefox 113+.";
    /* ... full-screen warning styles ... */
  }
}
```

> **Status:** Not yet implemented. Tracked under Phase 1.1 follow-up.

This warning is intentionally **non-blocking** — the page still renders, but unsupported users see a clear message explaining why colors look off.

## P3 wide-gamut handling

OKLCH values authored in this system may exceed the sRGB gamut (chroma > ~0.18 for many hues). On:

- **Display-P3 capable hardware** (most Apple devices since 2017, modern high-end Android, recent laptops) — colors render at their full intended saturation
- **sRGB-only displays** — the browser performs gamut mapping; high-chroma colors are clipped or compressed, producing a muted but consistent rendering

We accept this tradeoff. Designers authoring in Figma should preview their tokens on at least one sRGB display to confirm acceptable degradation.

The `validate-tokens.js` script flags colors with chroma above 0.4 as "potentially problematic" but does not reject them — chroma is a design decision.

## What this means for contributors

- **Do not** add hex or RGB color values to the token system. The [process pipeline](./scripts/process-token-io.js) auto-converts hex to OKLCH on import; emitted CSS is OKLCH-only.
- **Do not** add `@supports` fallbacks for color-related properties — they're either redundant (if the surrounding browser supports OKLCH) or unhelpful (if it doesn't, fallback color will look wrong against everything else).
- **Do** raise an issue if you discover a target browser in our support matrix where rendering is broken — that's a real bug.

## Re-evaluation

This support matrix should be revisited:

- **Annually**, against current caniuse data
- **When a major customer or deployment surfaces an unsupported-browser requirement** — at which point we discuss whether to add fallback paths for that specific use case
- **When the OKLCH spec evolves** in ways that affect browser implementations
