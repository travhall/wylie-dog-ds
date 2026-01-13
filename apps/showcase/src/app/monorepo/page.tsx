import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Box,
  Terminal,
  Workflow,
  Zap,
  FileCode,
  FolderTree,
  GitBranch,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function MonorepoPage() {
  const structure = [
    {
      name: "apps/",
      description: "Functional applications and platforms",
      items: [
        {
          name: "showcase",
          description: "The design system portal (this site)",
          type: "Next.js",
        },
        {
          name: "storybook",
          description: "Component development & documentation",
          type: "Storybook",
        },
        {
          name: "figma-plugin",
          description: "Designer-developer bridge",
          type: "React",
        },
      ],
    },
    {
      name: "packages/",
      description: "Shared libraries and configurations",
      items: [
        {
          name: "ui",
          description: "React component library",
          type: "React/Tailwind",
        },
        {
          name: "tokens",
          description: "Design tokens source of truth",
          type: "JSON/CSS",
        },
        {
          name: "tailwind-config",
          description: "Shared Tailwind presets",
          type: "Config",
        },
        {
          name: "typescript-config",
          description: "Shared TS configurations",
          type: "Config",
        },
        {
          name: "eslint-config",
          description: "Shared linting rules",
          type: "Config",
        },
      ],
    },
  ];

  const tooling = [
    {
      icon: <Zap className="h-6 w-6 text-(--color-text-warning)" />,
      title: "Turborepo",
      description:
        "High-performance build system with intelligent caching and parallel execution.",
    },
    {
      icon: <Terminal className="h-6 w-6 text-(--color-text-info)" />,
      title: "pnpm Workspaces",
      description:
        "Efficient package management with symlinked local packages for seamless development.",
    },
    {
      icon: <Workflow className="h-6 w-6 text-(--color-interactive-primary)" />,
      title: "Changesets",
      description:
        "Automated versioning and changelog generation for all packages in the monorepo.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-(--color-text-success)" />,
      title: "lint-staged & Husky",
      description:
        "Pre-commit hooks ensuring code quality and consistency before every push.",
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section - Unified Centered Design */}
      <section className="bg-(--color-interactive-primary)/3 dark:bg-(--color-interactive-primary)/5 p-12 md:p-20 rounded-[40px] border border-(--color-border-primary)/10 text-center space-y-6 relative overflow-hidden">
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="glass rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
            >
              Infrastructure
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            Monorepo Architecture
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            Wylie Dog Design System is built as a high-performance monorepo,
            enabling seamless collaboration between designers and engineers.
          </p>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Workspace Structure */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <FolderTree className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Workspace Structure
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {structure.map((category) => (
            <Card
              key={category.name}
              className="flex flex-col glass border-(--color-border-primary)/10 overflow-hidden group hover:border-(--color-interactive-primary)/20 transition-colors"
            >
              <CardHeader className="bg-(--color-background-secondary)/30 pb-6 border-b border-(--color-border-primary)/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-mono text-(--color-text-primary)">
                    {category.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="glass border-(--color-border-primary)/10 text-(--color-text-secondary)"
                  >
                    {category.items.length} items
                  </Badge>
                </div>
                <p className="text-sm text-(--color-text-secondary) italic mt-1">
                  {category.description}
                </p>
              </CardHeader>
              <CardContent className="grow p-0">
                <div className="divide-y divide-(--color-border-primary)/10">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-6 hover:bg-(--color-interactive-primary)/5 transition-colors group/item"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold group-hover/item:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                            /{item.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 opacity-60 uppercase tracking-tighter glass border-(--color-border-primary)/10 text-(--color-text-tertiary)"
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-(--color-text-secondary) leading-snug">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover/item:opacity-40 transition-opacity text-(--color-interactive-primary)" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tooling Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Box className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Developer Tooling
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tooling.map((tool) => (
            <Card
              key={tool.title}
              className="glass border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader>
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-2 border-(--color-border-primary)/5">
                  {tool.icon}
                </div>
                <CardTitle className="text-xl font-bold text-(--color-text-primary)">
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why a Monorepo? */}
      <section className="glass rounded-4xl p-10 md:p-16 relative overflow-hidden group border-(--color-border-primary)/5">
        <div className="relative z-10 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-3 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 glass rounded-xl">
                <GitBranch className="h-6 w-6 text-(--color-interactive-primary)" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
                Why this architecture?
              </h2>
            </div>
            <p className="text-lg text-(--color-text-secondary) max-w-3xl leading-relaxed">
              A monorepo provides a unified environment that accelerates
              development and ensures consistency across the entire design
              system.
            </p>
          </div>

          {[
            {
              title: "Unified Versioning",
              desc: "Keep tokens, UI components, and designs in sync. A single change to a token propagates through the entire ecosystem.",
            },
            {
              title: "Atomic Changes",
              desc: "Make changes across multiple packages in a single pull request, ensuring compatibility and reducing integration friction.",
            },
            {
              title: "Shared Standards",
              desc: "Enforce consistent code style, linting, and testing across the entire project with centralized configurations.",
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="space-y-3 p-6 glass border-(--color-border-primary)/10 rounded-2xl hover:bg-(--color-interactive-primary)/5 transition-colors"
            >
              <h3 className="text-xl font-bold text-(--color-text-primary)">
                {benefit.title}
              </h3>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-interactive-primary)/10 blur-[100px] -z-10 rounded-full group-hover:bg-(--color-interactive-primary)/20 transition-colors duration-700" />
      </section>
    </div>
  );
}
