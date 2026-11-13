import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";

export function RadiusSection() {
  return (
    <section
      id="radius"
      className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Radius
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              Five corners.{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                Every surface
              </span>{" "}
              already knows which.
            </h2>
            <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
              Radius isn&apos;t a design decision at use-time — it&apos;s
              encoded in the token. Every component surface resolves to its
              semantic radius automatically.
            </p>
          </div>
          <Link href="/tokens/borders">
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All{" "}
              {Object.keys(manifest.primitives.borderRadius).length +
                Object.keys(manifest.primitives.borderWidth).length}{" "}
              radius and border tokens →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              step: "sm",
              px: "2px",
              surface: "Tags & chips",
              token: "--border-radius-sm",
              preview: (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {["Design", "Systems", "OKLCH"].map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[0.6875rem] font-mono border border-(--color-border-default) text-(--color-foreground-muted)"
                      style={{ borderRadius: "var(--border-radius-sm)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              step: "md",
              px: "4px",
              surface: "Buttons & inputs",
              token: "--border-radius-md",
              preview: (
                <Button
                  size="sm"
                  style={{ borderRadius: "var(--border-radius-md)" }}
                >
                  Continue
                </Button>
              ),
            },
            {
              step: "lg",
              px: "8px",
              surface: "Menus & popovers",
              token: "--border-radius-lg",
              preview: (
                <div
                  className="border border-(--color-border-default) bg-(--color-background-default) w-full shadow-sm text-sm"
                  style={{
                    borderRadius: "var(--border-radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  {["Edit", "Duplicate", "Archive"].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-2 text-(--color-foreground-muted) text-xs ${i < 2 ? "border-b border-(--color-border-default)" : ""} ${i === 0 ? "text-(--color-foreground-default)" : ""}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              step: "xl",
              px: "12px",
              surface: "Cards & tiles",
              token: "--border-radius-xl",
              preview: (
                <div
                  className="border border-(--color-border-default) bg-(--color-background-default) p-3 w-full"
                  style={{ borderRadius: "var(--border-radius-xl)" }}
                >
                  <p className="font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                    Pro plan
                  </p>
                  <p className="font-serif text-lg font-semibold text-(--color-foreground-default) mt-0.5">
                    $49
                    <span className="text-sm font-sans font-normal text-(--color-foreground-faint)">
                      /mo
                    </span>
                  </p>
                  <div className="mt-2 rounded-full h-1.5 bg-(--color-border-default) overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "68%",
                        background: "var(--color-background-primary)",
                      }}
                    />
                  </div>
                  <p className="font-mono text-[0.5625rem] text-(--color-foreground-faint) mt-1">
                    68% of limit used
                  </p>
                </div>
              ),
            },
            {
              step: "2xl",
              px: "16px",
              surface: "Modals & sheets",
              token: "--border-radius-2xl",
              preview: (
                <div
                  className="border border-(--color-border-default) bg-(--color-background-default) p-3 w-full shadow-md"
                  style={{ borderRadius: "var(--border-radius-2xl)" }}
                >
                  <p className="text-sm font-semibold text-(--color-foreground-default) mb-2">
                    Invite teammate
                  </p>
                  <div
                    className="rounded-md border border-(--color-border-default) bg-(--color-background-muted) px-2.5 py-1.5 text-xs text-(--color-foreground-faint) mb-2"
                    style={{ borderRadius: "var(--border-radius-lg)" }}
                  >
                    name@company.com
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      style={{ borderRadius: "var(--border-radius-lg)" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      style={{ borderRadius: "var(--border-radius-lg)" }}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              ),
            },
          ].map((r) => (
            <Card key={r.step} className="gap-0 rounded-xl p-5 shadow-none">
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-semibold text-(--color-foreground-default)">
                  {r.step}
                </span>
                <span className="font-mono text-xs text-(--color-foreground-faint)">
                  {r.px}
                </span>
              </div>
              <div
                data-mock
                className="flex-1 flex items-center justify-center py-4"
              >
                {r.preview}
              </div>
              <div className="mt-4 pt-4 border-t border-(--color-border-default)">
                <p className="text-xs text-(--color-foreground-muted)">
                  {r.surface}
                </p>
                <p className="font-mono text-xs text-(--color-foreground-faint) mt-0.5">
                  {r.token}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
