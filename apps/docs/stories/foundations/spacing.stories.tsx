import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Design Tokens/Spacing & Layout", 
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
        These spacing tokens are used throughout the design system for consistent layouts.
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
            <div className={`w-16 h-16 bg-white mx-auto rounded ${className}`} />
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
            Card content with proper spacing between elements using our spacing scale (mb-6).
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
              <p className="text-sm text-neutral-600">With consistent spacing</p>
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
