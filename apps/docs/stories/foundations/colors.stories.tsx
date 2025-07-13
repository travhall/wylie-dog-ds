import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Design Tokens/Colors',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

// Mock tokens data - in real app, import from @wyliedog/tokens
const colorTokens = {
  blue: {
    50: 'oklch(0.97 0.013 263.83)',
    100: 'oklch(0.943 0.032 264.33)',
    200: 'oklch(0.896 0.064 264.72)',
    300: 'oklch(0.824 0.129 264.89)',
    400: 'oklch(0.731 0.201 265.75)',
    500: 'oklch(0.661 0.241 266.19)',
    600: 'oklch(0.588 0.246 267.33)',
    700: 'oklch(0.518 0.228 268.34)',
    800: 'oklch(0.447 0.19 269.47)',
    900: 'oklch(0.395 0.151 270.17)',
  },
  slate: {
    50: 'oklch(0.984 0.003 247.86)',
    100: 'oklch(0.968 0.007 247.9)',
    200: 'oklch(0.929 0.013 255.51)',
    300: 'oklch(0.869 0.02 252.89)',
    400: 'oklch(0.711 0.035 256.79)',
    500: 'oklch(0.554 0.041 257.42)',
    600: 'oklch(0.446 0.037 257.28)',
    700: 'oklch(0.372 0.039 257.29)',
    800: 'oklch(0.279 0.035 260.03)',
    900: 'oklch(0.208 0.033 265.76)',
  },
  green: {
    50: 'oklch(0.98 0.02 149.57)',
    500: 'oklch(0.707 0.193 142.5)',
    900: 'oklch(0.322 0.107 155.72)',
  },
  yellow: {
    50: 'oklch(0.988 0.024 107.89)',
    500: 'oklch(0.802 0.162 85.87)',
    900: 'oklch(0.467 0.11 73.67)',
  },
  red: {
    50: 'oklch(0.971 0.013 17.38)',
    500: 'oklch(0.637 0.237 25.33)',
    900: 'oklch(0.396 0.141 25.72)',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="space-y-8">
      {Object.entries(colorTokens).map(([category, colors]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">{category}</h3>
          <div className="grid grid-cols-10 gap-2">
            {Object.entries(colors).map(([shade, value]) => (
              <div key={shade} className="text-center">
                <div 
                  className="w-12 h-12 rounded border border-gray-200"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs mt-1 font-mono">{shade}</p>
                <p className="text-xs text-gray-500 font-mono truncate" title={value}>
                  {value.length > 8 ? value.substring(0, 8) + '...' : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ComponentColors: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Colors</h3>
        <div className="flex gap-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded">Primary Button</div>
          <div className="bg-slate-100 text-slate-900 border border-slate-300 px-4 py-2 rounded">Secondary Button</div>
          <div className="text-slate-700 hover:bg-slate-100 px-4 py-2 rounded">Ghost Button</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alert Colors</h3>
        <div className="space-y-2">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-900">Success alert message</p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-900">Warning alert message</p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-900">Error alert message</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
