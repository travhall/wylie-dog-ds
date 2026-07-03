import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { spacing } from "@wyliedog/tokens/hierarchical";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Label } from "@wyliedog/ui/label";
import { Button } from "@wyliedog/ui/button";

const meta: Meta = {
  title: "Foundations/Spacing & Layout",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Spacing and layout foundation tokens demonstrating the spacing scale, shadows, and layout patterns used throughout the design system.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Spacing scale data is derived from the design-token package (@wyliedog/tokens)
// rather than hardcoded — name = token key, px = the token's pixel value.
// Only the numeric spacing-scale keys are shown (the token export also carries
// offset-*, blur-*, tracking-* etc. entries that are not part of the linear scale).
const SPACING_SCALE_KEYS = [
  "025",
  "050",
  "100",
  "150",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
  "1100",
  "1200",
];

const spacingScale = SPACING_SCALE_KEYS.map((name) => {
  const value = (spacing as Record<string, string>)[name] ?? "0px";
  const px = parseFloat(value);
  return {
    name,
    px,
    rem: `${px / 16}rem`,
    value,
  };
});

// Subset used in the playground controls. The playground renders live Tailwind
// utility classes (p-N, m-N, gap-N), so it must use Tailwind-compatible scale
// names rather than the design-token keys.
const playgroundSteps = [
  { name: "0", px: 0 },
  { name: "0.5", px: 2 },
  { name: "1", px: 4 },
  { name: "2", px: 8 },
  { name: "3", px: 12 },
  { name: "4", px: 16 },
  { name: "6", px: 24 },
  { name: "8", px: 32 },
  { name: "12", px: 48 },
  { name: "16", px: 64 },
];

const shadowScale = [
  {
    name: "sm",
    class: "shadow-sm",
    description: "Subtle lift — tooltips, chips",
  },
  { name: "md", class: "shadow-md", description: "Medium — cards, dropdowns" },
  { name: "lg", class: "shadow-lg", description: "Strong — modals, panels" },
  { name: "xl", class: "shadow-xl", description: "Dramatic — overlays" },
];

// ============================================================================
// STORY 1: SpacingScale
// ============================================================================

export const SpacingScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Full spacing scale reference. Bar widths are proportional to each other — the visual difference between two steps is the actual difference in space.",
      },
    },
  },
  render: () => {
    const maxPx = Math.max(...spacingScale.map((s) => s.px));

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-1">
            Spacing Scale
          </h3>
          <p className="text-sm text-(--color-text-secondary)">
            4px base unit. Bars are proportional — the visual gap between two
            steps is the real difference in space.
          </p>
        </div>

        <div className="space-y-2">
          {spacingScale.map(({ name, px, rem }) => (
            <div key={name} className="flex items-center gap-4">
              <code className="w-12 text-sm font-mono font-semibold text-(--color-text-primary) shrink-0">
                {name}
              </code>
              <span className="w-14 text-xs text-(--color-text-secondary) shrink-0">
                {px}px
              </span>
              <div className="flex-1 flex items-center h-5">
                {px === 0 ? (
                  <span className="text-xs italic text-(--color-text-tertiary)">
                    —
                  </span>
                ) : (
                  <div
                    className="h-4 rounded-sm bg-(--color-interactive-primary)/60"
                    style={{ width: `${(px / maxPx) * 100}%` }}
                  />
                )}
              </div>
              <span className="w-20 text-xs text-(--color-text-tertiary) shrink-0 text-right hidden sm:block">
                {rem}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ============================================================================
// STORY 2: ShadowScale
// ============================================================================

export const ShadowScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Elevation levels for depth and hierarchy. **Dark mode note:** CSS box-shadows use dark RGBA values that vanish on dark surfaces. The side-by-side comparison below makes this visible. The recommended mitigation is to pair shadows with `--color-border-primary` on elevated surfaces in dark mode.",
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-1">
          Shadow Scale
        </h3>
        <p className="text-sm text-(--color-text-secondary)">
          Four elevation levels, from subtle lift to prominent overlay.
        </p>
      </div>

      {/* Light vs dark comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Light surface */}
        <div className="rounded-xl border border-(--color-border-primary) overflow-hidden">
          <div className="px-4 py-2 bg-(--color-background-secondary) border-b border-(--color-border-primary)">
            <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
              Light surface
            </p>
          </div>
          <div className="p-6 bg-white flex flex-wrap gap-6 justify-around">
            {shadowScale.map(({ name, class: cls }) => (
              <div key={name} className="text-center space-y-3">
                <div
                  className={`w-16 h-16 bg-white rounded-lg mx-auto ${cls}`}
                />
                <code className="block text-xs font-mono text-(--color-text-secondary)">
                  {cls}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Dark surface */}
        <div className="rounded-xl border border-(--color-border-primary) overflow-hidden">
          <div className="px-4 py-2 bg-(--color-background-secondary) border-b border-(--color-border-primary)">
            <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
              Dark surface — shadows disappear
            </p>
          </div>
          <div className="p-6 bg-gray-900 flex flex-wrap gap-6 justify-around">
            {shadowScale.map(({ name, class: cls }) => (
              <div key={name} className="text-center space-y-3">
                <div
                  className={`w-16 h-16 bg-gray-800 rounded-lg mx-auto ${cls}`}
                />
                <code className="block text-xs font-mono text-gray-400">
                  {cls}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dark mode guidance */}
      <div className="rounded-lg border border-(--color-border-primary) divide-y divide-(--color-border-primary) overflow-hidden">
        <div className="px-4 py-3 bg-(--color-background-secondary)">
          <p className="text-sm font-semibold">Dark mode strategy</p>
          <p className="text-xs text-(--color-text-secondary) mt-0.5">
            Standard CSS shadows use opaque dark RGBA values. On dark surfaces
            they lose contrast and become invisible.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-(--color-border-primary)">
          {[
            {
              label: "Avoid",
              color: "text-(--color-status-danger)",
              code: "shadow-md",
              note: "Invisible on dark backgrounds",
            },
            {
              label: "Better",
              color: "text-(--color-status-warning)",
              code: "shadow-md + border",
              note: "Add border-(--color-border-primary) to elevated surfaces",
            },
            {
              label: "Best",
              color: "text-(--color-status-success)",
              code: "shadow token (planned)",
              note: "Theme-aware shadow tokens that swap to a glow in dark mode",
            },
          ].map(({ label, color, code, note }) => (
            <div key={label} className="p-4 space-y-1">
              <p className={`text-xs font-semibold ${color}`}>{label}</p>
              <code className="block text-xs font-mono bg-(--color-background-secondary) px-1.5 py-1 rounded">
                {code}
              </code>
              <p className="text-xs text-(--color-text-tertiary)">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full scale reference */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Scale reference</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {shadowScale.map(({ name, class: cls, description }) => (
            <div key={name} className="space-y-3">
              <div
                className={`w-full aspect-square max-w-[9rem] mx-auto bg-(--color-background-primary) rounded-xl border border-(--color-border-primary) ${cls}`}
              />
              <div className="text-center space-y-0.5">
                <code className="text-sm font-mono font-semibold">
                  shadow-{name}
                </code>
                <p className="text-xs text-(--color-text-secondary)">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 3: ComponentSpacingExamples
// ============================================================================

export const ComponentSpacingExamples: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "How spacing tokens are applied in real components — buttons, cards, and list layouts.",
      },
    },
  },
  render: () => (
    <div className="space-y-10">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-1">
          Component Spacing
        </h3>
        <p className="text-sm text-(--color-text-secondary)">
          Consistent spacing creates visual rhythm. These examples show how the
          scale applies in context.
        </p>
      </div>

      {/* Button sizes */}
      <div className="space-y-3">
        <div>
          <h4 className="text-base font-semibold mb-0.5">Button Sizes</h4>
          <p className="text-sm text-(--color-text-secondary)">
            Padding scales with button importance.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1 text-center">
            <Button size="sm">Small</Button>
            <p className="text-xs font-mono text-(--color-text-tertiary)">
              px-3 py-1.5
            </p>
          </div>
          <div className="space-y-1 text-center">
            <Button size="md">Medium</Button>
            <p className="text-xs font-mono text-(--color-text-tertiary)">
              px-4 py-2
            </p>
          </div>
          <div className="space-y-1 text-center">
            <Button size="lg">Large</Button>
            <p className="text-xs font-mono text-(--color-text-tertiary)">
              px-6 py-3
            </p>
          </div>
        </div>
      </div>

      {/* Card spacing */}
      <div className="space-y-3">
        <div>
          <h4 className="text-base font-semibold mb-0.5">Card Spacing</h4>
          <p className="text-sm text-(--color-text-secondary)">
            Internal rhythm for card content.
          </p>
        </div>
        <div className="bg-(--color-background-primary) border border-(--color-border-primary) rounded-lg p-6 shadow-md max-w-md">
          <h5 className="font-semibold mb-2">Card Title</h5>
          <p className="text-sm text-(--color-text-secondary) mb-6">
            Body content with a generous bottom margin before the action area.
          </p>
          <div className="flex gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </div>
        <code className="text-xs font-mono text-(--color-text-secondary)">
          p-6 · mb-2 · mb-6 · gap-3
        </code>
      </div>

      {/* List spacing */}
      <div className="space-y-3">
        <div>
          <h4 className="text-base font-semibold mb-0.5">List Items</h4>
          <p className="text-sm text-(--color-text-secondary)">
            Consistent row height and internal padding.
          </p>
        </div>
        <div className="space-y-2 max-w-md">
          {["Design Tokens", "Component Library", "Documentation"].map(
            (label, i) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 bg-(--color-background-secondary) rounded-lg"
              >
                <div className="w-8 h-8 rounded bg-(--color-interactive-primary)/20 border border-(--color-interactive-primary)/30 shrink-0 flex items-center justify-center text-xs font-semibold text-(--color-interactive-primary)">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-(--color-text-tertiary)">
                    space-y-2 · p-3 · gap-3
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 4: SpacingPlayground
// ============================================================================

export const SpacingPlayground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive explorer for padding, margin, and gap. Select a value for each property to see how it renders in context.",
      },
    },
  },
  render: () => {
    const [padding, setPadding] = useState("4");
    const [margin, setMargin] = useState("4");
    const [gap, setGap] = useState("4");

    const pClass = `p-${padding}`;
    const mClass = `m-${margin}`;
    const gClass = `gap-${gap}`;

    function handleReset() {
      setPadding("4");
      setMargin("4");
      setGap("4");
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-2">
            Spacing Playground
          </h3>
          <p className="text-sm text-(--color-text-secondary)">
            Select a value for padding, margin, or gap to visualize it in
            context.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Padding */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Padding —{" "}
                <code className="font-mono text-xs text-(--color-text-secondary)">
                  p-{padding}
                </code>{" "}
                <span className="text-(--color-text-tertiary) font-normal">
                  ({playgroundSteps.find((s) => s.name === padding)?.px ?? 0}px)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {playgroundSteps.map((step) => (
                  <Button
                    key={step.name}
                    size="sm"
                    variant={padding === step.name ? "default" : "outline"}
                    onClick={() => setPadding(step.name)}
                  >
                    {step.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Margin —{" "}
                <code className="font-mono text-xs text-(--color-text-secondary)">
                  m-{margin}
                </code>{" "}
                <span className="text-(--color-text-tertiary) font-normal">
                  ({playgroundSteps.find((s) => s.name === margin)?.px ?? 0}px)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {playgroundSteps.map((step) => (
                  <Button
                    key={step.name}
                    size="sm"
                    variant={margin === step.name ? "default" : "outline"}
                    onClick={() => setMargin(step.name)}
                  >
                    {step.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Gap —{" "}
                <code className="font-mono text-xs text-(--color-text-secondary)">
                  gap-{gap}
                </code>{" "}
                <span className="text-(--color-text-tertiary) font-normal">
                  ({playgroundSteps.find((s) => s.name === gap)?.px ?? 0}px)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {playgroundSteps.map((step) => (
                  <Button
                    key={step.name}
                    size="sm"
                    variant={gap === step.name ? "default" : "outline"}
                    onClick={() => setGap(step.name)}
                  >
                    {step.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Previews */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Padding Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Padding Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-2 border-dashed border-(--color-interactive-primary)/40 bg-(--color-interactive-primary)/5 rounded">
                <span className="absolute top-1.5 left-2 text-[10px] font-mono text-(--color-interactive-primary)/70">
                  padding area
                </span>
                <div
                  className={`${pClass} bg-(--color-background-primary) border-2 border-(--color-interactive-primary) rounded m-4`}
                >
                  <div className="text-sm text-center text-(--color-text-secondary) py-2">
                    Content
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-md bg-(--color-background-secondary)/50 text-xs font-mono">
                className="{pClass}"
              </div>
            </CardContent>
          </Card>

          {/* Margin Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Margin Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-(--color-status-warning)/40 bg-(--color-status-warning)/5 rounded p-1">
                <span className="block text-[10px] font-mono text-(--color-status-warning)/70 px-1 pb-1">
                  margin area
                </span>
                <div
                  className={`${mClass} bg-(--color-background-primary) border-2 border-(--color-status-warning) rounded p-4`}
                >
                  <div className="text-sm text-center text-(--color-text-secondary)">
                    Content
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-md bg-(--color-background-secondary)/50 text-xs font-mono">
                className="{mClass}"
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gap Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gap Preview (Flex)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex ${gClass} p-4 border border-(--color-border-primary) rounded-lg bg-(--color-background-secondary)/30`}
            >
              {["Item 1", "Item 2", "Item 3"].map((label) => (
                <div
                  key={label}
                  className="flex-1 p-4 bg-(--color-interactive-primary)/10 border border-(--color-interactive-primary)/30 rounded text-center text-sm"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-md bg-(--color-background-secondary)/50 text-xs font-mono">
              className="flex {gClass}"
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    );
  },
};
