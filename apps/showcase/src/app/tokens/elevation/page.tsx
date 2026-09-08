import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import manifest from "@wyliedog/tokens/manifest.json";

const SHADOW_ORDER = [
  "shadow-none",
  "shadow-sm",
  "shadow-base",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-inner",
];

export default function ElevationPage() {
  const shadowEntries = Object.entries(manifest.semantics.shadow || {}).map(
    ([key, token]: [string, any]) => ({
      key,
      name: token.path[token.path.length - 1],
      value: token.value,
      variable: token.variable,
      description: token.description,
    })
  );

  const shadows = shadowEntries.sort((a, b) => {
    const ai = SHADOW_ORDER.indexOf(a.key);
    const bi = SHADOW_ORDER.indexOf(b.key);
    if (ai === -1 && bi === -1) return a.key.localeCompare(b.key);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <Link
        href="/tokens"
        className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tokens
      </Link>

      <div className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          Elevation
        </span>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
          {shadows.length} shadow steps —{" "}
          <span style={{ color: "var(--color-interactive-primary)" }}>one</span>{" "}
          stacking story.
        </h1>
        <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
          Every shadow token, in full — the complete reference behind the hub's
          layered scene, with each step's raw box-shadow value and its CSS
          variable.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shadows.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5"
          >
            <div
              className="h-16 w-16 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary)"
              style={{ boxShadow: s.variable }}
            />
            <p className="mt-4 font-semibold text-sm text-(--color-text-primary)">
              {s.name}
            </p>
            {s.description ? (
              <p className="mt-1 text-[11px] text-(--color-text-tertiary) leading-relaxed">
                {s.description}
              </p>
            ) : null}
            <p className="mt-3 font-mono text-[10px] text-(--color-text-secondary) break-all">
              {s.value}
            </p>
            <p className="mt-1 font-mono text-[10px] text-(--color-text-tertiary)">
              {s.variable}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-background-secondary) p-5">
        <p className="text-[11px] text-(--color-text-tertiary) leading-relaxed">
          Dark mode: shadows are replaced with border + background-lift. Same
          tokens, different rendering.
        </p>
      </div>
    </div>
  );
}
