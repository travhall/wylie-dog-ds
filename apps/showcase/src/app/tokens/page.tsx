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
import { Ruler, Type, Maximize2, LineChart } from "lucide-react";

export default function TokensPage() {
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

  const spacingPrimitives = Object.entries(primitives.spacing || {})
    .map(([name, token]: [string, any]) => ({
      name,
      value: token.value,
      var: token.variable,
      size: parseInt(name.split("-")[1]) || 0,
    }))
    .sort((a, b) => a.size - b.size);

  const typographyPrimitives = {
    families: Object.entries(primitives.typography?.family || {}).map(
      ([name, token]: [string, any]) => ({
        name,
        value: token.value,
        var: token.variable,
      })
    ),
    sizes: Object.entries(primitives.typography?.size || {})
      .map(([name, token]: [string, any]) => ({
        name: name.split("-").slice(-1)[0],
        value: token.value,
        var: token.variable,
        px: parseInt(token.value) || 0,
      }))
      .sort((a, b) => a.px - b.px),
    weights: Object.entries(primitives.typography?.weight || {}).map(
      ([name, token]: [string, any]) => ({
        name: name.split("-").slice(-1)[0],
        value: token.value,
        var: token.variable,
      })
    ),
    lineHeights: Object.entries(primitives.typography?.lineHeight || {}).map(
      ([name, token]: [string, any]) => ({
        name: name.split("-").slice(-1)[0],
        value: token.value,
        var: token.variable,
      })
    ),
  };

  const borderPrimitives = {
    radius: Object.entries(primitives.borderRadius || {}).map(
      ([name, token]: [string, any]) => ({
        name,
        value: token.value,
        var: token.variable,
      })
    ),
    width: Object.entries(primitives.borderWidth || {}).map(
      ([name, token]: [string, any]) => ({
        name,
        value: token.value,
        var: token.variable,
      })
    ),
  };

  const semanticGroups = Object.entries(semantics)
    .filter(([_, tokens]) => Object.keys(tokens).length > 0)
    .map(([group, tokens]) => ({
      group: formatGroupName(group),
      tokens: Object.entries(tokens).map(([name, token]) => ({
        name: name
          .replace(/^(color|spacing|font)-/, "")
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
        var: token.variable,
        description: token.description,
        type: token.type,
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
            Design Tokens
          </h1>
          <p className="text-lg md:text-xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed">
            The fundamental building blocks of our UI. A unified system for{" "}
            <span className="text-(--color-interactive-primary) font-bold">
              Color
            </span>
            ,{" "}
            <span className="text-(--color-text-info) font-bold">Spacing</span>,
            and{" "}
            <span className="text-(--color-text-success) font-bold">
              Typography
            </span>
            .
          </p>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-(--color-interactive-primary)/5 blur-[120px] -z-10 rounded-full" />
      </section>

      {/* Philosophy / Features omitted for brevity in tokens view - focusing on data */}

      {/* Spacing */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Ruler className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Spacing Scale
          </h2>
        </div>

        <div className="glass p-8 rounded-[40px] border-(--color-border-primary)/5 space-y-8">
          {spacingPrimitives.map((s) => (
            <div key={s.name} className="flex items-center gap-6 group">
              <div className="w-24 text-right">
                <div className="text-sm font-bold text-(--color-text-primary)">
                  {s.name}
                </div>
                <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                  {s.value}
                </div>
              </div>
              <div className="flex-1 h-3 glass rounded-full overflow-hidden border border-(--color-border-primary)/5">
                <div
                  className="h-full bg-(--color-interactive-primary) transition-all group-hover:opacity-80"
                  style={{ width: s.value }}
                />
              </div>
              <div className="w-20 text-xs font-mono text-(--color-text-tertiary)">
                {s.var}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Type className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Typography
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Families */}
          <Card className="glass border-(--color-border-primary)/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" /> Font Families
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {typographyPrimitives.families.map((f) => (
                <div key={f.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-(--color-text-tertiary)">
                      {f.name}
                    </span>
                    <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-50">
                      {f.var}
                    </span>
                  </div>
                  <div
                    className="text-4xl p-6 glass rounded-2xl border-(--color-border-primary)/5"
                    style={{ fontFamily: f.value }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card className="glass border-(--color-border-primary)/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Font Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typographyPrimitives.sizes.map((s) => (
                <div
                  key={s.name}
                  className="flex items-baseline justify-between border-b border-(--color-border-primary)/5 pb-2"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs font-mono text-(--color-text-tertiary) w-8">
                      {s.name}
                    </span>
                    <span
                      style={{ fontSize: s.value }}
                      className="text-(--color-text-primary)"
                    >
                      Visual Sample
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                    {s.value} ({s.var})
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weights */}
          <Card className="glass border-(--color-border-primary)/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" /> Font Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typographyPrimitives.weights.map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between border-b border-(--color-border-primary)/5 pb-2"
                >
                  <span
                    style={{ fontWeight: w.value }}
                    className="text-2xl text-(--color-text-primary)"
                  >
                    {w.name} Weight
                  </span>
                  <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                    {w.value} ({w.var})
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Line Heights */}
          <Card className="glass border-(--color-border-primary)/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Line Heights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typographyPrimitives.lineHeights.map((lh) => (
                <div
                  key={lh.name}
                  className="space-y-2 border-b border-(--color-border-primary)/5 pb-4"
                >
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-(--color-text-tertiary)">
                      {lh.name}
                    </span>
                    <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                      {lh.value} ({lh.var})
                    </span>
                  </div>
                  <p
                    className="text-sm text-(--color-text-secondary) glass p-4 rounded-xl border border-(--color-border-primary)/5"
                    style={{ lineHeight: lh.value }}
                  >
                    This is an example of text rendered with the {lh.name} line
                    height token. It helps ensure consistent vertical rhythm
                    across our typography system.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Borders & Radius */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-xl">
            <Maximize2 className="h-6 w-6 text-(--color-interactive-primary)" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-(--color-text-primary)">
            Borders & Radius
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Radius */}
          <div className="glass p-8 rounded-[40px] border-(--color-border-primary)/5">
            <h3 className="text-xl font-bold mb-8 text-(--color-text-primary)">
              Corner Radius
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {borderPrimitives.radius.map((r) => (
                <div
                  key={r.name}
                  className="space-y-3 flex flex-col items-center"
                >
                  <div
                    className="w-full aspect-square glass bg-(--color-interactive-primary)/10 border border-(--color-interactive-primary)/20"
                    style={{ borderRadius: r.value }}
                  />
                  <div className="text-center">
                    <div className="text-xs font-bold text-(--color-text-primary)">
                      {r.name}
                    </div>
                    <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                      {r.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Width */}
          <div className="glass p-8 rounded-[40px] border-(--color-border-primary)/5">
            <h3 className="text-xl font-bold mb-8 text-(--color-text-primary)">
              Border Width
            </h3>
            <div className="space-y-6">
              {borderPrimitives.width.map((w) => (
                <div key={w.name} className="flex items-center gap-4 group">
                  <div className="w-16 text-xs font-bold text-(--color-text-primary)">
                    {w.name}
                  </div>
                  <div
                    className="flex-1 h-8 bg-(--color-background-primary) rounded-lg border-(--color-interactive-primary) transition-all"
                    style={{ borderStyle: "solid", borderWidth: w.value }}
                  />
                  <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                    {w.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Primitives (Existing Colors) */}
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
