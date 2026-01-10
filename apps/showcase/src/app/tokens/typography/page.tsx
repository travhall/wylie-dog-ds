import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";
import { Maximize2, LineChart } from "lucide-react";

export default function TypographyPage() {
  const { primitives } = manifest;

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

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Typography
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          The structural rules for font families, sizes, weights, and vertical
          rhythm.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" /> Families & Sizes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {typographyPrimitives.families.map((f) => {
              // Extract the font family type (sans, mono, serif)
              const familyType = f.name.split("-").pop();
              // Use standard Tailwind font utilities (mapped to tokens via config)
              const fontFamilyClass = `font-${familyType}`;

              return (
                <div key={f.name} className="space-y-4">
                  <div className="text-xs font-black uppercase text-(--color-text-tertiary)">
                    {f.name} · {f.value}
                  </div>
                  {typographyPrimitives.sizes.map((s) => {
                    return (
                      <div
                        key={s.name}
                        className="flex flex-col gap-1 border-b border-(--color-border-primary)/5 pb-3"
                      >
                        <div className="flex items-baseline justify-between">
                          <span
                            className={`${fontFamilyClass} text-(--color-text-primary)`}
                            style={{ fontSize: s.var }}
                          >
                            Sample ({s.name})
                          </span>
                          <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                            {s.value}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-(--color-text-tertiary)/50">
                            {fontFamilyClass}
                          </span>
                          <span className="text-(--color-text-tertiary)/30">
                            ·
                          </span>
                          <span className="text-[9px] font-mono text-(--color-text-tertiary)/50">
                            fontSize: {s.var}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-(--color-text-primary)">
                Weights
              </h3>
              {typographyPrimitives.weights.map((w) => (
                <div key={w.name} className="flex items-center justify-between">
                  <span
                    style={{ fontWeight: w.value }}
                    className="text-lg text-(--color-text-primary)"
                  >
                    {w.name}
                  </span>
                  <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                    {w.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-(--color-text-primary)">
                Line Heights
              </h3>
              {typographyPrimitives.lineHeights.map((lh) => (
                <div
                  key={lh.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-(--color-text-primary)">
                    {lh.name}
                  </span>
                  <span className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                    {lh.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
