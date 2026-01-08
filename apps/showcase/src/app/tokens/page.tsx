import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import Link from "next/link";
import {
  Palette,
  Ruler,
  Type,
  Maximize2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function TokensOverviewPage() {
  const sections = [
    {
      title: "Colors",
      description:
        "OKLCH primitives and semantic systems with accessibility-first pairings.",
      href: "/tokens/colors",
      icon: Palette,
      color: "text-(--color-interactive-primary)",
      bgColor: "bg-(--color-interactive-primary)/3",
      tag: "Dynamic",
    },
    {
      title: "Spacing",
      description: "A mathematical scale for whitespace and layout rhythm.",
      href: "/tokens/spacing",
      icon: Ruler,
      color: "text-(--color-text-info)",
      bgColor: "bg-(--color-text-info)/3",
      tag: "Scale",
    },
    {
      title: "Typography",
      description:
        "Font families, sizes, weights, and vertical rhythm definitions.",
      href: "/tokens/typography",
      icon: Type,
      color: "text-(--color-text-success)",
      bgColor: "bg-(--color-text-success)/3",
      tag: "Foundations",
    },
    {
      title: "Borders",
      description:
        "Corner radius and stroke width primitives for consistent containers.",
      href: "/tokens/borders",
      icon: Maximize2,
      color: "text-(--color-text-warning)",
      bgColor: "bg-(--color-text-warning)/3",
      tag: "Geometry",
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="bg-(--color-interactive-primary)/3 dark:bg-(--color-interactive-primary)/5 p-12 md:p-20 rounded-[40px] border border-(--color-border-primary)/10 text-center space-y-6 relative overflow-hidden">
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="glass rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
            >
              Architecture
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            Design Tokens
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed">
            The fundamental building blocks of our UI. Our tokens synchronize
            design decisions across platforms and frameworks.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card className="glass h-full border border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/30 transition-all duration-500 overflow-hidden relative">
              <div
                className={cn(
                  "absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0",
                  section.color
                )}
              >
                <ArrowUpRight className="h-6 w-6" />
              </div>

              <CardHeader className="p-8">
                <div
                  className={cn(
                    "inline-flex p-4 rounded-2xl mb-4 transition-transform duration-500 group-hover:scale-110",
                    section.bgColor
                  )}
                >
                  <section.icon className={cn("h-8 w-8", section.color)} />
                </div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-3xl font-bold text-(--color-text-primary)">
                    {section.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                    {section.tag}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-12 space-y-6">
                <p className="text-lg text-(--color-text-secondary) leading-relaxed">
                  {section.description}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
                    section.color
                  )}
                >
                  Explore {section.title} <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
