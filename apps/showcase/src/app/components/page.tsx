import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import Link from "next/link";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Box,
  MousePointer2,
  Navigation as NavigationIcon,
  Layers,
  Database,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Github,
  ExternalLink,
} from "lucide-react";
import { Button } from "@wyliedog/ui/button";

export default function ComponentsOverviewPage() {
  const categories = [
    {
      title: "Foundations",
      description:
        "Buttons, badges, and the core building blocks of every interface.",
      href: "/components/foundations",
      icon: Box,
      color: "text-(--color-interactive-primary)",
      bgColor: "bg-(--color-interactive-primary)/3",
    },
    {
      title: "Forms",
      description:
        "Inputs, switches, sliders, and controls for user data entry.",
      href: "/components/forms",
      icon: MousePointer2,
      color: "text-(--color-text-info)",
      bgColor: "bg-(--color-text-info)/3",
    },
    {
      title: "Navigation",
      description: "Tabs, breadcrumbs, and pagination to guide user movement.",
      href: "/components/navigation",
      icon: NavigationIcon,
      color: "text-(--color-text-success)",
      bgColor: "bg-(--color-text-success)/3",
    },
    {
      title: "Overlays",
      description:
        "Dialogs, tooltips, and floating panels for contextual info.",
      href: "/components/overlays",
      icon: Layers,
      color: "text-(--color-interactive-warning)",
      bgColor: "bg-(--color-interactive-warning)/3",
    },
    {
      title: "Data Display",
      description:
        "Cards, avatars, tables, and lists for showcasing information.",
      href: "/components/data-display",
      icon: Database,
      color: "text-(--color-interactive-primary)",
      bgColor: "bg-(--color-interactive-primary)/3",
    },
    {
      title: "Feedback",
      description: "Alerts, progress bars, and skeletons for system status.",
      href: "/components/feedback",
      icon: AlertCircle,
      color: "text-(--color-interactive-danger)",
      bgColor: "bg-(--color-interactive-danger)/3",
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="bg-(--color-interactive-primary)/3 dark:bg-(--color-interactive-primary)/5 p-12 md:p-20 rounded-[40px] border border-(--color-border-primary)/10 text-center space-y-6 relative overflow-hidden">
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="glass rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
            >
              Library
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            UI Components
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed">
            A comprehensive collection of 45+ professional React components.
            Built with Radix UI, themed with tokens, and designed for
            accessibility.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Categories Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.href} href={category.href} className="group">
            <Card className="glass h-full border border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/30 transition-all duration-500 overflow-hidden relative">
              <div
                className={cn(
                  "absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0",
                  category.color
                )}
              >
                <ArrowUpRight className="h-6 w-6" />
              </div>

              <CardHeader className="p-8">
                <div
                  className={cn(
                    "inline-flex p-4 rounded-2xl mb-4 transition-transform duration-500 group-hover:scale-110 shadow-lg",
                    category.bgColor
                  )}
                >
                  <category.icon className={cn("h-8 w-8", category.color)} />
                </div>
                <CardTitle className="text-2xl font-bold text-(--color-text-primary)">
                  {category.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-8 pb-12 space-y-6">
                <p className="text-base text-(--color-text-secondary) leading-relaxed">
                  {category.description}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
                    category.color
                  )}
                >
                  Explore Category <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Secondary Hero - Value Props */}
      <section className="glass rounded-[40px] p-10 md:p-20 border border-(--color-border-primary)/10 relative overflow-hidden group">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 glass rounded-2xl shadow-xl shadow-(--color-interactive-primary)/10">
                <Shield className="h-8 w-8 text-(--color-interactive-primary)" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
                Universal Design
              </h2>
            </div>
            <p className="text-xl text-(--color-text-secondary) leading-relaxed italic border-l-4 border-(--color-interactive-primary)/20 pl-6">
              Every component is built on top of Radix UI primitives, ensuring
              out-of-the-box support for keyboard navigation, screen readers,
              and WAI-ARIA compliance.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/wyliedog/ds"
                target="_blank"
                rel="noreferrer"
                className="h-14 px-10 rounded-full glass border border-(--color-border-primary)/10 flex items-center gap-3 transition-all hover:bg-(--color-interactive-primary)/5 group/btn"
              >
                <Github className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                <span className="font-bold text-(--color-text-primary)">
                  Source Code
                </span>
              </a>
              <Link
                href="/storybook"
                className="h-14 px-10 rounded-full glass border border-(--color-border-primary)/10 flex items-center gap-3 transition-all hover:bg-(--color-interactive-primary)/5 group/btn"
              >
                <ExternalLink className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                <span className="font-bold text-(--color-text-primary)">
                  Full Storybook
                </span>
              </Link>
            </div>
          </div>

          <Card className="glass border-(--color-border-primary)/10 border-2 p-10 space-y-6 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-(--color-interactive-primary) italic">
              <Zap className="h-6 w-6" />
              Token Powered
            </div>
            <p className="text-lg text-(--color-text-secondary) leading-relaxed italic">
              Our components don't use hardcoded values. Instead, they consume
              <span className="font-bold text-(--color-text-primary)">
                {" "}
                semantic tokens{" "}
              </span>
              that automatically resolve based on theme, mode, and platform.
            </p>
          </Card>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-(--color-interactive-primary)/10 blur-[120px] -z-10 group-hover:bg-(--color-interactive-primary)/20 transition-colors duration-700" />
      </section>
    </div>
  );
}
