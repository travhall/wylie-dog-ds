import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@wyliedog/ui/avatar";
import { Skeleton } from "@wyliedog/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wyliedog/ui/table";
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

export default function ContentDisplayPage() {
  const components = [
    {
      name: "Accordion",
      description:
        "Vertically stacked sections that expand and collapse to reveal content.",
      status: "stable" as const,
      preview: (
        <div className="w-full space-y-1 text-sm">
          <div className="border border-(--color-border-primary)/20 rounded-lg px-4 py-3 font-medium text-(--color-text-primary) flex justify-between items-center">
            <span>Section one</span>
            <span className="text-(--color-text-secondary)">▼</span>
          </div>
          <div className="border border-(--color-border-primary)/20 rounded-lg px-4 py-2 text-(--color-text-secondary) text-xs">
            Accordion content goes here.
          </div>
          <div className="border border-(--color-border-primary)/20 rounded-lg px-4 py-3 font-medium text-(--color-text-primary) flex justify-between items-center">
            <span>Section two</span>
            <span className="text-(--color-text-secondary)">▶</span>
          </div>
        </div>
      ),
    },
    {
      name: "Aspect Ratio",
      description:
        "Maintains a consistent width-to-height ratio for media content.",
      status: "stable" as const,
      preview: (
        <div className="w-full">
          <div
            className="relative w-full rounded-lg bg-(--color-interactive-primary)/10 border border-(--color-border-primary)/20 flex items-center justify-center text-xs text-(--color-text-secondary)"
            style={{ aspectRatio: "16/9" }}
          >
            16 / 9
          </div>
        </div>
      ),
    },
    {
      name: "Avatar",
      description:
        "An image element with a fallback for representing a user or entity.",
      status: "stable" as const,
      preview: (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback>WD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">SM</AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      name: "Card",
      description:
        "A flexible container with optional header, content, and footer sections.",
      status: "stable" as const,
      preview: (
        <Card className="w-full border-(--color-border-primary)/20 shadow-none bg-(--color-background-secondary)/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Card Title</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-(--color-text-secondary)">
            Card content with supporting text.
          </CardContent>
        </Card>
      ),
    },
    {
      name: "Carousel",
      description:
        "A slideshow component for cycling through a series of items.",
      status: "stable" as const,
      preview: (
        <div className="flex items-center gap-2 w-full">
          <button className="h-8 w-8 rounded-full border border-(--color-border-primary)/20 flex items-center justify-center text-xs text-(--color-text-secondary)">
            ‹
          </button>
          <div className="flex-1 h-16 bg-(--color-interactive-primary)/10 border border-(--color-border-primary)/20 rounded-lg flex items-center justify-center text-xs text-(--color-text-secondary)">
            Slide 1 of 3
          </div>
          <button className="h-8 w-8 rounded-full border border-(--color-border-primary)/20 flex items-center justify-center text-xs text-(--color-text-secondary)">
            ›
          </button>
        </div>
      ),
    },
    {
      name: "Skeleton",
      description: "Placeholder preview displayed while content is loading.",
      status: "stable" as const,
      preview: (
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ),
    },
    {
      name: "Table",
      description:
        "Responsive data table with header, body, and footer sections.",
      status: "stable" as const,
      preview: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs py-1.5">Button</TableCell>
              <TableCell className="text-xs py-1.5">Stable</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-xs py-1.5">Card</TableCell>
              <TableCell className="text-xs py-1.5">Stable</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
            Content Display
          </h1>
          <Badge
            variant="outline"
            className="glass rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            7 components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl">
          Components for presenting and organizing information: accordions,
          media containers, avatars, cards, carousels, skeletons, and tables.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp, i) => (
          <Card
            key={comp.name}
            className="glass border-(--color-border-primary)/10 group hover:border-(--color-interactive-primary)/30 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 60}ms` }}
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
