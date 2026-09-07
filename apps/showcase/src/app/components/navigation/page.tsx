import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@wyliedog/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@wyliedog/ui/pagination";
import { Badge } from "@wyliedog/ui/badge";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

const StatusBadge = ({ status }: { status: "stable" | "beta" | "alpha" }) => {
  const map = {
    stable: "text-(--color-text-success)",
    beta: "text-(--color-text-warning)",
    alpha: "text-(--color-text-danger)",
  } as const;
  return (
    <div className="flex items-center gap-1.5 border border-(--color-border-primary)/5 px-2 py-0.5 rounded-full scale-90">
      <CheckCircle2 className={`h-3.5 w-3.5 ${map[status]}`} />
      <span className="text-[9px] uppercase font-black tracking-widest text-(--color-text-secondary)">
        {status}
      </span>
    </div>
  );
};

export default function NavigationPage() {
  const components = [
    {
      name: "Tabs",
      description:
        "A set of layered sections of content, known as tab panels, that are displayed one at a time.",
      status: "stable" as const,
      preview: (
        <Tabs defaultValue="one" className="w-45">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="one" className="text-[10px]">
              One
            </TabsTrigger>
            <TabsTrigger value="two" className="text-[10px]">
              Two
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ),
    },
    {
      name: "Breadcrumb",
      description:
        "Displays the path to the current resource using a hierarchy of links.",
      status: "stable" as const,
      preview: (
        <Breadcrumb className="scale-75 origin-center">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Library</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
    },
    {
      name: "Pagination",
      description:
        "Navigation for splitting large content into discrete pages.",
      status: "stable" as const,
      preview: (
        <Pagination className="scale-75 origin-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ),
    },
  ];

  const count =
    getComponentCategoryCounts().find((c) => c.dirName === "Navigation")
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
            Navigation
          </h1>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
          >
            {count} components
          </Badge>
        </div>
        <p className="text-lg text-(--color-text-secondary) leading-relaxed">
          Components that help users find their way through the application.
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
