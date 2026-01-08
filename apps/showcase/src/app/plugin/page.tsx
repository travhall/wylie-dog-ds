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
} from "lucide-react";

export default function PluginPage() {
  const features = [
    {
      icon: <RefreshCw className="h-6 w-6 text-(--color-text-warning)" />,
      title: "Token Sync",
      description:
        "Automatically sync design tokens from our JSON source of truth directly into Figma variables.",
    },
    {
      icon: <Layout className="h-6 w-6 text-(--color-interactive-primary)" />,
      title: "Component Library",
      description:
        "Access the entire UI component library within Figma, including all variants and states.",
    },
    {
      icon: <Zap className="h-6 w-6 text-(--color-text-warning)" />,
      title: "Instant Handoff",
      description:
        "Export component code and CSS directly from Figma to speed up the development process.",
    },
    {
      icon: (
        <HandMetal className="h-6 w-6 text-(--color-interactive-primary)" />
      ),
      title: "Auto-Layout Ready",
      description:
        "All components are pre-configured with Figma's Auto Layout for perfect responsive design.",
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
            Figma Plugin
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            The Wylie Dog Figma Plugin bridges the gap between design and
            development, bringing our design system directly into the designer's
            workspace.
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-warning)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Main Features */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="glass border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/20 transition-all duration-500 group"
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
          Powering the Workflow
        </h2>
        <div className="relative p-8 md:p-12 glass border-(--color-border-primary)/10 rounded-[32px] overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-3 relative z-10">
            {[
              {
                step: 1,
                title: "Define in JSON",
                icon: <MousePointer2 className="h-5 w-5" />,
                desc: "Tokens are defined centrally in the @wyliedog/tokens package as the ultimate source of truth.",
              },
              {
                step: 2,
                title: "Sync via Plugin",
                icon: <RefreshCw className="h-5 w-5" />,
                desc: "Designers use the plugin to pull update tokens, creating Figma variables and styles instantly.",
              },
              {
                step: 3,
                title: "Build & Iterate",
                icon: <Clock className="h-5 w-5" />,
                desc: "Designers build UI with the correct tokens, leading to pixel-perfect implementation in code.",
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

      {/* Status Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex glass p-3 rounded-2xl border-(--color-border-primary)/5">
          <Smartphone className="h-6 w-6 text-(--color-text-tertiary)" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
          Coming Soon to the Figma Community
        </h2>
        <p className="text-(--color-text-secondary) max-w-xl mx-auto leading-relaxed italic">
          We are currently polishing the plugin for internal use. Stay tuned for
          a public release on the Figma Community.
        </p>
        <div className="flex gap-2 justify-center">
          <Badge className="px-4 py-1 rounded-full bg-(--color-interactive-primary) text-(--color-text-inverse)">
            Beta Access
          </Badge>
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full glass border-(--color-border-primary)/10 text-(--color-text-secondary)"
          >
            In Development
          </Badge>
        </div>
      </section>
    </div>
  );
}
