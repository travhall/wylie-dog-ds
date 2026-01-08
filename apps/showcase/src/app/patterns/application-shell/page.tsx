"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Layout,
  Menu,
  Search,
  Bell,
  Settings,
  User,
  Home,
  FileText,
  BarChart3,
  Mail,
  Calendar,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function ApplicationShellPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Application Shell
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Complete application layout with header, navigation, content area,
            and footer. Demonstrates responsive behavior and consistent
            structure patterns.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Application Shell Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="tablet">Tablet</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>

              <TabsContent value="desktop" className="space-y-4">
                <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden glass">
                  {/* Header */}
                  <div className="bg-(--color-background-secondary)/50 border-b border-(--color-border-primary)/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Layout className="h-6 w-6 text-(--color-interactive-primary)" />
                          <span className="font-semibold text-(--color-text-primary)">
                            Application
                          </span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                          >
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </nav>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <Card className="glass border-(--color-border-primary)/10">
                          <CardHeader>
                            <CardTitle className="text-(--color-text-primary)">
                              Main Content
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-(--color-text-secondary)">
                              Primary application content goes here. This area
                              is flexible and can contain any type of content -
                              forms, tables, charts, or custom components.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <Card className="glass border-(--color-border-primary)/10">
                          <CardHeader>
                            <CardTitle className="text-(--color-text-primary)">
                              Sidebar
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-(--color-text-secondary) hover:text-(--color-text-primary)"
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-(--color-text-secondary) hover:text-(--color-text-primary)"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Messages
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-(--color-text-secondary) hover:text-(--color-text-primary)"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tablet" className="space-y-4">
                <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden max-w-2xl mx-auto glass">
                  {/* Header */}
                  <div className="bg-(--color-background-secondary)/50 border-b border-(--color-border-primary)/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <Menu className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Layout className="h-5 w-5 text-(--color-interactive-primary)" />
                          <span className="font-semibold text-(--color-text-primary)">
                            App
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Card className="glass border-(--color-border-primary)/10">
                      <CardHeader>
                        <CardTitle className="text-(--color-text-primary)">
                          Tablet Layout
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-(--color-text-secondary)">
                          Optimized for tablet devices with simplified header
                          and single-column content layout.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-4">
                <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden max-w-sm mx-auto glass">
                  {/* Header */}
                  <div className="bg-(--color-background-secondary)/50 border-b border-(--color-border-primary)/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <Menu className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-(--color-text-primary)">
                          App
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <Card className="glass border-(--color-border-primary)/10">
                      <CardHeader>
                        <CardTitle className="text-(--color-text-primary)">
                          Mobile Layout
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-(--color-text-secondary) text-sm">
                          Compact layout for mobile devices with collapsible
                          navigation and streamlined interface.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Layout className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Responsive Design
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Adapts seamlessly across desktop, tablet, and mobile
                    viewports with appropriate layout adjustments.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Menu className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Flexible Navigation
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Navigation transforms from horizontal to collapsible menu
                    based on screen size.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Search className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Global Actions
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Consistent header actions for search, notifications, and
                    user profile across all layouts.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Modular Structure
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Clean separation between header, content, and sidebar areas
                    for easy customization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-(--color-text-primary)">
                  When to Use
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                  <li>As the base layout for most applications</li>
                  <li>When you need consistent structure across pages</li>
                  <li>For applications requiring responsive behavior</li>
                  <li>When building multi-section interfaces</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-(--color-text-primary)">
                  Best Practices
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                  <li>Keep header content minimal and focused</li>
                  <li>Use consistent navigation patterns</li>
                  <li>Ensure content area is the primary focus</li>
                  <li>Test across all device sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
