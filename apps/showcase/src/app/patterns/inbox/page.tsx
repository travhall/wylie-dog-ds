"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Reply,
  Forward,
  Search,
  Filter,
  MoreHorizontal,
  Paperclip,
  Calendar,
  Clock,
  User,
  Tag,
  ChevronDown,
  Plus,
  Edit,
  ReplyAll,
  ExternalLink,
  FileText,
  Settings,
} from "lucide-react";

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  const emails = [
    {
      id: 1,
      from: "Sarah Johnson",
      fromEmail: "sarah@example.com",
      subject: "Q4 Revenue Report - Action Required",
      preview:
        "Hi team, I've attached the Q4 revenue report for your review. Please...",
      content:
        "Hi team,\n\nI've attached the Q4 revenue report for your review. Please take a look at the numbers and let me know if you have any questions or concerns.\n\nKey highlights:\n- Revenue up 23% YoY\n- Customer acquisition improved by 15%\n- Churn rate decreased to 2.3%\n\nWe should discuss this in our next team meeting.\n\nBest regards,\nSarah",
      date: "2 hours ago",
      read: false,
      starred: true,
      category: "work",
      hasAttachment: true,
    },
    {
      id: 2,
      from: "Mike Chen",
      fromEmail: "mike@design.com",
      subject: "New Design Mockups Ready",
      preview:
        "Hey! I've finished the mockups for the new dashboard. They look...",
      content:
        "Hey!\n\nI've finished the mockups for the new dashboard. They look amazing! I've incorporated all the feedback from our last meeting.\n\nChanges made:\n- Simplified navigation\n- Added dark mode support\n- Improved mobile responsiveness\n- Better data visualization\n\nYou can view them here: [Design Link]\n\nLet me know what you think!\n\nMike",
      date: "4 hours ago",
      read: false,
      starred: false,
      category: "design",
      hasAttachment: true,
    },
    {
      id: 3,
      from: "Emily Davis",
      fromEmail: "emily@hr.com",
      subject: "Team Building Event Next Friday",
      preview:
        "Don't forget about our team building event next Friday! We'll be...",
      content:
        "Hi everyone,\n\nDon't forget about our team building event next Friday! We'll be going to the escape room followed by dinner.\n\nSchedule:\n- 2:00 PM: Meet at office\n- 2:30 PM: Escape room challenge\n- 4:30 PM: Dinner at The Grill\n- 6:30 PM: Event ends\n\nPlease RSVP by Wednesday so we can make reservations.\n\nLooking forward to seeing everyone there!\n\nEmily",
      date: "6 hours ago",
      read: true,
      starred: false,
      category: "events",
      hasAttachment: false,
    },
    {
      id: 4,
      from: "Alex Thompson",
      fromEmail: "alex@tech.com",
      subject: "Bug Report: Login Issue",
      preview: "Found a bug in the login flow. When users try to login with...",
      content:
        "Hi team,\n\nFound a bug in the login flow. When users try to login with social accounts, they get redirected to a 404 page.\n\nSteps to reproduce:\n1. Go to login page\n2. Click 'Login with Google'\n3. Complete OAuth flow\n4. Get redirected to 404\n\nI think the issue is in the callback URL configuration.\n\nCan someone look into this?\n\nThanks,\nAlex",
      date: "1 day ago",
      read: true,
      starred: true,
      category: "bugs",
      hasAttachment: false,
    },
    {
      id: 5,
      from: "Newsletter",
      fromEmail: "news@techdigest.com",
      subject: "Weekly Tech Digest: AI Innovations",
      preview:
        "This week in tech: Major AI breakthroughs, new framework releases...",
      content:
        "This week's top stories:\n\n1. Major AI Breakthrough: New model achieves human-level reasoning\n2. React 19 Released with exciting new features\n3. Security Alert: Critical vulnerability found in popular library\n4. Startup Spotlight: Company raises $50M for sustainable tech\n\nRead more on our website!\n\nUnsubscribe | Preferences",
      date: "2 days ago",
      read: true,
      starred: false,
      category: "newsletter",
      hasAttachment: false,
    },
  ];

  const categories = [
    { name: "All", count: emails.length },
    { name: "Work", count: emails.filter((e) => e.category === "work").length },
    {
      name: "Design",
      count: emails.filter((e) => e.category === "design").length,
    },
    {
      name: "Events",
      count: emails.filter((e) => e.category === "events").length,
    },
    { name: "Bugs", count: emails.filter((e) => e.category === "bugs").length },
    {
      name: "Newsletter",
      count: emails.filter((e) => e.category === "newsletter").length,
    },
  ];

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmailData = emails.find((e) => e.id === selectedEmail);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Inbox</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A comprehensive email inbox interface with folder organization,
            search, filtering, and email management. Perfect for communication
            and messaging apps.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">Email Management</Badge>
            <Badge variant="outline">Search & Filter</Badge>
            <Badge variant="outline">Categories</Badge>
            <Badge variant="outline">Responsive</Badge>
          </div>
        </div>

        {/* Inbox Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Live Inbox Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-background h-150">
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 border-r flex flex-col">
                  <div className="p-4 border-b">
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Compose
                    </Button>
                  </div>

                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                        >
                          <span>{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </nav>

                  <div className="p-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span>2.5 GB / 15 GB</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "17%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email List */}
                <div className="w-96 border-r flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Inbox</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email.id)}
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          selectedEmail === email.id
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        } ${!email.read ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-sm ${!email.read ? "font-semibold" : ""}`}
                              >
                                {email.from}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {email.date}
                              </span>
                            </div>
                            <div
                              className={`text-sm mb-1 ${!email.read ? "font-medium" : ""}`}
                            >
                              {email.subject}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {email.preview}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {email.starred && (
                                <Star className="h-3 w-3 fill-current" />
                              )}
                              {email.hasAttachment && (
                                <Paperclip className="h-3 w-3" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {email.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 flex flex-col">
                  {selectedEmailData ? (
                    <>
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold">
                            {selectedEmailData.subject}
                          </h2>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedEmailData.from}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedEmailData.fromEmail} •{" "}
                              {selectedEmailData.date}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm">
                          {selectedEmailData.content}
                        </div>

                        {selectedEmailData.hasAttachment && (
                          <div className="mt-6 p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                Attachments
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 border rounded">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">
                                  Q4_Revenue_Report.pdf
                                </span>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Button>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                          <Button variant="outline">
                            <ReplyAll className="h-4 w-4 mr-2" />
                            Reply All
                          </Button>
                          <Button variant="outline">
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">
                          Select an email to read
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose an email from the list to view its content
                        </p>
                      </div>
                    </div>
                  )}
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
                <li>Email client applications</li>
                <li>Messaging platforms</li>
                <li>Notification centers</li>
                <li>Customer support interfaces</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Three-panel layout (sidebar, list, content)</li>
                <li>Real-time search and filtering</li>
                <li>Category-based organization</li>
                <li>Email actions (reply, forward, archive)</li>
                <li>Attachment handling</li>
                <li>Read/unread status management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
