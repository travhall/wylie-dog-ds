import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Button } from "@wyliedog/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@wyliedog/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@wyliedog/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@wyliedog/ui/popover";
import { CheckCircle2, Clock } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "stable":
      return (
        <CheckCircle2 className="h-3.5 w-3.5 text-(--color-text-success)" />
      );
    case "beta":
      return <Clock className="h-3.5 w-3.5 text-(--color-text-warning)" />;
    default:
      return null;
  }
};

export default function OverlaysPage() {
  const components = [
    {
      name: "Dialog",
      description:
        "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
      status: "stable",
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Modal Example</DialogTitle>
            </DialogHeader>
            <p className="text-sm opacity-80">This is a modal content area.</p>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      name: "Tooltip",
      description:
        "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
      status: "stable",
      preview: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Hover Me
              </Button>
            </TooltipTrigger>
            <TooltipContent className="glass">
              <p className="text-xs">Contextual info</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      name: "Popover",
      description: "Displays rich content in a portal, triggered by a button.",
      status: "beta",
      preview: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Open Popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass w-48 p-4">
            <p className="text-xs">Rich content can go here.</p>
          </PopoverContent>
        </Popover>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Overlays
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Floating panels and context-aware elements that appear above the main
          content.
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
