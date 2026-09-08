import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import { MotionPreview } from "../motion-preview";

export default function MotionPage() {
  const easing = Object.entries(manifest.semantics.easing || {}).map(
    ([key, token]: [string, any]) => ({
      key,
      name: token.path[token.path.length - 1],
      value: token.value,
      variable: token.variable,
      description: token.description,
    })
  );

  const semanticDuration = Object.entries(
    manifest.semantics.duration || {}
  ).map(([key, token]: [string, any]) => ({
    key,
    name: token.path[token.path.length - 1],
    value: token.value,
    variable: token.variable,
    description: token.description,
  }));

  const primitiveDuration = Object.entries(manifest.primitives.duration || {})
    .map(([key, token]: [string, any]) => ({
      key,
      name: token.path[token.path.length - 1],
      value: token.value,
      variable: token.variable,
    }))
    .sort((a, b) => Number(a.name) - Number(b.name));

  return (
    <TokensSubpageShell
      categoryNumber="06"
      categoryLabel="Motion"
      headline={
        <>
          {easing.length} curves and {semanticDuration.length} durations{" "}
          <span style={{ color: "var(--color-interactive-primary)" }}>
            cover everything.
          </span>
        </>
      }
      description={`Every easing curve and duration token, in full — plus the raw ${primitiveDuration.length}-step duration scale they're built from.`}
    >
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Easing
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {easing.map((e) => (
            <div
              key={e.key}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5"
            >
              <p className="font-semibold text-sm text-(--color-text-primary) capitalize">
                {e.name}
              </p>
              {e.description ? (
                <p className="mt-1 text-[11px] text-(--color-text-tertiary) leading-relaxed">
                  {e.description}
                </p>
              ) : null}
              <p className="mt-3 font-mono text-[10px] text-(--color-text-secondary) break-all">
                {e.value}
              </p>
              <p className="mt-1 font-mono text-[10px] text-(--color-text-tertiary)">
                {e.variable}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Semantic durations
        </h2>
        <div className="overflow-x-auto rounded-xl border border-(--color-border-primary)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border-primary) bg-(--color-background-secondary)">
                <th className="px-4 py-2 text-left font-semibold text-(--color-text-primary)">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-text-primary)">
                  Value
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-text-primary)">
                  Variable
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-text-primary)">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {semanticDuration.map((d) => (
                <tr
                  key={d.key}
                  className="border-b border-(--color-border-primary) last:border-0"
                >
                  <td className="px-4 py-2 font-medium text-(--color-text-primary) capitalize">
                    {d.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-(--color-text-secondary)">
                    {d.value}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-(--color-text-tertiary)">
                    {d.variable}
                  </td>
                  <td className="px-4 py-2 text-xs text-(--color-text-tertiary)">
                    {d.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Raw duration scale
        </h2>
        <div className="flex flex-wrap gap-3">
          {primitiveDuration.map((d) => (
            <div
              key={d.key}
              className="rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) px-3 py-2"
            >
              <p className="font-mono text-xs text-(--color-text-primary)">
                {d.value}
              </p>
              <p className="font-mono text-[10px] text-(--color-text-tertiary)">
                {d.variable}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Try it
        </h2>
        <MotionPreview />
      </section>
    </TokensSubpageShell>
  );
}
