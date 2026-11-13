import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function PatternsSection() {
  const meta = getShowcaseMeta();

  return (
    <section className="border-b border-(--color-border-default)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Patterns
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              From components to compositions.
            </h2>
            <p className="mt-3 text-(--color-foreground-muted)">
              {meta.patterns.count} reference patterns that show how the
              primitives compose into the screens you actually ship — auth
              flows, form compositions, layout shells, page compositions, and
              more.
            </p>
          </div>
          <Link href="/patterns">
            <Button
              variant="outline"
              className="h-9 rounded-md px-3.5 text-sm font-medium gap-1.5"
            >
              All patterns
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* 3 large pattern cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Layout */}
          <Link
            href="/patterns#cat-layout"
            className="group rounded-xl border border-(--color-border-muted) overflow-hidden flex flex-col hover:border-(--color-border-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="relative aspect-16/10 grid-bg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
                }}
              />
              <div className="absolute inset-3 flex gap-2">
                <div className="w-1/4 rounded-md glass-dark p-2 space-y-1">
                  <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-muted)" />
                  <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-muted)" />
                  <div
                    className="h-1.5 w-3/4 rounded-full"
                    style={{
                      background: "var(--color-background-accent)",
                    }}
                  />
                  <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-muted)" />
                </div>
                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-1.5">
                  <div className="rounded-md glass-dark" />
                  <div className="rounded-md glass-dark" />
                  <div className="col-span-2 row-span-2 rounded-md glass-dark p-2 flex items-end gap-1">
                    {[33, 50, 67, 50, 75, 100, 67].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: "var(--color-background-primary)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  Layout
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-(--color-foreground-faint) group-hover:text-(--color-foreground-primary-muted) transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </div>
              <h3 className="mt-2 font-semibold">Layout Patterns</h3>
              <p className="text-sm text-(--color-foreground-muted) mt-0.5">
                Page shell, sidebar, content area — collapses to a sheet below
                lg.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["Card", "NavigationMenu", "Sheet"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border border-(--color-border-default) px-2 py-0.5 font-mono text-xs text-(--color-foreground-muted)"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Auth */}
          <Link
            href="/patterns#cat-auth"
            className="group rounded-xl border border-(--color-border-muted) overflow-hidden flex flex-col hover:border-(--color-border-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="relative aspect-16/10 grid-bg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-3/4 rounded-md glass-dark p-3 space-y-2">
                  <div className="h-2 w-1/3 rounded-full bg-(--color-background-muted)" />
                  <div className="h-5 rounded border border-(--color-border-default) bg-(--color-background-default)" />
                  <div className="h-5 rounded border border-(--color-border-default) bg-(--color-background-default)" />
                  <div
                    className="h-5 rounded"
                    style={{
                      background: "var(--color-background-primary)",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  Form
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-(--color-foreground-faint) group-hover:text-(--color-foreground-primary-muted) transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </div>
              <h3 className="mt-2 font-semibold">Login &amp; Registration</h3>
              <p className="text-sm text-(--color-foreground-muted) mt-0.5">
                Sign-in, registration, social auth. Same schema, three layouts.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["Form", "Input", "+3"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border border-(--color-border-default) px-2 py-0.5 font-mono text-xs text-(--color-foreground-muted)"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <Link
            href="/patterns#cat-nav"
            className="group rounded-xl border border-(--color-border-muted) overflow-hidden flex flex-col hover:border-(--color-border-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="relative aspect-16/10 grid-bg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "color-mix(in oklch, var(--color-background-primary) 8%, transparent)",
                }}
              />
              <div className="absolute inset-0 grid place-items-center px-4">
                <div className="w-full rounded-md glass-dark p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-(--color-foreground-faint)"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <div className="h-2 w-1/3 rounded-full bg-(--color-background-muted)" />
                    <span className="ml-auto kbd kbd-sm">esc</span>
                  </div>
                  <div className="h-px w-full bg-(--color-border-default)" />
                  <div
                    className="rounded p-1"
                    style={{
                      background:
                        "color-mix(in oklch, var(--color-background-primary) 18%, transparent)",
                    }}
                  >
                    <div
                      className="h-1.5 w-1/2 rounded-full"
                      style={{
                        background: "var(--color-background-accent)",
                      }}
                    />
                  </div>
                  <div className="h-1.5 w-2/3 rounded-full bg-(--color-background-muted) ml-1" />
                  <div className="h-1.5 w-1/2 rounded-full bg-(--color-background-muted) ml-1" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                  Navigation
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-(--color-foreground-faint) group-hover:text-(--color-foreground-primary-muted) transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </div>
              <h3 className="mt-2 font-semibold">Site Header</h3>
              <p className="text-sm text-(--color-foreground-muted) mt-0.5">
                Sticky nav, search trigger, theme toggle — used on this very
                page.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["NavigationMenu", "Command", "+2"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border border-(--color-border-default) px-2 py-0.5 font-mono text-xs text-(--color-foreground-muted)"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        {/* Row 2: 6 small cards */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-6 gap-2">
          {[
            {
              cat: "Data",
              label: "Card Grid",
              sub: "Paginated · filterable",
              href: "/patterns#cat-data",
            },
            {
              cat: "Data",
              label: "Feature Grid",
              sub: "2×2 · 3×2 · 4×1",
              href: "/patterns#cat-data",
            },
            {
              cat: "Form",
              label: "Form Compositions",
              sub: "Multi-field · stepped",
              href: "/patterns#cat-forms",
            },
            {
              cat: "Form",
              label: "Form Validation",
              sub: "Error · async · success",
              href: "/patterns#cat-forms",
            },
            {
              cat: "Feedback",
              label: "Error Boundary",
              sub: "Page · component scope",
              href: "/patterns#cat-feedback",
            },
            {
              cat: "Responsive",
              label: "Responsive Patterns",
              sub: "Mobile · tablet · desktop",
              href: "/patterns#cat-responsive",
            },
          ].map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className="rounded-lg border border-(--color-border-muted) p-4 hover:border-(--color-border-default) transition-all"
              style={{ background: "var(--color-background-default)" }}
            >
              <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                {p.cat}
              </span>
              <p className="mt-2 text-sm font-semibold">{p.label}</p>
              <p className="text-xs text-(--color-foreground-faint) mt-0.5">
                {p.sub}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
