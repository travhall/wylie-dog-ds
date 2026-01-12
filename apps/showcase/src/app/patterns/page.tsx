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
import Link from "next/link";

export default function PatternsPage() {
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Patterns
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Reusable UI patterns that combine multiple components to solve
            common design problems. These patterns demonstrate how to compose
            the design system in real-world scenarios.
          </p>
        </div>

        {/* Pattern Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Layout Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-(--color-text-primary)">
              <Layout className="h-5 w-5 text-(--color-interactive-primary)" />
              Layout Patterns
            </h2>
            <div className="space-y-4">
              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Application Shell
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Layout
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Header, navigation, content area, and footer layout with
                    responsive behavior.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/application-shell">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Dashboard Layout
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Layout
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Grid-based dashboard with sidebar, cards, and data
                    visualization areas.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/dashboard-layout">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-(--color-text-primary)">
              <Settings className="h-5 w-5 text-(--color-interactive-primary)" />
              Form Patterns
            </h2>
            <div className="space-y-4">
              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Authentication Form
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Form
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Login/signup form with validation, error states, and
                    accessibility features.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/authentication-form">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Settings Form
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Form
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Multi-section settings form with various input types and
                    validation.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/settings-form">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-(--color-text-primary)">
              <BarChart3 className="h-5 w-5 text-(--color-interactive-primary)" />
              Data Patterns
            </h2>
            <div className="space-y-4">
              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Data Table
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Data
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Sortable, filterable table with pagination and bulk actions.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/data-table">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Search & Filter
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Data
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Search interface with filters, tags, and result display.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/search-filter">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-(--color-text-primary)">
              <Search className="h-5 w-5 text-(--color-interactive-primary)" />
              Navigation Patterns
            </h2>
            <div className="space-y-4">
              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Command Palette
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Navigation
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Keyboard-first navigation with search and quick actions.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/command-palette">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-(--color-border-primary)/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-(--color-text-primary)">
                      Breadcrumb Trail
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-(--color-interactive-primary) border-(--color-interactive-primary)/20"
                    >
                      Navigation
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Hierarchical navigation with clear path indicators.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/patterns/breadcrumb-trail">
                      <Button variant="outline" size="sm">
                        View Pattern
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Pattern Guidelines */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-(--color-text-primary)">
            Pattern Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  Composable
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Patterns are built from components and can be customized for
                  specific use cases.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  User-Tested
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Each pattern follows established UX best practices and
                  accessibility guidelines.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  Well Documented
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
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
