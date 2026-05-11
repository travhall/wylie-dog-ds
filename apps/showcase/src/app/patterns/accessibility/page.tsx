import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Accessibility, ExternalLink, ArrowLeft } from "lucide-react";
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

export default function AccessibilityPatternsPage() {
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
          <div className="p-3 bg-(--color-interactive-primary)/10 rounded-2xl">
            <Accessibility className="h-8 w-8 text-(--color-interactive-primary)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Accessibility Patterns
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              1 pattern — WCAG 2.1 AA reference implementation
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Reference implementations demonstrating WCAG 2.1 AA compliance,
          correct ARIA usage, focus management, and screen reader compatibility.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Accessibility Patterns"
          description="Comprehensive accessibility reference: properly labeled form fields, live regions for dynamic content, focus trap in modals, and keyboard-navigable interactive components."
          components={["Form", "Alert", "Input", "Button", "Dialog"]}
          storybookPath="/story/patterns-accessibility-accessibility-patterns--default"
        />
      </div>

      <div className="glass rounded-3xl p-8 border border-(--color-border-primary)/10 space-y-4">
        <h2 className="text-xl font-bold text-(--color-text-primary)">
          Accessibility Standards
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "WCAG 2.1 AA",
              description:
                "All patterns meet or exceed minimum accessibility guidelines.",
            },
            {
              label: "WAI-ARIA",
              description:
                "Correct ARIA roles, states, and properties on interactive elements.",
            },
            {
              label: "Keyboard Navigation",
              description:
                "Full keyboard operability with visible focus indicators.",
            },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
              >
                {item.label}
              </Badge>
              <p className="text-sm text-(--color-text-secondary)">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
