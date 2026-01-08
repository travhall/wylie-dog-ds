import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@wyliedog/ui/tooltip";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";

const meta: Meta<typeof Tooltip> = {
  title: "3. Components/Overlays/Tooltip",
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
                <button className="text-gray-400 hover:text-gray-600">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter username"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Email notifications</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600">
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
          <Button variant="secondary">No Delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears immediately (100ms)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="secondary">Medium Delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears after 500ms delay</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="secondary">Long Delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears after 1000ms delay</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Tooltips are initially hidden
    let tooltipText = canvas.queryByText(/appears immediately/i);
    expect(tooltipText).not.toBeInTheDocument();

    // Test 2: Test short delay tooltip (100ms)
    const noDelayButton = canvas.getByRole("button", { name: /no delay/i });
    expect(noDelayButton).toBeInTheDocument();
    await userEvent.hover(noDelayButton);

    // Wait for 100ms delay plus animation
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Verify tooltip is visible
    tooltipText = canvas.getByText(/appears immediately/i);
    expect(tooltipText).toBeInTheDocument();

    // Test 3: Unhover and verify tooltip is hidden
    await userEvent.unhover(noDelayButton);

    // Wait for fade out animation
    await new Promise((resolve) => setTimeout(resolve, 200));

    tooltipText = canvas.queryByText(/appears immediately/i);
    expect(tooltipText).not.toBeInTheDocument();

    // Test 4: Test medium delay tooltip (500ms)
    const mediumDelayButton = canvas.getByRole("button", {
      name: /medium delay/i,
    });
    expect(mediumDelayButton).toBeInTheDocument();
    await userEvent.hover(mediumDelayButton);

    // Wait for 500ms delay plus animation
    await new Promise((resolve) => setTimeout(resolve, 650));

    // Verify tooltip is visible
    tooltipText = canvas.getByText(/appears after 500ms delay/i);
    expect(tooltipText).toBeInTheDocument();

    // Test 5: Unhover medium delay tooltip
    await userEvent.unhover(mediumDelayButton);

    // Wait for fade out animation
    await new Promise((resolve) => setTimeout(resolve, 200));

    tooltipText = canvas.queryByText(/appears after 500ms delay/i);
    expect(tooltipText).not.toBeInTheDocument();

    // Test 6: Test long delay tooltip (1000ms)
    const longDelayButton = canvas.getByRole("button", {
      name: /long delay/i,
    });
    expect(longDelayButton).toBeInTheDocument();
    await userEvent.hover(longDelayButton);

    // Wait for 1000ms delay plus animation
    await new Promise((resolve) => setTimeout(resolve, 1150));

    // Verify tooltip is visible
    tooltipText = canvas.getByText(/appears after 1000ms delay/i);
    expect(tooltipText).toBeInTheDocument();

    // Test 7: Unhover long delay tooltip
    await userEvent.unhover(longDelayButton);

    // Wait for fade out animation
    await new Promise((resolve) => setTimeout(resolve, 200));

    tooltipText = canvas.queryByText(/appears after 1000ms delay/i);
    expect(tooltipText).not.toBeInTheDocument();

    // Test 8: Test rapid hover/unhover on short delay tooltip
    await userEvent.hover(noDelayButton);

    // Don't wait for full delay, unhover immediately
    await userEvent.unhover(noDelayButton);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Tooltip should not appear since we unhovered before delay
    tooltipText = canvas.queryByText(/appears immediately/i);
    expect(tooltipText).not.toBeInTheDocument();

    // Test 9: Re-hover the short delay button to verify it works again
    await userEvent.hover(noDelayButton);

    // Wait for delay and animation
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Tooltip should appear
    tooltipText = canvas.getByText(/appears immediately/i);
    expect(tooltipText).toBeInTheDocument();

    // Test 10: Final unhover to clean up
    await userEvent.unhover(noDelayButton);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 200));

    tooltipText = canvas.queryByText(/appears immediately/i);
    expect(tooltipText).not.toBeInTheDocument();
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
