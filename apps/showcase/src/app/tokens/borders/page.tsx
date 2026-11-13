import manifest from "@wyliedog/tokens/manifest.json";
import { Card } from "@wyliedog/ui/card";
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
        <Card className="gap-0 rounded-xl p-6 shadow-none">
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
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
                  <div className="text-xs font-mono text-(--color-foreground-faint)">
                    {formatSize(r.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="gap-0 rounded-xl p-6 shadow-none">
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
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
                <div className="text-xs font-mono text-(--color-foreground-faint)">
                  {w.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </TokensSubpageShell>
  );
}
