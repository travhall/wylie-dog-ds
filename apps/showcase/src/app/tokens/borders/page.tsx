import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import type { ManifestToken } from "@/lib/token-values";
import { formatSize } from "@/lib/token-units";

export default function BordersPage() {
  const { primitives } = manifest;

  const borderPrimitives = {
    radius: Object.entries(
      (primitives.borderRadius || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name,
      value: token.value,
      var: token.variable,
    })),
    width: Object.entries(
      (primitives.borderWidth || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name,
      value: token.value,
      var: token.variable,
    })),
  };

  return (
    <TokensSubpageShell
      categoryNumber="04"
      categoryLabel="Radius"
      headline={
        <>
          Every corner.{" "}
          <span className="text-(--color-foreground-primary-muted)">
            Every border
          </span>{" "}
          has a token.
        </>
      }
      description="Every radius and border-width token, in full — the complete reference behind the hub's sample."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-6">
          <h2 className="mb-6 font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
            Corner radius
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {borderPrimitives.radius.map((r) => (
              <div
                key={r.name}
                className="space-y-3 flex flex-col items-center"
              >
                <div
                  className="w-full aspect-square bg-(--color-background-muted) border border-(--color-border-default)"
                  style={{ borderRadius: r.value }}
                />
                <div className="text-center">
                  <div className="text-xs font-bold text-(--color-foreground-default)">
                    {r.name}
                  </div>
                  <div className="text-[0.625rem] font-mono text-(--color-foreground-faint)">
                    {formatSize(r.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-6">
          <h2 className="mb-6 font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
            Border width
          </h2>
          <div className="space-y-6">
            {borderPrimitives.width.map((w) => (
              <div key={w.name} className="flex items-center gap-4">
                <div className="w-16 text-xs font-bold text-(--color-foreground-default)">
                  {w.name}
                </div>
                <div
                  className="flex-1 h-10 bg-(--color-background-muted) rounded-lg"
                  style={{
                    border: `${w.value} solid var(--color-background-primary)`,
                  }}
                />
                <div className="text-[0.625rem] font-mono text-(--color-foreground-faint)">
                  {w.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </TokensSubpageShell>
  );
}
