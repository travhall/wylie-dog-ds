import manifest from "@wyliedog/tokens/manifest.json";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import type { ManifestToken } from "@/lib/token-values";
import { MotionPreview } from "../motion-preview";

export default function MotionPage() {
  const easing = Object.entries(
    (manifest.semantics.easing || {}) as Record<string, ManifestToken>
  ).map(([key, token]) => ({
    key,
    name: token.path[token.path.length - 1],
    value: token.value,
    variable: token.variable,
    description: token.description,
  }));

  const semanticDuration = Object.entries(
    (manifest.semantics.duration || {}) as Record<string, ManifestToken>
  ).map(([key, token]) => ({
    key,
    name: token.path[token.path.length - 1],
    value: token.value,
    variable: token.variable,
    description: token.description,
  }));

  const primitiveDuration = Object.entries(
    (manifest.primitives.duration || {}) as Record<string, ManifestToken>
  )
    .map(([key, token]) => ({
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
          <span className="text-(--color-foreground-primary-muted)">
            cover everything.
          </span>
        </>
      }
      description={`Every easing curve and duration token, in full — plus the raw ${primitiveDuration.length}-step duration scale they're built from.`}
    >
      <section className="space-y-4">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
          Easing
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {easing.map((e) => (
            <div
              key={e.key}
              className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5"
            >
              <p className="font-semibold text-sm text-(--color-foreground-default) capitalize">
                {e.name}
              </p>
              {e.description ? (
                <p className="mt-1 text-[0.6875rem] text-(--color-foreground-faint) leading-relaxed">
                  {e.description}
                </p>
              ) : null}
              <p className="mt-3 font-mono text-[0.625rem] text-(--color-foreground-muted) break-all">
                {e.value}
              </p>
              <p className="mt-1 font-mono text-[0.625rem] text-(--color-foreground-faint)">
                {e.variable}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
          Semantic durations
        </h2>
        <div
          tabIndex={0}
          role="region"
          aria-label="Semantic durations table"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring) overflow-x-auto rounded-xl border border-(--color-border-default)"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border-default) bg-(--color-background-muted)">
                <th className="px-4 py-2 text-left font-semibold text-(--color-foreground-default)">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-foreground-default)">
                  Value
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-foreground-default)">
                  Variable
                </th>
                <th className="px-4 py-2 text-left font-semibold text-(--color-foreground-default)">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {semanticDuration.map((d) => (
                <tr
                  key={d.key}
                  className="border-b border-(--color-border-default) last:border-0"
                >
                  <td className="px-4 py-2 font-medium text-(--color-foreground-default) capitalize">
                    {d.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-(--color-foreground-muted)">
                    {d.value}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-(--color-foreground-faint)">
                    {d.variable}
                  </td>
                  <td className="px-4 py-2 text-xs text-(--color-foreground-faint)">
                    {d.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
          Raw duration scale
        </h2>
        <div className="flex flex-wrap gap-3">
          {primitiveDuration.map((d) => (
            <div
              key={d.key}
              className="rounded-lg border border-(--color-border-default) bg-(--color-background-default) px-3 py-2"
            >
              <p className="font-mono text-xs text-(--color-foreground-default)">
                {d.value}
              </p>
              <p className="font-mono text-[0.625rem] text-(--color-foreground-faint)">
                {d.variable}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-wider text-(--color-foreground-faint)">
          Try it
        </h2>
        <MotionPreview />
      </section>
    </TokensSubpageShell>
  );
}
