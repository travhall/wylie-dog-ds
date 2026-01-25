import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@wyliedog/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Badge } from "@wyliedog/ui/badge";
import { Avatar } from "@wyliedog/ui/avatar";
import { Separator } from "@wyliedog/ui/separator";

const meta: Meta = {
  title: "Patterns/Layout Patterns/Layout Patterns",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real-world layout composition examples including dashboard, settings page, landing page, and user profile. These patterns demonstrate how to build complete page layouts using the design system.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
      table: {
        type: { summary: "string" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  render: () => (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Notifications
              </Button>
              <Avatar>JD</Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-(--color-text-secondary)">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <Badge variant="success" className="mt-1">
                +20.1%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-(--color-text-secondary)">
                Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <Badge variant="success" className="mt-1">
                +180.1%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-(--color-text-secondary)">
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <Badge variant="success" className="mt-1">
                +19%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-(--color-text-secondary)">
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <Badge variant="warning" className="mt-1">
                +201
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <p className="text-sm text-(--color-text-secondary)">
                  Your performance metrics for the last 30 days
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-75 bg-(--color-background-secondary) rounded flex items-center justify-center">
                  <p className="text-(--color-text-tertiary)">
                    Chart Component Placeholder
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    user: "John Doe",
                    action: "Created new project",
                    time: "2 hours ago",
                  },
                  {
                    user: "Jane Smith",
                    action: "Updated profile",
                    time: "4 hours ago",
                  },
                  {
                    user: "Mike Johnson",
                    action: "Completed task",
                    time: "6 hours ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--color-text-primary)">
                        {activity.user}
                      </p>
                      <p className="text-sm text-(--color-text-tertiary)">
                        {activity.action}
                      </p>
                      <p className="text-xs text-(--color-text-tertiary)">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  ),
};

export const SettingsPage: Story = {
  render: () => (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-(--color-text-secondary)">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {[
                { name: "General", active: true },
                { name: "Security", active: false },
                { name: "Notifications", active: false },
                { name: "Billing", active: false },
                { name: "Team", active: false },
              ].map((item) => (
                <Button
                  key={item.name}
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.name}
                </Button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <p className="text-sm text-(--color-text-secondary)">
                  Update your account information and preferences.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full px-3 py-2 border border-(--color-border-secondary) rounded-md"
                    rows={4}
                    defaultValue="Software developer passionate about creating great user experiences."
                  />
                </div>

                <Separator />

                <div className="flex justify-end space-x-3">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LandingPage: Story = {
  render: () => (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-(--color-border-secondary)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">WylieDog</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-(--color-text-secondary) hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#"
                className="text-(--color-text-secondary) hover:text-blue-600"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-(--color-text-secondary) hover:text-blue-600"
              >
                About
              </a>
              <a
                href="#"
                className="text-(--color-text-secondary) hover:text-blue-600"
              >
                Contact
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-linear-to-r from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-(--color-text-primary) mb-6">
            Build Better
            <span className="text-blue-600"> Design Systems</span>
          </h1>
          <p className="text-xl text-(--color-text-secondary) mb-8 max-w-3xl mx-auto">
            Create consistent, accessible, and beautiful user interfaces with
            our modern design system built on cutting-edge OKLCH color science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Start Building</Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-(--color-text-primary) mb-4">
              Everything you need to build at scale
            </h2>
            <p className="text-lg text-(--color-text-secondary) max-w-2xl mx-auto">
              Our design system provides all the tools and components you need
              to create consistent user experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Modern Components",
                description:
                  "40+ accessible React components built with TypeScript and Tailwind CSS.",
                icon: "🧩",
              },
              {
                title: "OKLCH Colors",
                description:
                  "Next-generation color science for perceptually uniform and accessible colors.",
                icon: "🎨",
              },
              {
                title: "Design Tokens",
                description:
                  "Systematic approach to design decisions with automated token synchronization.",
                icon: "⚙️",
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-(--color-text-secondary)">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-(--color-background-secondary)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-(--color-text-primary) mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-(--color-text-secondary) mb-8">
            Join thousands of developers already building with Wylie Dog Design
            System.
          </p>
          <Button size="lg">Start Building Today</Button>
        </div>
      </section>
    </div>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className=" bg-(--color-background-secondary)">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-24 w-24 text-2xl">JD</Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-(--color-text-primary)">
                  John Doe
                </h1>
                <p className="text-(--color-text-secondary)">
                  Senior Product Designer
                </p>
                <p className="text-sm text-(--color-text-tertiary) mt-1">
                  San Francisco, CA
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Badge>React</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>Design Systems</Badge>
                  <Badge>Figma</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Message</Button>
                <Button>Follow</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-(--color-text-secondary)">
                  Passionate product designer with 8+ years of experience
                  creating user-centered digital experiences. Specialized in
                  design systems, accessibility, and modern web technologies.
                  Currently leading design at a fast-growing startup.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "E-commerce Redesign",
                    description: "Complete overhaul of checkout flow",
                    status: "Completed",
                  },
                  {
                    name: "Design System v2",
                    description: "Next generation component library",
                    status: "In Progress",
                  },
                  {
                    name: "Mobile App Design",
                    description: "iOS and Android app interfaces",
                    status: "Planning",
                  },
                ].map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-sm text-(--color-text-secondary) mb-1">
                      {project.description}
                    </p>
                    <Badge
                      variant={
                        project.status === "Completed"
                          ? "success"
                          : project.status === "In Progress"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">
                    Projects
                  </span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">
                    Followers
                  </span>
                  <span className="font-semibold">1.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">
                    Following
                  </span>
                  <span className="font-semibold">387</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "UI Design",
                    "UX Research",
                    "Prototyping",
                    "Design Systems",
                    "Accessibility",
                    "User Testing",
                  ].map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ),
};
