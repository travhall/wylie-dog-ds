import Link from "next/link";
import { Button } from "@wyliedog/ui/button";

export function CtaSection() {
  return (
    <section className="border-b border-(--color-border-default)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <div className="flex-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
              Ready to wire tokens into your codebase?
            </h2>
            <p className="mt-2 text-(--color-foreground-muted) max-w-xl">
              Install the package or pull tokens straight into Figma with Token
              Bridge — both consume the exact same contract you saw on this
              page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/components">
              <Button
                size="sm"
                className="h-10 rounded-md px-4 font-semibold gap-1.5"
              >
                Browse components
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
            <Link href="/plugin">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-md px-4"
              >
                Open Token Bridge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
