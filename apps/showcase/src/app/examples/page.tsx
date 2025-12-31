import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import {
  BarChart3,
  Inbox,
  Settings,
  Layout,
  Zap,
  ExternalLink,
  Play,
} from "lucide-react";

export default function ExamplesPage() {
  const examples = [
    {
      id: "dashboard",
      title: "Analytics Dashboard",
      description:
        "Data-rich dashboard with charts, tables, filters, and real-time updates. Demonstrates complex layouts and data visualization patterns.",
      icon: <BarChart3 className="h-6 w-6" />,
      tags: ["Dashboard", "Data", "Charts"],
      difficulty: "Advanced",
      path: "/patterns/dashboard-layout",
    },
    {
      id: "inbox",
      title: "Email Inbox",
      description:
        "Full-featured inbox interface with search, filtering, bulk actions, and keyboard navigation. Shows list/detail patterns and command palette.",
      icon: <Inbox className="h-6 w-6" />,
      tags: ["Productivity", "Lists", "Search"],
      difficulty: "Intermediate",
      path: "/patterns/inbox",
    },
    {
      id: "settings",
      title: "Settings Panel",
      description:
        "Comprehensive settings interface with forms, validation, toggle switches, and destructive actions. Demonstrates form patterns and user preferences.",
      icon: <Settings className="h-6 w-6" />,
      tags: ["Forms", "Settings", "Validation"],
      difficulty: "Intermediate",
      path: "/patterns/settings-form",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "default";
      case "Intermediate":
        return "secondary";
      case "Advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Examples</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Real-world applications built with the Wylie Dog design system.
            These examples demonstrate how components work together to create
            complete user experiences.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examples.map((example) => (
            <Card key={example.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {example.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getDifficultyColor(example.difficulty)}>
                          {example.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {example.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {example.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={example.path}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 gap-1"
                  >
                    <Play className="h-3 w-3" />
                    View Example
                  </a>
                  <a
                    href={`https://github.com/wyliedog/wylie-dog-ds/tree/main/apps/showcase/src/app/examples/${example.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            What These Examples Demonstrate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Layout className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Component Composition</h3>
                <p className="text-sm text-muted-foreground">
                  How to combine multiple components to create complex
                  interfaces.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Real-world Patterns</h3>
                <p className="text-sm text-muted-foreground">
                  Common UI patterns and workflows found in production
                  applications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Accessibility, performance, and UX considerations in practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Build Your Own</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              These examples are starting points. You can modify them, combine
              patterns, or create entirely new experiences using the same
              components and tokens.
            </p>
            <div className="flex gap-2">
              <a
                href="/components"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
              >
                Browse Components
              </a>
              <a
                href="/patterns"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                View Patterns
              </a>
              <a
                href="http://localhost:6006"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                Open Storybook
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
