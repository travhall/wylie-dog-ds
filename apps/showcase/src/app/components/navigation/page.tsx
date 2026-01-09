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

export default function NavigationPage() {
  const components = [
    {
      name: "Tabs",
      description:
        "A set of layered sections of content, known as tab panels, that are displayed one at a time.",
      status: "stable",
      preview: (
        <Tabs defaultValue="one" className="w-[180px]">
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
      status: "stable",
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
      status: "stable",
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

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-(--color-text-primary)">
          Navigation
        </h1>
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
