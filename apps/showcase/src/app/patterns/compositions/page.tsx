import { getPatternDocsPath } from "@/lib/showcase-metadata";
import { Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatternCard } from "@/components/pattern-card";

export default function CompositionsPage() {
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
          <div className="p-3 bg-(--color-text-success)/10 rounded-2xl">
            <Layers className="h-8 w-8 text-(--color-text-success)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Page Compositions
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              3 patterns — Full page layouts and section building blocks
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Complete page-level compositions assembled from multiple components —
          hero sections, feature showcases, and full page layouts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PatternCard
          name="Page Layout"
          description="Full-page layout with header, footer, sidebar and main content, with width variants and a left or right sidebar."
          components={["PageLayout", "SiteHeader", "SiteFooter", "Button"]}
          storybookPath={getPatternDocsPath("page-layout") ?? "/"}
        />
        <PatternCard
          name="Section: Features"
          description="Features section built on FeatureGrid, with optional badges, several column configurations and style variants."
          components={["SectionFeatures"]}
          storybookPath={getPatternDocsPath("section-features") ?? "/"}
        />
        <PatternCard
          name="Section: Hero"
          description="Hero section with title, description, action buttons and an optional badge or image, in default, gradient and centered layouts."
          components={["SectionHero"]}
          storybookPath={getPatternDocsPath("section-hero") ?? "/"}
        />
      </div>
    </div>
  );
}
