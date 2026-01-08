"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  BarChart3,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  Home,
  FileText,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  Download,
  RefreshCw,
} from "lucide-react";

export default function DashboardLayoutPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20.1%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Active Users",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Sales",
      value: "+12,234",
      change: "+19%",
      trend: "up",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: "Active Now",
      value: "573",
      change: "+201",
      trend: "up",
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      product: "Premium Plan",
      amount: "$99.00",
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      product: "Basic Plan",
      amount: "$29.00",
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      product: "Enterprise Plan",
      amount: "$299.00",
      status: "completed",
      date: "2024-01-13",
    },
  ];

  const navigationItems = [
    { icon: <Home className="h-4 w-4" />, label: "Dashboard", active: true },
    { icon: <FileText className="h-4 w-4" />, label: "Orders", active: false },
    { icon: <Users className="h-4 w-4" />, label: "Customers", active: false },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Analytics",
      active: false,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      active: false,
    },
    { icon: <HelpCircle className="h-4 w-4" />, label: "Help", active: false },
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Dashboard Layout
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            A comprehensive dashboard layout with sidebar navigation, header
            actions, and data visualization areas. Perfect for admin panels and
            analytics interfaces.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20"
            >
              Sidebar Navigation
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20"
            >
              Data Cards
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20"
            >
              Responsive
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20"
            >
              Interactive
            </Badge>
          </div>
        </div>

        {/* Dashboard Preview */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <BarChart3 className="h-5 w-5 text-(--color-interactive-primary)" />
              Live Dashboard Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-primary) overflow-hidden shadow-lg">
              {/* Header Bar */}
              <div className="border-b border-(--color-border-primary)/20 px-4 py-3 flex items-center justify-between bg-(--color-background-secondary)/50 glass">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded-md hover:bg-(--color-background-secondary) text-(--color-text-secondary) transition-colors"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-(--color-interactive-primary) rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="font-semibold text-(--color-text-primary)">
                      Dashboard
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-(--color-border-primary)/20 rounded-md bg-(--color-background-primary)/50 text-sm w-64 text-(--color-text-primary) focus:outline-none focus:ring-1 focus:ring-(--color-border-focus)"
                    />
                  </div>
                  <button className="p-2 rounded-md hover:bg-(--color-background-secondary) relative text-(--color-text-secondary) transition-colors">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-(--color-interactive-danger) rounded-full"></span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-(--color-background-secondary) rounded-full flex items-center justify-center text-(--color-text-secondary)">
                      <User className="h-4 w-4" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-(--color-text-tertiary)" />
                  </div>
                </div>
              </div>

              <div className="flex min-h-[500px]">
                {/* Sidebar */}
                <div
                  className={`${sidebarCollapsed ? "w-16" : "w-64"} border-r border-(--color-border-primary)/20 transition-all duration-200 bg-(--color-background-secondary)/30`}
                >
                  <nav className="p-4 space-y-2">
                    {navigationItems.map((item, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                          item.active
                            ? "bg-(--color-interactive-primary) text-white shadow-sm"
                            : "text-(--color-text-secondary) hover:bg-(--color-background-secondary) hover:text-(--color-text-primary)"
                        }`}
                      >
                        {item.icon}
                        {!sidebarCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </button>
                    ))}
                  </nav>

                  {!sidebarCollapsed && (
                    <div className="p-4 border-t border-(--color-border-primary)/20 mt-4">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-(--color-background-secondary) rounded-full flex items-center justify-center text-(--color-text-secondary)">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-(--color-text-primary)">
                            Admin User
                          </div>
                          <div className="text-xs text-(--color-text-tertiary)">
                            admin@example.com
                          </div>
                        </div>
                      </div>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-(--color-text-secondary) hover:bg-(--color-background-secondary) hover:text-(--color-text-danger) mt-2 transition-colors">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                          <Card
                            key={index}
                            className="glass border-(--color-border-primary)/10 hover:border-(--color-border-primary)/20 transition-colors"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-(--color-text-tertiary)">
                                    {stat.title}
                                  </p>
                                  <p className="text-2xl font-bold text-(--color-text-primary)">
                                    {stat.value}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {stat.trend === "up" ? (
                                      <TrendingUp className="h-3 w-3 text-(--color-text-success)" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 text-(--color-text-danger)" />
                                    )}
                                    <span
                                      className={`text-xs ${
                                        stat.trend === "up"
                                          ? "text-(--color-text-success)"
                                          : "text-(--color-text-danger)"
                                      }`}
                                    >
                                      {stat.change}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 bg-(--color-background-secondary) rounded-lg text-(--color-interactive-primary)">
                                  {stat.icon}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Recent Orders */}
                      <Card className="glass border-(--color-border-primary)/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-(--color-text-primary)">
                            Recent Orders
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-(--color-border-primary)/20 h-8"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-(--color-border-primary)/20 h-8"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-(--color-border-primary)/10">
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Order ID
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Customer
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Product
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Amount
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Status
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)">
                                    Date
                                  </th>
                                  <th className="text-left p-3 font-semibold text-sm text-(--color-text-secondary)"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-(--color-border-primary)/10">
                                {recentOrders.map((order) => (
                                  <tr
                                    key={order.id}
                                    className="hover:bg-(--color-background-secondary)/30 transition-colors"
                                  >
                                    <td className="p-3 font-mono text-xs text-(--color-text-tertiary)">
                                      {order.id}
                                    </td>
                                    <td className="p-3 text-sm text-(--color-text-primary)">
                                      {order.customer}
                                    </td>
                                    <td className="p-3 text-sm text-(--color-text-secondary)">
                                      {order.product}
                                    </td>
                                    <td className="p-3 text-sm font-medium text-(--color-text-primary)">
                                      {order.amount}
                                    </td>
                                    <td className="p-3">
                                      <Badge
                                        className={
                                          order.status === "completed"
                                            ? "bg-(--color-text-success)/10 text-(--color-text-success) border-(--color-text-success)/20"
                                            : "bg-(--color-text-danger)/10 text-(--color-text-danger) border-(--color-text-danger)/20"
                                        }
                                        variant="outline"
                                      >
                                        {order.status}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-xs text-(--color-text-tertiary)">
                                      {order.date}
                                    </td>
                                    <td className="p-3">
                                      <button className="p-1 rounded hover:bg-(--color-background-secondary) text-(--color-text-tertiary) transition-colors">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                      <Card className="glass border-(--color-border-primary)/10">
                        <CardHeader>
                          <CardTitle className="text-(--color-text-primary)">
                            Analytics Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-(--color-background-secondary)/50 rounded-lg flex items-center justify-center border border-(--color-border-primary)/10">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-(--color-text-tertiary)" />
                              <p className="text-(--color-text-tertiary)">
                                Analytics charts would go here
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                      <Card className="glass border-(--color-border-primary)/10">
                        <CardHeader>
                          <CardTitle className="text-(--color-text-primary)">
                            Reports
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-(--color-border-primary)/10 rounded-lg glass-dark">
                              <h4 className="font-medium mb-2 text-(--color-text-primary)">
                                Monthly Report
                              </h4>
                              <p className="text-sm text-(--color-text-secondary) mb-3 text-balance">
                                Comprehensive monthly performance metrics
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-(--color-border-primary)/20 h-8"
                              >
                                Generate
                              </Button>
                            </div>
                            <div className="p-4 border border-(--color-border-primary)/10 rounded-lg glass-dark">
                              <h4 className="font-medium mb-2 text-(--color-text-primary)">
                                Sales Report
                              </h4>
                              <p className="text-sm text-(--color-text-secondary) mb-3 text-balance">
                                Detailed sales analysis and trends
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-(--color-border-primary)/20 h-8"
                              >
                                Generate
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <Card className="glass border-(--color-border-primary)/10">
                        <CardHeader>
                          <CardTitle className="text-(--color-text-primary)">
                            Dashboard Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-(--color-border-primary)/10 rounded-lg glass-dark">
                              <div>
                                <h4 className="font-medium text-(--color-text-primary)">
                                  Dark Mode
                                </h4>
                                <p className="text-sm text-(--color-text-secondary)">
                                  Toggle dark mode theme
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-(--color-border-primary)/20 h-8"
                              >
                                Configure
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-(--color-border-primary)/10 rounded-lg glass-dark">
                              <div>
                                <h4 className="font-medium text-(--color-text-primary)">
                                  Notifications
                                </h4>
                                <p className="text-sm text-(--color-text-secondary)">
                                  Manage notification preferences
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-(--color-border-primary)/20 h-8"
                              >
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <Settings className="h-5 w-5 text-(--color-interactive-primary)" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-(--color-text-primary)">
                When to use
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                <li>Admin panels and management interfaces</li>
                <li>Analytics and data visualization dashboards</li>
                <li>E-commerce backends</li>
                <li>Project management tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-(--color-text-primary)">
                Key Features
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                <li>Collapsible sidebar navigation</li>
                <li>Responsive grid layout for stats cards</li>
                <li>Tab-based content organization</li>
                <li>Search and notification system</li>
                <li>User profile dropdown</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
