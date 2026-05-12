import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Separator } from "@wyliedog/ui/separator";
import { ScrollArea } from "@wyliedog/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@wyliedog/ui/tabs";
import { CheckCircle2 } from "lucide-react";

const StatusBadge = ({ status }: { status: "stable" | "beta" | "alpha" }) => {
  const map = {
    stable: "text-(--color-text-success)",
    beta: "text-(--color-text-warning)",
    alpha: "text-(--color-text-danger)",
  } as const;
  return (
    <div className="flex items-center gap-1.5 glass border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
      <CheckCircle2 className={`h-3.5 w-3.5 ${map[status]}`} />
      <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
        {status}
      </span>
    </div>
  );
};

export default function LayoutPage() {
  const components = [
    {
      name: "Collapsible",
      description:
        "An interactive component that expands or collapses a section of content.",
      status: "stable" as const,
      preview: (
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between px-3 py-2 border border-(--color-border-primary)/20 rounded-lg text-xs">
            <span className="font-medium">Collapsible trigger</span>
            <span className="text-(--color-text-secondary)">▼</span>
          </div>
          <div className="px-3 py-2 border border-(--color-border-primary)/20 rounded-lg text-xs text-(--color-text-secondary)">
            Expanded content revealed here.
          </div>
        </div>
      ),
    },
    {
      name: "Resizable",
      description:
        "Resizable panels with drag handles for flexible layout control.",
      status: "stable" as const,
      preview: (
        <div className="flex w-full h-16 border border-(--color-border-primary)/20 rounded-lg overflow-hidden text-xs text-(--color-text-secondary)">
          <div className="flex-1 flex items-center justify-center bg-(--color-interactive-primary)/5">
            Panel 1
          </div>
          <div className="w-1 bg-(--color-border-primary)/30 cursor-col-resize" />
          <div className="flex-1 flex items-center justify-center bg-(--color-interactive-warning)/5">
            Panel 2
          </div>
        </div>
      ),
    },
    {
      name: "Scroll Area",
      description:
        "Custom scrollable container with a styled scrollbar that overlays content.",
      status: "stable" as const,
      preview: (
        <ScrollArea className="h-20 w-full rounded border border-(--color-border-primary)/20 p-3">
          <div className="space-y-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="text-xs text-(--color-text-secondary)">
                Scroll item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
    {
      name: "Separator",
      description:
        "Visually or semantically separates content, available in horizontal and vertical orientations.",
      status: "stable" as const,
      preview: (
        <div className="w-full space-y-2">
          <div className="text-xs text-(--color-text-secondary)">Above</div>
          <Separator />
          <div className="text-xs text-(--color-text-secondary)">Below</div>
          <div className="flex h-8 items-center gap-2">
            <span className="text-xs text-(--color-text-secondary)">Left</span>
            <Separator orientation="vertical" className="h-full" />
            <span className="text-xs text-(--color-text-secondary)">Right</span>
          </div>
        </div>
      ),
    },
    {
      name: "Tabs",
      description:
        "Tabbed interface for switching between related views within a shared container.",
      status: "stable" as const,
      preview: (
        <div className="w-full">
          <Tabs defaultValue="one">
            <TabsList className="h-8">
              <TabsTrigger value="one" className="text-xs h-7">
                Tab One
              </TabsTrigger>
              <TabsTrigger value="two" className="text-xs h-7">
                Tab Two
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="one"
              className="mt-2 text-xs text-(--color-text-secondary)"
            >
              Content for tab one.
            </TabsContent>
            <TabsContent
              value="two"
              className="mt-2 text-xs text-(--color-text-secondary)"
            >
              Content for tab two.
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
  ];

  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
            Layout & Structure
          </h1>
          <Badge
            variant="outline"
            className="glass rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            5 components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl">
          Structural components for organizing and arranging page content:
          Collapsible, Resizable panels, Scroll Area, Separator, and Tabs.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp, i) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold group-hover:text-(--color-interactive-primary) transition-colors text-(--color-text-primary)">
                  {comp.name}
                </CardTitle>
                <StatusBadge status={comp.status} />
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                {comp.description}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 mt-auto">
              <div className="glass bg-(--color-background-secondary)/20 rounded-xl p-4 min-h-25 flex items-center justify-center border border-(--color-border-primary)/5">
                {comp.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
