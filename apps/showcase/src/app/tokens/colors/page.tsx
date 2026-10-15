import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";

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
    .map(([group, tokens]) => ({
      group: formatGroupName(group),
      tokens: Object.entries(tokens)
        .filter(([, token]) => token.type === "color")
        .map(([name, token]) => ({
          name: name
            .replace(/^color-/, "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          var: token.variable,
          description: token.description,
        })),
    }))
    .filter((g) => g.tokens.length > 0);

  return (
    <TokensSubpageShell
      categoryNumber="01"
      categoryLabel="Color"
      headline={
        <>
          OKLCH means the ramp{" "}
          <span className="text-(--color-interactive-primary)">is</span> the
          math.
        </>
      }
      description="Every primitive palette and its semantic mapping, in full — the complete reference behind every swatch shown on the hub."
    >
      {/* Primitives */}
      <section className="space-y-6">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Primitive palettes
        </h2>
        <div className="space-y-10">
          {colorPrimitives.map((color) => (
            <div key={color.name} className="space-y-4">
              <h3 className="font-serif text-xl font-semibold text-(--color-text-primary)">
                {color.name}
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-11 gap-3">
                {color.shades.map(([shade, token]) => (
                  <div key={shade} className="space-y-2 cursor-help">
                    <div
                      className="aspect-square rounded-lg border border-(--color-border-primary)"
                      style={{ backgroundColor: token.variable }}
                      title={`${token.variable}\n${token.value}`}
                    />
                    <div className="text-center font-mono text-[10px] text-(--color-text-tertiary)">
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
      <section className="space-y-6">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Semantic mapping
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {semanticGroups.map((group) => (
            <div
              key={group.group}
              className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-background-primary)"
            >
              <h3 className="border-b border-(--color-border-primary) bg-(--color-background-secondary) px-5 py-3 font-semibold text-(--color-text-primary)">
                {group.group}
              </h3>
              <div>
                <div className="divide-y divide-(--color-border-primary)">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-(--color-text-primary)">
                          {token.name}
                        </div>
                        <div className="max-w-40 truncate font-mono text-[10px] text-(--color-text-tertiary)">
                          {token.var}
                        </div>
                      </div>
                      <div
                        className="h-8 w-8 shrink-0 rounded-md border border-(--color-border-primary)"
                        style={{ backgroundColor: token.var }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </TokensSubpageShell>
  );
}
