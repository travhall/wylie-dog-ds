import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Design Tokens/Spacing & Layout',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const spacingTokens = {
  '0': '0',
  'px': '1px',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
};

const shadowTokens = {
  'xs': '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  'sm': '0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Spacing Scale</h3>
      {Object.entries(spacingTokens).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-4">
          <div className="w-16 text-sm font-mono">{key}</div>
          <div 
            className="bg-blue-200 h-4"
            style={{ width: value }}
          />
          <div className="text-sm text-gray-500 font-mono">{value}</div>
        </div>
      ))}
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Shadow Scale</h3>
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(shadowTokens).map(([key, value]) => (
          <div key={key} className="text-center space-y-2">
            <div 
              className="w-16 h-16 bg-white mx-auto rounded"
              style={{ boxShadow: value }}
            />
            <p className="text-sm font-mono">{key}</p>
            <p className="text-xs text-gray-500 font-mono">shadow-{key}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ComponentSpacing: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Component Spacing Examples</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Button Padding</h4>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm">Small Button</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Medium Button</button>
          <button className="bg-blue-500 text-white px-6 py-3 rounded text-lg">Large Button</button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">Card Spacing</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md max-w-md">
          <h5 className="font-semibold mb-4">Card Title</h5>
          <p className="text-gray-600 mb-4">Card content with proper spacing between elements.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Action</button>
        </div>
      </div>
    </div>
  ),
};
