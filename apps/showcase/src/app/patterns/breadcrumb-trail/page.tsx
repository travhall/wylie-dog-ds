"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Button } from "@wyliedog/ui/button";
import { Badge } from "@wyliedog/ui/badge";
import {
  ChevronRight,
  Home,
  Folder,
  File,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Define the type for our breadcrumb items
type BreadcrumbItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
};

// Define the type for our tree structure
type TreeNode = {
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

// Sample data for the file explorer
export const sampleTree: TreeNode[] = [
  {
    name: "Documents",
    type: "folder",
    children: [
      {
        name: "Work",
        type: "folder",
        children: [
          { name: "Project1.pdf", type: "file" },
          { name: "Project2.docx", type: "file" },
        ],
      },
      {
        name: "Personal",
        type: "folder",
        children: [
          { name: "Resume.pdf", type: "file" },
          { name: "Notes.txt", type: "file" },
        ],
      },
    ],
  },
  {
    name: "Pictures",
    type: "folder",
    children: [
      { name: "Vacation.jpg", type: "file" },
      { name: "Family.jpg", type: "file" },
    ],
  },
];

// Breadcrumb component
function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={`${item.path}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-(--color-text-tertiary) mx-2" />
            )}
            <a
              href={item.path}
              className={`text-sm font-medium transition-colors ${
                index === items.length - 1
                  ? "text-(--color-text-primary)"
                  : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
            >
              {item.icon && (
                <span className="mr-2 text-(--color-text-tertiary)">
                  {item.icon}
                </span>
              )}
              {item.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// File explorer component
function FileExplorer({ tree }: { tree: TreeNode[] }) {
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (nodes: TreeNode[], path = "") => {
    return nodes.map((node, index) => {
      const nodePath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = expandedFolders[nodePath];

      return (
        <div key={nodePath} className="pl-4">
          <div
            className="flex items-center py-1 hover:bg-(--color-background-secondary)/50 rounded cursor-pointer group"
            onClick={() => node.type === "folder" && toggleFolder(nodePath)}
          >
            {node.type === "folder" ? (
              <>
                <button className="mr-1 text-(--color-text-tertiary) group-hover:text-(--color-text-primary)">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <Folder className="h-4 w-4 mr-2 text-(--color-interactive-primary)" />
              </>
            ) : (
              <File className="h-4 w-4 mr-2 text-(--color-text-tertiary) ml-5" />
            )}
            <span className="text-sm text-(--color-text-secondary) group-hover:text-(--color-text-primary)">
              {node.name}
            </span>
          </div>

          {node.type === "folder" && isExpanded && node.children && (
            <div className="ml-4 border-l border-(--color-border-primary)/10">
              {renderTree(node.children, nodePath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="border border-(--color-border-primary)/20 rounded-lg p-4 bg-(--color-background-primary) glass">
      {renderTree(tree)}
    </div>
  );
}

export default function BreadcrumbTrailPage() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
    { name: "Documents", path: "/documents" },
    { name: "Work", path: "/documents/work" },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
          Breadcrumb Trail
        </h1>
        <p className="text-lg text-(--color-text-secondary) max-w-3xl">
          Navigate hierarchical content with clear context and easy access to
          parent levels. Breadcrumbs help users understand their location within
          the application.
        </p>
      </div>

      {/* Interactive Demo */}
      <Card className="glass border-(--color-border-primary)/10">
        <CardHeader>
          <CardTitle className="text-(--color-text-primary)">
            Breadcrumb Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-(--color-text-primary)">
              Basic Breadcrumb
            </h3>
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-(--color-text-primary)">
              File Explorer with Breadcrumbs
            </h3>
            <div className="space-y-4">
              <div className="p-2 border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-secondary)/20">
                <Breadcrumbs
                  items={[
                    {
                      name: "Home",
                      path: "#",
                      icon: <Home className="h-4 w-4" />,
                    },
                    { name: "Documents", path: "#" },
                    { name: "Work", path: "#" },
                  ]}
                />
              </div>
              <FileExplorer tree={sampleTree} />
            </div>
          </div>
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
              <div className="bg-(--color-interactive-primary)/10 p-2 rounded-full">
                <ChevronRight className="h-5 w-5 text-(--color-interactive-primary)" />
              </div>
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  Hierarchical Navigation
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Clearly shows the current location within the application's
                  hierarchy.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-(--color-interactive-primary)/10 p-2 rounded-full">
                <Home className="h-5 w-5 text-(--color-interactive-primary)" />
              </div>
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  Quick Navigation
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Allows users to quickly jump to any parent level.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-(--color-interactive-primary)/10 p-2 rounded-full">
                <Folder className="h-5 w-5 text-(--color-interactive-primary)" />
              </div>
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  File Explorer
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Interactive file explorer with expandable folders.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-(--color-interactive-primary)/10 p-2 rounded-full">
                <ChevronDown className="h-5 w-5 text-(--color-interactive-primary)" />
              </div>
              <div>
                <h3 className="font-medium mb-1 text-(--color-text-primary)">
                  Responsive
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Adapts to different screen sizes and devices.
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
                <li>For applications with deep navigation hierarchies</li>
                <li>When users need to understand their location in the app</li>
                <li>For file explorers and content management systems</li>
                <li>
                  When you want to provide quick navigation to parent sections
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-(--color-text-primary)">
                Best Practices
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                <li>Use chevrons or slashes as separators between items</li>
                <li>Make all items except the current page clickable</li>
                <li>Keep breadcrumb labels short and meaningful</li>
                <li>Consider truncating long paths in mobile views</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
