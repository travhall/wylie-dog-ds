import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Figma,
  RefreshCw,
  Zap,
  Layout,
  HandMetal,
  Smartphone,
  MousePointer2,
  Clock,
  ArrowRight,
  Github,
  Shield,
  Code,
  Palette,
  Lock,
  Download,
  Upload,
  GitBranch,
} from "lucide-react";

export default function PluginPage() {
  const features = [
    {
      icon: (
        <RefreshCw className="h-6 w-6 text-(--color-interactive-primary)" />
      ),
      title: "Bi-directional Sync",
      description:
        "Advanced three-way merge between Figma variables and GitHub repositories with intelligent conflict detection.",
    },
    {
      icon: <Shield className="h-6 w-6 text-(--color-text-warning)" />,
      title: "OAuth Authentication",
      description:
        "Secure OAuth 2.0 + PKCE flow for GitHub, GitLab, and Bitbucket with no personal tokens required.",
    },
    {
      icon: <Palette className="h-6 w-6 text-(--color-interactive-primary)" />,
      title: "Universal Format Support",
      description:
        "Import/export 8+ token formats including W3C DTCG, Tokens Studio, Style Dictionary, and Material Design.",
    },
    {
      icon: <Code className="h-6 w-6 text-(--color-text-warning)" />,
      title: "Smart Processing",
      description:
        "Confidence-based format detection with automatic transformation and reference resolution.",
    },
    {
      icon: <Download className="h-6 w-6 text-(--color-interactive-primary)" />,
      title: "Bulk Operations",
      description:
        "Virtual scrolling and skeleton states enable handling 1000+ tokens efficiently.",
    },
    {
      icon: <Lock className="h-6 w-6 text-(--color-text-warning)" />,
      title: "Enterprise Ready",
      description:
        "Comprehensive test suite with 60%+ coverage, type-safe error handling, and security-first design.",
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section - Restored to Original Design */}
      <section className="bg-(--color-interactive-warning)/3 dark:bg-(--color-interactive-warning)/5 p-12 md:p-20 rounded-[40px] border border-(--color-border-primary)/10 text-center space-y-8 relative overflow-hidden">
        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="bg-(--color-background-primary)/50 backdrop-blur-sm rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold text-(--color-text-primary) border-(--color-border-primary)/10"
            >
              Designer Experience
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            Token Bridge
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            Advanced bi-directional design token synchronization between Figma
            and code repositories with OAuth authentication and intelligent
            conflict resolution.
          </p>
        </div>

        <div className="flex justify-center items-center gap-6 relative z-10 pt-4">
          <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg flex items-center justify-center p-4">
            <Figma className="h-full w-full text-[#F24E1E]" />
          </div>
          <RefreshCw className="h-6 w-6 text-(--color-text-tertiary)/30" />
          <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg flex items-center justify-center p-4">
            <Zap className="h-full w-full text-(--color-text-warning)" />
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-(--color-interactive-warning)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Main Features */}
      <section className="flex flex-wrap gap-8 justify-center">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="glass border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/20 transition-all duration-500 group w-72 shrink-0"
          >
            <CardHeader className="pb-4">
              <div className="mb-4 p-3 w-fit rounded-2xl glass border-(--color-border-primary)/5 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                {feature.icon}
              </div>
              <CardTitle className="text-xl font-bold text-(--color-text-primary)">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-(--color-text-secondary) leading-relaxed font-medium">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Workflow Visualization */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center tracking-tight text-(--color-text-primary)">
          Advanced Token Workflow
        </h2>
        <div className="relative p-8 md:p-12 glass border-(--color-border-primary)/10 rounded-4xl overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-3 relative z-10">
            {[
              {
                step: 1,
                title: "Import Tokens",
                icon: <Upload className="h-5 w-5" />,
                desc: "Import tokens from multiple formats (W3C DTCG, Tokens Studio, etc.) with confidence-based detection.",
              },
              {
                step: 2,
                title: "Sync & Resolve",
                icon: <GitBranch className="h-5 w-5" />,
                desc: "Bi-directional sync with intelligent conflict detection and three-way merge resolution.",
              },
              {
                step: 3,
                title: "Export & Deploy",
                icon: <Download className="h-5 w-5" />,
                desc: "Export to any format or sync directly to GitHub with OAuth authentication.",
              },
            ].map((flow) => (
              <div
                key={flow.step}
                className="space-y-4 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-full glass border-(--color-interactive-primary)/20 flex items-center justify-center font-black text-xl text-(--color-interactive-primary) shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {flow.step}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2 text-(--color-text-primary)">
                    {flow.icon}
                    {flow.title}
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) leading-relaxed font-medium">
                    {flow.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center tracking-tight text-(--color-text-primary)">
          Technical Excellence
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              metric: "8+ Formats",
              description:
                "W3C DTCG, Tokens Studio, Style Dictionary, Material Design, and more",
              icon: <Palette className="h-5 w-5" />,
            },
            {
              metric: "60%+ Coverage",
              description:
                "Comprehensive test suite with Vitest and coverage thresholds",
              icon: <Shield className="h-5 w-5" />,
            },
            {
              metric: "384KB Bundle",
              description:
                "Optimized build with intelligent code splitting and lazy loading",
              icon: <Zap className="h-5 w-5" />,
            },
            {
              metric: "OAuth 2.0 + PKCE",
              description:
                "Enterprise-grade authentication for GitHub, GitLab, and Bitbucket",
              icon: <Lock className="h-5 w-5" />,
            },
            {
              metric: "1000+ Tokens",
              description:
                "Virtual scrolling and skeleton states for large datasets",
              icon: <Download className="h-5 w-5" />,
            },
            {
              metric: "<2s Load Time",
              description:
                "Fast initialization and interactive UI with modern architecture",
              icon: <Clock className="h-5 w-5" />,
            },
          ].map((spec, index) => (
            <Card
              key={index}
              className="glass border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/20 transition-all duration-500 group"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full glass border-(--color-interactive-primary)/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {spec.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-(--color-interactive-primary)">
                    {spec.metric}
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                    {spec.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Status Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex glass p-3 rounded-2xl border-(--color-border-primary)/5">
          <Github className="h-6 w-6 text-(--color-text-tertiary)" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
          Available Now - Version 0.2.0
        </h2>
        <p className="text-(--color-text-secondary) max-w-xl mx-auto leading-relaxed">
          Token Bridge is actively developed with comprehensive OAuth support,
          advanced conflict resolution, and enterprise-ready testing. Available
          for development use with Figma Desktop.
        </p>
        <div className="flex gap-2 justify-center">
          <Badge className="px-4 py-1 rounded-full bg-(--color-interactive-primary) text-(--color-text-inverse)">
            v0.2.0
          </Badge>
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full glass border-(--color-border-primary)/10 text-(--color-text-secondary)"
          >
            Production Ready
          </Badge>
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full glass border-(--color-border-primary)/10 text-(--color-text-secondary)"
          >
            OAuth Support
          </Badge>
        </div>
      </section>
    </div>
  );
}
