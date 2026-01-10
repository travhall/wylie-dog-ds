import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@wyliedog/ui/avatar";
import { Separator } from "@wyliedog/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@wyliedog/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wyliedog/ui/table";
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

export default function DataDisplayPage() {
  const components = [
    {
      name: "Card",
      description:
        "A container for content and actions about a single subject.",
      status: "stable",
      preview: (
        <Card className="glass w-45 h-20 flex items-center justify-center">
          <span className="text-xs font-bold">Standard Card</span>
        </Card>
      ),
    },
    {
      name: "Avatar",
      description:
        "An image element with a fallback for representing the user.",
      status: "stable",
      preview: (
        <Avatar className="h-12 w-12 border-2 border-(--color-interactive-primary)/20">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
    },
    {
      name: "Accordion",
      description:
        "A vertically stacked set of interactive headings that each reveal a section of content.",
      status: "stable",
      preview: (
        <Accordion type="single" collapsible className="w-full max-w-45">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="text-xs py-2">
              Details
            </AccordionTrigger>
            <AccordionContent className="text-[10px] opacity-60">
              Revealed content goes here.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
    {
      name: "Table",
      description:
        "A responsive data table for displaying structured information.",
      status: "beta",
      preview: (
        <div className="glass rounded-lg overflow-hidden border border-(--color-border-primary)/10 scale-75 origin-center">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-[10px]">WD-001</TableCell>
                <TableCell className="text-[10px]">Active</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ),
    },
    {
      name: "Separator",
      description: "Visually or semantically separates content.",
      status: "stable",
      preview: (
        <div className="space-y-1 w-full flex flex-col items-center">
          <div className="text-[10px]">Top</div>
          <Separator className="w-1/2" />
          <div className="text-[10px]">Bottom</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Data Display
        </h1>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Components for presenting information and structured data.
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
