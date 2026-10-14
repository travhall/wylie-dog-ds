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
import { Badge } from "@wyliedog/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

export default function OverlaysPage() {
  const components = [
    {
      name: "Dialog",
      description:
        "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
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

  const count =
    getComponentCategoryCounts().find((c) => c.dirName === "Overlays-Popovers")
      ?.count ?? components.length;

  return (
    <div className="relative mx-auto max-w-7xl space-y-12 p-4 lg:p-8 xl:p-12">
      <Link
        href="/components"
        className="inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-interactive-primary) transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All Components
      </Link>
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
            Overlays
          </h1>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            {count} components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Floating panels and context-aware elements that appear above the main
          content. This page previews a selection; the Components page has all{" "}
          {count}.
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
