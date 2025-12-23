import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { color, spacing, shadow } from "@wyliedog/tokens/hierarchical";

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
        <h3 className="text-lg font-semibold mb-2">Semantic Color Tokens</h3>
        <p className="text-sm text-(--color-text-secondary) mb-4">
          These examples demonstrate the semantic token system using CSS custom
          properties with Tailwind's arbitrary value syntax.
        </p>
      </div>

      {/* Interactive Colors */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Interactive States
        </h4>
        <div className="flex flex-wrap gap-3">
          <button className="bg-(--color-interactive-primary) hover:bg-(--color-interactive-primary-hover) active:bg-(--color-interactive-primary-active) text-(--color-text-inverse) px-4 py-2 rounded transition-colors">
            Primary Button
          </button>
          <button className="bg-(--color-interactive-secondary) hover:bg-(--color-interactive-secondary-hover) active:bg-(--color-interactive-secondary-active) text-(--color-text-primary) px-4 py-2 rounded transition-colors">
            Secondary Button
          </button>
          <button className="border border-(--color-border-primary) hover:border-(--color-border-focus) text-(--color-text-primary) px-4 py-2 rounded transition-colors">
            Outline Button
          </button>
          <button className="bg-(--color-interactive-success) hover:bg-(--color-interactive-success-hover) text-(--color-text-inverse) px-4 py-2 rounded transition-colors">
            Success Action
          </button>
          <button className="bg-(--color-interactive-danger) hover:bg-(--color-interactive-danger-hover) text-(--color-text-inverse) px-4 py-2 rounded transition-colors">
            Danger Action
          </button>
        </div>
        <p className="text-xs text-(--color-text-tertiary) mt-2">
          Try hovering and clicking to see state changes
        </p>
      </div>

      {/* Alert/Status Messages */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Status Messages
        </h4>
        <div className="space-y-2">
          <div className="bg-surface-success border border-(--color-border-success) text-(--color-text-success) p-3 rounded flex items-start gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-medium">Success</div>
              <div className="text-sm">
                Your changes have been saved successfully
              </div>
            </div>
          </div>
          <div className="bg-(--color-surface-info) border border-(--color-border-info) text-(--color-text-info) p-3 rounded flex items-start gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-medium">Information</div>
              <div className="text-sm">
                This feature is currently in beta testing
              </div>
            </div>
          </div>
          <div className="bg-surface-warning border border-(--color-border-warning) text-(--color-text-warning) p-3 rounded flex items-start gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-medium">Warning</div>
              <div className="text-sm">
                Please review these changes before proceeding
              </div>
            </div>
          </div>
          <div className="bg-(--color-surface-danger) border border-(--color-border-danger) text-(--color-text-danger) p-3 rounded flex items-start gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-medium">Error</div>
              <div className="text-sm">
                Failed to save changes. Please try again
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background & Surface Hierarchy */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Background & Surface Hierarchy
        </h4>
        <div className="bg-(--color-background-primary) border border-(--color-border-secondary) p-4 rounded">
          <div className="text-(--color-text-primary) font-medium mb-2">
            Primary Background
          </div>
          <div className="bg-(--color-background-secondary) p-3 rounded mb-2">
            <div className="text-(--color-text-primary) text-sm mb-2">
              Secondary Background
            </div>
            <div className="bg-(--color-background-tertiary) p-3 rounded">
              <div className="text-(--color-text-secondary) text-sm">
                Tertiary Background
              </div>
            </div>
          </div>
          <div className="bg-(--color-surface-raised) border border-(--color-border-primary) p-3 rounded shadow-sm">
            <div className="text-(--color-text-primary) text-sm">
              Raised Surface (Card/Panel)
            </div>
          </div>
        </div>
      </div>

      {/* Text Hierarchy */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Text Hierarchy
        </h4>
        <div className="bg-(--color-background-secondary) p-4 rounded space-y-2">
          <div className="text-(--color-text-primary) text-lg font-semibold">
            Primary Text - Headings and emphasis
          </div>
          <div className="text-(--color-text-secondary)">
            Secondary Text - Body copy and descriptions
          </div>
          <div className="text-(--color-text-tertiary) text-sm">
            Tertiary Text - Subtle labels and metadata
          </div>
          <div className="text-(--color-text-disabled) text-sm">
            Disabled Text - Inactive elements
          </div>
        </div>
      </div>

      {/* Border & Focus States */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Borders & Focus States
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-(--color-border-primary) p-3 rounded">
            <div className="text-sm text-(--color-text-primary)">
              Primary Border
            </div>
          </div>
          <div className="border-2 border-(--color-border-focus) p-3 rounded">
            <div className="text-sm text-(--color-text-primary)">
              Focus Border (Interactive)
            </div>
          </div>
          <div className="border border-(--color-border-success) p-3 rounded">
            <div className="text-sm text-(--color-text-success)">
              Success Border
            </div>
          </div>
          <div className="border border-(--color-border-danger) p-3 rounded">
            <div className="text-sm text-(--color-text-danger)">
              Danger Border
            </div>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-3">
        <h4 className="font-medium text-(--color-text-primary)">
          Implementation Reference
        </h4>
        <div className="bg-background-inverse text-(--color-text-inverse) p-4 rounded font-mono text-xs overflow-x-auto">
          <div className="space-y-2">
            <div>
              <span className="text-purple-400">// Interactive buttons</span>
            </div>
            <div>
              <span className="text-blue-400">className</span>=
              <span className="text-green-400">
                "bg-(--color-interactive-primary)"
              </span>
            </div>
            <div>
              <span className="text-blue-400">className</span>=
              <span className="text-green-400">
                "hover:bg-(--color-interactive-primary-hover)"
              </span>
            </div>
            <div className="mt-3">
              <span className="text-purple-400">// Alert messages</span>
            </div>
            <div>
              <span className="text-blue-400">className</span>=
              <span className="text-green-400">
                "bg-(--color-surface-success)"
              </span>
            </div>
            <div>
              <span className="text-blue-400">className</span>=
              <span className="text-green-400">
                "border-(--color-border-success)"
              </span>
            </div>
            <div>
              <span className="text-blue-400">className</span>=
              <span className="text-green-400">
                "text-(--color-text-success)"
              </span>
            </div>
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
                  <div className="ml-2 text-neutral-500 break-all">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
