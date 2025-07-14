import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
