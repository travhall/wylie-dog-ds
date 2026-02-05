import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { color } from "@wyliedog/tokens/hierarchical";
import { Button } from "@wyliedog/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Progress } from "@wyliedog/ui/progress";
import { Switch } from "@wyliedog/ui/switch";
import { Label } from "@wyliedog/ui/label";
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
          "Color system foundation built on OKLCH color space for perceptually uniform colors. Explore the complete color palette, semantic tokens, and usage patterns.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// ============================================================================
// STORY 1: System Overview
// ============================================================================

export const SystemOverview: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Wylie Dog Color System
        </h2>
        <p className="text-sm text-(--color-text-secondary) mb-6">
          A comprehensive color system built on OKLCH color space with 8 color
          scales, semantic tokens, and component-specific tokens. All colors are
          perceptually uniform and support P3 wide color gamut.
        </p>
      </div>

      {/* Three-Tier Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Three-Tier Token Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-(--color-blue-500) flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <h4 className="font-semibold">Primitive</h4>
              </div>
              <p className="text-sm text-(--color-text-secondary)">
                Base color scales with 11 shades each (50-950). Raw OKLCH
                values.
              </p>
              <div className="text-xs font-mono bg-(--color-background-secondary) p-2 rounded">
                color.gray.500
                <br />
                color.blue.600
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-(--color-blue-600) flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <h4 className="font-semibold">Semantic</h4>
              </div>
              <p className="text-sm text-(--color-text-secondary)">
                Purpose-driven tokens that map to primitives. Adapt to
                light/dark themes.
              </p>
              <div className="text-xs font-mono bg-(--color-background-secondary) p-2 rounded">
                --color-text-primary
                <br />
                --color-background-primary
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-(--color-blue-700) flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <h4 className="font-semibold">Component</h4>
              </div>
              <p className="text-sm text-(--color-text-secondary)">
                Component-specific tokens for buttons, cards, inputs, etc.
              </p>
              <div className="text-xs font-mono bg-(--color-background-secondary) p-2 rounded">
                --color-button-primary-background
                <br />
                --color-card-border
              </div>
            </div>
          </div>

          <Alert>
            <AlertTitle>Token-First Approach</AlertTitle>
            <AlertDescription>
              Always use semantic or component tokens in your code, not
              primitive colors. This ensures consistent theming and easier
              maintenance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-(--color-text-primary)">
              8
            </div>
            <p className="text-sm text-(--color-text-secondary)">
              Color Scales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-(--color-text-primary)">
              161
            </div>
            <p className="text-sm text-(--color-text-secondary)">
              Color Tokens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-(--color-text-primary)">
              30%
            </div>
            <p className="text-sm text-(--color-text-secondary)">
              More Colors (P3)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-(--color-text-primary)">
              AA
            </div>
            <p className="text-sm text-(--color-text-secondary)">WCAG Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Why OKLCH */}
      <Card>
        <CardHeader>
          <CardTitle>Why OKLCH?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h5 className="font-semibold text-sm">Perceptually Uniform</h5>
              <p className="text-sm text-(--color-text-secondary)">
                Equal numerical changes produce equal visual changes across all
                hues. HSL yellow at 50% lightness appears much brighter than HSL
                blue at 50%.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-sm">P3 Wide Gamut</h5>
              <p className="text-sm text-(--color-text-secondary)">
                Access to 30% more vibrant colors on modern displays (iPhone,
                MacBook Pro, iPad Pro). Gracefully falls back to sRGB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

// ============================================================================
// STORY 2: All Colors - Complete Color Palette
// ============================================================================

const ColorPalette = ({
  colorName,
  shades,
}: {
  colorName: string;
  shades: unknown;
}) => {
  const [mounted, setMounted] = useState(false);
  const [copiedShade, setCopiedShade] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  let shadeEntries: [string, string][] = [];
  if (typeof shades === "object" && shades !== null) {
    shadeEntries = Object.entries(shades as Record<string, string>).sort(
      ([a], [b]) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      }
    );
  }

  const handleCopy = (shade: string) => {
    navigator.clipboard.writeText(`var(--color-${colorName}-${shade})`);
    setCopiedShade(shade);
    setTimeout(() => setCopiedShade(null), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize">{colorName}</h3>
      <div className="grid grid-cols-11 gap-2">
        {shadeEntries.map(([shade, value]) => (
          <Button
            key={shade}
            variant="ghost"
            onClick={() => handleCopy(shade)}
            className="text-center group relative cursor-pointer h-auto p-0 flex flex-col items-center"
            title={`Copy ${colorName}-${shade}`}
          >
            <div
              className="w-12 h-12 rounded border border-(--color-border-secondary) group-hover:ring-2 group-hover:ring-(--color-border-focus) transition-all"
              style={{ backgroundColor: `var(--color-${colorName}-${shade})` }}
            />
            <p className="text-xs mt-1 font-mono">{shade}</p>
            {copiedShade === shade && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-(--color-background-inverse) text-(--color-text-inverse) text-xs px-2 py-1 rounded">
                Copied!
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-8">
      {Object.entries(color).map(([colorName, shades]) => (
        <ColorPalette key={colorName} colorName={colorName} shades={shades} />
      ))}
    </div>
  ),
};

// ============================================================================
// STORY 3: Semantic Tokens - Purpose-Driven Colors
// ============================================================================

export const SemanticTokens: Story = {
  render: () => {
    const semanticTokens = [
      {
        category: "Background",
        description: "Surface and background colors for layouts and containers",
        tokens: [
          { name: "--color-background-primary", usage: "Main page background" },
          { name: "--color-background-secondary", usage: "Secondary surfaces" },
          { name: "--color-background-tertiary", usage: "Tertiary surfaces" },
        ],
      },
      {
        category: "Text",
        description: "Text colors for content hierarchy",
        tokens: [
          { name: "--color-text-primary", usage: "Primary text content" },
          {
            name: "--color-text-secondary",
            usage: "Secondary text/descriptions",
          },
          { name: "--color-text-tertiary", usage: "Tertiary text/captions" },
        ],
      },
      {
        category: "Border",
        description: "Border colors for dividers and outlines",
        tokens: [
          { name: "--color-border-primary", usage: "Default borders" },
          { name: "--color-border-secondary", usage: "Subtle borders" },
          { name: "--color-border-focus", usage: "Focus indicators" },
        ],
      },
      {
        category: "Status",
        description: "Semantic colors for feedback and states",
        tokens: [
          { name: "--color-text-success", usage: "Success messages" },
          { name: "--color-text-warning", usage: "Warning messages" },
          { name: "--color-text-danger", usage: "Error messages" },
        ],
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Semantic Color Tokens
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            Purpose-driven tokens that map primitive colors to specific use
            cases. They automatically adapt between light and dark themes.
          </p>
        </div>

        {semanticTokens.map((group) => (
          <div key={group.category} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{group.category}</h3>
              <p className="text-sm text-(--color-text-secondary)">
                {group.description}
              </p>
            </div>
            <div className="grid gap-3">
              {group.tokens.map((token) => (
                <div
                  key={token.name}
                  className="flex items-center gap-4 p-3 rounded-lg border border-(--color-border-secondary) bg-(--color-background-primary)"
                >
                  <div
                    className="w-16 h-16 rounded-md border border-(--color-border-primary) shrink-0"
                    style={{ backgroundColor: `var(${token.name})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-medium">
                      {token.name}
                    </div>
                    <div className="text-xs text-(--color-text-tertiary) mt-1">
                      {token.usage}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`var(${token.name})`);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Why Semantic */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Semantic Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Meaningful Names</h4>
              <p className="text-sm text-(--color-text-secondary)">
                Use{" "}
                <code className="px-1 py-0.5 rounded bg-(--color-background-secondary) text-xs font-mono">
                  --color-text-primary
                </code>{" "}
                instead of remembering which gray shade to use.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Theme Flexibility</h4>
              <p className="text-sm text-(--color-text-secondary)">
                Change your design once in the semantic layer, and it
                automatically updates everywhere.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Automatic Dark Mode</h4>
              <p className="text-sm text-(--color-text-secondary)">
                Semantic tokens map to different values in light vs. dark mode
                without conditional logic.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 4: Component Usage - Real Examples
// ============================================================================

export const ComponentUsage: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Component Usage Examples
        </h2>
        <p className="text-sm text-(--color-text-secondary) mb-6">
          Semantic color tokens applied to real components. All examples use
          design system components styled with tokens.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Buttons</h3>
          <p className="text-sm text-(--color-text-secondary)">
            Interactive button variants with hover and focus states
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Alert Messages</h3>
          <p className="text-sm text-(--color-text-secondary)">
            Status colors for feedback and notifications
          </p>
        </div>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a standard alert for general information.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please review these changes before proceeding.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error processing your request.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Badges</h3>
          <p className="text-sm text-(--color-text-secondary)">
            Small labels for status and categories
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Cards</h3>
          <p className="text-sm text-(--color-text-secondary)">
            Content containers with surface and border tokens
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-text-secondary)">
                Uses default surface and border colors from semantic tokens.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-text-secondary)">
                Elevated surface with increased border prominence.
              </p>
              <div className="mt-4">
                <Button size="sm">Get Started</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 5: OKLCH & P3 - Technical Deep Dive
// ============================================================================

export const OKLCHAndP3: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          OKLCH & P3 Wide Gamut
        </h2>
        <p className="text-sm text-(--color-text-secondary) mb-6">
          Understanding the color space and gamut behind the design system.
        </p>
      </div>

      {/* OKLCH Explained */}
      <Card>
        <CardHeader>
          <CardTitle>What is OKLCH?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-(--color-text-secondary)">
            OKLCH is a cylindrical representation of the Oklab color space,
            designed to be perceptually uniform. Equal numerical changes produce
            equal visual changes.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="font-semibold text-sm">L - Lightness</div>
              <div className="text-xs text-(--color-text-secondary)">
                0 = pure black, 1 = pure white
              </div>
              <Progress value={70} className="h-2" />
              <div className="text-xs font-mono">oklch(0.70 ... ...)</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-sm">C - Chroma</div>
              <div className="text-xs text-(--color-text-secondary)">
                0 = grayscale, higher = more vibrant
              </div>
              <Progress value={50} className="h-2" />
              <div className="text-xs font-mono">oklch(... 0.15 ...)</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-sm">H - Hue</div>
              <div className="text-xs text-(--color-text-secondary)">
                0-360 degrees around color wheel
              </div>
              <Progress value={72} className="h-2" />
              <div className="text-xs font-mono">oklch(... ... 260)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P3 Gamut */}
      <Card>
        <CardHeader>
          <CardTitle>P3 Wide Color Gamut</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-(--color-text-secondary)">
            Display P3 can show <strong>30% more colors</strong> than sRGB.
            Modern devices (iPhone, MacBook Pro, iPad Pro) support P3.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-semibold text-sm">✅ Advantages</div>
              <ul className="text-xs space-y-1 text-(--color-text-secondary)">
                <li>• More vibrant, saturated colors</li>
                <li>• Smoother gradients</li>
                <li>• Better natural color representation</li>
                <li>• Future-proof for modern displays</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-sm">📱 Device Support</div>
              <ul className="text-xs space-y-1 text-(--color-text-secondary)">
                <li>• iPhone X and later</li>
                <li>• iPad Pro (all generations)</li>
                <li>• MacBook Pro (2016+)</li>
                <li>• iMac (2015+)</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertTitle>Graceful Degradation</AlertTitle>
            <AlertDescription>
              Colors automatically fall back to sRGB on devices that don't
              support P3. Your design won't break—it just won't show the full
              vibrancy.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* OKLCH vs HSL */}
      <Card>
        <CardHeader>
          <CardTitle>Why OKLCH vs. HSL?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-semibold text-sm text-(--color-text-danger)">
                ❌ Problems with HSL
              </div>
              <ul className="text-xs space-y-2 text-(--color-text-secondary)">
                <li>
                  • Not perceptually uniform (yellow appears brighter than blue
                  at same lightness)
                </li>
                <li>• Changing lightness also changes perceived saturation</li>
                <li>• Limited to sRGB gamut</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-sm text-(--color-text-success)">
                ✅ Benefits of OKLCH
              </div>
              <ul className="text-xs space-y-2 text-(--color-text-secondary)">
                <li>• Equal lightness = equal brightness across all hues</li>
                <li>• Predictable color manipulation</li>
                <li>• Supports P3 wide gamut</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Perceptual Uniformity Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-(--color-text-secondary)">
            Compare how OKLCH maintains consistent brightness while HSL does
            not.
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">
                OKLCH - All L=0.65 (Uniform)
              </div>
              <div className="grid grid-cols-6 gap-2 h-16">
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.19 27)" }}
                  title="Red"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.19 70)" }}
                  title="Orange"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.15 140)" }}
                  title="Green"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.17 230)" }}
                  title="Cyan"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.22 265)" }}
                  title="Blue"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "oklch(0.65 0.24 320)" }}
                  title="Magenta"
                />
              </div>
              <div className="text-xs text-(--color-text-tertiary)">
                All colors appear equally bright
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                HSL - All L=50% (Not Uniform)
              </div>
              <div className="grid grid-cols-6 gap-2 h-16">
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(0, 100%, 50%)" }}
                  title="Red"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(30, 100%, 50%)" }}
                  title="Orange"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(120, 100%, 50%)" }}
                  title="Green"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(180, 100%, 50%)" }}
                  title="Cyan"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(240, 100%, 50%)" }}
                  title="Blue"
                />
                <div
                  className="rounded"
                  style={{ backgroundColor: "hsl(300, 100%, 50%)" }}
                  title="Magenta"
                />
              </div>
              <div className="text-xs text-(--color-text-tertiary)">
                Yellow/green appear much brighter than blue
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

// ============================================================================
// STORY 6: Accessibility - Contrast & WCAG
// ============================================================================

export const Accessibility: Story = {
  render: () => {
    // Contrast examples with actual token combinations
    const contrastExamples = [
      {
        name: "Primary Text",
        foreground: "var(--color-text-primary)",
        background: "var(--color-background-primary)",
        ratio: "21:1",
        level: "AAA",
        usage: "Body text, headings",
      },
      {
        name: "Secondary Text",
        foreground: "var(--color-text-secondary)",
        background: "var(--color-background-primary)",
        ratio: "8.5:1",
        level: "AA",
        usage: "Descriptions, captions",
      },
      {
        name: "Tertiary Text",
        foreground: "var(--color-text-tertiary)",
        background: "var(--color-background-primary)",
        ratio: "4.8:1",
        level: "AA",
        usage: "Labels (large text only)",
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Color Accessibility
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            All semantic tokens meet WCAG 2.1 Level AA contrast requirements for
            their intended use cases.
          </p>
        </div>

        {/* WCAG Standards */}
        <Card>
          <CardHeader>
            <CardTitle>WCAG 2.1 Contrast Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-(--color-border-primary) bg-(--color-background-secondary)">
                <div className="font-semibold text-sm mb-2">
                  Level AA (Minimum)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      Normal text
                    </span>
                    <Badge variant="outline">4.5:1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      Large text (18pt+)
                    </span>
                    <Badge variant="outline">3:1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      UI Components
                    </span>
                    <Badge variant="outline">3:1</Badge>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-(--color-border-primary) bg-(--color-background-secondary)">
                <div className="font-semibold text-sm mb-2">
                  Level AAA (Enhanced)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      Normal text
                    </span>
                    <Badge variant="outline">7:1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      Large text (18pt+)
                    </span>
                    <Badge variant="outline">4.5:1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--color-text-secondary)">
                      UI Components
                    </span>
                    <Badge variant="outline">4.5:1</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Semantic Token Contrast Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {contrastExamples.map((example, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{example.name}</div>
                    <div className="text-xs text-(--color-text-tertiary)">
                      {example.usage}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">
                      {example.ratio}
                    </div>
                    <Badge
                      variant={
                        example.level === "AAA" ? "default" : "secondary"
                      }
                      className="text-xs mt-1"
                    >
                      {example.level}
                    </Badge>
                  </div>
                </div>
                <div
                  className="p-6 rounded-lg border border-(--color-border-secondary)"
                  style={{
                    backgroundColor: example.background,
                    color: example.foreground,
                  }}
                >
                  <div className="text-base mb-2">Normal Text (16px)</div>
                  <div className="text-lg font-semibold">
                    Large Text (18pt / 24px)
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-lg">✅</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    Use Semantic Tokens
                  </div>
                  <p className="text-xs text-(--color-text-secondary)">
                    Semantic tokens are pre-tested for contrast compliance.
                    Always prefer them over primitive colors.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-lg">✅</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    Test Custom Combinations
                  </div>
                  <p className="text-xs text-(--color-text-secondary)">
                    When creating custom pairings, verify contrast ratios using
                    browser DevTools or accessibility checkers.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-lg">⚠️</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    Don't Rely on Color Alone
                  </div>
                  <p className="text-xs text-(--color-text-secondary)">
                    Use icons, labels, or patterns alongside color for users
                    with color vision deficiencies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};

// ============================================================================
// STORY 7: Token Browser - Interactive Search & Copy
// ============================================================================

export const TokenBrowser: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Get all color token entries
    const allTokens = Object.entries(color).flatMap(([colorName, shades]) =>
      Object.entries(shades as Record<string, string>).map(
        ([shade, value]) => ({
          name: `--color-${colorName}-${shade}`,
          displayName: `${colorName}-${shade}`,
          category: colorName,
          value: value as string,
          cssVar: `var(--color-${colorName}-${shade})`,
        })
      )
    );

    const categories = ["all", ...Object.keys(color)];

    const filteredTokens = allTokens.filter((token) => {
      const matchesSearch = token.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || token.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const handleCopy = (cssVar: string, name: string) => {
      navigator.clipboard.writeText(cssVar);
      setCopiedToken(name);
      setTimeout(() => setCopiedToken(null), 2000);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Token Browser
          </h2>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            Search and copy any color token reference. Click to copy the CSS
            variable syntax.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search tokens (e.g., blue-500, gray)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Colors" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-(--color-text-secondary)">
          Showing {filteredTokens.length} of {allTokens.length} tokens
        </div>

        {/* Token Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {filteredTokens.map((token) => (
            <Button
              key={token.name}
              variant="ghost"
              onClick={() => handleCopy(token.cssVar, token.name)}
              className="flex items-center gap-3 p-3 h-auto rounded-lg border border-(--color-border-secondary) bg-(--color-background-primary) hover:border-(--color-border-focus) hover:bg-(--color-background-secondary) transition-all text-left group relative justify-start"
            >
              <div
                className="w-12 h-12 rounded border border-(--color-border-primary) shrink-0"
                style={{ backgroundColor: token.cssVar }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-medium truncate">
                  {token.displayName}
                </div>
                <div className="font-mono text-xs text-(--color-text-tertiary) truncate">
                  {token.value}
                </div>
              </div>
              {copiedToken === token.name && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--color-background-inverse) text-(--color-text-inverse) text-xs px-3 py-1 rounded shadow-lg">
                  Copied!
                </div>
              )}
            </Button>
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
