import manifest from "@wyliedog/tokens/manifest.json";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BordersPage() {
  const { primitives } = manifest;

  const borderPrimitives = {
    radius: Object.entries(primitives.borderRadius || {}).map(
      ([name, token]: [string, any]) => ({
        name,
        value: token.value,
        var: token.variable,
      })
    ),
    width: Object.entries(primitives.borderWidth || {}).map(
      ([name, token]: [string, any]) => ({
        name,
        value: token.value,
        var: token.variable,
      })
    ),
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 p-4 lg:p-8 xl:p-12">
      <Link
        href="/tokens"
        className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tokens
      </Link>
      <section className="space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
          04 · Radius
        </span>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-(--color-text-primary)">
          Five corners.{" "}
          <span style={{ color: "var(--color-interactive-primary)" }}>
            Every surface
          </span>{" "}
          already knows which.
        </h1>
        <p className="mt-3 text-lg text-(--color-text-secondary) leading-relaxed">
          Every radius and border-width token, in full — the complete reference
          behind the hub's five-corner sample.
        </p>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="glass p-8 rounded-[40px] border-(--color-border-primary)/5">
          <h3 className="text-xl font-bold mb-8 text-(--color-text-primary)">
            Corner Radius
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {borderPrimitives.radius.map((r) => (
              <div
                key={r.name}
                className="space-y-3 flex flex-col items-center"
              >
                <div
                  className="w-full aspect-square bg-(--color-interactive-primary)/10 border border-(--color-interactive-primary)/20"
                  style={{ borderRadius: r.value }}
                />
                <div className="text-center">
                  <div className="text-xs font-bold text-(--color-text-primary)">
                    {r.name}
                  </div>
                  <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60 text-center">
                    {r.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-(--color-border-primary)/5">
          <h3 className="text-xl font-bold mb-8 text-(--color-text-primary)">
            Border Width
          </h3>
          <div className="space-y-6">
            {borderPrimitives.width.map((w) => (
              <div key={w.name} className="flex items-center gap-4">
                <div className="w-16 text-xs font-bold text-(--color-text-primary)">
                  {w.name}
                </div>
                <div
                  className="flex-1 h-10 bg-(--color-background-primary) rounded-lg"
                  style={{
                    border: `${w.value} solid var(--color-interactive-primary)`,
                  }}
                />
                <div className="text-[10px] font-mono text-(--color-text-tertiary) opacity-60">
                  {w.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
