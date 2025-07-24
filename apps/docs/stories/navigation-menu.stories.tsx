import type { Meta, StoryObj } from "@storybook/react-vite";
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
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: "A navigation menu component with dropdown submenus, hover interactions, and keyboard navigation support."
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-neutral-50 to-neutral-100 p-6 no-underline outline-none focus:shadow-md"
                    href="#"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Featured Product
                    </div>
                    <p className="text-sm leading-tight text-neutral-600">
                      Discover our most popular item with advanced features and modern design.
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
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-neutral-600">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Simple: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Products
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4">
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
            <ul className="grid w-[400px] gap-3 p-4">
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
