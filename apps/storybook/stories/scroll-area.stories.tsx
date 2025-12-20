import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "@wyliedog/ui/scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "3. Components/Layout/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Custom scrollable area with styled scrollbars that works consistently across platforms.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const TAGS = Array.from({ length: 50 }, (_, i) => `tag-${i + 1}`);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {TAGS.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md bg-gray-100 h-20 w-32 flex items-center justify-center text-sm"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const LongContent: Story = {
  render: () => (
    <ScrollArea className="h-50 w-87.5 rounded-md border p-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
      vehicula massa ut nulla placerat, at tempor erat congue. Sed euismod lorem
      vel consectetur bibendum. Nulla facilisi. Donec auctor, nisl eget
      ultricies tincidunt, nunc nisl aliquet nisl, eget aliquam nisl nisl sit
      amet lorem. Sed auctor, nisl eget ultricies tincidunt, nunc nisl aliquet
      nisl, eget aliquam nisl nisl sit amet lorem.
      <br />
      <br />
      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
      cubilia curae; Sed euismod lorem vel consectetur bibendum. Nulla facilisi.
      Donec auctor, nisl eget ultricies tincidunt, nunc nisl aliquet nisl, eget
      aliquam nisl nisl sit amet lorem.
      <br />
      <br />
      Pellentesque vehicula massa ut nulla placerat, at tempor erat congue. Sed
      euismod lorem vel consectetur bibendum. Nulla facilisi. Donec auctor, nisl
      eget ultricies tincidunt, nunc nisl aliquet nisl, eget aliquam nisl nisl
      sit amet lorem. Sed auctor, nisl eget ultricies tincidunt, nunc nisl
      aliquet nisl, eget aliquam nisl nisl sit amet lorem.
      <br />
      <br />
      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
      cubilia curae; Sed euismod lorem vel consectetur bibendum. Nulla facilisi.
    </ScrollArea>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-87.5">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Recent Activity
        </h3>
        <p className="text-sm text-muted-foreground">
          Your latest notifications and updates
        </p>
      </div>
      <div className="p-6 pt-0">
        <ScrollArea className="h-75 pr-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Notification {i + 1}</p>
                <p className="text-sm text-muted-foreground">
                  Description for notification {i + 1}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  ),
};

export const ChatMessages: Story = {
  render: () => (
    <div className="border rounded-lg w-100">
      <div className="p-3 border-b">
        <h4 className="font-medium">Chat</h4>
      </div>
      <ScrollArea className="h-75 p-3">
        <div className="space-y-3">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  i % 3 === 0
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                This is message {i + 1}. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};
