import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

export default function ContentDisplayPage() {
  const components = [
    {
      name: "Accordion",
      description:
        "Vertically stacked sections that expand and collapse to reveal content.",
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
      name: "Avatar",
      description:
        "An image element with a fallback for representing a user or entity.",
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
      preview: (
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            ‹
          </Button>
          <div className="flex-1 h-16 bg-(--color-interactive-primary)/10 border border-(--color-border-primary)/20 rounded-lg flex items-center justify-center text-xs text-(--color-text-secondary)">
            Slide 1 of 3
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            ›
          </Button>
        </div>
      ),
    },
    {
      name: "Table",
      description:
        "Responsive data table with header, body, and footer sections.",
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

  const count =
    getComponentCategoryCounts().find((c) => c.dirName === "Content-Display")
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
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
            Content Display
          </h1>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            {count} components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed max-w-2xl">
          Components for presenting and organizing information: accordions,
          avatars, badges, calendars, cards, carousels, and tables. This page
          previews a selection; the Components page has all {count}.
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
