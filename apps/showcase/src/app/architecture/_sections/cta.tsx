import Link from "next/link";
import { Button, buttonVariants } from "@wyliedog/ui/button";

export function CtaSection() {
  return (
    <section className="border-b border-(--color-border-default)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="glass rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <div className="flex-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
              Everything wires together at install time.
            </h2>
            <p className="mt-2 text-(--color-foreground-muted) max-w-xl">
              Two packages. One install. Everything flows through the
              Figma-to-git path, and ends up in the same place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="https://wyliedogstorybook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="h-10 rounded-md px-4 font-semibold gap-1.5"
              >
                Open Storybook
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </Button>
            </a>
            <Link href="/plugin">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-md px-4"
              >
                Token Bridge to Figma →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
