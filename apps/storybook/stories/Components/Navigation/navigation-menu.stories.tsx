import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@wyliedog/ui/navigation-menu";
import { cn } from "@wyliedog/ui/lib/utils";

const meta: Meta<typeof NavigationMenu> = {
  title: "Components/Navigation/Navigation Menu",
  component: NavigationMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A navigation menu component with dropdown submenus, hover interactions, and keyboard navigation support. Built on Radix UI primitives with full accessibility including ARIA attributes and focus management. Includes NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, and navigationMenuTriggerStyle utility for building complex navigation structures with nested dropdowns and rich content.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description:
        "Additional CSS classes to apply to the navigation menu container",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the navigation menu",
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
        category: "Appearance",
      },
    },
    delayDuration: {
      control: "number",
      description: "The delay in milliseconds before a submenu opens on hover",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "200" },
        category: "Behavior",
      },
    },
    skipDelayDuration: {
      control: "number",
      description:
        "The delay in milliseconds after a submenu closes before the hover delay is re-enabled",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "300" },
        category: "Behavior",
      },
    },
    children: {
      control: false,
      description:
        "Navigation menu content, typically NavigationMenuList with nested items",
      table: {
        type: { summary: "React.ReactNode" },
        category: "Content",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    delayDuration: 200,
    skipDelayDuration: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full-featured navigation menu with dropdown content panels, featured product highlight, and direct links. Use the controls panel to adjust orientation and delay durations.",
      },
    },
  },
  render: (args) => (
    <NavigationMenu
      orientation={args.orientation}
      delayDuration={args.delayDuration}
      skipDelayDuration={args.skipDelayDuration}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-100 lg:w-125 lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-neutral-50 to-neutral-100 p-6 no-underline outline-none focus:shadow-md"
                    href="#"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Featured Product
                    </div>
                    <p className="text-sm leading-tight text-(--color-text-secondary)">
                      Discover our most popular item with advanced features and
                      modern design.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="#" title="Web Apps">
                Build powerful web applications with our platform.
              </ListItem>
              <ListItem href="#" title="Mobile Apps">
                Create native mobile experiences.
              </ListItem>
              <ListItem href="#" title="Desktop Tools">
                Professional desktop software solutions.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
              <ListItem href="#" title="About">
                Learn about our company and mission.
              </ListItem>
              <ListItem href="#" title="Team">
                Meet the people behind our products.
              </ListItem>
              <ListItem href="#" title="Careers">
                Join our growing team.
              </ListItem>
              <ListItem href="#" title="News">
                Latest company updates and announcements.
              </ListItem>
              <ListItem href="#" title="Contact">
                Get in touch with our team.
              </ListItem>
              <ListItem href="#" title="Support">
                Find help and documentation.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-(--color-background-tertiary) hover:text-(--color-text-primary) focus:bg-(--color-background-tertiary) focus:text-(--color-text-primary)",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-(--color-text-secondary)">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story: "Flat navigation menu with simple text links and no dropdowns.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Products
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Navigation menu with multiple dropdown submenus for services and resources.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-100 gap-3 p-4">
              <ListItem href="#" title="Web Development">
                Custom websites and web applications.
              </ListItem>
              <ListItem href="#" title="Mobile Development">
                iOS and Android app development.
              </ListItem>
              <ListItem href="#" title="UI/UX Design">
                User interface and experience design.
              </ListItem>
              <ListItem href="#" title="Consulting">
                Technical consulting and strategy.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-100 gap-3 p-4">
              <ListItem href="#" title="Documentation">
                Complete guides and API reference.
              </ListItem>
              <ListItem href="#" title="Tutorials">
                Step-by-step learning materials.
              </ListItem>
              <ListItem href="#" title="Examples">
                Code examples and templates.
              </ListItem>
              <ListItem href="#" title="Community">
                Join our developer community.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithCallToAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Navigation menu with a rich content panel that includes a featured highlight card and a call-to-action button — a common SaaS marketing nav pattern.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-125 lg:grid-cols-[1fr_1fr]">
              <div className="flex flex-col gap-3">
                <ListItem href="#" title="For Startups">
                  Launch fast with our starter templates and toolkits.
                </ListItem>
                <ListItem href="#" title="For Enterprise">
                  Scalable infrastructure for large teams.
                </ListItem>
                <ListItem href="#" title="For Agencies">
                  White-label tools and client management.
                </ListItem>
              </div>
              <div className="flex flex-col justify-between rounded-md bg-(--color-background-secondary) p-4">
                <div>
                  <p className="text-sm font-medium mb-1">
                    New: Design System Kit
                  </p>
                  <p className="text-xs text-(--color-text-secondary) leading-relaxed">
                    Everything you need to build consistent, accessible UIs —
                    tokens, components, and docs.
                  </p>
                </div>
                <NavigationMenuLink
                  asChild
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-(--color-background-primary) px-3 py-1.5 text-sm font-medium ring-1 ring-(--color-border-default) hover:bg-(--color-background-tertiary) transition-colors"
                >
                  <a href="#">Get started free →</a>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive tests covering trigger click to open a dropdown panel, keyboard navigation (Tab between items), and Escape key to dismiss.",
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-80 gap-3 p-4">
              <ListItem href="#" title="Analytics">
                Real-time data dashboards.
              </ListItem>
              <ListItem href="#" title="Automation">
                Workflow automation tools.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Dropdown content is not visible initially
    expect(canvas.queryByText("Analytics")).not.toBeInTheDocument();

    // Test 2: Clicking the "Products" trigger opens the dropdown
    const productsTrigger = canvas.getByRole("button", { name: /products/i });
    await userEvent.click(productsTrigger);

    await new Promise((resolve) => setTimeout(resolve, 400));

    // Test 3: Dropdown content is now visible
    expect(canvas.getByText("Analytics")).toBeInTheDocument();
    expect(canvas.getByText("Automation")).toBeInTheDocument();

    // Test 4: The trigger has aria-expanded="true"
    expect(productsTrigger).toHaveAttribute("aria-expanded", "true");

    // Test 5: Pressing Escape closes the dropdown
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(productsTrigger).toHaveAttribute("aria-expanded", "false");
  },
};
