import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";
import { cn } from "@wyliedog/ui/lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "stable":
      return (
        <CheckCircle2 className="h-3.5 w-3.5 text-(--color-text-success)" />
      );
    case "beta":
      return <Clock className="h-3.5 w-3.5 text-(--color-text-warning)" />;
    case "alpha":
      return <AlertCircle className="h-3.5 w-3.5 text-(--color-text-danger)" />;
    default:
      return null;
  }
};

export default function FoundationsPage() {
  const components = [
    {
      name: "Button",
      description:
        "Standard interactive buttons with multiple variants and sizes.",
      status: "stable",
      preview: (
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
        </div>
      ),
    },
    {
      name: "Badge",
      description: "Status indicators, tags, and count labels.",
      status: "stable",
      preview: (
        <div className="flex gap-2">
          <Badge>Stable</Badge>
          <Badge variant="secondary">Beta</Badge>
          <Badge variant="outline">Alpha</Badge>
        </div>
      ),
    },
    {
      name: "Typography",
      description: "Heading and text styles for consistent content hierarchy.",
      status: "stable",
      preview: (
        <div className="space-y-1">
          <div className="text-sm font-bold">Heading</div>
          <div className="text-xs opacity-60">Body text specimen</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Foundations
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          The core atomic components that form the basis of our user interface.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col"
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                  {comp.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
                  {getStatusIcon(comp.status)}
                  <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
                    {comp.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {comp.description}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <div className="glass bg-(--color-background-secondary)/20 rounded-xl p-4 min-h-[100px] flex items-center justify-center border border-(--color-border-primary)/5">
                {comp.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
