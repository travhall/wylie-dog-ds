import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MotionPreview } from "../motion-preview";

export default function MotionPage() {
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
          Motion
        </span>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-text-primary)">
          Four curves and three durations{" "}
          <span style={{ color: "var(--color-interactive-primary)" }}>
            cover everything.
          </span>
        </h1>
        <p className="mt-3 text-(--color-text-secondary) leading-relaxed">
          Standard for persistent UI, emphasized for key moments, decelerate for
          entrances, accelerate for exits. Pick a duration from the scale — the
          curve does the rest.
        </p>
      </div>

      <MotionPreview />
    </div>
  );
}
