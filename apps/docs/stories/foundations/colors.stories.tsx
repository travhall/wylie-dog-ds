import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { color, spacing, shadow } from "@wyliedog/ui/tokens/hierarchical";

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
      <h3 className="text-lg font-semibold capitalize">{colorName} Colors</h3>
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
            Success message using semantic tokens
          </div>
          <div className="bg-warning-100 border border-warning-500 text-warning-700 p-3 rounded">
            Warning message using semantic tokens
          </div>
          <div className="bg-error-100 border border-error-500 text-error-700 p-3 rounded">
            Error message using semantic tokens
          </div>
        </div>
      </div>
    </div>
  ),
};

export const TokenInspector: Story = {
  render: () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <div>Loading...</div>;
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Token Inspector</h3>
        <p className="text-sm text-neutral-600">
          Live view of design tokens imported from the tokens package.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Color Tokens</h4>
            <div className="bg-neutral-50 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {Object.entries(color).map(([colorName, shades]) => (
                <div key={colorName} className="mb-2">
                  <div className="font-semibold text-neutral-700">
                    {colorName}:
                  </div>
                  {Object.entries(shades)
                    .slice(0, 3)
                    .map(([shade, value]) => (
                      <div key={shade} className="ml-2 text-neutral-600">
                        {shade}: {value}
                      </div>
                    ))}
                  {Object.keys(shades).length > 3 && (
                    <div className="ml-2 text-neutral-400">
                      ...{Object.keys(shades).length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Spacing Tokens</h4>
            <div className="bg-neutral-50 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {Object.entries(spacing).map(([key, value]) => (
                <div key={key} className="text-neutral-600">
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Shadow Tokens</h4>
            <div className="bg-neutral-50 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {Object.entries(shadow).map(([key, value]) => (
                <div key={key} className="text-neutral-600 mb-1">
                  <div>{key}:</div>
                  <div className="ml-2 text-neutral-500 break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
