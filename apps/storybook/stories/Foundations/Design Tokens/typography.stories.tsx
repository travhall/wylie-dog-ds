import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useCopyToClipboard } from "./use-copy-to-clipboard";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";
import { Textarea } from "@wyliedog/ui/textarea";
import manifest from "@wyliedog/tokens/manifest.json";
import { spacing } from "@wyliedog/tokens/hierarchical";
import { PageIntro, Section, TokenTable } from "./foundations-ui";
import type { TokenRow } from "./token-data";

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

// =============================================================================
// Token-driven data extraction from manifest.json
// =============================================================================

interface TokenEntry {
  name: string;
  path: string[];
  value: string | number;
  type: string;
  variable: string;
  description: string;
}

interface TypographyTokenData {
  key: string;
  value: string | number;
  jsName: string;
  token: string;
  cssVar: string;
  tailwind: string;
}

// Tailwind class mappings for edge cases where token name doesn't match Tailwind convention
const tailwindClassOverrides: Record<string, Record<string, string>> = {
  fontWeight: {
    regular: "font-normal", // Tailwind uses "normal" not "regular"
  },
  // Add other overrides here as needed
};

// Font family fallback stacks
const fontFamilyFallbacks: Record<string, string> = {
  sans: ", ui-sans-serif, system-ui, sans-serif",
  serif: ", ui-serif, Georgia, serif",
  mono: ", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

/**
 * Derives Tailwind class from token metadata
 */
function getTailwindClass(
  category: string,
  tokenKey: string,
  tokenType: string
): string {
  // Check for explicit overrides first
  if (tailwindClassOverrides[tokenType]?.[tokenKey]) {
    return tailwindClassOverrides[tokenType][tokenKey];
  }

  // Map token types to Tailwind prefixes
  const prefixMap: Record<string, string> = {
    fontSize: "text",
    fontWeight: "font",
    lineHeight: "leading",
    fontFamily: "font",
    letterSpacing: "tracking",
  };

  const prefix = prefixMap[tokenType] || category;
  return `${prefix}-${tokenKey}`;
}

/**
 * Extracts typography tokens from manifest and transforms them for UI use
 */
function extractTypographyTokens(
  category: "size" | "weight" | "lineHeight" | "family" | "letterSpacing"
): TypographyTokenData[] {
  const typography = manifest.primitives?.typography as
    Record<string, Record<string, TokenEntry>> | undefined;
  if (!typography || !typography[category]) {
    return [];
  }

  const tokens = Object.values(typography[category]);

  return tokens.map((token) => {
    const key = token.path[token.path.length - 1]; // Last element is the key (e.g., "bold", "base")
    let value = token.value;

    // For font families, append fallback stack
    if (token.type === "fontFamily" && fontFamilyFallbacks[key]) {
      value = `${token.value}${fontFamilyFallbacks[key]}`;
    }

    return {
      key,
      value,
      jsName: token.name,
      token: token.path.join("."),
      cssVar: token.variable,
      tailwind: getTailwindClass(category, key, token.type),
    };
  });
}

// Extract all typography tokens from manifest
const fontSizes = extractTypographyTokens("size");
const fontWeights = extractTypographyTokens("weight");
const lineHeights = extractTypographyTokens("lineHeight");
const fontFamilies = extractTypographyTokens("family");
const letterSpacings = extractTypographyTokens("letterSpacing");

// Check if tokens exist for each category
const hasLetterSpacingTokens = letterSpacings.length > 0;

// Helper to find token by key or get first available
function findTokenOrFirst(
  tokens: TypographyTokenData[],
  preferredKey: string
): TypographyTokenData | undefined {
  return tokens.find((t) => t.key === preferredKey) || tokens[0];
}

// =============================================================================
// Static Stories (these use CSS custom properties directly)
// =============================================================================

// =============================================================================
// Type scale, weights, line heights and tracking, all read from the tokens.
// Specimens are drawn with the token value itself, so a label can never drift
// from what is shown.
// =============================================================================

const SPECIMEN = "Typography";
const PARAGRAPH =
  "The crisis consists precisely in the fact that the old is dying and the new cannot be born: in this interregnum, morbid phenomena of the most varied kind come to pass.";

function asTokenRow(token: TypographyTokenData): TokenRow {
  return {
    variable: token.cssVar.replace(/^var\((.*)\)$/, "$1"),
    key: token.key,
    value: String(token.value),
  };
}

const sizeRows = [...fontSizes].reverse().map(asTokenRow);
const weightRows = fontWeights.map(asTokenRow);
const lineHeightRows = lineHeights.map(asTokenRow);
const trackingRows: TokenRow[] = Object.entries(spacing)
  .filter(([name]) =>
    /^tracking-(tighter|tight|normal|wide|wider|widest)$/.test(name)
  )
  .map(([name, value]) => ({
    variable: `typography.${name.replace("-", ".")}`,
    key: name.replace("tracking-", ""),
    value: String(value),
  }));

function SizesSection() {
  return (
    <Section
      title="Type scale"
      description="Sizes are authored in rem. The px figure beside each is what Figma shows."
    >
      <TokenTable
        caption="Font size tokens"
        rows={sizeRows}
        specimen={(row) => (
          <span
            className="block text-(--color-foreground-default)"
            style={{ fontSize: row.value }}
          >
            {SPECIMEN}
          </span>
        )}
      />
    </Section>
  );
}

function WeightsSection() {
  return (
    <Section title="Font weights">
      <TokenTable
        caption="Font weight tokens"
        rows={weightRows}
        specimen={(row) => (
          <span
            className="block text-xl text-(--color-foreground-default)"
            style={{ fontWeight: row.value }}
          >
            {SPECIMEN}
          </span>
        )}
      />
    </Section>
  );
}

function LineHeightsSection() {
  return (
    <Section
      title="Line heights"
      description="Line height is a percentage of the font size. Figma stores it as a percent text-style property rather than a variable, so the percent figure here is the one a Figma text style carries."
    >
      <TokenTable
        caption="Line height tokens"
        rows={lineHeightRows}
        specimenLabel="Paragraph"
        specimen={(row) => (
          <p
            className="max-w-sm text-sm text-(--color-foreground-muted)"
            style={{ lineHeight: parseFloat(row.value) / 100 }}
          >
            {PARAGRAPH}
          </p>
        )}
        renderValue={(row) => <span>{row.value}%</span>}
      />
    </Section>
  );
}

function TrackingSection() {
  return (
    <Section
      title="Letter spacing"
      description="Tracking is in em, so it scales with the font size. Like line height it is a text-style property in Figma, so these tokens are named here rather than exposed as CSS variables."
    >
      <TokenTable
        caption="Letter spacing tokens"
        rows={trackingRows}
        variableLabel="Token name"
        specimen={(row) => (
          <span
            className="block text-lg text-(--color-foreground-default)"
            style={{ letterSpacing: row.value }}
          >
            {SPECIMEN}
          </span>
        )}
      />
    </Section>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div>
      <PageIntro title="Typography">
        <p>
          {fontSizes.length} sizes, {fontWeights.length} weights,{" "}
          {lineHeights.length} line heights and {trackingRows.length} letter
          spacings, read from the tokens.
        </p>
      </PageIntro>
      <SizesSection />
      <WeightsSection />
      <LineHeightsSection />
      <TrackingSection />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Overview of the type scale, font weights, line heights and letter spacing.",
      },
    },
  },
};

export const TypeScale: Story = {
  render: () => <SizesSection />,
};

export const FontWeights: Story = {
  render: () => <WeightsSection />,
};

export const LineHeights: Story = {
  render: () => <LineHeightsSection />,
};

export const LetterSpacing: Story = {
  render: () => <TrackingSection />,
};

export const TextColors: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-(--color-foreground-default) text-lg mb-1">
          Primary Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-foreground-default
        </p>
      </div>

      <div>
        <p className="text-(--color-foreground-muted) text-lg mb-1">
          Secondary Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-foreground-muted
        </p>
      </div>

      <div>
        <p className="text-(--color-foreground-faint) text-lg mb-1">
          Muted Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-foreground-faint
        </p>
      </div>

      <div>
        <p className="text-(--color-foreground-info-muted) text-lg mb-1">
          Link Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-background-primary
        </p>
      </div>

      <div>
        <p className="text-(--color-foreground-danger-muted) text-lg mb-1">
          Error Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-foreground-danger-muted
        </p>
      </div>

      <div>
        <p className="text-(--color-foreground-success-muted) text-lg mb-1">
          Success Text
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --color-foreground-success-muted
        </p>
      </div>
    </div>
  ),
};

export const TypographyHierarchy: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Nine levels from display to caption. The visual weight of each level should match the importance of the content — not be chosen for aesthetics alone.",
      },
    },
  },
  render: () => {
    const levels = [
      {
        tag: "h1",
        sample: "Page Title",
        className: "text-5xl font-bold",
        token: "text-5xl · --font-size-5xl",
        usage: "Hero headlines, page titles. Once per page.",
      },
      {
        tag: "h2",
        sample: "Section Heading",
        className: "text-4xl font-bold",
        token: "text-4xl · --font-size-4xl",
        usage: "Major content sections.",
      },
      {
        tag: "h3",
        sample: "Sub-section",
        className: "text-3xl font-semibold",
        token: "text-3xl · --font-size-3xl",
        usage: "Sub-sections within a major section.",
      },
      {
        tag: "h4",
        sample: "Card Title",
        className: "text-2xl font-semibold",
        token: "text-2xl · --font-size-2xl",
        usage: "Card and panel headers.",
      },
      {
        tag: "h5",
        sample: "Group Label",
        className: "text-xl font-semibold",
        token: "text-xl · --font-size-xl",
        usage: "Form sections, sidebar titles.",
      },
      {
        tag: "h6",
        sample: "Minor Heading",
        className: "text-lg font-semibold",
        token: "text-lg · --font-size-lg",
        usage: "List group headers, tight contexts.",
      },
      {
        tag: "p",
        sample: "Body — default reading size for all content",
        className: "text-base",
        token: "text-base · --font-size-base",
        usage: "Body copy, descriptions.",
      },
      {
        tag: "p",
        sample: "Small — labels, captions, secondary text",
        className: "text-sm",
        token: "text-sm · --font-size-sm",
        usage: "Input labels, helper text.",
      },
      {
        tag: "p",
        sample: "Caption — metadata and footnotes",
        className: "text-xs",
        token: "text-xs · --font-size-xs",
        usage: "Timestamps, fine print.",
      },
    ];

    return (
      <div className="max-w-4xl space-y-12">
        {/* Hierarchy ladder */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-1">
              Type Hierarchy
            </h2>
            <p className="text-sm text-(--color-foreground-muted)">
              Use the level that matches the importance of the content in
              context — not the one that looks closest to what you want
              visually.
            </p>
          </div>

          <div className="rounded-lg border border-(--color-border-default) overflow-hidden divide-y divide-(--color-border-default)">
            {levels.map(({ tag, sample, className, token, usage }) => (
              <div
                key={token}
                className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[3.5rem_1fr_15rem] items-center gap-x-4 px-4 py-3 bg-(--color-background-default)"
              >
                <code className="text-xs font-mono text-(--color-foreground-faint) self-center">
                  {tag}
                </code>
                <p className={`${className} truncate`}>{sample}</p>
                <div className="hidden md:block">
                  <code className="block text-xs font-mono text-(--color-foreground-muted) mb-0.5">
                    {token}
                  </code>
                  <span className="text-xs text-(--color-foreground-faint)">
                    {usage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-world compositions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">In practice</h3>
            <p className="text-sm text-(--color-foreground-muted)">
              How hierarchy levels work together in common UI patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Article */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-xs font-medium tracking-wider text-(--color-foreground-faint) uppercase">
                  Article
                </p>
                <h2 className="text-3xl font-bold leading-tight">
                  Design Tokens at Scale
                </h2>
                <p className="text-base text-(--color-foreground-muted) leading-relaxed">
                  How large teams maintain visual consistency across hundreds of
                  components and multiple product lines.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-7 h-7 rounded-full bg-(--color-background-primary)/20 border border-(--color-border-default)" />
                  <div>
                    <p className="text-sm font-medium">Alex Kim</p>
                    <p className="text-xs text-(--color-foreground-faint)">
                      May 17, 2026 · 8 min read
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard stat */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-xs font-medium tracking-wider text-(--color-foreground-faint) uppercase">
                  Dashboard
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-(--color-foreground-muted)">
                    Monthly Revenue
                  </p>
                  <p className="text-4xl font-bold">$48,295</p>
                  <p className="text-sm text-(--color-foreground-success-muted)">
                    ↑ 12.5% from last month
                  </p>
                </div>
                <div className="border-t border-(--color-border-default) pt-3 space-y-2">
                  <p className="text-sm font-semibold">Breakdown</p>
                  {[
                    ["New customers", "$12,100"],
                    ["Renewals", "$28,450"],
                    ["Upgrades", "$7,745"],
                  ].map(([label, amount]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-(--color-foreground-muted)">
                        {label}
                      </span>
                      <span className="font-medium">{amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings page */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
                <p className="text-sm text-(--color-foreground-muted)">
                  Manage your preferences and notifications.
                </p>
              </div>
              <div className="divide-y divide-(--color-border-default)">
                {[
                  {
                    title: "Personal Information",
                    desc: "Update your name, email, and profile photo.",
                    meta: null as string | null,
                  },
                  {
                    title: "Notifications",
                    desc: "Choose how and when you receive notifications.",
                    meta: null as string | null,
                  },
                  {
                    title: "Security",
                    desc: "Manage passwords, two-factor authentication, and active sessions.",
                    meta: "Last login: May 17, 2026 at 9:42 AM · Chrome on macOS",
                  },
                ].map(({ title, desc, meta }) => (
                  <div key={title} className="py-3">
                    <h3 className="text-base font-semibold mb-0.5">{title}</h3>
                    <p className="text-sm text-(--color-foreground-muted)">
                      {desc}
                    </p>
                    {meta && (
                      <p className="text-xs text-(--color-foreground-faint) mt-1">
                        {meta}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

export const CodeTypography: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-3">Inline Code</h4>
        <p>
          Use the{" "}
          <code className="bg-(--color-background-muted) px-1.5 py-0.5 rounded text-sm font-mono">
            useState
          </code>{" "}
          hook to manage state in React components.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Code Block</h4>
        <pre className="bg-(--color-background-inverse) text-(--color-foreground-inverse) p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">
            {`function Button({ children, variant = "default" }) {
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
        <h4 className="text-lg font-semibold mb-3">Terminal Output</h4>
        <pre className="bg-(--color-background-inverse) text-(--color-foreground-inverse) p-4 rounded-lg font-mono text-sm">
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
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
          Responsive Heading
        </h1>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --font-size-2xl → md:--font-size-4xl → lg:--font-size-5xl
        </p>
      </div>

      <div>
        <p className="text-sm md:text-base lg:text-lg mb-2">
          This paragraph adapts its size based on screen size. On mobile
          it&apos;s smaller, on tablet it&apos;s medium, and on desktop
          it&apos;s larger for better readability.
        </p>
        <p className="text-sm text-(--color-foreground-muted) font-mono">
          --font-size-sm → md:--font-size-base → lg:--font-size-lg
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Mobile First
          </h2>
          <p className="text-sm md:text-base text-(--color-foreground-muted)">
            Typography scales up from mobile to larger screens, ensuring
            readability across all devices.
          </p>
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Flexible Layout
          </h2>
          <p className="text-sm md:text-base text-(--color-foreground-muted)">
            Text size and layout adjust automatically to provide optimal reading
            experience on any device.
          </p>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Typography Playground Component (Token-driven from manifest.json)
// =============================================================================

function TypographyPlaygroundComponent() {
  const defaultFontSize = findTokenOrFirst(fontSizes, "base");
  const defaultFontWeight = findTokenOrFirst(fontWeights, "regular");
  const defaultLineHeight = findTokenOrFirst(lineHeights, "normal");
  const defaultFontFamily = findTokenOrFirst(fontFamilies, "sans");
  const defaultLetterSpacing = findTokenOrFirst(letterSpacings, "normal");

  const [selectedFontSize, setSelectedFontSize] = useState<string>(
    defaultFontSize?.key || ""
  );
  const [selectedFontWeight, setSelectedFontWeight] = useState<string>(
    defaultFontWeight?.key || ""
  );
  const [selectedLineHeight, setSelectedLineHeight] = useState<string>(
    defaultLineHeight?.key || ""
  );
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(
    defaultFontFamily?.key || ""
  );
  const [selectedLetterSpacing, setSelectedLetterSpacing] = useState<string>(
    defaultLetterSpacing?.key || ""
  );
  const [previewText, setPreviewText] = useState(
    "The crisis consists precisely in the fact that the old is dying and the new cannot be born: in this interregnum, morbid phenomena of the most varied kind come to pass."
  );
  const { copiedKey: copiedType, copy } = useCopyToClipboard(2000); // preserve this site's existing 2000ms delay

  const currentFontSize = fontSizes.find((t) => t.key === selectedFontSize);
  const currentFontWeight = fontWeights.find(
    (t) => t.key === selectedFontWeight
  );
  const currentLineHeight = lineHeights.find(
    (t) => t.key === selectedLineHeight
  );
  const currentFontFamily = fontFamilies.find(
    (t) => t.key === selectedFontFamily
  );
  const currentLetterSpacing = hasLetterSpacingTokens
    ? letterSpacings.find((t) => t.key === selectedLetterSpacing)
    : null;

  if (
    !currentFontSize ||
    !currentFontWeight ||
    !currentLineHeight ||
    !currentFontFamily
  ) {
    return (
      <div className="p-4 text-center text-(--color-foreground-muted)">
        No typography tokens found in manifest.
      </div>
    );
  }

  const cssLines = [
    `font-size: ${currentFontSize.value};`,
    `font-weight: ${currentFontWeight.value};`,
    `line-height: ${(currentLineHeight.value as number) / 100};`,
    `font-family: ${currentFontFamily.value};`,
    ...(currentLetterSpacing
      ? [`letter-spacing: ${currentLetterSpacing.value}em;`]
      : []),
  ];

  const tailwindClasses = [
    currentFontSize.tailwind,
    currentFontWeight.tailwind,
    currentLineHeight.tailwind,
    currentFontFamily.tailwind,
    ...(currentLetterSpacing ? [currentLetterSpacing.tailwind] : []),
  ].join(" ");

  function handleCopy(type: "css" | "tailwind") {
    const text = type === "css" ? cssLines.join("\n") : tailwindClasses;
    copy(type, text);
  }

  function handleReset() {
    setSelectedFontSize(defaultFontSize?.key || "");
    setSelectedFontWeight(defaultFontWeight?.key || "");
    setSelectedLineHeight(defaultLineHeight?.key || "");
    setSelectedFontFamily(defaultFontFamily?.key || "");
    if (hasLetterSpacingTokens) {
      setSelectedLetterSpacing(defaultLetterSpacing?.key || "");
    }
    setPreviewText(
      "The crisis consists precisely in the fact that the old is dying and the new cannot be born: in this interregnum, morbid phenomena of the most varied kind come to pass."
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-2">
          Typography Playground
        </h3>
        <p className="text-sm text-(--color-foreground-muted)">
          Interactive explorer for typography tokens. All options are
          dynamically generated from the design token manifest — when tokens
          change, this playground updates automatically.
        </p>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border border-(--color-border-default) bg-(--color-background-default) min-h-[80px]"
            style={{
              fontSize: String(currentFontSize.value),
              fontWeight: currentFontWeight.value,
              lineHeight: (currentLineHeight.value as number) / 100,
              fontFamily: String(currentFontFamily.value),
              ...(currentLetterSpacing && {
                letterSpacing: `${currentLetterSpacing.value}em`,
              }),
            }}
          >
            {previewText}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typography Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Font Family ({fontFamilies.length} tokens)
            </Label>
            <div className="flex flex-wrap gap-2">
              {fontFamilies.map((token) => (
                <Button
                  key={token.key}
                  size="sm"
                  variant={
                    selectedFontFamily === token.key ? "default" : "outline"
                  }
                  onClick={() => setSelectedFontFamily(token.key)}
                >
                  {token.key}
                </Button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Font Size ({fontSizes.length} tokens)
            </Label>
            <div className="flex flex-wrap gap-2">
              {fontSizes.map((token) => (
                <Button
                  key={token.key}
                  size="sm"
                  variant={
                    selectedFontSize === token.key ? "default" : "outline"
                  }
                  onClick={() => setSelectedFontSize(token.key)}
                >
                  {token.key}
                </Button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Font Weight ({fontWeights.length} tokens)
            </Label>
            <div className="flex flex-wrap gap-2">
              {fontWeights.map((token) => (
                <Button
                  key={token.key}
                  size="sm"
                  variant={
                    selectedFontWeight === token.key ? "default" : "outline"
                  }
                  onClick={() => setSelectedFontWeight(token.key)}
                >
                  {token.key}
                </Button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Line Height ({lineHeights.length} tokens)
            </Label>
            <div className="flex flex-wrap gap-2">
              {lineHeights.map((token) => (
                <Button
                  key={token.key}
                  size="sm"
                  variant={
                    selectedLineHeight === token.key ? "default" : "outline"
                  }
                  onClick={() => setSelectedLineHeight(token.key)}
                >
                  {token.key}
                </Button>
              ))}
            </div>
          </div>

          {/* Letter Spacing - only shown if tokens exist */}
          {hasLetterSpacingTokens && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Letter Spacing ({letterSpacings.length} tokens)
              </Label>
              <div className="flex flex-wrap gap-2">
                {letterSpacings.map((token) => (
                  <Button
                    key={token.key}
                    size="sm"
                    variant={
                      selectedLetterSpacing === token.key
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setSelectedLetterSpacing(token.key)}
                  >
                    {token.key}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Text */}
          <div className="space-y-2">
            <Label htmlFor="preview-text" className="text-sm font-semibold">
              Preview Text
            </Label>
            <Textarea
              id="preview-text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="min-h-[80px] resize-y"
              placeholder="Enter your text here..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Token Output */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Token Output</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy("css")}
              >
                {copiedType === "css" ? (
                  <span className="text-(--color-foreground-success-muted)">
                    Copied!
                  </span>
                ) : (
                  "Copy CSS"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy("tailwind")}
              >
                {copiedType === "tailwind" ? (
                  <span className="text-(--color-foreground-success-muted)">
                    Copied!
                  </span>
                ) : (
                  "Copy Tailwind"
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* CSS Properties */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">CSS Properties</div>
              <div className="p-3 rounded-md bg-(--color-background-muted)/50 text-xs font-mono space-y-1">
                {cssLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>

            {/* Tailwind Classes */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Tailwind Classes</div>
              <div className="p-3 rounded-md bg-(--color-background-muted)/50 text-xs font-mono">
                <code>className=&quot;{tailwindClasses}&quot;</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

export const TypographyPlayground: Story = {
  render: () => <TypographyPlaygroundComponent />,
};
