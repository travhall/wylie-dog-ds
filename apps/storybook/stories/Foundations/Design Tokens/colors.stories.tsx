import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { color } from "@wyliedog/tokens/hierarchical";
import { Button } from "@wyliedog/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Progress } from "@wyliedog/ui/progress";
import { Input } from "@wyliedog/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Color system built on OKLCH for perceptually uniform colors, P3 wide gamut support, and automatic light/dark adaptation. Browse the full palette, semantic token catalog, and accessibility reference.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Shared helper — color swatch with copy-on-click
// Copies the raw OKLCH value. Primitive tokens live in `@theme inline` (not
// :root), so `var(--color-name)` doesn't resolve from external CSS. The OKLCH
// literal is the correct value to copy for use in custom properties or when
// overriding semantic tokens.
// ============================================================================

const ColorSwatch = ({
  colorName,
  shade,
  value,
}: {
  colorName: string;
  shade: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy OKLCH value for ${colorName}-${shade}`}
      className="group relative flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
    >
      <div
        className="w-12 h-12 rounded border border-(--color-border-secondary) group-hover:ring-2 group-hover:ring-(--color-border-focus) group-focus-visible:ring-2 group-focus-visible:ring-(--color-border-focus) transition-all"
        style={{ backgroundColor: value }}
      />
      <span className="text-xs font-mono text-(--color-text-tertiary)">
        {shade}
      </span>
      {copied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-(--color-text-primary) text-(--color-background-primary) text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
          Copied!
        </div>
      )}
    </button>
  );
};

// ============================================================================
// STORY 1: System Overview (includes OKLCH deep dive)
// ============================================================================

export const SystemOverview: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three-tier token architecture, OKLCH color science, and P3 wide gamut support — everything you need to understand the system before using it.",
      },
    },
  },
  render: () => {
    const colorScaleCount = Object.keys(color).length;
    const totalPrimitives = Object.values(color).reduce(
      (acc, shades) => acc + Object.keys(shades as object).length,
      0
    );

    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Color System
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            Built on OKLCH for perceptually uniform brightness across all hues.
            Supports Display P3 wide gamut on modern devices with automatic sRGB
            fallback.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: colorScaleCount, label: "Color Scales" },
            { value: totalPrimitives, label: "Primitive Tokens" },
            { value: "30%", label: "More Colors (P3)" },
            { value: "AA", label: "WCAG Level" },
          ].map(({ value, label }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-(--color-text-primary)">
                  {value}
                </div>
                <p className="text-sm text-(--color-text-secondary)">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Three-Tier Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>Three-Tier Token Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: "1",
                  label: "Primitive",
                  desc: "Raw OKLCH color scales (50–950). Context-free named values.",
                  examples: ["--color-gray-500", "--color-blue-600"],
                },
                {
                  tier: "2",
                  label: "Semantic",
                  desc: "Purpose-driven tokens that map to primitives. Adapt between light and dark mode.",
                  examples: [
                    "--color-text-primary",
                    "--color-background-primary",
                  ],
                },
                {
                  tier: "3",
                  label: "Component",
                  desc: "Component-specific tokens. Reference semantics — never primitives directly.",
                  examples: [
                    "--color-button-default-background",
                    "--color-card-border",
                  ],
                },
              ].map(({ tier, label, desc, examples }) => (
                <div key={tier} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-(--color-interactive-primary) flex items-center justify-center text-(--color-background-primary) text-xs font-bold shrink-0">
                      {tier}
                    </div>
                    <h3 className="font-semibold text-(--color-text-primary)">
                      {label}
                    </h3>
                  </div>
                  <p className="text-sm text-(--color-text-secondary)">
                    {desc}
                  </p>
                  <div className="text-xs font-mono bg-(--color-background-secondary) text-(--color-text-secondary) p-2 rounded space-y-1">
                    {examples.map((ex) => (
                      <div key={ex}>{ex}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="sr-only">Best practice</h4>
            <Alert>
              <AlertTitle>Always use semantic or component tokens</AlertTitle>
              <AlertDescription>
                Primitive tokens give the color system its vocabulary. Semantic
                tokens are what your code should reach for — they carry intent
                (primary text, danger border) and automatically shift between
                light and dark mode.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Semantic vs Primitive — usage rule */}
        <Card>
          <CardHeader>
            <CardTitle>Using tokens in practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-(--color-text-secondary)">
              Semantic tokens carry intent and adapt automatically to the active
              theme. Primitive tokens are the raw values that power them — not
              something your components should reference directly.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-(--color-status-danger)">
                  Avoid — primitive token
                </p>
                <div className="p-3 rounded-md bg-(--color-background-secondary) text-xs font-mono text-(--color-text-secondary) space-y-1">
                  <div>color: var(--color-gray-900);</div>
                  <div>background: var(--color-blue-600);</div>
                  <div>border: 1px solid var(--color-gray-200);</div>
                </div>
                <p className="text-xs text-(--color-text-tertiary)">
                  Hard-coded to one theme — breaks in dark mode.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-(--color-status-success)">
                  Prefer — semantic token
                </p>
                <div className="p-3 rounded-md bg-(--color-background-secondary) text-xs font-mono text-(--color-text-secondary) space-y-1">
                  <div>color: var(--color-text-primary);</div>
                  <div>background: var(--color-interactive-primary);</div>
                  <div>border: 1px solid var(--color-border-primary);</div>
                </div>
                <p className="text-xs text-(--color-text-tertiary)">
                  Carries intent. Adapts to light and dark automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why OKLCH */}
        <Card>
          <CardHeader>
            <CardTitle>Why OKLCH?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-(--color-text-secondary)">
              OKLCH (Lightness, Chroma, Hue) is a perceptually uniform color
              space. Equal numerical changes produce equal visual changes —
              unlike HSL, where yellow at 50% lightness looks far brighter than
              blue at the same value.
            </p>

            {/* L / C / H breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  axis: "L — Lightness",
                  desc: "0 = pure black · 1 = pure white",
                  progress: 70,
                  mono: "oklch(0.70 … …)",
                },
                {
                  axis: "C — Chroma",
                  desc: "0 = neutral gray · higher = more saturated",
                  progress: 50,
                  mono: "oklch(… 0.15 …)",
                },
                {
                  axis: "H — Hue",
                  desc: "0–360° around the color wheel",
                  progress: 72,
                  mono: "oklch(… … 260)",
                },
              ].map(({ axis, desc, progress, mono }) => (
                <div key={axis} className="space-y-2">
                  <div className="font-semibold text-sm text-(--color-text-primary)">
                    {axis}
                  </div>
                  <div className="text-xs text-(--color-text-secondary)">
                    {desc}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs font-mono text-(--color-text-tertiary)">
                    {mono}
                  </div>
                </div>
              ))}
            </div>

            {/* Perceptual uniformity demo */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-(--color-text-primary)">
                Perceptual uniformity — all colors at L=0.65
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs text-(--color-text-secondary)">
                    OKLCH — consistent perceived brightness across hues
                  </p>
                  <div className="grid grid-cols-6 gap-2 h-14">
                    {[
                      { bg: "oklch(0.65 0.19 27)", title: "Red" },
                      { bg: "oklch(0.65 0.19 70)", title: "Orange" },
                      { bg: "oklch(0.65 0.15 140)", title: "Green" },
                      { bg: "oklch(0.65 0.17 230)", title: "Cyan" },
                      { bg: "oklch(0.65 0.22 265)", title: "Blue" },
                      { bg: "oklch(0.65 0.24 320)", title: "Magenta" },
                    ].map(({ bg, title }) => (
                      <div
                        key={title}
                        className="rounded"
                        style={{ backgroundColor: bg }}
                        title={title}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-(--color-text-secondary)">
                    HSL at 50% lightness — yellow/green appear significantly
                    brighter than blue
                  </p>
                  <div className="grid grid-cols-6 gap-2 h-14">
                    {[
                      { bg: "hsl(0, 100%, 50%)", title: "Red" },
                      { bg: "hsl(30, 100%, 50%)", title: "Orange" },
                      { bg: "hsl(120, 100%, 50%)", title: "Green" },
                      { bg: "hsl(180, 100%, 50%)", title: "Cyan" },
                      { bg: "hsl(240, 100%, 50%)", title: "Blue" },
                      { bg: "hsl(300, 100%, 50%)", title: "Magenta" },
                    ].map(({ bg, title }) => (
                      <div
                        key={title}
                        className="rounded"
                        style={{ backgroundColor: bg }}
                        title={title}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* P3 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-semibold text-sm text-(--color-text-primary)">
                  P3 Wide Gamut
                </div>
                <ul className="text-xs space-y-1 text-(--color-text-secondary)">
                  <li>30% more vibrant colors than sRGB</li>
                  <li>Supported on iPhone X+, iPad Pro, MacBook Pro 2016+</li>
                  <li>
                    Automatic sRGB fallback — no breakage on older displays
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-sm text-(--color-text-primary)">
                  Browser Support
                </div>
                <ul className="text-xs space-y-1 text-(--color-text-secondary)">
                  <li>Chrome 111+, Safari 15.4+, Firefox 113+</li>
                  <li>
                    Specified as <code className="font-mono">oklch(…)</code> in
                    CSS
                  </li>
                  <li>Falls back gracefully in unsupported browsers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 2: Primitive Palette — full color scales
// ============================================================================

export const AllColors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Complete primitive color palette. Click any swatch to copy its OKLCH value. Primitive tokens live in Tailwind's `@theme inline` block — reference them through semantic tokens in your own code rather than directly.",
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <Alert>
        <AlertTitle>Primitive tokens are building blocks, not API</AlertTitle>
        <AlertDescription>
          These values power the semantic layer. In your components, always
          reach for{" "}
          <code className="font-mono text-xs">--color-text-primary</code>,{" "}
          <code className="font-mono text-xs">
            --color-background-secondary
          </code>
          , etc. — not raw primitive names like{" "}
          <code className="font-mono text-xs">--color-gray-500</code>.
        </AlertDescription>
      </Alert>

      {Object.entries(color).map(([colorName, shades]) => {
        const shadeEntries = Object.entries(
          shades as Record<string, string>
        ).sort(([a], [b]) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
          if (isNaN(numA)) return 1;
          if (isNaN(numB)) return -1;
          return numA - numB;
        });

        return (
          <div key={colorName} className="space-y-3">
            <h3 className="text-sm font-semibold capitalize text-(--color-text-primary)">
              {colorName}
            </h3>
            <div className="flex flex-wrap gap-3">
              {shadeEntries.map(([shade, value]) => (
                <ColorSwatch
                  key={shade}
                  colorName={colorName}
                  shade={shade}
                  value={value}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ),
};

// ============================================================================
// STORY 3: Semantic Tokens — purpose-driven color reference
// ============================================================================

export const SemanticTokens: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The semantic layer maps primitive colors to named intents. These tokens automatically shift between light and dark mode — toggle the mode in the Storybook toolbar above to see them adapt. Use these tokens in your code, never primitives.",
      },
    },
  },
  render: () => {
    const groups: {
      category: string;
      description: string;
      tokens: { name: string; usage: string }[];
    }[] = [
      {
        category: "Background",
        description: "Page surfaces and container fills",
        tokens: [
          {
            name: "--color-background-primary",
            usage: "Main page / modal background",
          },
          {
            name: "--color-background-secondary",
            usage: "Sidebar, panel, subtle surface",
          },
          {
            name: "--color-background-tertiary",
            usage: "Deeply nested or muted surface",
          },
          {
            name: "--color-background-inverse",
            usage: "Inverted surface (light on dark, dark on light)",
          },
        ],
      },
      {
        category: "Surface",
        description:
          "Status-tinted fills for feedback components — what Alert, Badge, and Toast use internally",
        tokens: [
          {
            name: "--color-surface-raised",
            usage: "Floating elements — popovers, dropdowns",
          },
          {
            name: "--color-surface-success",
            usage: "Success alert / badge fill",
          },
          {
            name: "--color-surface-warning",
            usage: "Warning alert / badge fill",
          },
          {
            name: "--color-surface-danger",
            usage: "Danger / error alert fill",
          },
          { name: "--color-surface-info", usage: "Informational alert fill" },
        ],
      },
      {
        category: "Text",
        description: "Content hierarchy and status messaging",
        tokens: [
          {
            name: "--color-text-primary",
            usage: "Headings, body copy, default labels",
          },
          { name: "--color-text-secondary", usage: "Descriptions, captions" },
          {
            name: "--color-text-tertiary",
            usage: "Timestamps, metadata, faint labels",
          },
          {
            name: "--color-text-disabled",
            usage: "Disabled / placeholder text",
          },
          { name: "--color-text-brand", usage: "Brand-colored text" },
          {
            name: "--color-text-danger",
            usage: "Error messages, destructive labels",
          },
          {
            name: "--color-text-success",
            usage: "Confirmation, success messages",
          },
          { name: "--color-text-warning", usage: "Warning messages" },
          { name: "--color-text-info", usage: "Informational messages, links" },
        ],
      },
      {
        category: "Border",
        description: "Dividers, outlines, and focus rings",
        tokens: [
          {
            name: "--color-border-primary",
            usage: "Default card, input, separator border",
          },
          { name: "--color-border-secondary", usage: "Subtle dividers" },
          { name: "--color-border-focus", usage: "Keyboard focus ring" },
          { name: "--color-border-success", usage: "Success state border" },
          { name: "--color-border-warning", usage: "Warning state border" },
          {
            name: "--color-border-danger",
            usage: "Error / destructive border",
          },
        ],
      },
      {
        category: "Interactive",
        description: "Buttons, links, and active controls",
        tokens: [
          {
            name: "--color-interactive-primary",
            usage: "Primary action background",
          },
          {
            name: "--color-interactive-primary-hover",
            usage: "Primary action — hover",
          },
          {
            name: "--color-interactive-primary-active",
            usage: "Primary action — active / pressed",
          },
          {
            name: "--color-interactive-secondary",
            usage: "Secondary action background",
          },
          {
            name: "--color-interactive-secondary-hover",
            usage: "Secondary action — hover",
          },
          {
            name: "--color-interactive-disabled",
            usage: "Disabled interactive element",
          },
        ],
      },
      {
        category: "Status",
        description:
          "Saturated indicator colors for icons, badge dots, and status markers — pair with Surface tokens for filled backgrounds",
        tokens: [
          {
            name: "--color-status-success",
            usage: "Success indicator icon / dot",
          },
          {
            name: "--color-status-warning",
            usage: "Warning indicator icon / dot",
          },
          {
            name: "--color-status-danger",
            usage: "Error / destructive indicator icon / dot",
          },
          {
            name: "--color-status-info",
            usage: "Informational indicator icon / dot",
          },
        ],
      },
    ];

    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const handleCopy = (tokenName: string) => {
      navigator.clipboard.writeText(`var(${tokenName})`);
      setCopiedToken(tokenName);
      setTimeout(() => setCopiedToken(null), 1800);
    };

    return (
      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.category} className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-(--color-text-primary)">
                {group.category}
              </h3>
              <p className="text-sm text-(--color-text-secondary)">
                {group.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {group.tokens.map((token) => (
                <button
                  key={token.name}
                  onClick={() => handleCopy(token.name)}
                  className="relative flex items-center gap-3 p-2.5 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) hover:bg-(--color-background-secondary) transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) group"
                >
                  {/* Swatch — var() resolves correctly since semantic tokens are on :root */}
                  <div
                    className="w-10 h-10 rounded border border-(--color-border-secondary) shrink-0"
                    style={{ backgroundColor: `var(${token.name})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-medium text-(--color-text-primary) truncate">
                      {token.name}
                    </div>
                    <div className="text-xs text-(--color-text-tertiary) mt-0.5 truncate">
                      {token.usage}
                    </div>
                  </div>
                  {copiedToken === token.name ? (
                    <span className="text-xs font-medium text-(--color-status-success) shrink-0">
                      Copied!
                    </span>
                  ) : (
                    <span className="text-xs text-(--color-text-tertiary) opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Copy
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Using Semantic Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-(--color-text-primary)">
                Tailwind v4 arbitrary syntax
              </h4>
              <div className="font-mono text-xs bg-(--color-background-secondary) p-3 rounded">
                <span className="text-(--color-text-tertiary)">{`// CSS variable inline — Tailwind v4`}</span>
                <br />
                {`<p className="text-(--color-text-secondary) bg-(--color-background-primary)">`}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-(--color-text-primary)">
                Inline style
              </h4>
              <div className="font-mono text-xs bg-(--color-background-secondary) p-3 rounded">
                {`style={{ color: 'var(--color-text-secondary)' }}`}
              </div>
            </div>
            <Alert>
              <AlertTitle>Tokens shift automatically in dark mode</AlertTitle>
              <AlertDescription>
                Adding the <code className="font-mono text-xs">dark</code> class
                to the root element remaps all semantic tokens. No conditional
                logic needed in your components. Toggle the mode in the
                Storybook toolbar to see every swatch adapt in place.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 4: Accessibility — contrast ratios and WCAG compliance
// ============================================================================

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Semantic token pairings and their approximate WCAG 2.1 contrast ratios. Verify custom pairings with browser DevTools (Elements → Computed → contrast ratio).",
      },
    },
  },
  render: () => {
    const contrastExamples = [
      {
        name: "Primary Text",
        foreground: "var(--color-text-primary)",
        background: "var(--color-background-primary)",
        ratio: "~21:1",
        level: "AAA",
        usage: "Body text, headings",
      },
      {
        name: "Secondary Text",
        foreground: "var(--color-text-secondary)",
        background: "var(--color-background-primary)",
        ratio: "~8.5:1",
        level: "AAA",
        usage: "Descriptions, captions",
      },
      {
        name: "Tertiary Text",
        foreground: "var(--color-text-tertiary)",
        background: "var(--color-background-primary)",
        ratio: "~4.8:1",
        level: "AA",
        usage: "Metadata, labels (large text only)",
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2 text-(--color-text-primary)">
            Color Accessibility
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            All semantic tokens meet WCAG 2.1 Level AA for their intended use
            cases. Ratios below are approximate — use browser DevTools to verify
            exact values or when creating custom pairings.
          </p>
        </div>

        {/* WCAG requirements table */}
        <Card>
          <CardHeader>
            <CardTitle>WCAG 2.1 Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  level: "Level AA (Minimum)",
                  rows: [
                    ["Normal text (< 18pt)", "4.5:1"],
                    ["Large text (≥ 18pt or 14pt bold)", "3:1"],
                    ["UI components & boundaries", "3:1"],
                  ],
                },
                {
                  level: "Level AAA (Enhanced)",
                  rows: [
                    ["Normal text", "7:1"],
                    ["Large text", "4.5:1"],
                    ["UI components", "4.5:1"],
                  ],
                },
              ].map(({ level, rows }) => (
                <div
                  key={level}
                  className="p-4 rounded-lg border border-(--color-border-primary) bg-(--color-background-secondary)"
                >
                  <div className="font-semibold text-sm text-(--color-text-primary) mb-3">
                    {level}
                  </div>
                  <div className="space-y-2">
                    {rows.map(([label, ratio]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-(--color-text-secondary)">
                          {label}
                        </span>
                        <Badge variant="outline">{ratio}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live contrast examples */}
        <Card>
          <CardHeader>
            <CardTitle>Semantic Token Pairings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {contrastExamples.map((example) => (
              <div key={example.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-(--color-text-primary)">
                      {example.name}
                    </div>
                    <div className="text-xs text-(--color-text-tertiary)">
                      {example.usage}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-(--color-text-primary)">
                      {example.ratio}
                    </span>
                    <Badge
                      variant={
                        example.level === "AAA" ? "default" : "secondary"
                      }
                    >
                      {example.level}
                    </Badge>
                  </div>
                </div>
                <div
                  className="p-6 rounded-lg border border-(--color-border-primary)"
                  style={{
                    backgroundColor: example.background,
                    color: example.foreground,
                  }}
                >
                  <div className="text-base mb-2">Normal text (16px)</div>
                  <div className="text-lg font-semibold">
                    Large text (18pt / 24px)
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Best practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: "✅",
                title: "Use semantic tokens",
                body: "Pre-tested pairings. Always prefer them over primitives.",
              },
              {
                icon: "✅",
                title: "Verify custom combinations",
                body: "Browser DevTools → Elements → Computed → contrast ratio gives the exact value for any foreground/background pair.",
              },
              {
                icon: "⚠️",
                title: "Don't rely on color alone",
                body: "Pair color with icons, labels, or patterns for users with color vision deficiencies.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="text-lg shrink-0">{icon}</div>
                <div>
                  <div className="font-medium text-sm text-(--color-text-primary) mb-1">
                    {title}
                  </div>
                  <p className="text-xs text-(--color-text-secondary)">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 5: Token Browser — interactive search & copy
// ============================================================================

export const TokenBrowser: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Search the full primitive color catalog. Click any token to copy its OKLCH value — useful when overriding semantic tokens in custom CSS. For semantic tokens, use the Semantic Tokens story above.",
      },
    },
  },
  render: () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const allTokens = Object.entries(color).flatMap(([colorName, shades]) =>
      Object.entries(shades as Record<string, string>).map(
        ([shade, value]) => ({
          name: `${colorName}-${shade}`,
          category: colorName,
          value: value as string,
        })
      )
    );

    const categories = ["all", ...Object.keys(color)];

    const filteredTokens = allTokens.filter((token) => {
      const matchesSearch = token.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || token.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const handleCopy = (token: { name: string; value: string }) => {
      // Copy the OKLCH value — primitive tokens live in @theme inline,
      // not on :root, so var(--color-name) won't resolve from external CSS.
      navigator.clipboard.writeText(token.value);
      setCopiedToken(token.name);
      setTimeout(() => setCopiedToken(null), 1800);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2 text-(--color-text-primary)">
            Primitive Token Browser
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-2">
            Search and copy OKLCH values for any primitive token. Use these when
            defining or overriding semantic tokens in your app's CSS — not
            directly in component classes.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search (e.g., blue-500, gray)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger aria-label="Filter by color category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All colors" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-(--color-text-tertiary)">
          Showing {filteredTokens.length} of {allTokens.length} tokens — click
          to copy OKLCH value
        </p>

        {/* Token grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredTokens.map((token) => (
            <button
              key={token.name}
              onClick={() => handleCopy(token)}
              className="relative flex items-center gap-3 p-3 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) hover:border-(--color-border-focus) hover:bg-(--color-background-secondary) transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
            >
              <div
                className="w-10 h-10 rounded border border-(--color-border-secondary) shrink-0"
                style={{ backgroundColor: token.value }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-medium text-(--color-text-primary) truncate">
                  {token.name}
                </div>
                <div className="font-mono text-xs text-(--color-text-tertiary) truncate">
                  {token.value}
                </div>
              </div>
              {copiedToken === token.name && (
                <div className="absolute inset-0 flex items-center justify-center bg-(--color-background-primary) rounded-lg">
                  <span className="text-xs font-medium text-(--color-text-primary)">
                    Copied!
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredTokens.length === 0 && (
          <div className="text-center py-12 text-(--color-text-secondary)">
            No tokens found matching "{searchQuery}"
          </div>
        )}
      </div>
    );
  },
};
