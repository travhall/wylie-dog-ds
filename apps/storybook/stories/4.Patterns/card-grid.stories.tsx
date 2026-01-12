import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardGrid } from "@wyliedog/ui/card-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Star,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  User,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

const meta: Meta<typeof CardGrid> = {
  title: "4. Patterns/Card Grid",
  component: CardGrid,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card Grid component for displaying responsive grids of cards with multiple variants and interactive features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "spacious", "masonry", "elevated"],
      description: "The visual style variant",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
    columns: {
      control: "object",
      description: "Responsive column configuration",
    },
    gap: {
      control: "text",
      description: "Gap between grid items",
    },
    centered: {
      control: "boolean",
      description: "Whether to center grid items",
    },
    interactive: {
      control: "boolean",
      description: "Enable hover animations and transitions",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <Card
        key="1"
        className="group hover:shadow-lg transition-all duration-300"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Project Alpha</CardTitle>
            <Badge variant="secondary">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-(--color-text-secondary) mb-4">
            Advanced design system with comprehensive token management and
            real-time synchronization.
          </p>
          <div className="flex items-center justify-between text-xs text-(--color-text-tertiary)">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> 4.8
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> 12
              </span>
            </div>
            <span>2 hours ago</span>
          </div>
        </CardContent>
      </Card>,
      <Card
        key="2"
        className="group hover:shadow-lg transition-all duration-300"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Mobile App</CardTitle>
            <Badge variant="outline">In Progress</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-(--color-text-secondary) mb-4">
            Cross-platform mobile application with React Native and TypeScript
            integration.
          </p>
          <div className="flex items-center justify-between text-xs text-(--color-text-tertiary)">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> 4.6
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> 8
              </span>
            </div>
            <span>5 hours ago</span>
          </div>
        </CardContent>
      </Card>,
      <Card
        key="3"
        className="group hover:shadow-lg transition-all duration-300"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">Design System</CardTitle>
            <Badge variant="default">New</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-(--color-text-secondary) mb-4">
            Comprehensive component library with accessibility features and dark
            mode support.
          </p>
          <div className="flex items-center justify-between text-xs text-(--color-text-tertiary)">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> 4.9
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> 24
              </span>
            </div>
            <span>1 day ago</span>
          </div>
        </CardContent>
      </Card>,
    ],
    columns: { sm: 1, md: 2, lg: 3 },
    gap: "gap-6",
    centered: false,
    variant: "default",
    interactive: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-16">
      {/* Default Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Default Variant
        </h3>
        <CardGrid columns={{ sm: 1, md: 2 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Standard Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Clean and simple card design with default spacing.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Another Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Consistent styling across all grid items.
              </p>
            </CardContent>
          </Card>
        </CardGrid>
      </div>

      {/* Compact Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Compact Variant
        </h3>
        <CardGrid variant="compact" columns={{ sm: 1, md: 3, lg: 4 }}>
          {["Quick", "Fast", "Small", "Tiny"].map((label) => (
            <Card key={label} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-(--color-interactive-primary)/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-4 w-4 text-(--color-interactive-primary)" />
                  </div>
                  <h4 className="font-medium text-sm">{label} Card</h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      </div>

      {/* Spacious Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Spacious Variant
        </h3>
        <CardGrid variant="spacious" columns={{ sm: 1, md: 2 }}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Room to Breathe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                Extra spacing creates a luxurious feel with more visual
                hierarchy and emphasis on content.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-(--color-text-tertiary)">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Elegant Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                Perfect for premium content and featured sections that need more
                visual impact.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-(--color-text-tertiary)">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </div>
            </CardContent>
          </Card>
        </CardGrid>
      </div>

      {/* Elevated Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Elevated Variant
        </h3>
        <CardGrid variant="elevated" columns={{ sm: 1, md: 2, lg: 3 }}>
          {["Premium", "Featured", "Spotlight"].map((label, index) => (
            <Card
              key={label}
              className="bg-linear-to-br from-(--color-background-secondary) to-(--color-background-primary) border-(--color-border-primary)/20 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Pro" : "Plus"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Enhanced card with elevated design and premium styling
                  options.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All available variants showcasing different spacing and styling approaches.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Interactive Grid
        </h3>
        <CardGrid
          interactive={true}
          columns={{ sm: 1, md: 2, lg: 3 }}
          className="max-w-4xl"
        >
          {[
            {
              title: "Analytics Dashboard",
              description:
                "Real-time metrics and insights with interactive charts.",
              badge: "Popular",
              badgeVariant: "default" as const,
              stats: { views: "2.4k", likes: 142 },
            },
            {
              title: "Team Collaboration",
              description: "Work together seamlessly with real-time updates.",
              badge: "New",
              badgeVariant: "success" as const,
              stats: { views: "1.8k", likes: 89 },
            },
            {
              title: "API Integration",
              description: "Connect with your favorite tools and services.",
              badge: "Advanced",
              badgeVariant: "secondary" as const,
              stats: { views: "3.1k", likes: 201 },
            },
            {
              title: "Mobile First",
              description: "Optimized for all devices with responsive design.",
              stats: { views: "1.2k", likes: 67 },
            },
            {
              title: "Security First",
              description:
                "Enterprise-grade security with end-to-end encryption.",
              badge: "Secure",
              badgeVariant: "warning" as const,
              stats: { views: "890", likes: 45 },
            },
            {
              title: "Performance",
              description: "Lightning-fast with optimized loading times.",
              stats: { views: "1.5k", likes: 98 },
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="group cursor-pointer border-(--color-border-primary)/20 hover:border-(--color-interactive-primary)/30 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base group-hover:text-(--color-interactive-primary) transition-colors">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badgeVariant} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4 text-(--color-text-tertiary)" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-(--color-text-secondary) mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {item.stats.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {item.stats.likes}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-(--color-text-tertiary) group-hover:text-(--color-interactive-primary) group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">
          Centered Layout
        </h3>
        <CardGrid
          interactive={true}
          centered={true}
          columns={{ sm: 1, md: 2, lg: 2 }}
          className="max-w-2xl"
        >
          <Card className="bg-linear-to-r from-(--color-interactive-primary)/5 to-(--color-interactive-secondary)/5 border-(--color-interactive-primary)/20">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-(--color-interactive-primary) rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl mb-2">Featured Content</CardTitle>
              <p className="text-sm text-(--color-text-secondary) mb-4">
                Centered cards work great for highlighting important
                information.
              </p>
              <Button size="sm">Get Started</Button>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-r from-(--color-interactive-success)/5 to-(--color-interactive-warning)/5 border-(--color-interactive-success)/20">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-(--color-interactive-success) rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl mb-2">Quick Actions</CardTitle>
              <p className="text-sm text-(--color-text-secondary) mb-4">
                Perfect for call-to-action cards and user interactions.
              </p>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </CardGrid>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive examples with hover effects, animations, and responsive behavior.",
      },
    },
  },
};
