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
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Dashboard Layout
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A comprehensive dashboard layout with sidebar navigation, header
            actions, and data visualization areas. Perfect for admin panels and
            analytics interfaces.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">Sidebar Navigation</Badge>
            <Badge variant="outline">Data Cards</Badge>
            <Badge variant="outline">Responsive</Badge>
            <Badge variant="outline">Interactive</Badge>
          </div>
        </div>

        {/* Dashboard Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Dashboard Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-background">
              {/* Header Bar */}
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        D
                      </span>
                    </div>
                    <span className="font-semibold">Dashboard</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border rounded-md bg-background text-sm w-64"
                    />
                  </div>
                  <button className="p-2 rounded-md hover:bg-muted relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <div
                  className={`${sidebarCollapsed ? "w-16" : "w-64"} border-r transition-all duration-200`}
                >
                  <nav className="p-4 space-y-2">
                    {navigationItems.map((item, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          item.active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {item.icon}
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    ))}
                  </nav>

                  {!sidebarCollapsed && (
                    <div className="p-4 border-t mt-4">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Admin User</div>
                          <div className="text-xs text-muted-foreground">
                            admin@example.com
                          </div>
                        </div>
                      </div>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted mt-2">
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
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {stat.value}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {stat.trend === "up" ? (
                                      <TrendingUp className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 text-red-500" />
                                    )}
                                    <span
                                      className={`text-xs ${
                                        stat.trend === "up"
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {stat.change}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 bg-muted rounded-lg">
                                  {stat.icon}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Recent Orders */}
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle>Recent Orders</CardTitle>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2 font-medium">
                                    Order ID
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Customer
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Product
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Amount
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Status
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Date
                                  </th>
                                  <th className="text-left p-2 font-medium"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {recentOrders.map((order) => (
                                  <tr key={order.id} className="border-b">
                                    <td className="p-2 font-mono text-sm">
                                      {order.id}
                                    </td>
                                    <td className="p-2">{order.customer}</td>
                                    <td className="p-2">{order.product}</td>
                                    <td className="p-2 font-medium">
                                      {order.amount}
                                    </td>
                                    <td className="p-2">
                                      <Badge
                                        variant={
                                          order.status === "completed"
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {order.status}
                                      </Badge>
                                    </td>
                                    <td className="p-2 text-sm text-muted-foreground">
                                      {order.date}
                                    </td>
                                    <td className="p-2">
                                      <button className="p-1 rounded hover:bg-muted">
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
                      <Card>
                        <CardHeader>
                          <CardTitle>Analytics Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Analytics charts would go here
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">
                                Monthly Report
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Comprehensive monthly performance metrics
                              </p>
                              <Button variant="outline" size="sm">
                                Generate
                              </Button>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Sales Report</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Detailed sales analysis and trends
                              </p>
                              <Button variant="outline" size="sm">
                                Generate
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Dashboard Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Dark Mode</h4>
                                <p className="text-sm text-muted-foreground">
                                  Toggle dark mode theme
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Configure
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Notifications</h4>
                                <p className="text-sm text-muted-foreground">
                                  Manage notification preferences
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">When to use</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Admin panels and management interfaces</li>
                <li>Analytics and data visualization dashboards</li>
                <li>E-commerce backends</li>
                <li>Project management tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
