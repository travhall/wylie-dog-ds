import React from "react";
import { Button } from "@wyliedog/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  Layers,
  Box,
  Code2,
  BookOpen,
  Figma,
  Zap,
  ArrowRight,
  Shield,
  Layout,
  ChevronRight,
} from "lucide-react";

export default function ShowcasePage() {
  const ecosystem = [
    {
      title: "Monorepo",
      icon: <Box className="h-6 w-6 text-(--color-interactive-primary)" />,
      description:
        "Turbo-powered workspace infrastructure that houses all apps and packages.",
      href: "/monorepo",
      badge: "Infrastructure",
      tokenColor: "primary",
    },
    {
      title: "Design Tokens",
      icon: <Palette className="h-6 w-6 text-(--color-interactive-warning)" />,
      description:
        "A+ rated OKLCH color system and semantic token architecture.",
      href: "/colors",
      badge: "Source of Truth",
      tokenColor: "warning",
    },
    {
      title: "UI Components",
      icon: <Layers className="h-6 w-6 text-(--color-interactive-primary)" />,
      description:
        "42+ production-ready accessible components built with Radix UI.",
      href: "/components",
      badge: "Built with React",
      tokenColor: "primary",
    },
    {
      title: "Storybook",
      icon: <BookOpen className="h-6 w-6 text-(--color-interactive-warning)" />,
      description:
        "Interactive documentation and isolated component development.",
      href: "/storybook",
      badge: "Documentation",
      tokenColor: "warning",
    },
    {
      title: "Figma Plugin",
      icon: <Figma className="h-6 w-6 text-[#F24E1E]" />,
      description:
        "Bridging design and code with instant token and component sync.",
      href: "/plugin",
      badge: "Design Ops",
      tokenColor: "warning",
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative py-12 md:py-24 overflow-hidden">
        <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
          <Badge
            variant="outline"
            className="gap-2 px-4 py-1.5 glass rounded-full text-[10px] font-bold tracking-widest uppercase"
          >
            <Sparkles className="h-3.5 w-3.5 text-(--color-interactive-primary) animate-pulse" />
            V1.0.0 Experimental
          </Badge>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-(--color-text-primary) animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Crafting the <br />
          <span className="text-(--color-interactive-primary) italic">
            Perfect
          </span>{" "}
          Ecosystem
        </h1>

        <p className="text-lg md:text-xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          A high-performance design system ecosystem built for speed,
          accessibility, and developer joy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link href="/components">
            <Button
              size="lg"
              className="h-14 px-10 rounded-full text-lg shadow-xl shadow-(--color-interactive-primary)/10 transition-all hover:scale-105 active:scale-95"
            >
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/monorepo">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-full text-lg glass transition-all hover:scale-105 active:scale-95"
            >
              Infrastructure
            </Button>
          </Link>
        </div>

        {/* Decorative elements - Subtle and doesn't block text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-(--color-interactive-primary)/3 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Ecosystem Grid */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <Badge
            variant="secondary"
            className="px-3 py-1 bg-(--color-interactive-primary)/10 text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            The Core Pillars
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-(--color-text-primary)">
            The Ecosystem at a Glance
          </h2>
          <p className="text-xl text-(--color-text-secondary) max-w-2xl mx-auto italic">
            Everything you need to build, design, and scale.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "group transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
                i === 0 && "delay-100",
                i === 1 && "delay-200",
                i === 2 && "delay-300",
                i === 3 && "delay-400",
                i === 4 && "delay-500"
              )}
            >
              <Card className="h-full border-2 border-(--color-border-primary)/10 glass group-hover:border-(--color-interactive-primary)/30 transition-all shadow-none group-hover:shadow-2xl group-hover:shadow-(--color-interactive-primary)/5 overflow-hidden">
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        item.tokenColor === "primary"
                          ? "bg-(--color-interactive-primary)/10 text-(--color-interactive-primary)"
                          : "bg-(--color-interactive-warning)/10 text-(--color-interactive-warning)"
                      )}
                    >
                      {item.icon}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold tracking-widest uppercase py-0.5 border-(--color-border-primary)/50 glass"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl flex items-center gap-2 group-hover:text-(--color-interactive-primary) transition-colors">
                    {item.title}
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-(--color-text-secondary) leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
                {/* Decorative card background */}
                <div
                  className={cn(
                    "absolute -bottom-12 -right-12 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700",
                    item.tokenColor === "primary"
                      ? "bg-(--color-interactive-primary)"
                      : "bg-(--color-interactive-warning)"
                  )}
                />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Key Stats / Features */}
      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            icon: <Zap className="text-(--color-interactive-warning)" />,
            value: "42+",
            label: "Components",
            desc: "Accessible building blocks.",
          },
          {
            icon: <Shield className="text-(--color-interactive-primary)" />,
            value: "AA",
            label: "Compliant",
            desc: "Inclusive by design.",
          },
          {
            icon: <Code2 className="text-(--color-interactive-primary)" />,
            value: "TS",
            label: "Native",
            desc: "Type-safe experience.",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass p-10 rounded-[32px] border-(--color-border-primary)/10 flex flex-col items-center text-center space-y-4 hover:border-(--color-interactive-primary)/20 transition-all duration-500 group"
          >
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(stat.icon as any, { className: "h-8 w-8" })}
            </div>
            <div className="space-y-1">
              <h3 className="text-5xl font-black tracking-tighter text-(--color-text-primary)">
                {stat.value}
              </h3>
              <p className="font-bold text-lg text-(--color-interactive-primary) uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
            <p className="text-(--color-text-secondary)">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Philosophy Section */}
      <section className="bg-(--color-background-inverse) text-(--color-text-inverse) rounded-3xl p-12 overflow-hidden relative">
        <div className="relative z-10 grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Design-as-Code</h2>
            <p className="text-lg opacity-80">
              We believe that design should be as maintainable and versionable
              as code. Our ecosystem ensures that the gap between what a
              designer sees and what a developer builds is non-existent.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge
                variant="outline"
                className="border-(--color-text-inverse)/20 text-(--color-text-inverse)"
              >
                W3C DTCG Standard
              </Badge>
              <Badge
                variant="outline"
                className="border-(--color-text-inverse)/20 text-(--color-text-inverse)"
              >
                OKLCH Color Science
              </Badge>
              <Badge
                variant="outline"
                className="border-(--color-text-inverse)/20 text-(--color-text-inverse)"
              >
                Atomic Design
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-(--color-text-inverse)/10 rounded-2xl backdrop-blur-sm border border-(--color-text-inverse)/20 p-6 flex flex-col justify-between">
              <Palette className="h-8 w-8" />
              <p className="text-sm font-semibold">Tokens</p>
            </div>
            <div className="aspect-square bg-(--color-text-inverse)/10 rounded-2xl backdrop-blur-sm border border-(--color-text-inverse)/20 p-6 flex flex-col justify-between">
              <Layout className="h-8 w-8" />
              <p className="text-sm font-semibold">Patterns</p>
            </div>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-interactive-primary)/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-(--color-interactive-primary)/10 blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </section>
    </div>
  );
}
