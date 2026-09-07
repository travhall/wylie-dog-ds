import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatternCard } from "@/components/pattern-card";

export default function FeedbackPatternsPage() {
  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/patterns"
          className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          All Patterns
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-(--color-interactive-danger)/10 rounded-2xl">
            <Bell className="h-8 w-8 text-(--color-interactive-danger)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Feedback Patterns
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              1 pattern — Error boundary and graceful degradation
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Patterns for communicating system state to users — errors, retries,
          and graceful fallbacks with accessible announcements.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Error Boundary Patterns"
          description="Complete error boundary composition with an informative alert, contextual card, and retry action button. Handles 404, 500, and network error states."
          components={["Alert", "Button", "Card"]}
          storybookPath="/story/patterns-feedback-patterns-error-boundary-patterns--default"
        />
      </div>
    </div>
  );
}
