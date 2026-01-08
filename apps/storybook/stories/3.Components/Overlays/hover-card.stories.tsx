import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@wyliedog/ui/hover-card";
import { Avatar } from "@wyliedog/ui/avatar";
import { Button } from "@wyliedog/ui/button";
import { CalendarIcon, MapPinIcon, LinkIcon } from "lucide-react";

const meta: Meta<typeof HoverCard> = {
  title: "3. Components/Overlays/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hover-triggered content cards for displaying additional information. Built on Radix UI primitives with smooth animations and flexible positioning.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    openDelay: {
      control: "number",
      description: "Delay in milliseconds before opening",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "700" },
      },
    },
    closeDelay: {
      control: "number",
      description: "Delay in milliseconds before closing",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "300" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <span className="text-sm">Hover over the link:</span>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@nextjs</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <div className="bg-black text-white flex items-center justify-center w-full h-full text-sm font-bold">
                N
              </div>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm">
                The React Framework - created by @vercel.
              </p>
              <div className="flex items-center pt-2">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Joined December 2021
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600 mb-4">
        Hover over team member names:
      </p>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Designed by:</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                Sarah Chen
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex space-x-4">
                <Avatar>
                  <div className="bg-purple-500 text-white flex items-center justify-center w-full h-full text-sm font-bold">
                    SC
                  </div>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Sarah Chen</h4>
                  <p className="text-sm text-neutral-600">
                    Senior Product Designer
                  </p>
                  <p className="text-sm">
                    Leading design for our mobile experience. 5+ years in
                    product design.
                  </p>
                  <div className="flex items-center pt-2 space-x-4">
                    <div className="flex items-center">
                      <MapPinIcon className="mr-1 h-3 w-3 opacity-70" />
                      <span className="text-xs text-neutral-500">
                        San Francisco
                      </span>
                    </div>
                    <div className="flex items-center">
                      <LinkIcon className="mr-1 h-3 w-3 opacity-70" />
                      <span className="text-xs text-neutral-500">
                        @sarahchen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm">Developed by:</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                Alex Rivera
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex space-x-4">
                <Avatar>
                  <div className="bg-blue-500 text-white flex items-center justify-center w-full h-full text-sm font-bold">
                    AR
                  </div>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Alex Rivera</h4>
                  <p className="text-sm text-neutral-600">
                    Full Stack Engineer
                  </p>
                  <p className="text-sm">
                    Frontend and backend development. React, Node.js, and
                    TypeScript expert.
                  </p>
                  <div className="flex items-center pt-2 space-x-4">
                    <div className="flex items-center">
                      <MapPinIcon className="mr-1 h-3 w-3 opacity-70" />
                      <span className="text-xs text-neutral-500">Remote</span>
                    </div>
                    <div className="flex items-center">
                      <LinkIcon className="mr-1 h-3 w-3 opacity-70" />
                      <span className="text-xs text-neutral-500">@alexdev</span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "User profile hover cards showing team member information.",
      },
    },
  },
};

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="space-y-4">
        <p className="text-sm font-medium">Top positioning:</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me (top)</Button>
          </HoverCardTrigger>
          <HoverCardContent side="top" className="w-64">
            <p className="text-sm">
              This hover card appears above the trigger element.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Bottom positioning:</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me (bottom)</Button>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" className="w-64">
            <p className="text-sm">
              This hover card appears below the trigger element.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Left positioning:</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me (left)</Button>
          </HoverCardTrigger>
          <HoverCardContent side="left" className="w-64">
            <p className="text-sm">
              This hover card appears to the left of the trigger element.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Right positioning:</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button>Hover me (right)</Button>
          </HoverCardTrigger>
          <HoverCardContent side="right" className="w-64">
            <p className="text-sm">
              This hover card appears to the right of the trigger element.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different positioning options for hover card placement.",
      },
    },
  },
};

export const ProductInfo: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold">Product Catalog</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium">MacBook Pro</h4>
          <p className="text-sm text-neutral-600">Starting at $1,999</p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 mt-2 h-auto">
                View specs
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">MacBook Pro 14-inch</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Display:</span> 14.2-inch
                    Liquid Retina XDR
                  </p>
                  <p>
                    <span className="font-medium">Chip:</span> Apple M3 Pro or
                    M3 Max
                  </p>
                  <p>
                    <span className="font-medium">Memory:</span> Up to 128GB
                    unified memory
                  </p>
                  <p>
                    <span className="font-medium">Storage:</span> Up to 8TB SSD
                  </p>
                  <p>
                    <span className="font-medium">Battery:</span> Up to 18 hours
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium">iPad Pro</h4>
          <p className="text-sm text-neutral-600">Starting at $1,099</p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 mt-2 h-auto">
                View specs
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">iPad Pro 12.9-inch</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Display:</span> 12.9-inch
                    Liquid Retina XDR
                  </p>
                  <p>
                    <span className="font-medium">Chip:</span> Apple M2
                  </p>
                  <p>
                    <span className="font-medium">Storage:</span> Up to 2TB
                  </p>
                  <p>
                    <span className="font-medium">Camera:</span> 12MP Ultra Wide
                    front camera
                  </p>
                  <p>
                    <span className="font-medium">Connectivity:</span> Wi-Fi 6E
                    and 5G
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Product information cards triggered by hover for e-commerce scenarios.",
      },
    },
  },
};

export const Documentation: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <h3 className="text-lg font-semibold">API Documentation</h3>

      <div className="space-y-2">
        <p className="text-sm">
          The{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <code className="px-1 py-0.5 bg-neutral-100 rounded text-sm cursor-help">
                useState
              </code>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">useState</h4>
                <p className="text-sm">
                  A Hook that lets you add state to functional components.
                </p>
                <div className="text-xs bg-neutral-50 p-2 rounded">
                  <code>const [state, setState] = useState(initialState)</code>
                </div>
                <p className="text-xs text-neutral-600">
                  Returns a stateful value and a function to update it.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          hook allows you to add state to functional components.
        </p>

        <p className="text-sm">
          You can also use{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <code className="px-1 py-0.5 bg-neutral-100 rounded text-sm cursor-help">
                useEffect
              </code>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">useEffect</h4>
                <p className="text-sm">
                  A Hook that lets you perform side effects in functional
                  components.
                </p>
                <div className="text-xs bg-neutral-50 p-2 rounded">
                  <code>useEffect(effect, dependencies?)</code>
                </div>
                <p className="text-xs text-neutral-600">
                  Runs after every completed render, but can be optimized with
                  dependencies.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          for side effects and lifecycle events.
        </p>

        <p className="text-sm">
          For complex state logic, consider{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <code className="px-1 py-0.5 bg-neutral-100 rounded text-sm cursor-help">
                useReducer
              </code>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">useReducer</h4>
                <p className="text-sm">
                  A Hook that is usually preferable to useState when you have
                  complex state logic.
                </p>
                <div className="text-xs bg-neutral-50 p-2 rounded">
                  <code>
                    const [state, dispatch] = useReducer(reducer, initialState)
                  </code>
                </div>
                <p className="text-xs text-neutral-600">
                  Accepts a reducer function and returns the current state
                  paired with a dispatch method.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          as an alternative.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Documentation tooltips for code examples and API references.",
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <p className="text-sm text-neutral-600">
          Hover cards support keyboard navigation. Use Tab to focus triggers,
          then hover or use keyboard shortcuts to reveal content.
        </p>
      </div>

      <div className="space-y-4">
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" aria-describedby="accessible-description">
              Profile Information
            </Button>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-80"
            role="dialog"
            aria-labelledby="profile-title"
          >
            <div className="space-y-2">
              <h4 id="profile-title" className="font-semibold">
                John Doe
              </h4>
              <p className="text-sm text-neutral-600">Software Engineer</p>
              <p className="text-sm">
                Full-stack developer with 8 years of experience in React and
                Node.js. Currently working on design systems and developer
                tools.
              </p>
              <div className="flex items-center pt-2">
                <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-neutral-500">Seattle, WA</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <p id="accessible-description" className="text-xs text-neutral-600">
          Hover or focus to reveal additional profile information
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates accessibility features including ARIA attributes and keyboard support.",
      },
    },
  },
};

export const WithInteractions: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <span className="text-sm">Hover over the link:</span>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button variant="link">Hover me</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <div className="bg-blue-500 text-white flex items-center justify-center w-full h-full text-sm font-bold">
                TC
              </div>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Test Card</h4>
              <p className="text-sm">
                This is a test hover card with interactions.
              </p>
              <div className="flex items-center pt-2">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Created January 2026
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Hover card is initially closed
    let cardContent = canvas.queryByText(/this is a test hover card/i);
    expect(cardContent).not.toBeInTheDocument();

    // Test 2: Find and hover over the trigger
    const triggerButton = canvas.getByRole("button", { name: /hover me/i });
    expect(triggerButton).toBeInTheDocument();
    await userEvent.hover(triggerButton);

    // Wait for open delay (200ms) plus animation
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Test 3: Hover card content is visible after hover
    cardContent = canvas.getByText(/this is a test hover card/i);
    expect(cardContent).toBeInTheDocument();

    // Test 4: Verify heading is visible
    const heading = canvas.getByRole("heading", { name: /test card/i });
    expect(heading).toBeInTheDocument();

    // Test 5: Verify calendar icon and date are visible
    const dateText = canvas.getByText(/created january 2026/i);
    expect(dateText).toBeInTheDocument();

    // Test 6: Unhover to close the card
    await userEvent.unhover(triggerButton);

    // Wait for close delay (100ms) plus animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Test 7: Hover card content should be hidden after unhover
    cardContent = canvas.queryByText(/this is a test hover card/i);
    expect(cardContent).not.toBeInTheDocument();

    // Test 8: Hover again to verify reopening works
    await userEvent.hover(triggerButton);

    // Wait for open delay plus animation
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Content should be visible again
    cardContent = canvas.getByText(/this is a test hover card/i);
    expect(cardContent).toBeInTheDocument();

    // Test 9: Unhover one more time to verify consistent behavior
    await userEvent.unhover(triggerButton);

    // Wait for close delay plus animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify closed state
    cardContent = canvas.queryByText(/this is a test hover card/i);
    expect(cardContent).not.toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive interaction test demonstrating hover card functionality including hover/unhover interactions, open/close delay timing (200ms open, 100ms close), and content visibility. Tests proper display of card content with nested components. Uses play functions to simulate real user hover interactions. View the Interactions panel to see the automated test execution.",
      },
    },
  },
};
