import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  BookOpen,
  ExternalLink,
  Eye,
  History,
  Layers,
  Shapes,
  FlaskConical,
  Puzzle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function StorybookPage() {
  const categories = [
    {
      title: "Foundations",
      icon: <Shapes className="h-6 w-6" />,
      description: "Visual guidelines like colors, typography, and spacing.",
      count: "12 stories",
      tokenColor: "primary",
    },
    {
      title: "Components",
      icon: <Layers className="h-6 w-6" />,
      description: "Atomic components and complex UI blocks.",
      count: "42+ components",
      tokenColor: "warning",
    },
    {
      title: "Patterns",
      icon: <Puzzle className="h-6 w-6" />,
      description: "Reusable compositions that solve common UX problems.",
      count: "9 patterns",
      tokenColor: "primary",
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section - Unified Centered Design */}
      <section className="bg-(--color-interactive-primary)/3 dark:bg-(--color-interactive-primary)/5 p-12 md:p-20 rounded-[40px] border border-(--color-border-primary)/10 text-center space-y-8 relative overflow-hidden">
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="glass rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
            >
              Documentation Hub
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            Interactive Storybook
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            Our Storybook serves as the source of truth for component
            implementation, offering an isolated environment for development and
            testing.
          </p>
          <div className="flex justify-center flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full shadow-lg shadow-(--color-interactive-primary)/10 gap-2"
            >
              Launch Storybook <ExternalLink className="h-4 w-4" />
            </Button>
            <Link href="/docs">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full glass gap-2 border-(--color-border-primary)/10"
              >
                Read Guides
              </Button>
            </Link>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Categories Grid */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Eye className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Documentation Structure
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((cat) => (
            <Card
              key={cat.title}
              className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 transform hover:-translate-y-1 cursor-default"
            >
              <CardHeader>
                <div
                  className={cn(
                    "p-3 w-fit rounded-2xl mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3",
                    cat.tokenColor === "primary"
                      ? "bg-(--color-interactive-primary)/10 text-(--color-interactive-primary)"
                      : "bg-(--color-interactive-warning)/10 text-(--color-interactive-warning)"
                  )}
                >
                  {cat.icon}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl text-(--color-text-primary)">
                    {cat.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="glass text-(--color-text-secondary) text-[10px] tracking-wide uppercase px-2 py-0.5"
                  >
                    {cat.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-(--color-text-secondary) leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-bold text-(--color-interactive-primary) opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 group-hover:duration-500">
                  Explore Stories <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features List */}
      <section className="grid gap-8 md:grid-cols-2">
        {[
          {
            icon: <FlaskConical className="h-6 w-6 text-(--color-text-info)" />,
            title: "Testing Sandbox",
            desc: "Every component is tested in isolation to ensure accessibility (a11y), responsive behavior, and interaction states.",
            items: [
              "Interactive Controls (Args)",
              "Viewport Switching",
              "Dark/Light Mode Toggles",
            ],
          },
          {
            icon: (
              <History className="h-6 w-6 text-(--color-interactive-primary)" />
            ),
            title: "Visual Regression",
            desc: "We use Storybook to power our visual regression tests, ensuring that UI changes are intentional and tracked.",
            items: [
              "Chromatic Integration",
              "Automated Snapshots",
              "CI/CD Integration",
            ],
          },
        ].map((feature, i) => (
          <Card
            key={i}
            className="glass border-(--color-border-primary)/10 overflow-hidden relative"
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="p-3 glass rounded-2xl">{feature.icon}</div>
              <CardTitle className="text-2xl text-(--color-text-primary)">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-(--color-text-secondary) leading-relaxed">
                {feature.desc}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feature.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold glass px-3 py-2 rounded-xl border-(--color-border-primary)/5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-(--color-interactive-primary)" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 glass rounded-[40px] border-dashed border-(--color-interactive-primary)/20 relative overflow-hidden">
        <div className="relative z-10 space-y-8 px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-(--color-text-primary)">
            Ready to start building?
          </h2>
          <p className="text-xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed">
            Deep dive into our component library, view the source code, and
            interact with live examples in our production Storybook instance.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 rounded-full text-lg shadow-xl shadow-(--color-interactive-primary)/20 gap-3 group"
          >
            Launch Storybook Instance
            <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        {/* Background glow */}
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-(--color-interactive-primary)/5 via-transparent to-transparent -z-10" />
      </section>
    </div>
  );
}
