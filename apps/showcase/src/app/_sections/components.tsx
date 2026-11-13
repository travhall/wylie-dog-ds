import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function ComponentsSection() {
  const meta = getShowcaseMeta();

  const categoryCount = (dirName: string) =>
    meta.componentCategories.find((c) => c.dirName === dirName)?.count ?? 0;

  return (
    <section className="border-b border-(--color-border-default) bg-(--color-background-muted)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Components
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              {meta.components.count} typed React components.
            </h2>
            <p className="mt-3 text-(--color-foreground-muted)">
              Headless primitives, fully composable, accessible by default.
              Every component ships with TypeScript types, a test file and a
              Storybook story.
            </p>
          </div>
          <Link href="/components">
            <Button
              variant="outline"
              className="h-9 rounded-md px-3.5 text-sm font-medium gap-1.5"
            >
              All components
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Foundations/Button */}
          <Link
            href="/components#inputs"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Inputs &amp; Controls
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Inputs-Controls")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Button</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Default, secondary, outline, ghost, link, destructive.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className="inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold"
                style={{
                  background: "var(--color-background-primary)",
                  color: "var(--color-foreground-primary)",
                }}
              >
                Save changes
              </span>
              <span className="inline-flex h-8 items-center rounded-md border border-(--color-border-default) px-3 text-xs font-semibold text-(--color-foreground-default)">
                Cancel
              </span>
              <span className="inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold text-(--color-foreground-muted) hover:bg-(--color-background-muted) transition-colors">
                Skip
              </span>
            </div>
          </Link>

          {/* Forms/Input */}
          <Link
            href="/components#inputs"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Inputs &amp; Controls
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Inputs-Controls")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Input</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Any native input type, with error and success states.
            </p>
            <div data-mock aria-hidden="true" className="mt-5 space-y-2">
              <label className="block text-[0.6875rem] font-medium text-(--color-foreground-muted)">
                Email
              </label>
              <div className="flex h-9 items-center gap-2 rounded-md border border-(--color-border-default) bg-(--color-background-muted) px-3">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-(--color-foreground-faint)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <span className="text-xs text-(--color-foreground-default)">
                  travis@wyliedog.dev
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation/Tabs */}
          <Link
            href="/components#navigation"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Navigation
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Navigation")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Tabs</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Tabbed panels in three sizes.
            </p>
            <div className="mt-5">
              <div className="flex border-b border-(--color-border-default) text-xs">
                <span
                  className="-mb-px border-b-2 px-3 py-2 font-medium"
                  style={{
                    borderColor: "var(--color-background-accent)",
                    color: "var(--color-foreground-default)",
                  }}
                >
                  Overview
                </span>
                <span className="px-3 py-2 text-(--color-foreground-faint)">
                  Activity
                </span>
                <span className="px-3 py-2 text-(--color-foreground-faint)">
                  Members
                </span>
              </div>
            </div>
          </Link>

          {/* Overlays/Dialog */}
          <Link
            href="/components#overlays"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Overlays &amp; Popovers
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Overlays-Popovers")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Dialog</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Modal dialog with header, footer and overlay.
            </p>
            <div data-mock aria-hidden="true" className="mt-5 relative h-27.5">
              <div className="absolute inset-x-2 top-2 rounded-md border border-(--color-border-default) bg-(--color-background-muted) p-3 opacity-60">
                <div className="h-2 w-20 rounded-full bg-(--color-background-muted)" />
                <div className="mt-2 h-2 w-32 rounded-full bg-(--color-background-muted)" />
              </div>
              <div
                className="absolute inset-x-0 top-6 rounded-md border border-(--color-border-default) p-3 shadow-lg"
                style={{ background: "var(--color-background-default)" }}
              >
                <p className="text-xs font-semibold">Delete project?</p>
                <p className="text-[0.6875rem] text-(--color-foreground-faint) mt-0.5">
                  This cannot be undone.
                </p>
                <div className="mt-2 flex justify-end gap-1.5">
                  <span className="inline-flex h-6 items-center rounded border border-(--color-border-default) px-2 text-[0.625rem] font-medium">
                    Cancel
                  </span>
                  <span
                    className="inline-flex h-6 items-center rounded px-2 text-[0.625rem] font-semibold"
                    style={{
                      background: "var(--color-background-danger)",
                      color: "var(--color-foreground-danger)",
                    }}
                  >
                    Delete
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Data Display/Table */}
          <Link
            href="/components#content-display"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Content Display
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Content-Display")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Table</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Header, body and footer parts in a scrollable wrapper.
            </p>
            <div
              data-mock
              aria-hidden="true"
              className="mt-5 rounded-md border border-(--color-border-default) overflow-hidden text-xs"
            >
              <div className="grid grid-cols-3 bg-(--color-background-muted) px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-wider text-(--color-foreground-faint)">
                <span>Name</span>
                <span>Role</span>
                <span className="text-right">Status</span>
              </div>
              <div className="grid grid-cols-3 px-3 py-2 border-t border-(--color-border-default)">
                <span>Elena Mori</span>
                <span className="text-(--color-foreground-muted)">Lead</span>
                <span className="text-right">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.5625rem] font-medium"
                    style={{
                      background: "var(--color-background-success-muted)",
                      color: "var(--color-foreground-success-muted)",
                    }}
                  >
                    Active
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 px-3 py-2 border-t border-(--color-border-default)">
                <span>Jude Reyes</span>
                <span className="text-(--color-foreground-muted)">Eng</span>
                <span className="text-right text-(--color-foreground-faint)">
                  —
                </span>
              </div>
            </div>
          </Link>

          {/* Feedback/Alert */}
          <Link
            href="/components#feedback"
            className="group rounded-lg border border-(--color-border-muted) p-5 flex flex-col hover:border-(--color-border-default) hover:bg-(--color-background-default) transition-all"
            style={{ background: "var(--color-background-default)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                Feedback &amp; Status
              </p>
              <span className="font-mono text-xs text-(--color-foreground-faint)">
                {categoryCount("Feedback-Status")}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">Alert</h3>
            <p className="text-sm text-(--color-foreground-muted) mt-0.5">
              Default, success, warning, destructive.
            </p>
            <div data-mock aria-hidden="true" className="mt-5 space-y-1.5">
              <div
                className="flex items-start gap-2 rounded-md border px-3 py-2"
                style={{
                  borderColor:
                    "color-mix(in oklch, var(--color-foreground-success-muted) 35%, transparent)",
                  background:
                    "color-mix(in oklch, var(--color-foreground-success-muted) 10%, transparent)",
                }}
              >
                <span
                  className="grid h-4 w-4 mt-px place-items-center rounded-full shrink-0"
                  style={{
                    background: "var(--color-foreground-success-muted)",
                    color: "var(--color-foreground-success)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-[0.6875rem] font-semibold">Build passed</p>
                  <p className="text-[0.625rem] text-(--color-foreground-muted)">
                    Typecheck, lint and tests
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
