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
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Inbox
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            A comprehensive email inbox interface with folder organization,
            search, filtering, and email management. Perfect for communication
            and messaging apps.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Email Management
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Search & Filter
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Categories
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Responsive
            </Badge>
          </div>
        </div>

        {/* Inbox Preview */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <Inbox className="h-5 w-5" />
              Live Inbox Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-primary)/50 h-150 overflow-hidden shadow-xl">
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 border-r border-(--color-border-primary)/10 flex flex-col bg-(--color-background-secondary)/20">
                  <div className="p-4 border-b border-(--color-border-primary)/10">
                    <Button className="w-full bg-(--color-interactive-primary) text-white hover:opacity-90">
                      <Plus className="h-4 w-4 mr-2" />
                      Compose
                    </Button>
                  </div>

                  <div className="p-4 border-b border-(--color-border-primary)/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                      <Input
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                      />
                    </div>
                  </div>

                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-(--color-background-secondary)/50 text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <span>{category.name}</span>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-(--color-background-secondary) text-(--color-text-tertiary)"
                          >
                            {category.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </nav>

                  <div className="p-4 border-t border-(--color-border-primary)/10 bg-(--color-background-secondary)/10">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-(--color-text-tertiary)">
                          Storage
                        </span>
                        <span className="text-(--color-text-secondary)">
                          2.5 GB / 15 GB
                        </span>
                      </div>
                      <div className="w-full bg-(--color-background-secondary) rounded-full h-1.5">
                        <div
                          className="bg-(--color-interactive-primary) h-1.5 rounded-full"
                          style={{ width: "17%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email List */}
                <div className="w-96 border-r border-(--color-border-primary)/10 flex flex-col bg-(--color-background-primary)/20">
                  <div className="p-4 border-b border-(--color-border-primary)/10 bg-(--color-background-secondary)/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-(--color-text-primary)">
                        Inbox
                      </h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)"
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)"
                        >
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
                        className={`p-4 border-b border-(--color-border-primary)/5 cursor-pointer transition-all duration-200 ${
                          selectedEmail === email.id
                            ? "bg-(--color-background-secondary) border-l-2 border-l-(--color-interactive-primary)"
                            : "hover:bg-(--color-background-secondary)/50"
                        } ${!email.read ? "bg-(--color-interactive-primary)/3" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-(--color-background-secondary) border border-(--color-border-primary)/10 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-(--color-text-tertiary)" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-sm ${!email.read ? "font-bold text-(--color-text-primary)" : "text-(--color-text-secondary)"}`}
                              >
                                {email.from}
                              </span>
                              <span className="text-xs text-(--color-text-tertiary)">
                                {email.date}
                              </span>
                            </div>
                            <div
                              className={`text-sm mb-1 ${!email.read ? "font-semibold text-(--color-text-primary)" : "text-(--color-text-secondary)"}`}
                            >
                              {email.subject}
                            </div>
                            <div className="text-xs text-(--color-text-tertiary) truncate leading-relaxed">
                              {email.preview}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {email.starred && (
                                <Star className="h-3 w-3 fill-(--color-interactive-warning) text-(--color-interactive-warning)" />
                              )}
                              {email.hasAttachment && (
                                <Paperclip className="h-3 w-3 text-(--color-text-tertiary)" />
                              )}
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1.5 border-(--color-border-primary)/20 text-(--color-text-tertiary) uppercase tracking-wider"
                              >
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
                <div className="flex-1 flex flex-col bg-(--color-background-primary)/40">
                  {selectedEmailData ? (
                    <>
                      <div className="p-6 border-b border-(--color-border-primary)/10 bg-(--color-background-secondary)/5">
                        <div className="flex items-start justify-between mb-6">
                          <h2 className="text-2xl font-bold text-(--color-text-primary) tracking-tight">
                            {selectedEmailData.subject}
                          </h2>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-(--color-text-tertiary) hover:text-(--color-interactive-danger) hover:bg-(--color-background-secondary)/50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-(--color-background-secondary) border border-(--color-border-primary)/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-(--color-text-tertiary)" />
                          </div>
                          <div>
                            <div className="font-semibold text-(--color-text-primary)">
                              {selectedEmailData.from}
                            </div>
                            <div className="text-xs text-(--color-text-tertiary)">
                              {selectedEmailData.fromEmail} •{" "}
                              {selectedEmailData.date}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-8 overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm text-(--color-text-secondary) leading-loose max-w-2xl">
                          {selectedEmailData.content}
                        </div>

                        {selectedEmailData.hasAttachment && (
                          <div className="mt-10 p-4 border border-(--color-border-primary)/10 rounded-xl bg-(--color-background-secondary)/10">
                            <div className="flex items-center gap-2 mb-4">
                              <Paperclip className="h-4 w-4 text-(--color-text-tertiary)" />
                              <span className="font-semibold text-xs text-(--color-text-secondary) uppercase tracking-wider">
                                Attachments (1)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center justify-between p-3 border border-(--color-border-primary)/10 rounded-lg bg-(--color-background-primary)/50 group hover:border-(--color-border-primary)/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded bg-red-500/10 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-red-500" />
                                  </div>
                                  <span className="text-sm font-medium text-(--color-text-secondary) truncate max-w-[150px]">
                                    Q4_Revenue_Report.pdf
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-(--color-text-tertiary) group-hover:text-(--color-interactive-primary)"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 border-t border-(--color-border-primary)/10 bg-(--color-background-secondary)/5">
                        <div className="flex gap-3">
                          <Button className="bg-(--color-interactive-primary) text-white hover:opacity-90 shadow-sm transition-transform active:scale-95">
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                          <Button
                            variant="outline"
                            className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                          >
                            <ReplyAll className="h-4 w-4 mr-2" />
                            Reply All
                          </Button>
                          <Button
                            variant="outline"
                            className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                          >
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-(--color-background-primary)/20">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-(--color-background-secondary)/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-(--color-border-primary)/10 shadow-inner">
                          <Mail className="h-8 w-8 text-(--color-text-tertiary) opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2">
                          Select an email to read
                        </h3>
                        <p className="text-sm text-(--color-text-tertiary) max-w-xs mx-auto">
                          Choose an email from the list on the left to view its
                          full content and attachments.
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
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <Settings className="h-5 w-5" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-(--color-text-primary)">
                When to use
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-(--color-text-secondary)">
                <li>Email client applications and messaging platforms</li>
                <li>Notification centers and activity feeds</li>
                <li>Customer support ticket management interfaces</li>
                <li>Internal communication and collaborative tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-(--color-text-primary)">
                Key Features
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside text-sm text-(--color-text-secondary)">
                <li>Three-panel layout (sidebar, list, content)</li>
                <li>Real-time search and filtering capabilities</li>
                <li>Category and tag-based organization</li>
                <li>Contextual email actions (reply, forward, archive)</li>
                <li>Sophisticated attachment handling</li>
                <li>Visual read/unread status management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
