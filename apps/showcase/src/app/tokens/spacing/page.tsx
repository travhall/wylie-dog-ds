import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import { SpacingDemo } from "../spacing-demo";

export default function SpacingPage() {
  const { primitives } = manifest;

  const composedSpacingTokens = [
    manifest.components.card["card-padding"],
    manifest.components.input["input-padding-x"],
  ].map((token) => `--space-${token.path.join("-")}: ${token.value}`);

  const spacingPrimitives = Object.entries(primitives.spacing || {})
    .map(([name, token]: [string, any]) => ({
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
          <span style={{ color: "var(--color-interactive-primary)" }}>
            Same data.
          </span>
        </>
      }
      description="The 4-pixel base scale powers every gap, padding, and inset in the system. Every spacing token, in full, below."
    >
      <SpacingDemo />

      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5 max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary) mb-2">
          Composed tokens
        </p>
        <div className="space-y-1 font-mono text-[10px] text-(--color-text-tertiary)">
          {composedSpacingTokens.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
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
            <div className="flex-1 h-4 rounded-full overflow-hidden border border-(--color-border-primary)/5">
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
    </TokensSubpageShell>
  );
}
