import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";
import { Switch } from "@wyliedog/ui/switch";
import {
  typographyFontFamilySans,
  typographyFontFamilyMono,
  typographyFontSizeXs,
  typographyFontSizeSm,
  typographyFontSizeBase,
  typographyFontSizeLg,
  typographyFontSizeXl,
  typographyFontSize2xl,
  typographyFontSize3xl,
  typographyFontSize4xl,
  typographyFontSize5xl,
  typographyFontSize6xl,
  typographyFontWeightThin,
  typographyFontWeightLight,
  typographyFontWeightNormal,
  typographyFontWeightMedium,
  typographyFontWeightSemibold,
  typographyFontWeightBold,
  typographyFontWeightExtrabold,
  typographyLineHeightNone,
  typographyLineHeightTight,
  typographyLineHeightSnug,
  typographyLineHeightNormal,
  typographyLineHeightRelaxed,
  typographyLineHeightLoose,
} from "@wyliedog/tokens";

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Typography system demonstrating the type scale, hierarchy, and OKLCH color integration for text elements. Features an interactive playground for exploring typography combinations.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-(length:--font-size-2xl) font-bold">Type Scale</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-(length:--font-size-5xl) font-bold">
              Heading 1 - 48px
            </h1>
          </div>
          <div>
            <h2 className="text-(length:--font-size-4xl) font-bold">
              Heading 2 - 36px
            </h2>
          </div>
          <div>
            <h3 className="text-(length:--font-size-3xl) font-bold">
              Heading 3 - 30px
            </h3>
          </div>
          <div>
            <h4 className="text-(length:--font-size-2xl) font-bold">
              Heading 4 - 24px
            </h4>
          </div>
          <div>
            <h5 className="text-(length:--font-size-xl) font-bold">
              Heading 5 - 20px
            </h5>
          </div>
          <div>
            <h6 className="text-(length:--font-size-lg) font-bold">
              Heading 6 - 18px
            </h6>
          </div>
          <div>
            <p className="text-(length:--font-size-base)">Body (Base) - 16px</p>
          </div>
          <div>
            <p className="text-(length:--font-size-sm)">Small - 14px</p>
          </div>
          <div>
            <p className="text-(length:--font-size-xs)">Extra Small - 12px</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-(length:--font-size-2xl) font-bold">
          Font Weights
        </h2>
        <div className="space-y-2">
          <p className="text-(length:--font-size-xl) font-(--font-weight-light)">
            Light (300)
          </p>
          <p className="text-(length:--font-size-xl) font-(--font-weight-normal)">
            Normal (400)
          </p>
          <p className="text-(length:--font-size-xl) font-(--font-weight-medium)">
            Medium (500)
          </p>
          <p className="text-(length:--font-size-xl) font-(--font-weight-semibold)">
            Semibold (600)
          </p>
          <p className="text-(length:--font-size-xl) font-(--font-weight-bold)">
            Bold (700)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-(length:--font-size-2xl) font-bold">
          Line Heights
        </h2>
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-(length:--font-size-sm) font-semibold mb-1">
              Tight
            </p>
            <p className="leading-(--line-height-tight) text-(--color-text-secondary)">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <p className="text-(length:--font-size-sm) font-semibold mb-1">
              Normal
            </p>
            <p className="leading-(--line-height-normal) text-(--color-text-secondary)">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <p className="text-(length:--font-size-sm) font-semibold mb-1">
              Relaxed
            </p>
            <p className="leading-(--line-height-relaxed) text-(--color-text-secondary)">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Overview of all typography variants including type scale, font weights, and line heights.",
      },
    },
  },
};

export const TypeScale: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-(length:--font-size-5xl) font-bold mb-2">
          Heading 1
        </h1>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-5xl / 48px
        </p>
      </div>

      <div>
        <h2 className="text-(length:--font-size-4xl) font-bold mb-2">
          Heading 2
        </h2>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-4xl / 36px
        </p>
      </div>

      <div>
        <h3 className="text-(length:--font-size-3xl) font-bold mb-2">
          Heading 3
        </h3>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-3xl / 30px
        </p>
      </div>

      <div>
        <h4 className="text-(length:--font-size-2xl) font-bold mb-2">
          Heading 4
        </h4>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-2xl / 24px
        </p>
      </div>

      <div>
        <h5 className="text-(length:--font-size-xl) font-bold mb-2">
          Heading 5
        </h5>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-xl / 20px
        </p>
      </div>

      <div>
        <h6 className="text-(length:--font-size-lg) font-bold mb-2">
          Heading 6
        </h6>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-lg / 18px
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-base) mb-2">Body Large (Base)</p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-base / 16px
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-sm) mb-2">Body Small</p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-sm / 14px
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-xs) mb-2">Caption</p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-xs / 12px
        </p>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-(length:--font-size-xl) font-(--font-weight-light) mb-1">
          Light Weight
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-weight-light / 300
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-xl) font-(--font-weight-normal) mb-1">
          Normal Weight
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-weight-normal / 400
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-xl) font-(--font-weight-medium) mb-1">
          Medium Weight
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-weight-medium / 500
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-xl) font-(--font-weight-semibold) mb-1">
          Semibold Weight
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-weight-semibold / 600
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-xl) font-(--font-weight-bold) mb-1">
          Bold Weight
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-weight-bold / 700
        </p>
      </div>
    </div>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-2">
          Tight (--line-height-tight)
        </h4>
        <p className="leading-(--line-height-tight) text-(--color-text-secondary)">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-2">
          Normal (--line-height-normal)
        </h4>
        <p className="leading-(--line-height-normal) text-(--color-text-secondary)">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-2">
          Relaxed (--line-height-relaxed)
        </h4>
        <p className="leading-(--line-height-relaxed) text-(--color-text-secondary)">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-2">
          Loose (--line-height-loose)
        </h4>
        <p className="leading-(--line-height-loose) text-(--color-text-secondary)">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-(--color-text-primary) text-(length:--font-size-lg) mb-1">
          Primary Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-text-primary
        </p>
      </div>

      <div>
        <p className="text-(--color-text-secondary) text-(length:--font-size-lg) mb-1">
          Secondary Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-text-secondary
        </p>
      </div>

      <div>
        <p className="text-(--color-text-tertiary) text-(length:--font-size-lg) mb-1">
          Muted Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-text-tertiary
        </p>
      </div>

      <div>
        <p className="text-(--color-status-info) text-(length:--font-size-lg) mb-1">
          Link Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-status-info
        </p>
      </div>

      <div>
        <p className="text-(--color-status-error) text-(length:--font-size-lg) mb-1">
          Error Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-status-error
        </p>
      </div>

      <div>
        <p className="text-(--color-status-success) text-(length:--font-size-lg) mb-1">
          Success Text
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --color-status-success
        </p>
      </div>
    </div>
  ),
};

export const TypographyHierarchy: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      <article className="prose prose-gray max-w-none">
        <h1>The Future of Design Systems</h1>
        <p className="lead text-(length:--font-size-xl) text-(--color-text-secondary)">
          How OKLCH color science and modern web technologies are
          revolutionizing the way we build consistent user interfaces.
        </p>

        <h2>Introduction</h2>
        <p>
          Design systems have evolved significantly over the past decade. What
          started as simple style guides have transformed into sophisticated,
          token-driven architectures that enable teams to build cohesive
          experiences at scale.
        </p>

        <h3>Color Revolution</h3>
        <p>
          Traditional design systems relied on RGB and HSL color spaces, which
          don't account for human perception. OKLCH (Oklch) provides
          perceptually uniform colors, ensuring that color relationships remain
          consistent across different contexts and devices.
        </p>

        <blockquote>
          "OKLCH enables mathematical color generation that maintains perceptual
          uniformity—something impossible with traditional color spaces."
        </blockquote>

        <h4>Key Benefits</h4>
        <ul>
          <li>
            <strong>Perceptual uniformity:</strong> Colors appear equally bright
            to human eyes
          </li>
          <li>
            <strong>Extended gamut:</strong> 30% more colors than sRGB
          </li>
          <li>
            <strong>Mathematical precision:</strong> Algorithmic color
            generation
          </li>
          <li>
            <strong>Future-ready:</strong> Aligns with emerging web standards
          </li>
        </ul>

        <h5>Implementation Details</h5>
        <p>
          Implementing OKLCH in production requires careful consideration of
          browser support, fallback strategies, and design tool integration.
        </p>

        <h6>Browser Support</h6>
        <p>
          Modern browsers now support OKLCH natively, with 93% coverage as of
          2024. This makes OKLCH a viable choice for production applications.
        </p>
      </article>
    </div>
  ),
};

export const CodeTypography: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-(--font-size-lg) font-semibold mb-3">
          Inline Code
        </h4>
        <p>
          Use the{" "}
          <code className="bg-(--color-background-secondary) px-1.5 py-0.5 rounded text-(length:--font-size-sm) font-(--font-family-mono)">
            useState
          </code>{" "}
          hook to manage state in React components.
        </p>
      </div>

      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-3">
          Code Block
        </h4>
        <pre className="bg-(--color-background-inverse) text-(--color-text-inverse) p-4 rounded-lg overflow-x-auto">
          <code className="font-(--font-family-mono) text-(length:--font-size-sm)">
            {`function Button({ children, variant = "primary" }) {
  return (
    <button className={\`btn btn-\${variant}\`}>
      {children}
    </button>
  );
}`}
          </code>
        </pre>
      </div>

      <div>
        <h4 className="text-(length:--font-size-lg) font-semibold mb-3">
          Terminal Output
        </h4>
        <pre className="bg-(--color-background-inverse) text-(--color-status-success) p-4 rounded-lg font-(--font-family-mono) text-(length:--font-size-sm)">
          {`$ npm install @wyliedog/ui
+ @wyliedog/ui@1.0.0
added 1 package from 1 contributor
✨ Done in 2.34s`}
        </pre>
      </div>
    </div>
  ),
};

export const ResponsiveTypography: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-(length:--font-size-2xl) md:text-(length:--font-size-4xl) lg:text-(length:--font-size-5xl) font-bold mb-2">
          Responsive Heading
        </h1>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-2xl → md:--font-size-4xl → lg:--font-size-5xl
        </p>
      </div>

      <div>
        <p className="text-(length:--font-size-sm) md:text-(length:--font-size-base) lg:text-(length:--font-size-lg) mb-2">
          This paragraph adapts its size based on screen size. On mobile it's
          smaller, on tablet it's medium, and on desktop it's larger for better
          readability.
        </p>
        <p className="text-(length:--font-size-sm) text-(--color-text-secondary) font-mono">
          --font-size-sm → md:--font-size-base → lg:--font-size-lg
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-(length:--font-size-lg) md:text-(length:--font-size-xl) font-semibold mb-2">
            Mobile First
          </h3>
          <p className="text-(length:--font-size-sm) md:text-(length:--font-size-base) text-(--color-text-secondary)">
            Typography scales up from mobile to larger screens, ensuring
            readability across all devices.
          </p>
        </div>
        <div>
          <h3 className="text-(length:--font-size-lg) md:text-(length:--font-size-xl) font-semibold mb-2">
            Flexible Layout
          </h3>
          <p className="text-(length:--font-size-sm) md:text-(length:--font-size-base) text-(--color-text-secondary)">
            Text size and layout adjust automatically to provide optimal reading
            experience on any device.
          </p>
        </div>
      </div>
    </div>
  ),
};

// Typography token data structures - defined outside component for stability
const fontSizes = {
  xs: {
    value: typographyFontSizeXs,
    token: "typography.font-size.xs",
    tailwind: "text-xs",
  },
  sm: {
    value: typographyFontSizeSm,
    token: "typography.font-size.sm",
    tailwind: "text-sm",
  },
  base: {
    value: typographyFontSizeBase,
    token: "typography.font-size.base",
    tailwind: "text-base",
  },
  lg: {
    value: typographyFontSizeLg,
    token: "typography.font-size.lg",
    tailwind: "text-lg",
  },
  xl: {
    value: typographyFontSizeXl,
    token: "typography.font-size.xl",
    tailwind: "text-xl",
  },
  "2xl": {
    value: typographyFontSize2xl,
    token: "typography.font-size.2xl",
    tailwind: "text-2xl",
  },
  "3xl": {
    value: typographyFontSize3xl,
    token: "typography.font-size.3xl",
    tailwind: "text-3xl",
  },
  "4xl": {
    value: typographyFontSize4xl,
    token: "typography.font-size.4xl",
    tailwind: "text-4xl",
  },
  "5xl": {
    value: typographyFontSize5xl,
    token: "typography.font-size.5xl",
    tailwind: "text-5xl",
  },
  "6xl": {
    value: typographyFontSize6xl,
    token: "typography.font-size.6xl",
    tailwind: "text-6xl",
  },
};

const fontWeights = {
  thin: {
    value: typographyFontWeightThin,
    token: "typography.font-weight.thin",
    tailwind: "font-thin",
  },
  light: {
    value: typographyFontWeightLight,
    token: "typography.font-weight.light",
    tailwind: "font-light",
  },
  normal: {
    value: typographyFontWeightNormal,
    token: "typography.font-weight.normal",
    tailwind: "font-normal",
  },
  medium: {
    value: typographyFontWeightMedium,
    token: "typography.font-weight.medium",
    tailwind: "font-medium",
  },
  semibold: {
    value: typographyFontWeightSemibold,
    token: "typography.font-weight.semibold",
    tailwind: "font-semibold",
  },
  bold: {
    value: typographyFontWeightBold,
    token: "typography.font-weight.bold",
    tailwind: "font-bold",
  },
  extrabold: {
    value: typographyFontWeightExtrabold,
    token: "typography.font-weight.extrabold",
    tailwind: "font-extrabold",
  },
};

const lineHeights = {
  none: {
    value: typographyLineHeightNone,
    token: "typography.line-height.none",
    tailwind: "leading-none",
  },
  tight: {
    value: typographyLineHeightTight,
    token: "typography.line-height.tight",
    tailwind: "leading-tight",
  },
  snug: {
    value: typographyLineHeightSnug,
    token: "typography.line-height.snug",
    tailwind: "leading-snug",
  },
  normal: {
    value: typographyLineHeightNormal,
    token: "typography.line-height.normal",
    tailwind: "leading-normal",
  },
  relaxed: {
    value: typographyLineHeightRelaxed,
    token: "typography.line-height.relaxed",
    tailwind: "leading-relaxed",
  },
  loose: {
    value: typographyLineHeightLoose,
    token: "typography.line-height.loose",
    tailwind: "leading-loose",
  },
};

const fontFamilies = {
  sans: {
    value: `${typographyFontFamilySans}, ui-sans-serif, system-ui, sans-serif`,
    token: "typography.font-family.sans",
    tailwind: "font-sans",
    cssVar: "var(--font-family-sans)",
  },
  mono: {
    value: `${typographyFontFamilyMono}, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
    token: "typography.font-family.mono",
    tailwind: "font-mono",
    cssVar: "var(--font-family-mono)",
  },
};

// Extracted component for proper React hooks behavior
function TypographyPlaygroundComponent() {
  const [selectedFontSize, setSelectedFontSize] = useState<string>("base");
  const [selectedFontWeight, setSelectedFontWeight] =
    useState<string>("normal");
  const [selectedLineHeight, setSelectedLineHeight] =
    useState<string>("normal");
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>("sans");
  const [previewText, setPreviewText] = useState(
    "The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing."
  );
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  const currentFontSize = fontSizes[selectedFontSize as keyof typeof fontSizes];
  const currentFontWeight =
    fontWeights[selectedFontWeight as keyof typeof fontWeights];
  const currentLineHeight =
    lineHeights[selectedLineHeight as keyof typeof lineHeights];
  const currentFontFamily =
    fontFamilies[selectedFontFamily as keyof typeof fontFamilies];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-2">
          Typography Playground
        </h3>
        <p className="text-sm text-muted-foreground">
          Interactive explorer for typography tokens. Adjust font size, weight,
          line height, and family to see how they work together with live design
          token values.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typography Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Font Size</Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Object.keys(fontSizes).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedFontSize(size)}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    selectedFontSize === size
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {showTokenDetails && (
              <div className="text-xs text-muted-foreground font-mono space-y-1">
                <div>Value: {currentFontSize.value}</div>
                <div>Token: {currentFontSize.token}</div>
              </div>
            )}
          </div>

          {/* Font Weight */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Font Weight</Label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.keys(fontWeights).map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => setSelectedFontWeight(weight)}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    selectedFontWeight === weight
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
            {showTokenDetails && (
              <div className="text-xs text-muted-foreground font-mono space-y-1">
                <div>Value: {currentFontWeight.value}</div>
                <div>Token: {currentFontWeight.token}</div>
              </div>
            )}
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Line Height</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.keys(lineHeights).map((height) => (
                <button
                  key={height}
                  type="button"
                  onClick={() => setSelectedLineHeight(height)}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    selectedLineHeight === height
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {height}
                </button>
              ))}
            </div>
            {showTokenDetails && (
              <div className="text-xs text-muted-foreground font-mono space-y-1">
                <div>Value: {currentLineHeight.value}</div>
                <div>Token: {currentLineHeight.token}</div>
              </div>
            )}
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Font Family</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(fontFamilies).map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => setSelectedFontFamily(family)}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    selectedFontFamily === family
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
            {showTokenDetails && (
              <div className="text-xs text-muted-foreground font-mono truncate">
                <div>Value: {currentFontFamily.value}</div>
                <div>Token: {currentFontFamily.token}</div>
              </div>
            )}
          </div>

          {/* Toggle Token Details */}
          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="token-details"
              checked={showTokenDetails}
              onCheckedChange={setShowTokenDetails}
            />
            <Label htmlFor="token-details" className="text-sm">
              Show token details inline
            </Label>
          </div>

          {/* Custom Text Input */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preview Text</Label>
            <textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
              placeholder="Enter your text here..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Live Preview</span>
            <Badge variant="outline">Interactive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border bg-background"
            style={{
              fontSize: currentFontSize.value,
              fontWeight: currentFontWeight.value,
              lineHeight: currentLineHeight.value,
              fontFamily: currentFontFamily.value,
            }}
          >
            {previewText}
          </div>
        </CardContent>
      </Card>

      {/* Token Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Token Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* CSS */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">CSS Properties</div>
              <div className="p-3 rounded-md bg-muted/50 text-xs font-mono space-y-1">
                <div>font-size: {currentFontSize.value};</div>
                <div>font-weight: {currentFontWeight.value};</div>
                <div>line-height: {currentLineHeight.value};</div>
                <div>font-family: {currentFontFamily.value};</div>
              </div>
            </div>

            {/* Token Names */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Design Token Names</div>
              <div className="p-3 rounded-md bg-muted/50 text-xs font-mono space-y-1">
                <div>{currentFontSize.token}</div>
                <div>{currentFontWeight.token}</div>
                <div>{currentLineHeight.token}</div>
                <div>{currentFontFamily.token}</div>
              </div>
            </div>
          </div>

          {/* JavaScript Import Example */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">JavaScript Import</div>
            <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
              <code className="text-muted-foreground">
                {`import {
  typographyFontSize${selectedFontSize.charAt(0).toUpperCase() + selectedFontSize.slice(1).replace(/[^a-zA-Z0-9]/g, "")},
  typographyFontWeight${selectedFontWeight.charAt(0).toUpperCase() + selectedFontWeight.slice(1)},
  typographyLineHeight${selectedLineHeight.charAt(0).toUpperCase() + selectedLineHeight.slice(1)},
  typographyFontFamily${selectedFontFamily.charAt(0).toUpperCase() + selectedFontFamily.slice(1)}
} from '@wyliedog/tokens';`}
              </code>
            </div>
          </div>

          {/* Tailwind Classes */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">Tailwind CSS Classes</div>
            <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
              <code>
                className="{currentFontSize.tailwind}{" "}
                {currentFontWeight.tailwind} {currentLineHeight.tailwind}{" "}
                {currentFontFamily.tailwind}"
              </code>
            </div>
          </div>

          {/* Copy Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const cssText = `font-size: ${currentFontSize.value};\nfont-weight: ${currentFontWeight.value};\nline-height: ${currentLineHeight.value};\nfont-family: ${currentFontFamily.value};`;
                navigator.clipboard.writeText(cssText);
              }}
            >
              Copy CSS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tokenText = `${currentFontSize.token}\n${currentFontWeight.token}\n${currentLineHeight.token}\n${currentFontFamily.token}`;
                navigator.clipboard.writeText(tokenText);
              }}
            >
              Copy Token Names
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const tailwindText = `${currentFontSize.tailwind} ${currentFontWeight.tailwind} ${currentLineHeight.tailwind} ${currentFontFamily.tailwind}`;
                navigator.clipboard.writeText(tailwindText);
              }}
            >
              Copy Tailwind Classes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedFontSize("base");
            setSelectedFontWeight("normal");
            setSelectedLineHeight("normal");
            setSelectedFontFamily("sans");
            setPreviewText(
              "The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing."
            );
          }}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

export const TypographyPlayground: Story = {
  render: () => <TypographyPlaygroundComponent />,
};
