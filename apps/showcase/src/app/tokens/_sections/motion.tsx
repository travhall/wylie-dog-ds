import Link from "next/link";
import { Button } from "@wyliedog/ui/button";
import manifest from "@wyliedog/tokens/manifest.json";
import { MotionPreview } from "../motion-preview";

export function MotionSection() {
  return (
    <section
      id="motion"
      className="border-b border-(--color-border-default) bg-(--color-background-muted) scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Motion
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              {Object.keys(manifest.semantics.easing).length} curves and{" "}
              {Object.keys(manifest.semantics.duration).length} durations{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                cover everything.
              </span>
            </h2>
            <p className="mt-3 text-(--color-foreground-muted) leading-relaxed">
              A default curve for most transitions, ease-out (decelerate) for
              entrances, ease-in (accelerate) for exits, and ease-in-out for
              symmetric moves. Pick a duration from the scale — the curve does
              the rest.
            </p>
          </div>
          <Link href="/tokens/motion">
            <Button variant="outline" size="sm" className="rounded-md shrink-0">
              All{" "}
              {Object.keys(manifest.semantics.easing).length +
                Object.keys(manifest.semantics.duration).length +
                Object.keys(manifest.primitives.duration).length}{" "}
              motion tokens →
            </Button>
          </Link>
        </div>

        <MotionPreview />
      </div>
    </section>
  );
}
