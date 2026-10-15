import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import type { ManifestToken } from "@/lib/token-values";

export default function TypographyPage() {
  const { primitives } = manifest;

  const typographyPrimitives = {
    families: Object.entries(
      (primitives.typography?.family || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name,
      value: token.value,
      var: token.variable,
    })),
    sizes: Object.entries(
      (primitives.typography?.size || {}) as Record<string, ManifestToken>
    )
      .map(([name, token]) => ({
        name: name.split("-").slice(-1)[0],
        value: token.value,
        var: token.variable,
        px: parseInt(token.value) || 0,
      }))
      .sort((a, b) => a.px - b.px),
    weights: Object.entries(
      (primitives.typography?.weight || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name: name.split("-").slice(-1)[0],
      value: token.value,
      var: token.variable,
    })),
    lineHeights: Object.entries(
      (primitives.typography?.lineHeight || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name: name.split("-").slice(-1)[0],
      value: token.value,
      var: token.variable,
    })),
  };

  return (
    <TokensSubpageShell
      categoryNumber="02"
      categoryLabel="Typography"
      headline={
        <>
          A pairing that ships{" "}
          <span className="text-(--color-interactive-primary)">long-form</span>,
          dashboards, and code.
        </>
      }
      description="Every family, size, weight, and line height, in full — the complete reference behind the hub's editorial sample."
    >
      <div className="space-y-4">
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-6 space-y-4">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
              Families and sizes
            </h2>
          </div>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-(--color-border-primary)">
                    <th
                      scope="col"
                      className="pb-3 pr-4 text-[10px] font-mono uppercase tracking-wider text-(--color-text-tertiary)"
                    >
                      Size
                    </th>
                    {typographyPrimitives.families.map((f) => (
                      <th
                        key={f.name}
                        scope="col"
                        className="pb-3 px-4 text-[10px] font-mono uppercase tracking-wider text-(--color-text-tertiary)"
                      >
                        {f.name} · {f.value}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typographyPrimitives.sizes.map((s) => (
                    <tr
                      key={s.name}
                      className="border-b border-(--color-border-primary) last:border-0"
                    >
                      <th
                        scope="row"
                        className="py-3 pr-6 align-top text-left font-normal"
                      >
                        <div className="text-sm text-(--color-text-primary)">
                          {s.name}
                        </div>
                        <div className="text-[10px] font-mono text-(--color-text-tertiary)">
                          {s.value}
                        </div>
                        <div className="text-[10px] font-mono text-(--color-text-tertiary)">
                          fontSize: {s.var}
                        </div>
                      </th>
                      {typographyPrimitives.families.map((f) => {
                        // Extract the font family type (sans, mono, serif)
                        const familyType = f.name.split("-").pop();
                        // Use standard Tailwind font utilities (mapped to tokens via config)
                        const fontFamilyClass = `font-${familyType}`;

                        return (
                          <td key={f.name} className="py-3 px-4 align-top">
                            <span
                              className={`${fontFamilyClass} text-(--color-text-primary)`}
                              style={{ fontSize: `${s.value}px` }}
                            >
                              Sample
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-6 space-y-8">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
              Attributes
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-(--color-text-primary)">
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
                  <span className="text-[10px] font-mono text-(--color-text-tertiary)">
                    {w.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-(--color-text-primary)">
                Line heights
              </h3>
              {typographyPrimitives.lineHeights.map((lh) => (
                <div
                  key={lh.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-(--color-text-primary)">
                    {lh.name}
                  </span>
                  <span className="text-[10px] font-mono text-(--color-text-tertiary)">
                    {lh.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </TokensSubpageShell>
  );
}
