import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";

const meta: Meta = {
  title: "2. Foundations/Design Tokens/Spacing & Layout",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// Real spacing tokens from Tailwind
const spacingScale = [
  { name: "0", class: "w-0", description: "0" },
  { name: "px", class: "w-px", description: "1px" },
  { name: "0.5", class: "w-0.5", description: "0.125rem (2px)" },
  { name: "1", class: "w-1", description: "0.25rem (4px)" },
  { name: "2", class: "w-2", description: "0.5rem (8px)" },
  { name: "3", class: "w-3", description: "0.75rem (12px)" },
  { name: "4", class: "w-4", description: "1rem (16px)" },
  { name: "6", class: "w-6", description: "1.5rem (24px)" },
  { name: "8", class: "w-8", description: "2rem (32px)" },
  { name: "12", class: "w-12", description: "3rem (48px)" },
  { name: "16", class: "w-16", description: "4rem (64px)" },
  { name: "20", class: "w-20", description: "5rem (80px)" },
  { name: "24", class: "w-24", description: "6rem (96px)" },
];

const shadowScale = [
  { name: "sm", class: "shadow-sm", description: "Subtle shadow" },
  { name: "md", class: "shadow-md", description: "Medium shadow" },
  { name: "lg", class: "shadow-lg", description: "Large shadow" },
  { name: "xl", class: "shadow-xl", description: "Extra large shadow" },
];

export const SpacingScale: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Spacing Scale</h3>
      <p className="text-sm text-neutral-600">
        These spacing tokens are used throughout the design system for
        consistent layouts.
      </p>
      {spacingScale.map(({ name, class: className, description }) => (
        <div key={name} className="flex items-center space-x-4">
          <div className="w-16 text-sm font-mono">{name}</div>
          <div className={`bg-primary-200 h-4 ${className}`} />
          <div className="text-sm text-neutral-500">{description}</div>
          <div className="text-xs font-mono text-neutral-400">{className}</div>
        </div>
      ))}
    </div>
  ),
};

export const ShadowScale: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Shadow Scale</h3>
      <p className="text-sm text-neutral-600">
        Elevation levels for depth and hierarchy in the interface.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {shadowScale.map(({ name, class: className, description }) => (
          <div key={name} className="text-center space-y-2">
            <div
              className={`w-16 h-16 bg-white mx-auto rounded ${className}`}
            />
            <p className="text-sm font-mono">{name}</p>
            <p className="text-xs text-neutral-500">{description}</p>
            <p className="text-xs font-mono text-neutral-400">{className}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ComponentSpacingExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Component Spacing Examples</h3>

      <div className="space-y-4">
        <h4 className="font-medium">Button Sizes</h4>
        <div className="flex gap-4 items-center">
          <button className="bg-primary-500 text-white px-3 py-1.5 rounded text-sm">
            Small (px-3 py-1.5)
          </button>
          <button className="bg-primary-500 text-white px-4 py-2 rounded">
            Medium (px-4 py-2)
          </button>
          <button className="bg-primary-500 text-white px-6 py-3 rounded text-lg">
            Large (px-6 py-3)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Card Spacing</h4>
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-md max-w-md">
          <h5 className="font-semibold mb-4">Card Title (mb-4)</h5>
          <p className="text-neutral-600 mb-6">
            Card content with proper spacing between elements using our spacing
            scale (mb-6).
          </p>
          <div className="flex gap-3">
            <button className="bg-primary-500 text-white px-4 py-2 rounded">
              Primary
            </button>
            <button className="border border-neutral-300 text-neutral-900 px-4 py-2 rounded">
              Secondary
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">List Spacing</h4>
        <div className="space-y-3 max-w-md">
          <div className="flex items-center p-3 bg-neutral-50 rounded">
            <div className="w-10 h-10 bg-primary-200 rounded mr-3"></div>
            <div>
              <p className="font-medium">List Item 1</p>
              <p className="text-sm text-neutral-600">
                With consistent spacing
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-neutral-50 rounded">
            <div className="w-10 h-10 bg-primary-200 rounded mr-3"></div>
            <div>
              <p className="font-medium">List Item 2</p>
              <p className="text-sm text-neutral-600">Using space-y-3</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-neutral-50 rounded">
            <div className="w-10 h-10 bg-primary-200 rounded mr-3"></div>
            <div>
              <p className="font-medium">List Item 3</p>
              <p className="text-sm text-neutral-600">For visual rhythm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const SpacingPlayground: Story = {
  render: () => {
    const [padding, setPadding] = useState("p-4");
    const [margin, setMargin] = useState("m-4");
    const [gap, setGap] = useState("gap-4");

    const spacingValues = [
      { value: "0", label: "0 (0px)" },
      { value: "0.5", label: "0.5 (2px)" },
      { value: "1", label: "1 (4px)" },
      { value: "2", label: "2 (8px)" },
      { value: "3", label: "3 (12px)" },
      { value: "4", label: "4 (16px)" },
      { value: "6", label: "6 (24px)" },
      { value: "8", label: "8 (32px)" },
      { value: "12", label: "12 (48px)" },
      { value: "16", label: "16 (64px)" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-2">
            Spacing Playground
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive explorer for spacing tokens. Visualize how padding,
            margin, and gap values work together.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spacing Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Padding */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Padding</Label>
              <div className="grid grid-cols-5 gap-2">
                {spacingValues.map((item) => (
                  <button
                    key={`p-${item.value}`}
                    onClick={() => setPadding(`p-${item.value}`)}
                    className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      padding === `p-${item.value}`
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Margin</Label>
              <div className="grid grid-cols-5 gap-2">
                {spacingValues.map((item) => (
                  <button
                    key={`m-${item.value}`}
                    onClick={() => setMargin(`m-${item.value}`)}
                    className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      margin === `m-${item.value}`
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gap (for flex/grid)</Label>
              <div className="grid grid-cols-5 gap-2">
                {spacingValues.map((item) => (
                  <button
                    key={`gap-${item.value}`}
                    onClick={() => setGap(`gap-${item.value}`)}
                    className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      gap === `gap-${item.value}`
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview - Padding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Padding Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
              <div
                className={`${padding} bg-white dark:bg-gray-800 border-2 border-blue-500`}
              >
                <div className="text-sm text-center py-4">
                  Content with {padding}
                </div>
              </div>
              <div className="absolute top-2 left-2 text-xs font-mono text-blue-600 dark:text-blue-400">
                padding area
              </div>
            </div>
            <div className="mt-3 p-3 rounded-md bg-muted/50">
              <code className="text-xs font-mono">className="{padding}"</code>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview - Margin */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Margin Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950 dark:border-orange-700 p-4">
              <div
                className={`${margin} bg-white dark:bg-gray-800 border-2 border-orange-500 p-4`}
              >
                <div className="text-sm text-center">Element with {margin}</div>
              </div>
              <div className="mt-2 text-xs font-mono text-orange-600 dark:text-orange-400 text-center">
                margin area (orange)
              </div>
            </div>
            <div className="mt-3 p-3 rounded-md bg-muted/50">
              <code className="text-xs font-mono">className="{margin}"</code>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview - Gap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gap Preview (Flex)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex ${gap} p-4 border border-border rounded-lg bg-muted/30`}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 p-4 bg-primary/20 border border-primary rounded text-center text-sm"
                >
                  Item {i}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-md bg-muted/50">
              <code className="text-xs font-mono">className="flex {gap}"</code>
            </div>
          </CardContent>
        </Card>

        {/* Visual Scale Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visual Scale Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spacingValues.map((item) => (
                <div key={item.value} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-mono text-muted-foreground">
                    {item.label}
                  </div>
                  <div
                    className="bg-primary h-6"
                    style={{
                      width:
                        item.value === "0"
                          ? "0"
                          : item.value === "0.5"
                            ? "2px"
                            : item.value === "1"
                              ? "4px"
                              : item.value === "2"
                                ? "8px"
                                : item.value === "3"
                                  ? "12px"
                                  : item.value === "4"
                                    ? "16px"
                                    : item.value === "6"
                                      ? "24px"
                                      : item.value === "8"
                                        ? "32px"
                                        : item.value === "12"
                                          ? "48px"
                                          : "64px",
                    }}
                  />
                  <div className="text-xs font-mono text-muted-foreground">
                    p-{item.value}, m-{item.value}, gap-{item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Common Usage Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Card Component</p>
              <code className="text-xs font-mono bg-muted p-2 rounded block">
                className="p-6" {/* Padding: 24px */}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Button Component</p>
              <code className="text-xs font-mono bg-muted p-2 rounded block">
                className="px-4 py-2" {/* Horizontal: 16px, Vertical: 8px */}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Stack Layout</p>
              <code className="text-xs font-mono bg-muted p-2 rounded block">
                className="space-y-4" {/* Vertical gap: 16px */}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Grid Layout</p>
              <code className="text-xs font-mono bg-muted p-2 rounded block">
                className="grid gap-6" {/* Grid gap: 24px */}
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
              setPadding("p-4");
              setMargin("m-4");
              setGap("gap-4");
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    );
  },
};
