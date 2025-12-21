import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import {
  Layout,
  Settings,
  Inbox,
  BarChart3,
  Search,
  Users,
  FileText,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function PatternsPage() {
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Patterns</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Reusable UI patterns that combine multiple components to solve
            common design problems. These patterns demonstrate how to compose
            the design system in real-world scenarios.
          </p>
        </div>

        {/* Pattern Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Layout Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Layout Patterns
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Application Shell</CardTitle>
                    <Badge variant="outline">Layout</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Header, navigation, content area, and footer layout with
                    responsive behavior.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/application-shell"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Dashboard Layout</CardTitle>
                    <Badge variant="outline">Layout</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Grid-based dashboard with sidebar, cards, and data
                    visualization areas.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/dashboard-layout"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Form Patterns
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">
                      Authentication Form
                    </CardTitle>
                    <Badge variant="outline">Form</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Login/signup form with validation, error states, and
                    accessibility features.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/authentication-form"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Settings Form</CardTitle>
                    <Badge variant="outline">Form</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Multi-section settings form with various input types and
                    validation.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/settings-form"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Patterns
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Data Table</CardTitle>
                    <Badge variant="outline">Data</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sortable, filterable table with pagination and bulk actions.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/data-table"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
                    <Badge variant="outline">Data</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search interface with filters, tags, and result display.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/search-filter"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Navigation Patterns
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Command Palette</CardTitle>
                    <Badge variant="outline">Navigation</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Keyboard-first navigation with search and quick actions.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/command-palette"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Breadcrumb Trail</CardTitle>
                    <Badge variant="outline">Navigation</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Hierarchical navigation with clear path indicators.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/patterns/breadcrumb-trail"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      View Pattern
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Pattern Guidelines */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Pattern Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Composable</h3>
                <p className="text-sm text-muted-foreground">
                  Patterns are built from components and can be customized for
                  specific use cases.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">User-Tested</h3>
                <p className="text-sm text-muted-foreground">
                  Each pattern follows established UX best practices and
                  accessibility guidelines.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Well Documented</h3>
                <p className="text-sm text-muted-foreground">
                  Clear guidelines for when and how to use each pattern in your
                  applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
