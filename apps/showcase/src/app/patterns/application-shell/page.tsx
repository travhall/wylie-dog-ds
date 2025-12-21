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
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Application Shell
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Complete application layout with header, navigation, content area,
            and footer. Demonstrates responsive behavior and consistent
            structure patterns.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Application Shell Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="tablet">Tablet</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>

              <TabsContent value="desktop" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-muted border-b p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Layout className="h-6 w-6" />
                          <span className="font-semibold">Application</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6">
                          <Button variant="ghost" size="sm">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </nav>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Main Content</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              Primary application content goes here. This area
                              is flexible and can contain any type of content -
                              forms, tables, charts, or custom components.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <Card>
                          <CardHeader>
                            <CardTitle>Sidebar</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Messages
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
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
                <div className="border rounded-lg overflow-hidden max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="bg-muted border-b p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="sm">
                          <Menu className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Layout className="h-5 w-5" />
                          <span className="font-semibold">App</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tablet Layout</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Optimized for tablet devices with simplified header
                          and single-column content layout.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-4">
                <div className="border rounded-lg overflow-hidden max-w-sm mx-auto">
                  {/* Header */}
                  <div className="bg-muted border-b p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Menu className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold">App</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mobile Layout</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
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
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Layout className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Responsive Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Adapts seamlessly across desktop, tablet, and mobile
                    viewports with appropriate layout adjustments.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Menu className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Flexible Navigation</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigation transforms from horizontal to collapsible menu
                    based on screen size.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Search className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Global Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Consistent header actions for search, notifications, and
                    user profile across all layouts.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Modular Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean separation between header, content, and sidebar areas
                    for easy customization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">When to Use</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>As the base layout for most applications</li>
                  <li>When you need consistent structure across pages</li>
                  <li>For applications requiring responsive behavior</li>
                  <li>When building multi-section interfaces</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Best Practices</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
