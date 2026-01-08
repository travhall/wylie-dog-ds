import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Sparkles,
  Palette,
  Layers,
  Shield,
  Code2,
  ExternalLink,
  Github,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export default function ComponentsPage() {
  const componentCategories = [
    {
      title: "Foundations",
      components: [
        {
          name: "Button",
          description: "Standard interactive buttons",
          status: "stable",
        },
        {
          name: "Badge",
          description: "Status indicators and tags",
          status: "stable",
        },
        {
          name: "Typography",
          description: "Heading and text styles",
          status: "stable",
        },
      ],
    },
    {
      title: "Forms",
      components: [
        { name: "Input", description: "Text input fields", status: "stable" },
        {
          name: "Checkbox",
          description: "Binary choice selection",
          status: "stable",
        },
        {
          name: "Radio Group",
          description: "Single choice selection",
          status: "stable",
        },
        { name: "Switch", description: "On/Off toggles", status: "beta" },
      ],
    },
    {
      title: "Data Display",
      components: [
        { name: "Card", description: "Content containers", status: "stable" },
        { name: "Table", description: "Tabular data display", status: "beta" },
        {
          name: "List",
          description: "Iterative data display",
          status: "stable",
        },
      ],
    },
    {
      title: "Feedback",
      components: [
        { name: "Alert", description: "Important messages", status: "stable" },
        {
          name: "Progress",
          description: "Task status indicators",
          status: "beta",
        },
        {
          name: "Skeleton",
          description: "Loading placeholders",
          status: "stable",
        },
      ],
    },
    {
      title: "Overlay",
      components: [
        { name: "Dialog", description: "Modal windows", status: "stable" },
        { name: "Tooltip", description: "Contextual info", status: "stable" },
        { name: "Popover", description: "Floating content", status: "beta" },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "stable":
        return (
          <CheckCircle2 className="h-3.5 w-3.5 text-(--color-text-success)" />
        );
      case "beta":
        return <Clock className="h-3.5 w-3.5 text-(--color-text-warning)" />;
      case "alpha":
        return (
          <AlertCircle className="h-3.5 w-3.5 text-(--color-text-danger)" />
        );
      default:
        return null;
    }
  };

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
              Library
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            UI Components
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            A collection of high-quality, accessible React components built with
            Radix UI and themed using our custom design tokens.
          </p>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Interactive Demo Section */}
      <section className="space-y-10 group">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Sparkles className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary) group-hover:text-(--color-interactive-primary) transition-colors">
            Live Examples
          </h2>
        </div>

        <Card className="glass border-(--color-border-primary)/10 overflow-hidden shadow-2xl shadow-(--color-interactive-primary)/5">
          <Tabs defaultValue="buttons" className="w-full">
            <div className="px-8 pt-8 pb-4 border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/20">
              <TabsList className="glass border-(--color-border-primary)/10 p-1 rounded-full h-12 max-w-md">
                <TabsTrigger
                  value="buttons"
                  className="rounded-full data-[state=active]:bg-(--color-interactive-primary) data-[state=active]:text-(--color-text-inverse) data-[state=active]:shadow-lg h-full"
                >
                  Buttons
                </TabsTrigger>
                <TabsTrigger
                  value="forms"
                  className="rounded-full data-[state=active]:bg-(--color-interactive-primary) data-[state=active]:text-(--color-text-inverse) data-[state=active]:shadow-lg h-full"
                >
                  Forms
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  className="rounded-full data-[state=active]:bg-(--color-interactive-primary) data-[state=active]:text-(--color-text-inverse) data-[state=active]:shadow-lg h-full"
                >
                  Feedback
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="buttons"
              className="p-10 space-y-12 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="grid gap-12 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-(--color-text-tertiary) uppercase tracking-[0.2em] italic">
                    Variants
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <Button className="rounded-full transition-transform hover:scale-105 active:scale-95">
                      Default
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-full transition-transform hover:scale-105 active:scale-95"
                    >
                      Secondary
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full glass transition-transform hover:scale-105 active:scale-95"
                    >
                      Outline
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-full transition-transform hover:scale-105 active:scale-95"
                    >
                      Ghost
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-full transition-transform hover:scale-105 active:scale-95"
                    >
                      Destructive
                    </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-(--color-text-tertiary) uppercase tracking-[0.2em] italic">
                    Sizes
                  </h3>
                  <div className="flex items-center gap-6">
                    <Button size="sm" className="rounded-full">
                      Small
                    </Button>
                    <Button size="default" className="rounded-full">
                      Default
                    </Button>
                    <Button size="lg" className="rounded-full px-8">
                      Large
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="forms"
              className="p-10 space-y-10 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="grid gap-8 md:grid-cols-2 max-w-3xl">
                <div className="space-y-3">
                  <Label
                    htmlFor="demo-name"
                    className="text-sm font-bold tracking-tight text-(--color-text-primary)"
                  >
                    Name
                  </Label>
                  <Input
                    id="demo-name"
                    placeholder="John Doe"
                    className="glass border-(--color-border-primary)/10 focus:border-(--color-interactive-primary)/50 h-12 px-4 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="demo-email"
                    className="text-sm font-bold tracking-tight text-(--color-text-primary)"
                  >
                    Email
                  </Label>
                  <Input
                    id="demo-email"
                    type="email"
                    placeholder="john@example.com"
                    className="glass border-(--color-border-primary)/10 focus:border-(--color-interactive-primary)/50 h-12 px-4 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button className="w-full md:w-auto h-12 px-10 rounded-full shadow-lg shadow-(--color-interactive-primary)/10">
                    Submit Information
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="feedback"
              className="p-10 space-y-10 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Success",
                    icon: (
                      <CheckCircle2 className="text-(--color-text-success)" />
                    ),
                    desc: "Action completed successfully.",
                    bg: "bg-(--color-interactive-success)/5",
                    border: "border-(--color-interactive-success)/20",
                  },
                  {
                    title: "Warning",
                    icon: <Clock className="text-(--color-text-warning)" />,
                    desc: "Please review your entries.",
                    bg: "bg-(--color-interactive-warning)/5",
                    border: "border-(--color-interactive-warning)/20",
                  },
                  {
                    title: "Error",
                    icon: (
                      <AlertCircle className="text-(--color-text-danger)" />
                    ),
                    desc: "Something went wrong.",
                    bg: "bg-(--color-interactive-danger)/5",
                    border: "border-(--color-interactive-danger)/20",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className={cn(
                      "border-2 shadow-none glass",
                      item.bg,
                      item.border
                    )}
                  >
                    <CardHeader className="p-5">
                      <CardTitle className="text-base flex items-center gap-2 font-bold uppercase tracking-wide">
                        {item.icon}
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-sm opacity-80 italic leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </section>

      {/* Directory Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Layers className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Component Directory
          </h2>
        </div>

        <div className="space-y-16">
          {componentCategories.map((group) => (
            <div key={group.title} className="space-y-6">
              <h3 className="text-xl font-black text-(--color-text-primary)/80 flex items-center gap-3 italic">
                {group.title}
                <div className="h-px bg-(--color-border-primary)/20 flex-grow" />
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {group.components.map((comp) => (
                  <Card
                    key={comp.name}
                    className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 cursor-help"
                  >
                    <CardHeader className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                          {comp.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
                          {getStatusIcon(comp.status)}
                          <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
                            {comp.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-(--color-text-secondary) leading-relaxed italic">
                        {comp.description}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="glass rounded-[40px] p-10 md:p-20 border border-(--color-interactive-primary)/10 relative overflow-hidden group">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 glass rounded-2xl shadow-xl shadow-(--color-interactive-primary)/10">
                <Shield className="h-8 w-8 text-(--color-interactive-primary)" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
                Built for Accessibility
              </h2>
            </div>
            <p className="text-xl text-(--color-text-secondary) leading-relaxed italic">
              Every component in ` @wyliedog/ui ` is built on top of Radix UI
              primitives, ensuring out-of-the-box support for keyboard
              navigation, screen readers, and WAI-ARIA compliance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 rounded-full glass border-(--color-border-primary)/10 gap-3 group/btn"
              >
                <Github className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                <span className="font-bold">Source Code</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 rounded-full glass border-(--color-border-primary)/10 gap-3 group/btn"
              >
                <ExternalLink className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                <span className="font-bold">Storybook</span>
              </Button>
            </div>
          </div>

          <Card className="glass border-(--color-border-primary)/10 border-2 p-10 space-y-6 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-(--color-interactive-primary) italic">
              <Zap className="h-6 w-6" />
              Performance Optimized
            </div>
            <p className="text-lg text-(--color-text-secondary) leading-relaxed italic border-l-4 border-(--color-interactive-primary)/20 pl-6">
              Components are treeshakeable and optimized for modern build
              pipelines. We use Tailwind CSS 4 for styling, ensuring minimal
              runtime overhead and maximum flexibility.
            </p>
          </Card>
        </div>
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-(--color-interactive-primary)/10 blur-[120px] -z-10 group-hover:bg-(--color-interactive-primary)/20 transition-colors duration-700" />
      </section>
    </div>
  );
}
