import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@wyliedog/ui/button";

export default function ElevationPage() {
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
          Five shadow steps —{" "}
          <span style={{ color: "var(--color-interactive-primary)" }}>one</span>{" "}
          stacking story.
        </h1>
        <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
          Each step encodes both a shadow value and a semantic z-axis role. The
          scene below reflects honest stacking order.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-3">
        {/* Layered scene */}
        <div
          className="lg:col-span-8 rounded-xl border border-(--color-border-primary) bg-(--color-background-secondary) overflow-hidden relative grid-bg"
          style={{ minHeight: "480px" }}
        >
          <div
            className="relative w-full h-full p-8"
            style={{ minHeight: "480px" }}
          >
            {/* Base card */}
            <div className="absolute top-10 left-8 w-56 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-4 shadow-sm">
              <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                xs · base
              </div>
              <p className="font-mono text-[10px] text-(--color-text-tertiary)">
                packages/ui
              </p>
              <p className="font-semibold text-sm text-(--color-text-primary) mt-1">
                Button.tsx
              </p>
              <div
                className="mt-2 h-1 rounded-full"
                style={{
                  background: "var(--color-interactive-primary)",
                  width: "60%",
                }}
              />
            </div>
            {/* Popover */}
            <div
              className="absolute top-8 left-52 w-48 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-3"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                md · popover
              </div>
              {["View changelog", "Copy token", "Open in Figma"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`px-2 py-1.5 text-xs rounded-md text-(--color-text-secondary) ${i === 0 ? "bg-(--color-background-secondary) text-(--color-text-primary)" : ""}`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
            {/* Toast */}
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-3 flex items-center gap-3"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                lg · toast
              </div>
              <span
                className="h-6 w-6 rounded-full grid place-items-center shrink-0"
                style={{ background: "oklch(60% 0.14 155)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-(--color-text-inverse)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </span>
              <p className="text-xs font-medium text-(--color-text-primary)">
                Tokens published · v1.4.1
              </p>
            </div>
            {/* Modal */}
            <div
              className="absolute bottom-8 right-8 w-56 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-4"
              style={{ boxShadow: "var(--shadow-xl)" }}
            >
              <div className="absolute -top-2.5 left-3 glass-dark rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-(--color-text-secondary)">
                xl · modal
              </div>
              <p className="text-sm font-semibold text-(--color-text-primary) mb-3">
                Invite teammate
              </p>
              <div className="rounded-md border border-(--color-border-primary) bg-(--color-background-secondary) px-2.5 py-1.5 text-xs text-(--color-text-tertiary) mb-2">
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
        <div className="lg:col-span-4 rounded-xl border border-(--color-border-primary) bg-(--color-background-primary) p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary) mb-4">
            Elevation ladder
          </p>
          <div className="space-y-3">
            {[
              {
                level: "xs · base",
                shadow: "0 1px 3px rgba(0,0,0,.08)",
                role: "Cards, panels",
                token: "--shadow-xs",
              },
              {
                level: "sm · raised",
                shadow: "0 2px 8px -1px rgba(0,0,0,.12)",
                role: "Raised elements",
                token: "--shadow-sm",
              },
              {
                level: "md · popover",
                shadow: "0 4px 12px -2px rgba(0,0,0,.15)",
                role: "Menus, popovers",
                token: "--shadow-md",
              },
              {
                level: "lg · toast",
                shadow: "0 8px 24px -4px rgba(0,0,0,.20)",
                role: "Toasts, drawers",
                token: "--shadow-lg",
              },
              {
                level: "xl · modal",
                shadow: "0 16px 48px -8px rgba(0,0,0,.28)",
                role: "Modals, spotlights",
                token: "--shadow-xl",
              },
            ].map((e) => (
              <div key={e.level} className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg border border-(--color-border-primary) bg-(--color-background-primary) shrink-0"
                  style={{ boxShadow: e.shadow }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] text-(--color-text-primary)">
                    {e.level}
                  </p>
                  <p className="text-[11px] text-(--color-text-tertiary)">
                    {e.role}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-(--color-text-tertiary) shrink-0">
                  {e.token}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 pt-4 border-t border-(--color-border-primary) text-[11px] text-(--color-text-tertiary) leading-relaxed">
            Dark mode: shadows are replaced with border + background-lift. Same
            tokens, different rendering.
          </p>
        </div>
      </div>
    </div>
  );
}
