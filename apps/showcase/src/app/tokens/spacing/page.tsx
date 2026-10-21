import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import { SpacingDemo } from "../spacing-demo";
import type { ManifestToken } from "@/lib/token-values";

export default function SpacingPage() {
  const { primitives } = manifest;

  const composedSpacingTokens = [
    manifest.components.card["card-padding"],
    manifest.components.input["input-padding-x"],
  ].map((token) => `--space-${token.path.join("-")}: ${token.value}`);

  const spacingPrimitives = Object.entries(
    (primitives.spacing || {}) as Record<string, ManifestToken>
  )
    .map(([name, token]) => ({
      name,
      value: token.value,
      var: token.variable,
      size: parseInt(name.split("-")[1]) || 0,
    }))
    .sort((a, b) => a.size - b.size);

  return (
    <TokensSubpageShell
      categoryNumber="03"
      categoryLabel="Spacing"
      headline={
        <>
          One scale. Three densities.{" "}
          <span className="text-(--color-primary-foreground-subtle)">
            Same data.
          </span>
        </>
      }
      description="The 4-pixel base scale powers every gap, padding, and inset in the system. Every spacing token, in full, below."
    >
      <SpacingDemo />

      <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5 max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint) mb-2">
          Composed tokens
        </p>
        <div className="space-y-1 font-mono text-[10px] text-(--color-foreground-faint)">
          {composedSpacingTokens.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-6 space-y-6">
        {spacingPrimitives.map((s) => (
          <div key={s.name} className="flex items-center gap-6">
            <div className="w-24 shrink-0 text-right">
              <div className="text-sm font-bold text-(--color-foreground-default)">
                {s.name}
              </div>
              <div className="text-[10px] font-mono text-(--color-foreground-faint)">
                {s.value}
              </div>
            </div>
            <div className="flex-1 h-3 rounded-sm overflow-hidden bg-(--color-background-subtle)">
              <div
                className="h-full bg-(--color-primary-background-default)"
                style={{ width: s.value }}
              />
            </div>
            <div className="w-40 shrink-0 text-xs font-mono text-(--color-foreground-faint) text-right">
              {s.var}
            </div>
          </div>
        ))}
      </div>
    </TokensSubpageShell>
  );
}
