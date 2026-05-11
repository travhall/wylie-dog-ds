import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Layers, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STORYBOOK_BASE = "http://localhost:6006";

interface PatternCardProps {
  name: string;
  description: string;
  components: string[];
  storybookPath: string;
}

function PatternCard({
  name,
  description,
  components,
  storybookPath,
}: PatternCardProps) {
  return (
    <Card className="glass border border-(--color-border-primary)/10 hover:border-(--color-interactive-primary)/30 transition-all duration-500">
      <CardHeader className="p-6">
        <CardTitle className="text-xl font-bold text-(--color-text-primary) mb-2">
          {name}
        </CardTitle>
        <p className="text-sm text-(--color-text-secondary) leading-relaxed">
          {description}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-(--color-text-secondary) mb-2">
            Components used
          </p>
          <div className="flex flex-wrap gap-1.5">
            {components.map((comp) => (
              <Badge
                key={comp}
                variant="outline"
                className="text-[10px] border-(--color-border-primary)/20"
              >
                {comp}
              </Badge>
            ))}
          </div>
        </div>
        <a
          href={`${STORYBOOK_BASE}?path=${storybookPath}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            View in Storybook
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

export default function CompositionsPage() {
  return (
    <div className="space-y-12 py-8">
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
          description="A full-page scaffold combining a site header, main content area with sidebar, card content blocks, and a site footer."
          components={["PageLayout", "SiteHeader", "SiteFooter", "Card"]}
          storybookPath="/story/patterns-page-compositions-page-layout--default"
        />
        <PatternCard
          name="Section: Features"
          description="Marketing feature section with an icon-driven grid, badge labels, and a call-to-action button row. Suitable for landing pages."
          components={["FeatureGrid", "Badge", "Button"]}
          storybookPath="/story/patterns-page-compositions-section-features--default"
        />
        <PatternCard
          name="Section: Hero"
          description="Full-width hero section with headline, subhead, badge tag, and primary/secondary CTA buttons. Includes decorative gradient background."
          components={["Button", "Badge"]}
          storybookPath="/story/patterns-page-compositions-section-hero--default"
        />
      </div>
    </div>
  );
}
