import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";
import { Textarea } from "@wyliedog/ui/textarea";
import manifest from "@wyliedog/tokens/manifest.json";

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
    | Record<string, Record<string, TokenEntry>>
    | undefined;
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

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Type Scale</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-5xl font-bold">Heading 1 - 48px</h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold">Heading 2 - 36px</h2>
          </div>
          <div>
            <h3 className="text-3xl font-bold">Heading 3 - 30px</h3>
          </div>
          <div>
            <h4 className="text-2xl font-bold">Heading 4 - 24px</h4>
          </div>
          <div>
            <h5 className="text-xl font-bold">Heading 5 - 20px</h5>
          </div>
          <div>
            <h6 className="text-lg font-bold">Heading 6 - 18px</h6>
          </div>
          <div>
            <p className="text-base">Body (Base) - 16px</p>
          </div>
          <div>
            <p className="text-sm">Small - 14px</p>
          </div>
          <div>
            <p className="text-xs">Extra Small - 12px</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Font Weights</h2>
        <div className="space-y-2">
          <p className="text-xl font-light">Light (300)</p>
          <p className="text-xl font-normal">Normal (400)</p>
          <p className="text-xl font-medium">Medium (500)</p>
          <p className="text-xl font-semibold">Semibold (600)</p>
          <p className="text-xl font-bold">Bold (700)</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Line Heights</h2>
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-sm font-semibold mb-1">Tight</p>
            <p className="leading-tight text-(--color-text-secondary)">
              The crisis consists precisely in the fact that the old is dying
              and the new cannot be born: in this interregnum, morbid phenomena
              of the most varied kind come to pass.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Normal</p>
            <p className="leading-normal text-(--color-text-secondary)">
              The crisis consists precisely in the fact that the old is dying
              and the new cannot be born: in this interregnum, morbid phenomena
              of the most varied kind come to pass.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Relaxed</p>
            <p className="leading-relaxed text-(--color-text-secondary)">
              The crisis consists precisely in the fact that the old is dying
              and the new cannot be born: in this interregnum, morbid phenomena
              of the most varied kind come to pass.
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
        <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-5xl / 48px
        </p>
      </div>

      <div>
        <h2 className="text-4xl font-bold mb-2">Heading 2</h2>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-4xl / 36px
        </p>
      </div>

      <div>
        <h3 className="text-3xl font-bold mb-2">Heading 3</h3>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-3xl / 30px
        </p>
      </div>

      <div>
        <h4 className="text-2xl font-bold mb-2">Heading 4</h4>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-2xl / 24px
        </p>
      </div>

      <div>
        <h5 className="text-xl font-bold mb-2">Heading 5</h5>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-xl / 20px
        </p>
      </div>

      <div>
        <h6 className="text-lg font-bold mb-2">Heading 6</h6>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-lg / 18px
        </p>
      </div>

      <div>
        <p className="text-base mb-2">Body Large (Base)</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-base / 16px
        </p>
      </div>

      <div>
        <p className="text-sm mb-2">Body Small</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-sm / 14px
        </p>
      </div>

      <div>
        <p className="text-xs mb-2">Caption</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
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
        <p className="text-xl font-light mb-1">Light Weight</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-weight-light / 300
        </p>
      </div>

      <div>
        <p className="text-xl font-normal mb-1">Normal Weight</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-weight-normal / 400
        </p>
      </div>

      <div>
        <p className="text-xl font-medium mb-1">Medium Weight</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-weight-medium / 500
        </p>
      </div>

      <div>
        <p className="text-xl font-semibold mb-1">Semibold Weight</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-weight-semibold / 600
        </p>
      </div>

      <div>
        <p className="text-xl font-bold mb-1">Bold Weight</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
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
        <h4 className="text-lg font-semibold mb-2">
          Tight (--line-height-tight)
        </h4>
        <p className="leading-tight text-(--color-text-secondary)">
          The crisis consists precisely in the fact that the old is dying and
          the new cannot be born: in this interregnum, morbid phenomena of the
          most varied kind come to pass.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">
          Normal (--line-height-normal)
        </h4>
        <p className="leading-normal text-(--color-text-secondary)">
          The crisis consists precisely in the fact that the old is dying and
          the new cannot be born: in this interregnum, morbid phenomena of the
          most varied kind come to pass.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">
          Relaxed (--line-height-relaxed)
        </h4>
        <p className="leading-relaxed text-(--color-text-secondary)">
          The crisis consists precisely in the fact that the old is dying and
          the new cannot be born: in this interregnum, morbid phenomena of the
          most varied kind come to pass.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">
          Loose (--line-height-loose)
        </h4>
        <p className="leading-loose text-(--color-text-secondary)">
          The crisis consists precisely in the fact that the old is dying and
          the new cannot be born: in this interregnum, morbid phenomena of the
          most varied kind come to pass.
        </p>
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-(--color-text-primary) text-lg mb-1">Primary Text</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-text-primary
        </p>
      </div>

      <div>
        <p className="text-(--color-text-secondary) text-lg mb-1">
          Secondary Text
        </p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-text-secondary
        </p>
      </div>

      <div>
        <p className="text-(--color-text-tertiary) text-lg mb-1">Muted Text</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-text-tertiary
        </p>
      </div>

      <div>
        <p className="text-(--color-interactive-primary) text-lg mb-1">
          Link Text
        </p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-interactive-primary
        </p>
      </div>

      <div>
        <p className="text-(--color-status-danger) text-lg mb-1">Error Text</p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-status-danger
        </p>
      </div>

      <div>
        <p className="text-(--color-status-success) text-lg mb-1">
          Success Text
        </p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --color-status-success
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
            <p className="text-sm text-(--color-text-secondary)">
              Use the level that matches the importance of the content in
              context — not the one that looks closest to what you want
              visually.
            </p>
          </div>

          <div className="rounded-lg border border-(--color-border-primary) overflow-hidden divide-y divide-(--color-border-primary)">
            {levels.map(({ tag, sample, className, token, usage }) => (
              <div
                key={token}
                className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[3.5rem_1fr_15rem] items-center gap-x-4 px-4 py-3 bg-(--color-background-primary)"
              >
                <code className="text-xs font-mono text-(--color-text-tertiary) self-center">
                  {tag}
                </code>
                <p className={`${className} truncate`}>{sample}</p>
                <div className="hidden md:block">
                  <code className="block text-xs font-mono text-(--color-text-secondary) mb-0.5">
                    {token}
                  </code>
                  <span className="text-xs text-(--color-text-tertiary)">
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
            <p className="text-sm text-(--color-text-secondary)">
              How hierarchy levels work together in common UI patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Article */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-xs font-medium tracking-wider text-(--color-text-tertiary) uppercase">
                  Article
                </p>
                <h2 className="text-3xl font-bold leading-tight">
                  Design Tokens at Scale
                </h2>
                <p className="text-base text-(--color-text-secondary) leading-relaxed">
                  How large teams maintain visual consistency across hundreds of
                  components and multiple product lines.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-7 h-7 rounded-full bg-(--color-interactive-primary)/20 border border-(--color-border-primary)" />
                  <div>
                    <p className="text-sm font-medium">Alex Kim</p>
                    <p className="text-xs text-(--color-text-tertiary)">
                      May 17, 2026 · 8 min read
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard stat */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-xs font-medium tracking-wider text-(--color-text-tertiary) uppercase">
                  Dashboard
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-(--color-text-secondary)">
                    Monthly Revenue
                  </p>
                  <p className="text-4xl font-bold">$48,295</p>
                  <p className="text-sm text-(--color-status-success)">
                    ↑ 12.5% from last month
                  </p>
                </div>
                <div className="border-t border-(--color-border-primary) pt-3 space-y-2">
                  <p className="text-sm font-semibold">Breakdown</p>
                  {[
                    ["New customers", "$12,100"],
                    ["Renewals", "$28,450"],
                    ["Upgrades", "$7,745"],
                  ].map(([label, amount]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-(--color-text-secondary)">
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
                <p className="text-sm text-(--color-text-secondary)">
                  Manage your preferences and notifications.
                </p>
              </div>
              <div className="divide-y divide-(--color-border-primary)">
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
                    <p className="text-sm text-(--color-text-secondary)">
                      {desc}
                    </p>
                    {meta && (
                      <p className="text-xs text-(--color-text-tertiary) mt-1">
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
          <code className="bg-(--color-background-secondary) px-1.5 py-0.5 rounded text-sm font-mono">
            useState
          </code>{" "}
          hook to manage state in React components.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Code Block</h4>
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
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
        <pre className="bg-gray-900 text-green-600 p-4 rounded-lg font-mono text-sm">
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
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-2xl → md:--font-size-4xl → lg:--font-size-5xl
        </p>
      </div>

      <div>
        <p className="text-sm md:text-base lg:text-lg mb-2">
          This paragraph adapts its size based on screen size. On mobile it's
          smaller, on tablet it's medium, and on desktop it's larger for better
          readability.
        </p>
        <p className="text-sm text-(--color-text-secondary) font-mono">
          --font-size-sm → md:--font-size-base → lg:--font-size-lg
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Mobile First
          </h3>
          <p className="text-sm md:text-base text-(--color-text-secondary)">
            Typography scales up from mobile to larger screens, ensuring
            readability across all devices.
          </p>
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Flexible Layout
          </h3>
          <p className="text-sm md:text-base text-(--color-text-secondary)">
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
  const [copiedType, setCopiedType] = useState<"css" | "tailwind" | null>(null);

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
      <div className="p-4 text-center text-(--color-text-secondary)">
        No typography tokens found in manifest.
      </div>
    );
  }

  const cssLines = [
    `font-size: ${currentFontSize.value}px;`,
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
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
        <p className="text-sm text-(--color-text-secondary)">
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
            className="p-6 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) min-h-[80px]"
            style={{
              fontSize: `${currentFontSize.value}px`,
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
                  <span className="text-(--color-status-success)">Copied!</span>
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
                  <span className="text-(--color-status-success)">Copied!</span>
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
              <div className="p-3 rounded-md bg-(--color-background-secondary)/50 text-xs font-mono space-y-1">
                {cssLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>

            {/* Tailwind Classes */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Tailwind Classes</div>
              <div className="p-3 rounded-md bg-(--color-background-secondary)/50 text-xs font-mono">
                <code>className="{tailwindClasses}"</code>
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
