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
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Examples
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Real-world applications built with the Wylie Dog design system.
            These examples demonstrate how components work together to create
            complete user experiences.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {examples.map((example) => (
            <Card
              key={example.id}
              className="h-full glass border-(--color-border-primary)/10 shadow-lg hover:border-(--color-interactive-primary)/30 transition-all duration-500 overflow-hidden group"
            >
              <CardHeader className="border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-(--color-interactive-primary)/10 rounded-2xl text-(--color-interactive-primary) shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {example.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-(--color-text-primary)">
                        {example.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={getDifficultyColor(example.difficulty)}
                          className="border-(--color-border-primary)/20 text-xs font-bold uppercase tracking-widest"
                        >
                          {example.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  {example.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {example.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-wider border-(--color-border-primary)/20 text-(--color-text-tertiary)"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <a
                    href={example.path}
                    className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) disabled:opacity-50 bg-(--color-interactive-primary) text-white hover:opacity-90 h-10 px-5 gap-2 shadow-lg shadow-(--color-interactive-primary)/10 active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5" />
                    View Example
                  </a>
                  <a
                    href={`https://github.com/wyliedog/wylie-dog-ds/tree/main/apps/showcase/src/app/examples/${example.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) disabled:opacity-50 border border-(--color-border-primary)/20 text-(--color-text-secondary) hover:bg-(--color-background-secondary)/50 h-10 px-5 gap-2 active:scale-95"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Source
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-(--color-text-primary)">
            What These Examples Demonstrate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="flex items-start space-x-4 group">
              <div className="p-3 glass rounded-2xl text-(--color-interactive-primary) shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-(--color-text-primary) mb-1">
                  Component Composition
                </h3>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  How to combine multiple components to create complex,
                  accessible interfaces.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-3 glass rounded-2xl text-(--color-interactive-primary) shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-(--color-text-primary) mb-1">
                  Real-world Patterns
                </h3>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  Common UI patterns and industry workflows found in modern
                  product applications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-3 glass rounded-2xl text-(--color-interactive-primary) shadow-sm group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-(--color-text-primary) mb-1">
                  Best Practices
                </h3>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  Accessibility, high performance, and human UX considerations
                  in practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-(--color-background-secondary)/30 glass border border-(--color-border-primary)/5 p-10 rounded-4xl mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-(--color-text-primary)">
            Build Your Own
          </h2>
          <div className="space-y-6">
            <p className="text-sm text-(--color-text-secondary) leading-relaxed italic max-w-2xl">
              These examples are designed as extensible starting points. You can
              modify them, combine various patterns, or create entirely new
              experiences using our unified atomic components and design tokens.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/components"
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) disabled:opacity-50 bg-(--color-interactive-primary) text-white hover:opacity-90 h-10 px-6 shadow-lg shadow-(--color-interactive-primary)/10 active:scale-95"
              >
                Browse Components
              </a>
              <a
                href="/patterns"
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) disabled:opacity-50 border border-(--color-border-primary)/20 text-(--color-text-secondary) hover:bg-(--color-background-secondary)/50 h-10 px-6 active:scale-95"
              >
                View Patterns
              </a>
              <a
                href="http://localhost:6006"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) disabled:opacity-50 border border-(--color-border-primary)/20 text-(--color-text-secondary) hover:bg-(--color-background-secondary)/50 h-10 px-6 active:scale-95"
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
