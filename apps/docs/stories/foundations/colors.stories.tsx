import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react"; // BOLT: VSCode is displaying this message but the Story is running as expected: Could not find a declaration file for module 'react'. '/Users/travishall/GitHub/wylie-dog-ds/node_modules/.pnpm/react@19.1.0/node_modules/react/index.js' implicitly has an 'any' type. If the 'react' package actually exposes this module, consider sending a pull request to amend 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react'ts(7016)

const meta: Meta = {
  title: "Foundations/Design Tokens/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// BOLT: This feels less maintainable, we need the tokens to drive the color structure and display
const colorStructure = {
  primary: [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ],
  neutral: [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ],
  success: [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ],
  warning: [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ],
  error: [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
  ],
};

const ColorPalette = ({
  colorName,
  shades,
}: {
  colorName: string;
  shades: string[];
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize">{colorName} Colors</h3>
      <div className="grid grid-cols-11 gap-2">
        {shades.map((shade) => (
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
          Colors read from CSS variables. Update design tokens → rebuild →
          changes appear here.
        </p>
      </div>

      {Object.entries(colorStructure).map(([colorName, shades]) => (
        <ColorPalette key={colorName} colorName={colorName} shades={shades} />
      ))}
    </div>
  ),
};

export const ColorUsage: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Color Usage Examples</h3>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button className="bg-primary-500 text-white px-4 py-2 rounded">
            Primary
          </button>
          <button className="bg-neutral-200 text-neutral-900 px-4 py-2 rounded">
            Secondary
          </button>
          <button className="border border-neutral-300 text-neutral-900 px-4 py-2 rounded">
            Outline
          </button>
        </div>

        <div className="space-y-2">
          <div className="bg-success-100 border border-success-500 text-success-700 p-3 rounded">
            Success message
          </div>
          <div className="bg-warning-100 border border-warning-500 text-warning-700 p-3 rounded">
            Warning message
          </div>
          <div className="bg-error-100 border border-error-500 text-error-700 p-3 rounded">
            Error message
          </div>
        </div>
      </div>
    </div>
  ),
};
