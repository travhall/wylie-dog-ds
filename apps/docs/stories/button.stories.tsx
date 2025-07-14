import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Primary Button" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary Button" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline Button" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
