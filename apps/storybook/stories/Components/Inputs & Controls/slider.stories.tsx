import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@wyliedog/ui/slider";
import { useState } from "react";

const meta: Meta<typeof Slider> = {
  title: "Components/Inputs & Controls/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A slider component for selecting values from a range with support for single and multiple handles.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "object",
      description: "Default value(s) for the slider",
      table: {
        type: { summary: "number[]" },
        defaultValue: { summary: "[0]" },
        category: "Content",
      },
    },
    max: {
      control: "number",
      description: "Maximum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "100" },
        category: "Content",
      },
    },
    min: {
      control: "number",
      description: "Minimum value",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
        category: "Content",
      },
    },
    step: {
      control: "number",
      description: "Step increment",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
        category: "Behavior",
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "State",
      },
    },
  },
  args: {
    defaultValue: [50],
    max: 100,
    min: 0,
    step: 1,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic slider with a single handle at the midpoint.",
      },
    },
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Dual-handle slider for selecting a value range.",
      },
    },
  },
};

export const CustomRange: Story = {
  args: {
    defaultValue: [10],
    min: 0,
    max: 20,
    step: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Slider with custom min, max, and step values.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Slider in a disabled state that cannot be interacted with.",
      },
    },
  },
};

export const WithLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Slider with a label and live value display showing the current selection.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState([50]);

    return (
      <div className="w-full space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Volume</label>
            <span className="text-sm text-(--color-text-secondary)">
              {value[0]}%
            </span>
          </div>
          <Slider value={value} onValueChange={setValue} max={100} step={1} />
        </div>
      </div>
    );
  },
};

export const PriceRange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dual-handle range slider for filtering by price with formatted currency labels.",
      },
    },
  },
  render: () => {
    const [priceRange, setPriceRange] = useState([200, 800]);

    return (
      <div className="w-full space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Price Range</label>
            <span className="text-sm text-(--color-text-secondary)">
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            min={0}
            step={10}
          />
          <div className="flex justify-between text-xs text-(--color-text-tertiary)">
            <span>$0</span>
            <span>$1,000</span>
          </div>
        </div>
      </div>
    );
  },
};
