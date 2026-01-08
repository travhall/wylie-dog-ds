"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wyliedog/ui/table";
import {
  Database,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function DataTablePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const sampleData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Active",
      lastActive: "2024-01-14",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      status: "Inactive",
      lastActive: "2024-01-10",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "Moderator",
      status: "Active",
      lastActive: "2024-01-15",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "lep@example.com",
      role: "User",
      status: "Pending",
      lastActive: "2024-01-13",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Data Table
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Comprehensive data table with sorting, filtering, pagination, and
            actions. Demonstrates complex data presentation patterns and user
            interactions.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Data Table Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-(--color-background-secondary)/50 p-1">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary)"
                >
                  Basic
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary)"
                >
                  Advanced
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary)"
                >
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary)"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary)"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {/* Basic Table */}
                  <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden bg-(--color-background-primary)/30 glass-dark">
                    <Table>
                      <TableHeader className="bg-(--color-background-secondary)/30">
                        <TableRow className="border-b border-(--color-border-primary)/10 hover:bg-transparent">
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            <Button
                              variant="ghost"
                              onClick={() => setSortColumn("name")}
                              className="h-auto p-0 font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-transparent"
                            >
                              Name
                              <ArrowUpDown className="ml-2 h-4 w-4 text-(--color-text-tertiary)" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Email
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Role
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Last Active
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleData.map((user) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-(--color-border-primary)/10 hover:bg-(--color-background-secondary)/30 transition-colors"
                          >
                            <TableCell className="font-medium text-(--color-text-primary)">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-(--color-text-secondary)">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-(--color-text-secondary)">
                              {user.role}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusColor(user.status)}
                                className="font-medium"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-(--color-text-tertiary) text-sm">
                              {user.lastActive}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-(--color-text-tertiary)">
                      Showing 1 to 5 of 25 results
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) min-w-[32px]"
                      >
                        1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) min-w-[32px]"
                      >
                        2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) min-w-[32px]"
                      >
                        3
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {/* Advanced Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                        <Input
                          placeholder="Search..."
                          className="pl-10 w-64 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                        />
                      </div>
                      <select className="border border-(--color-border-primary)/20 rounded-md px-3 py-2 text-sm bg-(--color-background-primary)/50 text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none">
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>User</option>
                        <option>Moderator</option>
                      </select>
                      <select className="border border-(--color-border-primary)/20 rounded-md px-3 py-2 text-sm bg-(--color-background-primary)/50 text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) h-9"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) h-9"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Table with Selection */}
                  <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden bg-(--color-background-primary)/30 glass-dark">
                    <Table>
                      <TableHeader className="bg-(--color-background-secondary)/30">
                        <TableRow className="border-b border-(--color-border-primary)/10 hover:bg-transparent">
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              className="rounded border-(--color-border-primary)/30 bg-transparent"
                            />
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            <Button
                              variant="ghost"
                              onClick={() => setSortColumn("name")}
                              className="h-auto p-0 font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-transparent"
                            >
                              Name
                              <ArrowUpDown className="ml-2 h-4 w-4 text-(--color-text-tertiary)" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Email
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Role
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Last Active
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleData.map((user) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-(--color-border-primary)/10 hover:bg-(--color-background-secondary)/30 transition-colors"
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded border-(--color-border-primary)/30 bg-transparent"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-(--color-text-primary)">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-(--color-text-secondary)">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusColor(user.status)}
                                className="font-medium"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-(--color-text-tertiary) text-sm">
                              {user.lastActive}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Advanced Pagination */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-(--color-text-tertiary)">
                        Rows per page:
                      </span>
                      <select className="border border-(--color-border-primary)/20 rounded-md px-2 py-1 text-sm bg-(--color-background-primary)/50 text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                        <option>100</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-(--color-border-primary)/20 text-(--color-text-tertiary) opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) min-w-[32px]"
                      >
                        1
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="min-w-[32px] bg-(--color-interactive-primary) text-white shadow-sm hover:opacity-90"
                      >
                        2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary) min-w-[32px]"
                      >
                        3
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {/* Table with Actions */}
                  <div className="border border-(--color-border-primary)/20 rounded-lg overflow-hidden bg-(--color-background-primary)/30 glass-dark">
                    <Table>
                      <TableHeader className="bg-(--color-background-secondary)/30">
                        <TableRow className="border-b border-(--color-border-primary)/10 hover:bg-transparent">
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Name
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Email
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Role
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-(--color-text-secondary) font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleData.map((user) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-(--color-border-primary)/10 hover:bg-(--color-background-secondary)/30 transition-colors"
                          >
                            <TableCell className="font-medium text-(--color-text-primary)">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-(--color-text-secondary)">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusColor(user.status)}
                                className="font-medium"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-(--color-text-tertiary) hover:text-(--color-interactive-primary) hover:bg-(--color-background-secondary)/50 transition-colors h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-(--color-text-tertiary) hover:text-(--color-interactive-primary) hover:bg-(--color-background-secondary)/50 transition-colors h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-(--color-text-tertiary) hover:text-(--color-interactive-danger) hover:bg-(--color-background-secondary)/50 transition-colors h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between border-t border-(--color-border-primary)/10 pt-4 px-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-(--color-text-tertiary) font-medium">
                        3 items selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-(--color-interactive-danger)/20 text-(--color-interactive-danger) hover:bg-(--color-interactive-danger)/10 hover:text-(--color-interactive-danger)"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary)"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
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
                <Database className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Data Management
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) text-balance">
                    Efficient handling of large datasets with pagination and
                    virtual scrolling capabilities.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Search className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Search & Filter
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) text-balance">
                    Real-time search and multi-criteria filtering for quick data
                    discovery.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ArrowUpDown className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Sorting
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) text-balance">
                    Multi-column sorting with visual indicators and persistent
                    sort state.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MoreHorizontal className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Row Actions
                  </h3>
                  <p className="text-sm text-(--color-text-secondary) text-balance">
                    Contextual actions for individual rows and bulk operations
                    on selected items.
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
                  <li>For displaying structured data with multiple columns</li>
                  <li>When users need to sort, filter, or search data</li>
                  <li>For managing collections with CRUD operations</li>
                  <li>When pagination is required for large datasets</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-(--color-text-primary)">
                  Best Practices
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                  <li>Keep table headers clear and descriptive</li>
                  <li>Provide loading states for async data</li>
                  <li>Implement keyboard navigation</li>
                  <li>Use appropriate column widths and alignment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
