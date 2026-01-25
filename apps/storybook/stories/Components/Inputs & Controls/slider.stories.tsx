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
    },
    max: {
      control: "number",
      description: "Maximum value",
    },
    min: {
      control: "number",
      description: "Minimum value",
    },
    step: {
      control: "number",
      description: "Step increment",
    },
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
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
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
};

export const CustomRange: Story = {
  args: {
    defaultValue: [10],
    min: 0,
    max: 20,
    step: 2,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    disabled: true,
  },
};

export const WithLabels: Story = {
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

// export const Vertical: Story = {
//   render: () => (
//     <div className="h-50 w-12.5">
//       <Slider
//         defaultValue={[50]}
//         max={100}
//         step={1}
//         orientation="vertical"
//         className="h-full"
//       />
//     </div>
//   ),
// };
