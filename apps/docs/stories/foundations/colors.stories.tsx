import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Design Tokens/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// Real design tokens from our Tailwind config
const colorCategories = {
  primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  neutral: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  success: [100, 500, 700],
  warning: [100, 500, 700],
  error: [100, 500, 700],
};

export const PrimaryColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Primary Colors</h3>
      <div className="grid grid-cols-10 gap-2">
        {colorCategories.primary.map((shade) => (
          <div key={shade} className="text-center">
            <div 
              className={`w-12 h-12 rounded border border-neutral-200 bg-primary-${shade}`}
            />
            <p className="text-xs mt-1 font-mono">{shade}</p>
            <p className="text-xs text-neutral-500 font-mono">
              bg-primary-{shade}
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const NeutralColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Neutral Colors</h3>
      <div className="grid grid-cols-10 gap-2">
        {colorCategories.neutral.map((shade) => (
          <div key={shade} className="text-center">
            <div 
              className={`w-12 h-12 rounded border border-neutral-200 bg-neutral-${shade}`}
            />
            <p className="text-xs mt-1 font-mono">{shade}</p>
            <p className="text-xs text-neutral-500 font-mono">
              bg-neutral-{shade}
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Semantic Colors</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Success</h4>
        <div className="flex gap-2">
          {colorCategories.success.map((shade) => (
            <div key={shade} className="text-center">
              <div className={`w-12 h-12 rounded border border-neutral-200 bg-success-${shade}`} />
              <p className="text-xs mt-1 font-mono">{shade}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Warning</h4>
        <div className="flex gap-2">
          {colorCategories.warning.map((shade) => (
            <div key={shade} className="text-center">
              <div className={`w-12 h-12 rounded border border-neutral-200 bg-warning-${shade}`} />
              <p className="text-xs mt-1 font-mono">{shade}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Error</h4>
        <div className="flex gap-2">
          {colorCategories.error.map((shade) => (
            <div key={shade} className="text-center">
              <div className={`w-12 h-12 rounded border border-neutral-200 bg-error-${shade}`} />
              <p className="text-xs mt-1 font-mono">{shade}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const ComponentColorExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Color Usage in Components</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Button Colors</h4>
        <div className="flex gap-4">
          <button className="bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded">
            Primary Button
          </button>
          <button className="bg-neutral-200 text-neutral-900 hover:bg-neutral-300 px-4 py-2 rounded">
            Secondary Button
          </button>
          <button className="border border-neutral-300 text-neutral-900 hover:bg-neutral-100 px-4 py-2 rounded">
            Outline Button
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Alert Colors</h4>
        <div className="space-y-2">
          <div className="bg-success-100 border-l-4 border-success-500 p-4 rounded">
            <p className="text-success-700">Success: Operation completed successfully</p>
          </div>
          <div className="bg-warning-100 border-l-4 border-warning-500 p-4 rounded">
            <p className="text-warning-700">Warning: Please review your inputs</p>
          </div>
          <div className="bg-error-100 border-l-4 border-error-500 p-4 rounded">
            <p className="text-error-700">Error: Something went wrong</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
