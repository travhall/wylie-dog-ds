"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Check,
  X,
  Save,
  RotateCcw,
  Upload,
  Download,
} from "lucide-react";

export default function SettingsFormPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Settings Form
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Multi-section settings form with various input types, validation
            states, and organized categories. Perfect for user preferences and
            application configuration.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Multi-section
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Validation
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Responsive
            </Badge>
            <Badge
              variant="outline"
              className="border-(--color-border-primary)/20 text-(--color-text-secondary)"
            >
              Accessible
            </Badge>
          </div>
        </div>

        {/* Settings Form Preview */}
        <Card className="glass border-(--color-border-primary)/10 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/5">
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <Settings className="h-5 w-5" />
              Live Settings Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 mb-10 h-11 p-1 bg-(--color-background-secondary)/50 rounded-lg">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm"
                  >
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm"
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm"
                  >
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger
                    value="data"
                    className="data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm"
                  >
                    Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="profile"
                  className="space-y-6 animate-in fade-in duration-300"
                >
                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                          >
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            className="border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                          >
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            className="border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                        >
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                        >
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                          <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                        >
                          Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                          <Input
                            id="location"
                            placeholder="New York, NY"
                            className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                        >
                          Bio
                        </Label>
                        <textarea
                          id="bio"
                          rows={3}
                          className="w-full p-3 border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-primary)/50 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none transition-all"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="text-(--color-text-primary)">
                        Profile Picture
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-(--color-background-secondary)/50 border border-(--color-border-primary)/10 rounded-full flex items-center justify-center shadow-inner">
                          <User className="h-8 w-8 text-(--color-text-tertiary)" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-(--color-interactive-primary) text-white hover:opacity-90"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                            >
                              Remove
                            </Button>
                          </div>
                          <p className="text-xs text-(--color-text-tertiary)">
                            JPG, PNG or GIF. Maximum file size 2MB.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="notifications"
                  className="space-y-6 animate-in fade-in duration-300"
                >
                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Email Notifications
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div>
                              <div className="font-semibold text-(--color-text-primary)">
                                Marketing Emails
                              </div>
                              <div className="text-sm text-(--color-text-tertiary)">
                                Receive emails about new features and updates
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={emailNotifications}
                              onChange={(e) =>
                                setEmailNotifications(e.target.checked)
                              }
                              className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div>
                              <div className="font-semibold text-(--color-text-primary)">
                                Security Alerts
                              </div>
                              <div className="text-sm text-(--color-text-tertiary)">
                                Get notified about security events
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div>
                              <div className="font-semibold text-(--color-text-primary)">
                                Weekly Digest
                              </div>
                              <div className="text-sm text-(--color-text-tertiary)">
                                Receive a weekly summary of activity
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Push Notifications
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div>
                              <div className="font-semibold text-(--color-text-primary)">
                                Desktop Notifications
                              </div>
                              <div className="text-sm text-(--color-text-tertiary)">
                                Receive push notifications on your desktop
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={pushNotifications}
                              onChange={(e) =>
                                setPushNotifications(e.target.checked)
                              }
                              className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div>
                              <div className="font-semibold text-(--color-text-primary)">
                                Mobile Notifications
                              </div>
                              <div className="text-sm text-(--color-text-tertiary)">
                                Receive notifications on your mobile device
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="security"
                  className="space-y-6 animate-in fade-in duration-300"
                >
                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Two-Factor Authentication
                        </h3>
                        <div className="flex items-center justify-between p-5 border border-(--color-border-primary)/10 rounded-xl bg-(--color-background-secondary)/10">
                          <div>
                            <div className="font-bold text-(--color-text-primary)">
                              Enable 2FA
                            </div>
                            <div className="text-sm text-(--color-text-tertiary)">
                              Add an extra layer of security to your account
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) =>
                              setTwoFactorEnabled(e.target.checked)
                            }
                            className="h-5 w-5 rounded border-(--color-border-primary)/30 bg-transparent text-(--color-interactive-primary) focus:ring-(--color-interactive-primary)/20 transition-all"
                          />
                        </div>
                        {twoFactorEnabled && (
                          <div className="p-5 bg-(--color-interactive-primary)/5 border border-(--color-interactive-primary)/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                            <div className="font-bold text-(--color-interactive-primary) mb-1 italic">
                              Setup Two-Factor Authentication
                            </div>
                            <div className="text-sm text-(--color-text-secondary) mb-4">
                              Use an authenticator app to generate codes for
                              secure login
                            </div>
                            <Button
                              size="sm"
                              className="bg-(--color-interactive-primary) text-white hover:opacity-90"
                            >
                              <Smartphone className="h-4 w-4 mr-2" />
                              Setup App
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Password Management
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="currentPassword"
                              className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                            >
                              Current Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                              <Input
                                id="currentPassword"
                                type="password"
                                className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="newPassword"
                              className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                            >
                              New Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                              <Input
                                id="newPassword"
                                type="password"
                                className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="confirmPassword"
                              className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                            >
                              Confirm New Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--color-text-tertiary)" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                className="pl-10 border-(--color-border-primary)/20 bg-(--color-background-primary)/50 focus:ring-(--color-border-focus)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Active Sessions
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-(--color-background-secondary)/50 flex items-center justify-center border border-(--color-border-primary)/10 shadow-sm">
                                <Monitor className="h-5 w-5 text-(--color-text-tertiary)" />
                              </div>
                              <div>
                                <div className="font-bold text-(--color-text-primary)">
                                  Chrome on macOS
                                </div>
                                <div className="text-xs text-(--color-text-tertiary)">
                                  192.168.1.1 • Active now
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-interactive-danger) hover:bg-(--color-interactive-danger)/5"
                            >
                              Revoke
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 border border-(--color-border-primary)/5 rounded-xl bg-(--color-background-secondary)/5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-(--color-background-secondary)/50 flex items-center justify-center border border-(--color-border-primary)/10 shadow-sm">
                                <Smartphone className="h-5 w-5 text-(--color-text-tertiary)" />
                              </div>
                              <div>
                                <div className="font-bold text-(--color-text-primary)">
                                  Safari on iPhone
                                </div>
                                <div className="text-xs text-(--color-text-tertiary)">
                                  192.168.1.2 • 2 hours ago
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-interactive-danger) hover:bg-(--color-interactive-danger)/5"
                            >
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="appearance"
                  className="space-y-6 animate-in fade-in duration-300"
                >
                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
                        <Palette className="h-5 w-5" />
                        Appearance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Interface Theme
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <button
                            onClick={() => setDarkMode(false)}
                            className={`p-5 border rounded-2xl text-left transition-all hover:scale-[1.02] ${
                              !darkMode
                                ? "border-(--color-interactive-primary) bg-(--color-interactive-primary)/5 shadow-lg shadow-(--color-interactive-primary)/10"
                                : "border-(--color-border-primary)/10 bg-(--color-background-secondary)/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Sun
                                className={`h-5 w-5 ${!darkMode ? "text-(--color-interactive-primary)" : "text-(--color-text-tertiary)"}`}
                              />
                              <span
                                className={`font-bold ${!darkMode ? "text-(--color-interactive-primary)" : "text-(--color-text-primary)"}`}
                              >
                                Light
                              </span>
                            </div>
                            <p className="text-xs text-(--color-text-tertiary) leading-relaxed">
                              Clean and bright interface for daytime clarity
                            </p>
                          </button>
                          <button
                            onClick={() => setDarkMode(true)}
                            className={`p-5 border rounded-2xl text-left transition-all hover:scale-[1.02] ${
                              darkMode
                                ? "border-(--color-interactive-primary) bg-(--color-interactive-primary)/5 shadow-lg shadow-(--color-interactive-primary)/10"
                                : "border-(--color-border-primary)/10 bg-(--color-background-secondary)/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Moon
                                className={`h-5 w-5 ${darkMode ? "text-(--color-interactive-primary)" : "text-(--color-text-tertiary)"}`}
                              />
                              <span
                                className={`font-bold ${darkMode ? "text-(--color-interactive-primary)" : "text-(--color-text-primary)"}`}
                              >
                                Dark
                              </span>
                            </div>
                            <p className="text-xs text-(--color-text-tertiary) leading-relaxed">
                              Easy on the eyes for comfortable nighttime usage
                            </p>
                          </button>
                          <button className="p-5 border border-(--color-border-primary)/10 rounded-2xl text-left bg-(--color-background-secondary)/5 hover:border-(--color-border-primary)/30 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-3">
                              <Monitor className="h-5 w-5 text-(--color-text-tertiary)" />
                              <span className="font-bold text-(--color-text-primary)">
                                System
                              </span>
                            </div>
                            <p className="text-xs text-(--color-text-tertiary) leading-relaxed">
                              Automatically sync with your OS preferences
                            </p>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Region & Localization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="language"
                              className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                            >
                              Language
                            </Label>
                            <select className="w-full p-2.5 border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-primary)/50 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none appearance-none transition-all">
                              <option>English (US)</option>
                              <option>Spanish</option>
                              <option>French</option>
                              <option>German</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="timezone"
                              className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)"
                            >
                              Timezone
                            </Label>
                            <select className="w-full p-2.5 border border-(--color-border-primary)/20 rounded-lg bg-(--color-background-primary)/50 text-sm text-(--color-text-secondary) focus:ring-1 focus:ring-(--color-border-focus) focus:outline-none appearance-none transition-all">
                              <option>UTC-08:00 Pacific Time</option>
                              <option>UTC-05:00 Eastern Time</option>
                              <option>UTC+00:00 London</option>
                              <option>UTC+01:00 Paris</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="data"
                  className="space-y-6 animate-in fade-in duration-300"
                >
                  <Card className="border-(--color-border-primary)/10 bg-(--color-background-primary)/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
                        <Database className="h-5 w-5" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-tertiary)">
                          Export Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-5 border border-(--color-border-primary)/10 rounded-2xl bg-(--color-background-secondary)/5 group hover:border-(--color-border-primary)/30 transition-all">
                            <div className="font-bold text-(--color-text-primary) mb-1 group-hover:text-(--color-interactive-primary) transition-colors">
                              Export All Data
                            </div>
                            <div className="text-sm text-(--color-text-tertiary) mb-5">
                              Download all your personal data in JSON format
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export JSON
                            </Button>
                          </div>
                          <div className="p-5 border border-(--color-border-primary)/10 rounded-2xl bg-(--color-background-secondary)/5 group hover:border-(--color-border-primary)/30 transition-all">
                            <div className="font-bold text-(--color-text-primary) mb-1 group-hover:text-(--color-interactive-primary) transition-colors">
                              Export CSV
                            </div>
                            <div className="text-sm text-(--color-text-tertiary) mb-5">
                              Download your preferences as CSV files
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export CSV
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-interactive-danger)">
                          Delete Account
                        </h3>
                        <div className="p-6 border border-(--color-interactive-danger)/20 rounded-2xl bg-(--color-interactive-danger)/5">
                          <div className="font-bold text-(--color-interactive-danger) mb-2 uppercase tracking-tight">
                            Critical: Danger Zone
                          </div>
                          <div className="text-sm text-(--color-text-secondary) mb-5 leading-relaxed">
                            Once you delete your account, all associated data
                            will be permanently removed. This action cannot be
                            undone. Please proceed with extreme caution.
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-(--color-interactive-danger) text-white hover:opacity-90 shadow-lg shadow-(--color-interactive-danger)/20"
                          >
                            Delete Account Permanently
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-12 pt-8 border-t border-(--color-border-primary)/10">
                <Button
                  variant="outline"
                  className="border-(--color-border-primary)/20 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)/50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button className="bg-(--color-interactive-primary) text-white hover:opacity-90 shadow-lg shadow-(--color-interactive-primary)/20 px-8 transition-transform active:scale-95">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card className="glass border-(--color-border-primary)/10 shadow-lg">
          <CardHeader className="border-b border-(--color-border-primary)/5 bg-(--color-background-secondary)/5">
            <CardTitle className="flex items-center gap-2 text-(--color-text-primary)">
              <Settings className="h-5 w-5" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-primary) mb-4">
                  When to use
                </h3>
                <ul className="space-y-3">
                  {[
                    "Comprehensive user profile management",
                    "Complex application-wide configuration",
                    "Granular privacy and security controls",
                    "User-facing theme and visual preferences",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-(--color-text-secondary)"
                    >
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-(--color-interactive-primary) shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-primary) mb-4">
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {[
                    "Tab-based logical categorization for usability",
                    "Wide range of specialized input controls",
                    "Adaptive grid layouts for consistent density",
                    "High-visibility security and danger zones",
                    "Seamless responsive transitions for mobile users",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-(--color-text-secondary)"
                    >
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-(--color-interactive-primary) shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
