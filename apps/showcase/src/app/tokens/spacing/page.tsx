import manifest from "@wyliedog/tokens/manifest.json";

export default function SpacingPage() {
  const { primitives } = manifest;

  const spacingPrimitives = Object.entries(primitives.spacing || {})
    .map(([name, token]: [string, any]) => ({
      name,
      value: token.value,
      var: token.variable,
      size: parseInt(name.split("-")[1]) || 0,
    }))
    .sort((a, b) => a.size - b.size);

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Spacing Scale
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Consistent spacing values that drive the layout and rhythm of the
          entire interface.
        </p>
      </section>

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
            <div className="flex-1 h-4 glass rounded-full overflow-hidden border border-(--color-border-primary)/5">
              <div
                className="h-full bg-(--color-interactive-primary) transition-all group-hover:opacity-80"
                style={{ width: s.value }}
              />
            </div>
            <div className="w-40 text-xs font-mono text-(--color-text-tertiary) text-right">
              {s.var}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
