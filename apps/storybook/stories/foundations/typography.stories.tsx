import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";

const meta: Meta = {
  title: "2. Foundations/Typography",
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
            <p className="leading-tight text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Normal</p>
            <p className="leading-normal text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Relaxed</p>
            <p className="leading-relaxed text-gray-700">
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
        <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
        <p className="text-sm text-gray-600 font-mono">text-5xl / 48px</p>
      </div>

      <div>
        <h2 className="text-4xl font-bold mb-2">Heading 2</h2>
        <p className="text-sm text-gray-600 font-mono">text-4xl / 36px</p>
      </div>

      <div>
        <h3 className="text-3xl font-bold mb-2">Heading 3</h3>
        <p className="text-sm text-gray-600 font-mono">text-3xl / 30px</p>
      </div>

      <div>
        <h4 className="text-2xl font-bold mb-2">Heading 4</h4>
        <p className="text-sm text-gray-600 font-mono">text-2xl / 24px</p>
      </div>

      <div>
        <h5 className="text-xl font-bold mb-2">Heading 5</h5>
        <p className="text-sm text-gray-600 font-mono">text-xl / 20px</p>
      </div>

      <div>
        <h6 className="text-lg font-bold mb-2">Heading 6</h6>
        <p className="text-sm text-gray-600 font-mono">text-lg / 18px</p>
      </div>

      <div>
        <p className="text-base mb-2">Body Large (Base)</p>
        <p className="text-sm text-gray-600 font-mono">text-base / 16px</p>
      </div>

      <div>
        <p className="text-sm mb-2">Body Small</p>
        <p className="text-sm text-gray-600 font-mono">text-sm / 14px</p>
      </div>

      <div>
        <p className="text-xs mb-2">Caption</p>
        <p className="text-sm text-gray-600 font-mono">text-xs / 12px</p>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-light mb-1">Light Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-light / 300</p>
      </div>

      <div>
        <p className="text-xl font-normal mb-1">Normal Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-normal / 400</p>
      </div>

      <div>
        <p className="text-xl font-medium mb-1">Medium Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-medium / 500</p>
      </div>

      <div>
        <p className="text-xl font-semibold mb-1">Semibold Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-semibold / 600</p>
      </div>

      <div>
        <p className="text-xl font-bold mb-1">Bold Weight</p>
        <p className="text-sm text-gray-600 font-mono">font-bold / 700</p>
      </div>
    </div>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h4 className="text-lg font-semibold mb-2">Tight (leading-tight)</h4>
        <p className="leading-tight text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Normal (leading-normal)</h4>
        <p className="leading-normal text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">
          Relaxed (leading-relaxed)
        </h4>
        <p className="leading-relaxed text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Loose (leading-loose)</h4>
        <p className="leading-loose text-gray-700">
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
        <p className="text-gray-900 text-lg mb-1">Primary Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-900</p>
      </div>

      <div>
        <p className="text-gray-700 text-lg mb-1">Secondary Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-700</p>
      </div>

      <div>
        <p className="text-gray-500 text-lg mb-1">Muted Text</p>
        <p className="text-sm text-gray-600 font-mono">text-gray-500</p>
      </div>

      <div>
        <p className="text-blue-600 text-lg mb-1">Link Text</p>
        <p className="text-sm text-gray-600 font-mono">text-blue-600</p>
      </div>

      <div>
        <p className="text-red-600 text-lg mb-1">Error Text</p>
        <p className="text-sm text-gray-600 font-mono">text-red-600</p>
      </div>

      <div>
        <p className="text-green-600 text-lg mb-1">Success Text</p>
        <p className="text-sm text-gray-600 font-mono">text-green-600</p>
      </div>
    </div>
  ),
};

export const TypographyHierarchy: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      <article className="prose prose-gray max-w-none">
        <h1>The Future of Design Systems</h1>
        <p className="lead text-xl text-gray-600">
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
        <h4 className="text-lg font-semibold mb-3">Inline Code</h4>
        <p>
          Use the{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
            useState
          </code>{" "}
          hook to manage state in React components.
        </p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Code Block</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">
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
        <h4 className="text-lg font-semibold mb-3">Terminal Output</h4>
        <pre className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
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
        <p className="text-sm text-gray-600 font-mono">
          text-2xl md:text-4xl lg:text-5xl
        </p>
      </div>

      <div>
        <p className="text-sm md:text-base lg:text-lg mb-2">
          This paragraph adapts its size based on screen size. On mobile it's
          smaller, on tablet it's medium, and on desktop it's larger for better
          readability.
        </p>
        <p className="text-sm text-gray-600 font-mono">
          text-sm md:text-base lg:text-lg
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Mobile First
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Typography scales up from mobile to larger screens, ensuring
            readability across all devices.
          </p>
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Flexible Layout
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Text size and layout adjust automatically to provide optimal reading
            experience on any device.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const TypographyPlayground: Story = {
  render: () => {
    const [fontSize, setFontSize] = useState("text-base");
    const [fontWeight, setFontWeight] = useState("font-normal");
    const [lineHeight, setLineHeight] = useState("leading-normal");
    const [textColor, setTextColor] = useState("text-gray-900");
    const [sampleText, setSampleText] = useState(
      "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet."
    );

    const fontSizes = [
      { value: "text-xs", label: "Extra Small (12px)", size: "12px" },
      { value: "text-sm", label: "Small (14px)", size: "14px" },
      { value: "text-base", label: "Base (16px)", size: "16px" },
      { value: "text-lg", label: "Large (18px)", size: "18px" },
      { value: "text-xl", label: "XL (20px)", size: "20px" },
      { value: "text-2xl", label: "2XL (24px)", size: "24px" },
      { value: "text-3xl", label: "3XL (30px)", size: "30px" },
      { value: "text-4xl", label: "4XL (36px)", size: "36px" },
      { value: "text-5xl", label: "5XL (48px)", size: "48px" },
    ];

    const fontWeights = [
      { value: "font-light", label: "Light (300)" },
      { value: "font-normal", label: "Normal (400)" },
      { value: "font-medium", label: "Medium (500)" },
      { value: "font-semibold", label: "Semibold (600)" },
      { value: "font-bold", label: "Bold (700)" },
    ];

    const lineHeights = [
      { value: "leading-tight", label: "Tight (1.25)" },
      { value: "leading-snug", label: "Snug (1.375)" },
      { value: "leading-normal", label: "Normal (1.5)" },
      { value: "leading-relaxed", label: "Relaxed (1.625)" },
      { value: "leading-loose", label: "Loose (2)" },
    ];

    const textColors = [
      { value: "text-gray-900", label: "Primary (Gray 900)" },
      { value: "text-gray-700", label: "Secondary (Gray 700)" },
      { value: "text-gray-500", label: "Muted (Gray 500)" },
      { value: "text-blue-600", label: "Link (Blue 600)" },
      { value: "text-green-600", label: "Success (Green 600)" },
      { value: "text-red-600", label: "Error (Red 600)" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-2">
            Typography Playground
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive explorer for typography tokens. Adjust font size,
            weight, line height, and color to see how they work together.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Typography Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Size</Label>
              <div className="grid grid-cols-3 gap-2">
                {fontSizes.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFontSize(item.value)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      fontSize === item.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Font Weight</Label>
              <div className="grid grid-cols-3 gap-2">
                {fontWeights.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFontWeight(item.value)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      fontWeight === item.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Line Height</Label>
              <div className="grid grid-cols-3 gap-2">
                {lineHeights.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setLineHeight(item.value)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      lineHeight === item.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Text Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {textColors.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setTextColor(item.value)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      textColor === item.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Text Input */}
            <div className="space-y-2">
              <Label htmlFor="sample-text" className="text-sm font-medium">
                Sample Text
              </Label>
              <textarea
                id="sample-text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background min-h-[80px] resize-y"
                placeholder="Enter your sample text..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-lg border border-border bg-muted/30">
              <p
                className={`${fontSize} ${fontWeight} ${lineHeight} ${textColor}`}
              >
                {sampleText}
              </p>
            </div>

            {/* Current Classes */}
            <div className="mt-4 p-4 rounded-md bg-muted/50">
              <p className="text-xs font-medium mb-2">Current Classes:</p>
              <code className="text-xs font-mono">
                className="{fontSize} {fontWeight} {lineHeight} {textColor}"
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
              <div className="text-muted-foreground mb-1">Tailwind CSS:</div>
              <code>
                className="{fontSize} {fontWeight} {lineHeight} {textColor}"
              </code>
            </div>
            <div className="p-3 rounded-md bg-muted/50 text-xs font-mono">
              <div className="text-muted-foreground mb-1">CSS:</div>
              <code>
                font-size: {fontSizes.find((f) => f.value === fontSize)?.size};
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFontSize("text-base");
              setFontWeight("font-normal");
              setLineHeight("leading-normal");
              setTextColor("text-gray-900");
              setSampleText(
                "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet."
              );
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    );
  },
};
