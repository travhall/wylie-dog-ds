import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarImage, AvatarFallback } from "@wyliedog/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "3. Components/Data Display/Avatar",
  component: Avatar,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: 'Avatar component for displaying user profile pictures with fallback support. Includes size variants and compound components for image and fallback content.'
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the avatar",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "md" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Small</p>
      </div>
      
      <div className="text-center">
        <Avatar size="md">
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Medium</p>
      </div>
      
      <div className="text-center">
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Large</p>
      </div>
      
      <div className="text-center">
        <Avatar size="xl">
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Extra Large</p>
      </div>
    </div>
  ),
};

export const WithInitials: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const UserProfiles: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Team Members</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Product Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Sarah Anderson</p>
              <p className="text-xs text-gray-500">UI/UX Designer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Michael Kim</p>
              <p className="text-xs text-gray-500">Frontend Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const GroupDisplay: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Overlapping Avatars</h4>
        <div className="flex -space-x-2">
          <Avatar className="border-2 border-white">
            <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>U3</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>+2</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Avatar Grid</h4>
        <div className="grid grid-cols-4 gap-2 w-fit">
          <Avatar size="sm">
            <AvatarFallback>A1</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A2</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A3</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A4</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A5</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A6</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A7</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>A8</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Loading States</h4>
      <div className="flex gap-4">
        <Avatar>
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
        </Avatar>
        <Avatar>
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
        </Avatar>
        <Avatar>
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
        </Avatar>
      </div>
    </div>
  ),
};
