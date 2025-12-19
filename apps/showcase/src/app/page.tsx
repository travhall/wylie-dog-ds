import {
  SiteHeader,
  SiteFooter,
  PageLayout,
  SectionHero,
  SectionFeatures,
} from "@wyliedog/ui/compositions";
import { Button } from "@wyliedog/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import {
  Sparkles,
  Palette,
  Layers,
  Zap,
  Shield,
  Code2,
  Heart,
  Github,
  Twitter,
} from "lucide-react";

export default function Home() {
  // Header navigation
  const navigation = [
    { label: "Components", href: "#components" },
    { label: "Documentation", href: "#docs" },
    { label: "Examples", href: "#examples" },
  ];

  // Footer columns
  const footerColumns = [
    {
      title: "Product",
      links: [
        { label: "Components", href: "#components" },
        { label: "Tokens", href: "#tokens" },
        { label: "Storybook", href: "#storybook" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#docs" },
        { label: "Examples", href: "#examples" },
        { label: "GitHub", href: "https://github.com" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ];

  // Social links
  const socialLinks = [
    {
      label: "GitHub",
      href: "https://github.com",
      icon: <Github className="h-5 w-5" />,
    },
    {
      label: "Twitter",
      href: "https://twitter.com",
      icon: <Twitter className="h-5 w-5" />,
    },
  ];

  // Features data
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "42 Components",
      description:
        "Complete component library with Button, Card, Dialog, Table, and more. Everything you need to build modern applications.",
      badge: "Complete",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "OKLCH Colors",
      description:
        "Next-generation perceptually uniform color system. 2-3 years ahead of industry standards with P3 gamut support.",
      badge: "Advanced",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Design Tokens",
      description:
        "275+ tokens in primitive-semantic-component hierarchy. A+ rated implementation following W3C DTCG standards.",
      badge: "A+ Rated",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description:
        "Optimized build pipeline with intelligent caching. Components built for performance with minimal bundle sizes.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "WCAG AA Compliant",
      description:
        "Accessibility-first design with comprehensive keyboard navigation, ARIA support, and screen reader compatibility.",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Developer Experience",
      description:
        "Full TypeScript support, comprehensive documentation, and interactive Storybook examples for every component.",
    },
  ];

  return (
    <PageLayout
      header={
        <SiteHeader
          logo={
            <a href="/" className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Wylie Dog</span>
            </a>
          }
          navigation={navigation}
        />
      }
      footer={
        <SiteFooter
          logo={
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Wylie Dog</span>
            </div>
          }
          columns={footerColumns}
          copyright="© 2025 Wylie Dog Design System. Built with love."
          socialLinks={socialLinks}
        />
      }
      variant="full-width"
    >
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        badge="Production Ready"
        title="Build Faster with OKLCH Color Science"
        description="A production-ready design system featuring 42 components, next-generation OKLCH color science, and industry-leading design token architecture."
        primaryAction={{
          label: "View Components",
          href: "#components",
        }}
        secondaryAction={{
          label: "Read Docs",
          href: "#docs",
        }}
        image={
          <div className="aspect-square rounded-lg bg-gradient-to-br from-primary via-secondary to-accent p-8 flex items-center justify-center">
            <div className="text-white text-center">
              <Code2 className="h-24 w-24 mx-auto mb-4" />
              <p className="text-2xl font-bold">42 Components</p>
            </div>
          </div>
        }
      />

      {/* Features Section */}
      <SectionFeatures
        variant="cards"
        title="Everything You Need to Build"
        description="Built on modern web standards with React 19, TypeScript 5.8, and Tailwind CSS 4. Optimized for production with comprehensive testing and documentation."
        features={features}
        columns={3}
      />

      {/* Components Grid Section */}
      <section id="components" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Component Library
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Production-Ready Components
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              42 accessible, themeable components built with Radix UI primitives
              and styled with design tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Component Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Buttons</CardTitle>
                  <Badge>6 variants</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="default">
                    Default
                  </Button>
                  <Button size="sm" variant="secondary">
                    Secondary
                  </Button>
                  <Button size="sm" variant="outline">
                    Outline
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Badges</CardTitle>
                  <Badge>4 variants</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Cards</CardTitle>
                  <Badge>Composable</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Flexible container with header, content, and footer sections
                  for organizing UI elements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Forms</CardTitle>
                  <Badge>10+ inputs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete form controls including Input, Select, Checkbox,
                  Radio, Switch, and validation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Dialogs & Modals</CardTitle>
                  <Badge>Accessible</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dialog, AlertDialog, Sheet, Popover, and Tooltip with full
                  keyboard navigation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>Navigation</CardTitle>
                  <Badge>5 patterns</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  NavigationMenu, Breadcrumb, Pagination, Tabs, and Menubar for
                  all your navigation needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* OKLCH Colors Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Color Science
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              OKLCH Color System
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Perceptually uniform colors that look great across devices. 30%
              more colors than traditional sRGB with P3 gamut support.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="aspect-square rounded-lg bg-primary p-6 flex flex-col items-center justify-center text-primary-foreground">
              <div className="text-2xl font-bold mb-2">Primary</div>
              <div className="text-sm opacity-90">OKLCH</div>
            </div>
            <div className="aspect-square rounded-lg bg-secondary p-6 flex flex-col items-center justify-center text-secondary-foreground">
              <div className="text-2xl font-bold mb-2">Secondary</div>
              <div className="text-sm opacity-90">P3 Gamut</div>
            </div>
            <div className="aspect-square rounded-lg bg-accent p-6 flex flex-col items-center justify-center text-accent-foreground">
              <div className="text-2xl font-bold mb-2">Accent</div>
              <div className="text-sm opacity-90">Uniform</div>
            </div>
            <div className="aspect-square rounded-lg bg-destructive p-6 flex flex-col items-center justify-center text-destructive-foreground">
              <div className="text-2xl font-bold mb-2">Alert</div>
              <div className="text-sm opacity-90">Accessible</div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
