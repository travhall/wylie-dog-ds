import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";
import { SpacingDemo } from "../spacing-demo";

export function SpacingSection() {
  const composedSpacingTokens = [
    manifest.components.card["card-padding"],
    manifest.components.input["input-padding-x"],
  ].map((token) => `--space-${token.path.join("-")}: ${token.value}`);

  return (
    <section
      id="spacing"
      className="border-b border-(--color-border-default) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Spacing
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              One scale. Three densities.{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                Same data.
              </span>
            </h2>
            <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
              The 4-pixel base scale powers every gap, padding, and inset in the
              system. Switch density on this real members table — every gutter,
              row height, and avatar size re-resolves through the same tokens.
            </p>
          </div>
          <Link href="/tokens/spacing">
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All {Object.keys(manifest.primitives.spacing).length} spacing
              tokens →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8">
            <SpacingDemo />
          </div>

          {/* Spacing scale panel */}
          <Card className="gap-0 lg:col-span-4 rounded-xl p-5 shadow-none">
            <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-4">
              Scale · --space-*
            </p>
            <div className="space-y-2">
              {[
                { step: "050", px: 4 },
                { step: "100", px: 8 },
                { step: "150", px: 12 },
                { step: "200", px: 16, inUse: true },
                { step: "300", px: 24 },
                { step: "400", px: 32 },
                { step: "500", px: 40 },
                { step: "600", px: 48 },
                { step: "700", px: 64 },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 rounded-md ${s.inUse ? "px-2 py-1 -mx-2" : ""}`}
                  style={
                    s.inUse
                      ? {
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
                        }
                      : undefined
                  }
                >
                  <span className="font-mono text-xs w-4 text-(--color-foreground-faint) shrink-0">
                    {s.step}
                  </span>
                  <div
                    className="relative"
                    style={{ height: "0.5rem", width: "7.5rem" }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 origin-left rounded-sm w-full"
                      style={{
                        background: s.inUse
                          ? "var(--color-background-primary)"
                          : "var(--color-border-default)",
                        transform: `scaleX(${Math.min(s.px * 2.5, 120) / 120})`,
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-xs ml-auto shrink-0"
                    style={{
                      color: s.inUse
                        ? "var(--color-foreground-primary-muted)"
                        : "var(--color-foreground-faint)",
                    }}
                  >
                    {s.px}px{s.inUse ? " · in use" : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-(--color-border-default) space-y-1 font-mono text-xs text-(--color-foreground-faint)">
              <p className="text-(--color-foreground-muted) mb-2">
                Composed tokens
              </p>
              {composedSpacingTokens.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
