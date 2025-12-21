import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Sparkles,
  Palette,
  Layers,
  Shield,
  Code2,
  ExternalLink,
  Github,
  Twitter,
  Zap,
} from "lucide-react";

export default function ComponentsPage() {
  const components = [
    {
      name: "Button",
      description: "Interactive button with multiple variants and sizes",
      props: ["variant", "size", "disabled", "asChild"],
      status: "stable",
    },
    {
      name: "Card",
      description: "Flexible container for grouping related content",
      props: ["className", "children"],
      status: "stable",
    },
    {
      name: "Input",
      description: "Text input field with validation states",
      props: ["type", "placeholder", "disabled", "value"],
      status: "stable",
    },
    {
      name: "Label",
      description: "Accessible label for form inputs",
      props: ["htmlFor", "children"],
      status: "stable",
    },
    {
      name: "Badge",
      description: "Small status indicators and tags",
      props: ["variant", "children"],
      status: "stable",
    },
    {
      name: "Tabs",
      description: "Tabbed interface for organizing content",
      props: ["defaultValue", "orientation", "children"],
      status: "stable",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "default";
      case "beta":
        return "secondary";
      case "alpha":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Components</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Production-ready components built with Radix UI primitives and
            styled with design tokens. Each component is accessible, themeable,
            and thoroughly tested.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="buttons" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="buttons" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Button Variants
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
                  <div className="flex items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="forms" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">Form</Badge>
                  <Badge variant="secondary">Interactive</Badge>
                  <Badge>Validated</Badge>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Card Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Card content with flexible layout options.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Another Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Consistent styling across all cards.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Third Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Responsive grid layout.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Components Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <Card key={component.name} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <Badge variant={getStatusColor(component.status)}>
                    {component.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {component.description}
                </p>
                <div>
                  <h4 className="text-sm font-medium mb-2">Props:</h4>
                  <div className="flex flex-wrap gap-1">
                    {component.props.map((prop) => (
                      <Badge key={prop} variant="outline" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Accessible</h3>
                  <p className="text-sm text-muted-foreground">
                    Built with Radix UI primitives for full keyboard navigation
                    and screen reader support.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Palette className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Themeable</h3>
                  <p className="text-sm text-muted-foreground">
                    Styled with design tokens for consistent theming across
                    light and dark modes.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Layers className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Composable</h3>
                  <p className="text-sm text-muted-foreground">
                    Flexible API with compound components for complex use cases.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Type Safe</h3>
                  <p className="text-sm text-muted-foreground">
                    Full TypeScript support with comprehensive type definitions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Github className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Source Code</h3>
                  <p className="text-sm text-muted-foreground">
                    View component implementations on GitHub
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Storybook</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive component documentation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
