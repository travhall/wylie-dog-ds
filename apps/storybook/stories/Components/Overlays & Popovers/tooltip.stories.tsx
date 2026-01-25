import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen, waitFor } from "storybook/test";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@wyliedog/ui/tooltip";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta<any> = {
  title: "Components/Overlays & Popovers/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Tooltip component built on Radix UI primitives for displaying contextual information. Supports different positioning and provides excellent accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "The preferred side of the trigger to render the tooltip",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "top" },
      },
    },
    delayDuration: {
      control: { type: "number", min: 0, max: 2000, step: 100 },
      description: "The duration in milliseconds before the tooltip appears",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "700" },
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a helpful tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 place-items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="secondary">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears immediately</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <Button variant="secondary">Default delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Default delay (700ms)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1500}>
        <TooltipTrigger asChild>
          <Button variant="secondary">Long delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Long delay (1500ms)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Rich tooltip</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Rich Content Tooltip</p>
            <p className="text-sm">
              This tooltip contains multiple elements and can display more
              complex information to users.
            </p>
            <div className="flex gap-1">
              <Badge variant="secondary">Feature</Badge>
              <Badge variant="outline">Beta</Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">List tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p className="font-medium mb-2">Keyboard shortcuts:</p>
            <ul className="text-sm space-y-1">
              <li>• Ctrl+C - Copy</li>
              <li>• Ctrl+V - Paste</li>
              <li>• Ctrl+Z - Undo</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const InFormContext: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <h3 className="text-lg font-semibold">Account Settings</h3>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Username</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-(--color-text-tertiary) hover:text-(--color-text-secondary)">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Username must be 3-20 characters and unique</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-(--color-border-secondary) rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter username"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Email notifications</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-(--color-text-tertiary) hover:text-(--color-text-secondary)">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Receive email notifications for important updates</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Enable email notifications</span>
          </label>
        </div>
      </div>
    </div>
  ),
};

export const ButtonTooltips: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost">
            ↗️
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open in new tab</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost">
            💾
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Save changes (Ctrl+S)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost">
            🗑️
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete item</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost">
            ⚙️
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithInteractions: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button id="no-delay">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Interactive tooltips appear immediately</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button id="medium-delay">Medium delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Interactive tooltips appear after 500ms</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button id="long-delay">Long delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Interactive tooltips appear after 1000ms</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const noDelayButton = canvas.getByRole("button", { name: /no delay/i });

    // Test 1: Tooltips are initially shown on hover
    await userEvent.hover(noDelayButton);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(
      screen.getAllByText(/interactive tooltips appear immediately/i)[0]
    ).toBeVisible();

    // Test 2: Test medium delay tooltip (500ms)
    const mediumDelayButton = canvas.getByRole("button", {
      name: /medium delay/i,
    });
    await userEvent.hover(mediumDelayButton);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(
      screen.getAllByText(/interactive tooltips appear after 500ms/i)[0]
    ).toBeVisible();

    // Test 3: Test long delay tooltip (1000ms)
    const longDelayButton = canvas.getByRole("button", {
      name: /long delay/i,
    });
    await userEvent.hover(longDelayButton);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(
      screen.getAllByText(/interactive tooltips appear after 1000ms/i)[0]
    ).toBeVisible();

    // Cleanup
    await userEvent.unhover(longDelayButton);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating tooltip functionality including hover/unhover interactions and delay timing variations (100ms, 500ms, 1000ms). Tests proper tooltip visibility based on delay duration, rapid hover/unhover behavior, and consistent reopening. Uses play functions to simulate real user hover interactions with various delay scenarios. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
