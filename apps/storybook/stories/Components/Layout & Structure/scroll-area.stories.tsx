import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "@wyliedog/ui/scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/Layout & Structure/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Custom scrollable area with styled scrollbars that works consistently across platforms. Built on Radix UI ScrollArea primitive with full accessibility and native scrolling behavior. Provides beautiful, customizable scrollbars that replace browser defaults while maintaining smooth scrolling performance. Supports both vertical and horizontal scrolling. Perfect for content panels, chat interfaces, file lists, and any area requiring overflow scrolling with enhanced visual design.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description:
        "Additional CSS classes to apply to the scroll area container",
      table: {
        type: { summary: "string" },
      },
    },
    type: {
      control: "radio",
      options: ["auto", "always", "scroll", "hover"],
      description:
        "Scrollbar visibility behavior: 'auto' (native), 'always' (always visible), 'scroll' (visible when scrolling), 'hover' (visible on hover)",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "hover" },
      },
    },
    scrollHideDelay: {
      control: "number",
      description:
        "The delay in milliseconds before scrollbars auto-hide after scrolling stops",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "600" },
      },
    },
    dir: {
      control: "radio",
      options: ["ltr", "rtl"],
      description:
        "The reading direction for the scroll area (left-to-right or right-to-left)",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "ltr" },
      },
    },
    children: {
      control: false,
      description: "Content to be rendered inside the scrollable area",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
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
            className="shrink-0 rounded-md bg-(--color-background-secondary) h-20 w-32 flex items-center justify-center text-sm"
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
      Rich beings for pretty waiting be known bits cosmic for arena sky star
      stuff. Explosion good circumnavigated ve extraordinary white hearts far
      vast there not preserve. Thousands tingling moving fluff away white mote
      for network the carbon in our apple pies calls to us awaits finite but
      unbounded. Death wormholes finite but unbounded venture invent wormholes
      mote that awaits suspended away circumnavigated take something incredible
      stirred. Dust vast billions gravity heavy are awaits interiors upon still
      astonishment require figures.
      <br />
      <br />
      Cambrian moving vastness bits only starlight require prime circumnavigated
      something incredible s circumnavigated sea of tranquility good. Small eye
      small only moving still the carbon in our apple pies euclid as a patch of
      light edge. Little vanquish the carbon in our apple pies pale blue dot
      atoms glorious still by rich. Love calls to us extraordinary good science
      syntheses hundreds cherish cluster helmets s for network. Paroxysm sunbeam
      dawn death love one gravity through globular hundreds awaits cosmic.
      <br />
      <br />
      Flourish vastness white helmets edge stirred little venture stellar
      alchemy pretty. Atoms figures science cambrian impossible death glorious
      number thousands. Dawn rich moving thousands ever network globular number
      still collapsing stars preserve. Questions collapsing stars made galaxy
      rise vanquish ghostly cambrian not gravity flourish ever sea of
      tranquility. Vastness seed that spine ve spine evidence wormholes.
      <br />
      <br />
      Impossible finite but unbounded dust circumnavigated edge that
      circumnavigated white brain from which we spring science. Vanquish through
      energy how death invent only hidden suspended vanquish courage. Are vast
      wormholes helmets impossible flourish dust through dancing vast universe
      white heavy sunrise claims. Sunrise harvesting impossible ghostly still
      global claims collapsing stars. Global spine fugue very collapsing stars
      kindling far thousands moving.
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
              <div className="w-2 h-2 bg-(--color-interactive-primary) rounded-full" />
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
                    ? "bg-(--color-interactive-primary) text-(--color-text-inverse)"
                    : "bg-(--color-background-secondary) text-(--color-text-primary)"
                }`}
              >
                This is message {i + 1}. Ever how the carbon in our apple pies
                finite but unbounded hidden fugue more still.
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};
