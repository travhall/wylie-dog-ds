import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";

export default function ColorsPage() {
  const { primitives, semantics } = manifest;

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
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Color System
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Our system utilizes{" "}
          <span className="text-(--color-interactive-primary) font-bold">
            OKLCH
          </span>{" "}
          for perceptually uniform color scaling.
        </p>
      </section>

      {/* Primitives */}
      <section className="space-y-10">
        <h2 className="text-2xl font-bold tracking-tight text-(--color-text-primary)">
          Primitive Palettes
        </h2>
        <div className="space-y-12">
          {colorPrimitives.map((color) => (
            <div key={color.name} className="space-y-4">
              <h3 className="text-lg font-bold text-(--color-text-primary)">
                {color.name}
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-11 gap-4">
                {color.shades.map(([shade, token]) => (
                  <div key={shade} className="space-y-2 group cursor-help">
                    <div
                      className="aspect-square rounded-xl shadow-inner border border-(--color-text-primary)/5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: token.variable }}
                      title={`${token.variable}\n${token.value}`}
                    />
                    <div className="text-center text-[10px] font-black text-(--color-text-tertiary)">
                      {shade}
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
        <h2 className="text-2xl font-bold tracking-tight text-(--color-text-primary)">
          Semantic Mapping
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
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
                        <div className="text-sm font-bold text-(--color-text-primary)">
                          {token.name}
                        </div>
                        <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60 truncate max-w-[120px]">
                          {token.var}
                        </div>
                      </div>
                      <div
                        className="w-10 h-10 rounded-lg shadow-lg"
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
    </div>
  );
}
