import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { ExternalLink } from "lucide-react";

const STORYBOOK_BASE = "https://wyliedogstorybook.com";

interface PatternCardProps {
  name: string;
  description: string;
  components: string[];
  storybookPath: string;
}

export function PatternCard({
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
