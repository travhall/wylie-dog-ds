import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import {
  Palette,
  Droplet,
  Sun,
  Moon,
  Info,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";
import manifest from "@wyliedog/tokens/manifest.json";

export default function ColorsPage() {
  const { primitives, semantics } = manifest;

  // Helper to format group names (e.g., "background" -> "Backgrounds")
  const formatGroupName = (name: string) =>
    name.charAt(0).toUpperCase() +
    name.slice(1) +
    (name.endsWith("s") ? "" : "s");

  const colorPrimitives = Object.entries(primitives.colors).map(
    ([name, shades]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      shades: Object.entries(shades).sort((a, b) => {
        const aVal = parseInt(a[0]) || 0;
        const bVal = parseInt(b[0]) || 0;
        return aVal - bVal;
      }),
    })
  );

  const semanticGroups = Object.entries(semantics)
    .filter(([_, tokens]) => Object.keys(tokens).length > 0)
    .map(([group, tokens]) => ({
      group: formatGroupName(group),
      tokens: Object.entries(tokens).map(([name, token]) => ({
        name: name
          .replace(/^color-/, "")
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
        var: token.variable,
        description: token.description,
      })),
    }));

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
              Design Tokens
            </Badge>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-(--color-text-primary)">
            Color System
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) leading-relaxed">
            Our system utilizes{" "}
            <span className="text-(--color-interactive-primary) font-bold">
              OKLCH
            </span>{" "}
            for perceptually uniform color scaling, ensuring accessible contrast
            and vibrant palettes across all modes.
          </p>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Philosophy / Features */}
      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            icon: <Droplet className="text-(--color-text-info)" />,
            title: "Perceptual Clarity",
            desc: "OKLCH ensures that 500-level blue feels as 'bright' as 500-level orange.",
          },
          {
            icon: <Globe className="text-(--color-interactive-primary)" />,
            title: "Wide Gamut",
            desc: "Built for modern displays with support for P3 color spaces and beyond.",
          },
          {
            icon: <CheckCircle2 className="text-(--color-text-success)" />,
            title: "A11y First",
            desc: "Semantic pairings are pre-validated for WCAG AA/AAA compliance.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="glass p-8 rounded-3xl border-(--color-border-primary)/10 flex flex-col items-center text-center space-y-4"
          >
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center shadow-lg border-(--color-border-primary)/5">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-(--color-text-primary)">
              {item.title}
            </h3>
            <p className="text-sm text-(--color-text-secondary) leading-relaxed italic">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Primitives */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Palette className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Primitive Palettes
          </h2>
        </div>

        <div className="space-y-12">
          {colorPrimitives.map((color) => (
            <div key={color.name} className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-(--color-text-primary)">
                {color.name}
                <span className="text-xs font-normal text-(--color-text-tertiary) opacity-50 uppercase tracking-widest">
                  — Primitive
                </span>
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-11 gap-2 md:gap-4">
                {color.shades.map(([shade, token]) => (
                  <div key={shade} className="space-y-2 group cursor-help">
                    <div
                      className="aspect-square rounded-xl shadow-inner border border-(--color-text-primary)/5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: token.variable }}
                      title={`${token.variable}\n${token.value}`}
                    />
                    <div className="text-center">
                      <div className="text-[10px] font-black text-(--color-text-tertiary)">
                        {shade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Semantics */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Zap className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Semantic Mapping
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {semanticGroups.map((group) => (
            <Card
              key={group.group}
              className="glass border-(--color-border-primary)/10 overflow-hidden"
            >
              <CardHeader className="bg-(--color-background-secondary)/30 border-b border-(--color-border-primary)/5">
                <CardTitle className="text-xl font-bold text-(--color-text-primary)">
                  {group.group}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border-primary)/5">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center justify-between p-5 group hover:bg-(--color-interactive-primary)/5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                          {token.name}
                        </div>
                        <div
                          className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60 truncate max-w-[120px]"
                          title={token.var}
                        >
                          {token.var}
                        </div>
                        {token.description && (
                          <div className="text-[10px] text-(--color-text-tertiary) italic">
                            {token.description}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl shadow-lg border border-(--color-border-primary)/10"
                        style={{ backgroundColor: token.var }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical Details */}
      <section className="glass rounded-[40px] p-10 md:p-16 relative overflow-hidden group border-(--color-border-primary)/5">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center relative z-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
              Mode Awareness
            </h2>
            <p className="text-lg text-(--color-text-secondary) leading-relaxed italic border-l-4 border-(--color-interactive-primary)/20 pl-6">
              Our semantic tokens automatically resolve to the correct primitive
              based on the user's color scheme preference. Dark mode is not an
              afterthought—it's baked into the token architecture.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-bold border-(--color-border-primary)/5">
                <Sun className="h-4 w-4 text-(--color-interactive-warning)" />{" "}
                Light Mode
              </div>
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-bold border-(--color-border-primary)/5">
                <Moon className="h-4 w-4 text-(--color-interactive-primary)" />{" "}
                Dark Mode
              </div>
            </div>
          </div>

          <div className="p-8 glass border-(--color-border-primary)/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-(--color-interactive-primary)">
              <Info className="h-4 w-4" /> Usage Tip
            </div>
            <p className="text-(--color-text-secondary) leading-relaxed italic">
              Always use{" "}
              <span className="font-mono text-(--color-text-primary) font-bold">
                semantic tokens
              </span>{" "}
              for UI elements. Primitives should only be used when creating
              brand-new visual patterns or artistic decorations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
