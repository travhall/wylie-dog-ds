import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from 'ui/src/input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const Error: Story = {
  args: { variant: 'error', placeholder: 'Error state' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};