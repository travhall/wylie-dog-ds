import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import manifest from "@wyliedog/tokens/manifest.json";

export function ElevationSection() {
  return (
    <section
      id="elevation"
      className="border-b border-(--color-border-default) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Elevation
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              {Object.keys(manifest.semantics.shadow).length} shadow steps —{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                one
              </span>{" "}
              stacking story.
            </h2>
            <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
              Each step encodes both a shadow value and a semantic z-axis role.
              The scene below reflects honest stacking order.
            </p>
          </div>
          <Link href="/tokens/elevation">
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All {Object.keys(manifest.semantics.shadow).length} shadow tokens
              →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Layered scene */}
          <div
            data-mock
            className="lg:col-span-8 rounded-xl border border-(--color-border-default) bg-(--color-background-muted) overflow-hidden relative grid-bg"
            style={{ minHeight: "30rem" }}
          >
            <div
              className="relative w-full h-full p-8"
              style={{ minHeight: "30rem" }}
            >
              {/* Base card */}
              <div className="absolute top-10 left-8 w-56 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-4 shadow-sm">
                <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-muted)">
                  xs · base
                </div>
                <p className="font-mono text-[0.625rem] text-(--color-foreground-faint)">
                  packages/ui
                </p>
                <p className="font-semibold text-sm text-(--color-foreground-default) mt-1">
                  Button.tsx
                </p>
                <div
                  className="mt-2 h-1 rounded-full"
                  style={{
                    background: "var(--color-background-primary)",
                    width: "60%",
                  }}
                />
              </div>
              {/* Popover */}
              <div
                className="absolute top-8 left-52 w-48 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-3"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-muted)">
                  md · popover
                </div>
                {["View changelog", "Copy token", "Open in Figma"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`px-2 py-1.5 text-xs rounded-md text-(--color-foreground-muted) ${i === 0 ? "bg-(--color-background-muted) text-(--color-foreground-default)" : ""}`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
              {/* Toast */}
              <div
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-3 flex items-center gap-3"
                style={{ boxShadow: "var(--shadow-lg)" }}
              >
                <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-muted)">
                  lg · toast
                </div>
                <span
                  className="h-6 w-6 rounded-full grid place-items-center shrink-0"
                  style={{
                    background: "var(--color-foreground-success-muted)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 text-(--color-foreground-inverse)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                <p className="text-xs font-medium text-(--color-foreground-default)">
                  Tokens published · v1.4.1
                </p>
              </div>
              {/* Modal */}
              <div
                className="absolute bottom-8 right-8 w-56 rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-4"
                style={{ boxShadow: "var(--shadow-xl)" }}
              >
                <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-(--color-foreground-muted)">
                  xl · modal
                </div>
                <p className="text-sm font-semibold text-(--color-foreground-default) mb-3">
                  Invite teammate
                </p>
                <div className="rounded-md border border-(--color-border-default) bg-(--color-background-muted) px-2.5 py-1.5 text-xs text-(--color-foreground-faint) mb-2">
                  name@company.com
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1">
                    Send invite
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Elevation ladder */}
          <Card className="gap-0 lg:col-span-4 rounded-xl p-5 shadow-none">
            <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-4">
              Elevation ladder
            </p>
            <div className="space-y-3">
              {[
                {
                  level: "sm",
                  role: "Cards, tabs, feature icons",
                  token: "--shadow-sm",
                },
                {
                  level: "base",
                  role: "Raised elements",
                  token: "--shadow-base",
                },
                {
                  level: "md",
                  role: "Menus, popovers, tooltips",
                  token: "--shadow-md",
                },
                {
                  level: "lg",
                  role: "Toasts, dialogs",
                  token: "--shadow-lg",
                },
                {
                  level: "xl",
                  role: "Largest floating surfaces",
                  token: "--shadow-xl",
                },
              ].map((e) => (
                <div key={e.level} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg border border-(--color-border-default) bg-(--color-background-default) shrink-0"
                    style={{ boxShadow: `var(${e.token})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-(--color-foreground-default)">
                      {e.level}
                    </p>
                    <p className="text-xs text-(--color-foreground-faint)">
                      {e.role}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-(--color-foreground-faint) shrink-0">
                    {e.token}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 pt-4 border-t border-(--color-border-default) text-xs text-(--color-foreground-faint) leading-relaxed">
              Dark mode redefines the same shadow tokens with higher opacity
              (0.3 to 0.4 instead of 0.05 to 0.1).
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
