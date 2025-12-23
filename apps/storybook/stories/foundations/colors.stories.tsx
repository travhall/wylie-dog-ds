import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { color, spacing, shadow } from "@wyliedog/tokens/hierarchical";
import { Button } from "@wyliedog/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@wyliedog/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Progress } from "@wyliedog/ui/progress";
import { Switch } from "@wyliedog/ui/switch";
import { Label } from "@wyliedog/ui/label";

const meta: Meta = {
  title: "2. Foundations/Design Tokens/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const ColorPalette = ({
  colorName,
  shades,
}: {
  colorName: string;
  shades: unknown;
}) => {
  const [mounted, setMounted] = useState(false);

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
        // Sort numerically, with special handling for non-numeric keys
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      }
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize">{colorName}</h3>
      <div className="grid grid-cols-11 gap-2">
        {shadeEntries.map(([shade, value]) => (
          <div key={shade} className="text-center">
            <div
              className="w-12 h-12 rounded border border-neutral-200"
              style={{ backgroundColor: `var(--color-${colorName}-${shade})` }}
            />
            <p className="text-xs mt-1 font-mono">{shade}</p>
            <p className="text-xs text-neutral-500 font-mono">
              {colorName}-{shade}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="bg-neutral-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Wylie Dog Color System</h2>
        <p className="text-sm text-neutral-600">
          Colors are driven by design tokens and automatically sync with the
          design system. All colors use OKLCH for better perceptual uniformity
          and accessibility.
        </p>
      </div>

      {Object.entries(color).map(([colorName, shades]) => (
        <ColorPalette key={colorName} colorName={colorName} shades={shades} />
      ))}
    </div>
  ),
};

export const ColorUsage: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-2">
          Color Usage in Components
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          These examples demonstrate how semantic color tokens are applied to
          actual components in the design system. The colors automatically adapt
          to the current theme and support light/dark modes.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Buttons</h4>
          <Badge variant="outline">Interactive</Badge>
        </div>
        <div className="flex flex-wrap gap-3 items-center p-4 rounded-lg border bg-background">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Hover and click to see different states and transitions.
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Alert Messages</h4>
          <Badge variant="outline">Status Indicators</Badge>
        </div>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a standard alert. Use it to highlight important
              information.
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
              There was an error processing your request. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Interactive Elements</h4>
          <Badge variant="outline">Form Controls</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-background">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress</Label>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toggle">Toggle</Label>
              <div className="flex items-center space-x-2">
                <Switch id="toggle" />
                <Label htmlFor="toggle">Enabled</Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Badges</Label>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Card Example */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Card Components</h4>
          <Badge variant="outline">Content Containers</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard card with default styling
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card uses the default background and text colors from the
                theme.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard card with default styling
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card uses primary color tokens for the border and subtle
                background.
              </p>
              <div className="mt-4">
                <Button size="sm">Get Started</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Theme Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Theme Integration</h4>
          <Badge variant="outline">CSS Variables</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The color system is built with CSS custom properties that
              automatically adapt to light and dark themes. Components use these
              semantic color tokens to ensure consistent theming across the
              application.
            </p>
            <div className="p-4 rounded-lg bg-muted/50">
              <pre className="text-xs overflow-x-auto">
                <code className="text-muted-foreground">
                  {`/* Example of theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  /* ... */
}`}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

export const TokenPlayground: Story = {
  render: () => {
    const [mounted, setMounted] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOklchDetails, setShowOklchDetails] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <div>Loading...</div>;
    }

    // Parse OKLCH values for the selected color
    const parseOklch = (value: string) => {
      const match = value.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/);
      if (!match) return null;
      return {
        l: parseFloat(match[1]),
        c: parseFloat(match[2]),
        h: parseFloat(match[3]),
      };
    };

    // Get all color tokens as flat list for searching
    const allColorTokens = Object.entries(color).flatMap(
      ([colorName, shades]) =>
        Object.entries(shades as Record<string, string>).map(
          ([shade, value]) => ({
            name: `${colorName}.${shade}`,
            displayName: `color-${colorName}-${shade}`,
            cssVar: `--color-${colorName}-${shade}`,
            value,
            colorName,
            shade,
          })
        )
    );

    // Filter tokens based on search
    const filteredTokens = searchQuery
      ? allColorTokens.filter(
          (token) =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allColorTokens;

    // Get selected token details
    const selectedToken = selectedColor
      ? allColorTokens.find((t) => t.name === selectedColor)
      : null;

    const selectedOklch = selectedToken
      ? parseOklch(selectedToken.value)
      : null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-2">
            Token Playground
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive explorer for design tokens with live OKLCH color space
            analysis. Search, inspect, and copy tokens for use in your
            components.
          </p>
        </div>

        {/* Search and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search tokens (e.g., blue, 500, oklch)..."
                className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="oklch-details"
                checked={showOklchDetails}
                onCheckedChange={setShowOklchDetails}
              />
              <Label htmlFor="oklch-details" className="text-sm">
                Show OKLCH component breakdown
              </Label>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {filteredTokens.length} of {allColorTokens.length} color
              tokens
            </div>
          </CardContent>
        </Card>

        {/* Token Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredTokens.slice(0, 60).map((token) => (
            <button
              key={token.name}
              onClick={() => setSelectedColor(token.name)}
              className={`group relative p-3 rounded-lg border bg-card text-card-foreground transition-all hover:shadow-md ${
                selectedColor === token.name
                  ? "ring-2 ring-primary shadow-md"
                  : ""
              }`}
            >
              <div
                className="w-full h-16 rounded-md mb-2 border border-border"
                style={{ backgroundColor: `var(${token.cssVar})` }}
              />
              <div className="text-xs font-mono truncate">
                {token.colorName}
              </div>
              <div className="text-xs font-semibold">{token.shade}</div>
              {showOklchDetails && (
                <div className="text-[10px] font-mono text-muted-foreground mt-1 space-y-0.5">
                  {(() => {
                    const oklch = parseOklch(token.value);
                    if (oklch) {
                      return (
                        <>
                          <div>L: {oklch.l.toFixed(3)}</div>
                          <div>C: {oklch.c.toFixed(3)}</div>
                          <div>H: {oklch.h.toFixed(0)}°</div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredTokens.length > 60 && (
          <div className="text-sm text-center text-muted-foreground">
            Showing first 60 results. Refine your search to see more.
          </div>
        )}

        {/* Selected Token Details */}
        {selectedToken && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Token Details</span>
                <Badge variant="outline">{selectedToken.displayName}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Preview */}
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: `var(${selectedToken.cssVar})` }}
                />
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-semibold">
                    {selectedToken.colorName} {selectedToken.shade}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {selectedToken.value}
                  </div>
                </div>
              </div>

              {/* OKLCH Breakdown */}
              {selectedOklch && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    OKLCH Color Space Components
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Lightness (L)</Label>
                      <div className="text-lg font-mono font-semibold">
                        {(selectedOklch.l * 100).toFixed(1)}%
                      </div>
                      <Progress value={selectedOklch.l * 100} className="h-1" />
                      <div className="text-[10px] text-muted-foreground">
                        0 = Black, 100 = White
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Chroma (C)</Label>
                      <div className="text-lg font-mono font-semibold">
                        {selectedOklch.c.toFixed(3)}
                      </div>
                      <Progress
                        value={(selectedOklch.c / 0.4) * 100}
                        className="h-1"
                      />
                      <div className="text-[10px] text-muted-foreground">
                        0 = Gray, 0.4 = Vibrant
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hue (H)</Label>
                      <div className="text-lg font-mono font-semibold">
                        {selectedOklch.h.toFixed(0)}°
                      </div>
                      <Progress
                        value={(selectedOklch.h / 360) * 100}
                        className="h-1"
                      />
                      <div className="text-[10px] text-muted-foreground">
                        0-360° color wheel
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Examples */}
              <div className="space-y-3">
                <div className="text-sm font-semibold">Usage Examples</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
                    <div className="text-muted-foreground mb-1">CSS:</div>
                    <code>background-color: var({selectedToken.cssVar});</code>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
                    <div className="text-muted-foreground mb-1">
                      Tailwind CSS 4:
                    </div>
                    <code>className="bg-({selectedToken.cssVar})"</code>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
                    <div className="text-muted-foreground mb-1">
                      JavaScript (hierarchical):
                    </div>
                    <code>
                      import {`{color}`} from '@wyliedog/tokens/hierarchical';
                      <br />
                      const value = color.{selectedToken.colorName}[
                      {selectedToken.shade}];
                    </code>
                  </div>
                </div>
              </div>

              {/* Copy Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `var(${selectedToken.cssVar})`
                    );
                  }}
                >
                  Copy CSS Variable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedToken.value);
                  }}
                >
                  Copy OKLCH Value
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Token Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(color).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Color Scales
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {allColorTokens.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Color Tokens
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(spacing).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Spacing Tokens
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(shadow).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Shadow Tokens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
};
