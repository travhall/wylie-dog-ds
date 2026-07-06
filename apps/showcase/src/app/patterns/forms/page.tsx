import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { FormInput, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STORYBOOK_BASE = "https://wyliedogstorybook.com";

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

export default function FormPatternsPage() {
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
            <FormInput className="h-8 w-8 text-(--color-text-success)" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
              Form Patterns
            </h1>
            <p className="text-(--color-text-secondary) mt-1">
              2 patterns — Compositions and validation
            </p>
          </div>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl pt-2">
          Complex form patterns demonstrating field grouping, conditional
          inputs, and real-time validation feedback.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatternCard
          name="Form Compositions"
          description="Multi-section form with field groups, select menus, checkboxes, and contextual help text. Shows how to structure complex data entry UIs."
          components={[
            "Form",
            "Input",
            "Select",
            "Checkbox",
            "Button",
            "Label",
          ]}
          storybookPath="/story/patterns-form-patterns-form-compositions--default"
        />
        <PatternCard
          name="Form Validation"
          description="Real-time and on-submit validation with inline error messages, success badges, and accessible alert announcements."
          components={["Form", "Input", "Button", "Alert", "Badge"]}
          storybookPath="/story/patterns-form-patterns-form-validation--default"
        />
      </div>
    </div>
  );
}
