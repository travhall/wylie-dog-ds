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
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Settings Form
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Multi-section settings form with various input types, validation
            states, and organized categories. Perfect for user preferences and
            application configuration.
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">Multi-section</Badge>
            <Badge variant="outline">Validation</Badge>
            <Badge variant="outline">Responsive</Badge>
            <Badge variant="outline">Accessible</Badge>
          </div>
        </div>

        {/* Settings Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Live Settings Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-4xl mx-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="New York, NY"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={3}
                          className="w-full p-3 border rounded-md bg-background"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG or GIF. Maximum file size 2MB.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Email Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                Marketing Emails
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Receive emails about new features and updates
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={emailNotifications}
                              onChange={(e) =>
                                setEmailNotifications(e.target.checked)
                              }
                              className="rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Security Alerts</div>
                              <div className="text-sm text-muted-foreground">
                                Get notified about security events
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Weekly Digest</div>
                              <div className="text-sm text-muted-foreground">
                                Receive a weekly summary of activity
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Push Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                Desktop Notifications
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Receive push notifications on your desktop
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={pushNotifications}
                              onChange={(e) =>
                                setPushNotifications(e.target.checked)
                              }
                              className="rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                Mobile Notifications
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Receive notifications on your mobile device
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          Two-Factor Authentication
                        </h3>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Enable 2FA</div>
                            <div className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) =>
                              setTwoFactorEnabled(e.target.checked)
                            }
                            className="rounded"
                          />
                        </div>
                        {twoFactorEnabled && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="font-medium mb-2">
                              Setup Two-Factor Authentication
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Use an authenticator app to generate codes
                            </div>
                            <Button variant="outline" size="sm">
                              <Smartphone className="h-4 w-4 mr-2" />
                              Setup App
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Password</h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="currentPassword"
                                type="password"
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="newPassword"
                                type="password"
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Active Sessions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  Chrome on macOS
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  192.168.1.1 • Active now
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  Safari on iPhone
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  192.168.1.2 • 2 hours ago
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Theme</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => setDarkMode(false)}
                            className={`p-4 border rounded-lg text-left ${
                              !darkMode ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Sun className="h-4 w-4" />
                              <span className="font-medium">Light</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Clean and bright interface
                            </p>
                          </button>
                          <button
                            onClick={() => setDarkMode(true)}
                            className={`p-4 border rounded-lg text-left ${
                              darkMode ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Moon className="h-4 w-4" />
                              <span className="font-medium">Dark</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Easy on the eyes in low light
                            </p>
                          </button>
                          <button className="p-4 border rounded-lg text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <Monitor className="h-4 w-4" />
                              <span className="font-medium">System</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Follow your system preference
                            </p>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Language & Region</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <select className="w-full p-2 border rounded-md bg-background">
                              <option>English (US)</option>
                              <option>Spanish</option>
                              <option>French</option>
                              <option>German</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select className="w-full p-2 border rounded-md bg-background">
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

                <TabsContent value="data" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Export Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="font-medium mb-2">
                              Export All Data
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Download all your data in JSON format
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export JSON
                            </Button>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="font-medium mb-2">Export CSV</div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Download your data as CSV files
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export CSV
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Delete Account</h3>
                        <div className="p-4 border border-destructive rounded-lg">
                          <div className="font-medium mb-2 text-destructive">
                            Danger Zone
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            Once you delete your account, there is no going
                            back. Please be certain.
                          </div>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-8 pt-6 border-t">
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
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
                <li>User profile management</li>
                <li>Application configuration</li>
                <li>Privacy and security settings</li>
                <li>Preference management</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tab-based organization</li>
                <li>Various input types and controls</li>
                <li>Real-time validation states</li>
                <li>Responsive grid layouts</li>
                <li>Security-focused sections</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
