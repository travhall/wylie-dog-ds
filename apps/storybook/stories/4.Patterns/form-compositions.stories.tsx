import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Textarea } from "@wyliedog/ui/textarea";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { Switch } from "@wyliedog/ui/switch";
import { Badge } from "@wyliedog/ui/badge";
import { Separator } from "@wyliedog/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import { useState, useCallback } from "react";

const meta: Meta = {
  title: "4. Patterns/Form Compositions",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Real-world form composition examples demonstrating how components work together. These patterns include contact forms, multi-step forms, validation, user preferences, project creation, and payment forms.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
      table: {
        type: { summary: "string" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ContactForm: Story = {
  render: () => (
    <Card className="w-125">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" required>
              First Name
            </Label>
            <Input id="first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" required>
              Last Name
            </Label>
            <Input id="last-name" placeholder="Doe" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Acme Corp" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inquiry-type">Type of Inquiry</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select inquiry type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" required>
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us how we can help you..."
            className="min-h-30"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox id="consent" className="mt-1" />
            <Label htmlFor="consent" required className="leading-5">
              I agree to be contacted regarding my inquiry
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="newsletter" className="mt-1" />
            <Label htmlFor="newsletter" className="leading-5">
              Subscribe to our newsletter for updates and insights
            </Label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1">Send Message</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const MultiStepForm: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("account");

    return (
      <Card className="w-150">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" required>
                    Username
                  </Label>
                  <Input id="username" placeholder="johndoe" />{" "}
                  {/* cSpell:ignore johndoe */}
                  <p className="text-xs text-gray-500">
                    This will be your unique identifier
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" required>
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" required>
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" required>
                    I agree to the Terms of Service
                  </Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("profile")}>
                  Next: Profile
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="mst">Mountain Time</SelectItem>
                        <SelectItem value="cst">Central Time</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("account")}
                >
                  Previous
                </Button>
                <Button onClick={() => setActiveTab("preferences")}>
                  Next: Preferences
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">
                        Email notifications
                      </Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">
                        Push notifications
                      </Label>
                      <Switch id="push-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">
                        SMS notifications
                      </Label>
                      <Switch id="sms-notifications" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <RadioGroup defaultValue="public">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" />
                      <Label htmlFor="friends">Friends only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("profile")}
                >
                  Previous
                </Button>
                <Button>Create Account</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  },
};

export const FormWithValidation: Story = {
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (formData: FormData) => {
      const newErrors: Record<string, string> = {};

      if (!formData.get("email")) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.get("email") as string)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!formData.get("password")) {
        newErrors.password = "Password is required";
      } else if ((formData.get("password") as string).length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (!formData.get("confirm-password")) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (
        formData.get("password") !== formData.get("confirm-password")
      ) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newErrors = validate(formData);

      setErrors(newErrors);
      setSubmitted(true);

      if (Object.keys(newErrors).length === 0) {
        alert("Form submitted successfully!");
      }
    };

    return (
      <Card className="w-125">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" required>
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role">
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" name="terms" />
                <Label htmlFor="terms" required>
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
            </div>

            {submitted && Object.keys(errors).length === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Account created successfully!
                </p>
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  },
};

export const UserPreferences: Story = {
  render: () => (
    <Card className="w-125">
      <CardHeader>
        <CardTitle>Account Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Profile Information</h4>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" defaultValue="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="pst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                  <SelectItem value="cst">Central Time (CST)</SelectItem>
                  <SelectItem value="est">Eastern Time (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>{" "}
                  {/* cSpell:ignore Español */}
                  <SelectItem value="fr">Français</SelectItem>{" "}
                  {/* cSpell:ignore Français */}
                  <SelectItem value="de">Deutsch</SelectItem>{" "}
                  {/* cSpell:ignore Deutsch */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Notifications</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-xs text-neutral-600">
                  Get notified about important updates
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push notifications</Label>
                <p className="text-xs text-neutral-600">
                  Receive browser notifications
                </p>
              </div>
              <Switch id="push-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing emails</Label>
                <p className="text-xs text-neutral-600">
                  Product updates and promotions
                </p>
              </div>
              <Switch id="marketing-emails" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Privacy</h4>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="profile-public" />
              <Label htmlFor="profile-public">Make my profile public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="analytics" defaultChecked />
              <Label htmlFor="analytics">Share usage analytics</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="third-party" />
              <Label htmlFor="third-party">
                Allow third-party integrations
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1">Save Changes</Button>
          <Button variant="ghost">Reset</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ProjectCreation: Story = {
  render: () => (
    <Card className="w-150">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-name" required>
            Project Name
          </Label>
          <Input id="project-name" placeholder="My Awesome Project" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            placeholder="Brief description of your project..."
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-type" required>
              Project Type
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API Service</SelectItem>
                <SelectItem value="library">Library/Package</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="vanilla">Vanilla JS</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select defaultValue="private">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license">License</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select license" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mit">MIT</SelectItem>
                <SelectItem value="apache">Apache 2.0</SelectItem>
                <SelectItem value="gpl">GPL v3</SelectItem>
                <SelectItem value="bsd">BSD 3-Clause</SelectItem>
                <SelectItem value="none">No License</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-size">Team Size</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (1 person)</SelectItem>
                <SelectItem value="small">Small (2-5)</SelectItem>
                <SelectItem value="medium">Medium (6-15)</SelectItem>
                <SelectItem value="large">Large (16+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Project Features</h4>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="feature-auth" />
              <Label htmlFor="feature-auth">Authentication</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="feature-db" />
              <Label htmlFor="feature-db">Database</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="feature-api" defaultChecked />
              <Label htmlFor="feature-api">REST API</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="feature-tests" defaultChecked />
              <Label htmlFor="feature-tests">Unit Tests</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="feature-ci" />
              <Label htmlFor="feature-ci">CI/CD Pipeline</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="feature-docs" />
              <Label htmlFor="feature-docs">Documentation</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-deploy">Auto-deploy to staging</Label>
              <p className="text-xs text-neutral-600">
                Automatically deploy commits to staging environment
              </p>
            </div>
            <Switch id="auto-deploy" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Build notifications</Label>
              <p className="text-xs text-neutral-600">
                Get notified about build status
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1">Create Project</Button>
          <Button variant="secondary">Save as Template</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const PaymentForm: Story = {
  render: () => (
    <Card className="w-125">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Pro Plan</p>
              <p className="text-sm text-gray-600">Monthly subscription</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">$29.99</p>
              <Badge variant="success">Save 20%</Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number" required>
              Card Number
            </Label>
            <Input id="card-number" placeholder="1234 5678 9012 3456" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="expiry" required>
                Expiry Date
              </Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" required>
                CVC
              </Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholder-name" required>
              Cardholder Name
            </Label>
            <Input id="cardholder-name" placeholder="John Doe" />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Billing Address</h4>

          <div className="space-y-2">
            <Label htmlFor="billing-country" required>
              Country
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input id="billing-city" placeholder="San Francisco" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP Code</Label>
              <Input id="billing-zip" placeholder="94102" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="save-payment" />
            <Label htmlFor="save-payment">
              Save payment method for future purchases
            </Label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1">Complete Payment</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates a complete form interaction flow with multiple field types including text inputs, textareas, checkboxes, switches, radio groups, and selects. Tests Tab navigation through all fields, filling out the entire form, and submitting with validation.",
      },
    },
  },
  render: () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      console.log("Form submitted with data:", Object.fromEntries(formData));
    };

    return (
      <Card className="w-125">
        <CardHeader>
          <CardTitle>Complete Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name-int" required>
                    First Name
                  </Label>
                  <Input
                    id="first-name-int"
                    name="firstName"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name-int" required>
                    Last Name
                  </Label>
                  <Input id="last-name-int" name="lastName" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-int" required>
                  Email Address
                </Label>
                <Input
                  id="email-int"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio-int">Bio</Label>
                <Textarea
                  id="bio-int"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-int" required>
                  Country
                </Label>
                <Select name="country">
                  <SelectTrigger id="country-int">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Notification Preferences
                </Label>
                <RadioGroup name="notifications" defaultValue="email">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="notify-email-int" />
                    <Label htmlFor="notify-email-int">Email only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="notify-sms-int" />
                    <Label htmlFor="notify-sms-int">SMS only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="notify-both-int" />
                    <Label htmlFor="notify-both-int">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Features</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="newsletter-int" name="newsletter" />
                  <Label htmlFor="newsletter-int">
                    Subscribe to newsletter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="updates-int" name="updates" />
                  <Label htmlFor="updates-int">Receive product updates</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-int">Marketing emails</Label>
                    <p className="text-xs text-neutral-600">
                      Promotional content
                    </p>
                  </div>
                  <Switch id="marketing-int" name="marketing" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms-int" name="terms" required />
                <Label htmlFor="terms-int" required>
                  I agree to the Terms of Service
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Form
              </Button>
              <Button type="button" variant="ghost">
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Find and verify all form fields exist
    const firstNameInput = canvas.getByLabelText(/first name/i);
    const lastNameInput = canvas.getByLabelText(/last name/i);
    const emailInput = canvas.getByLabelText(/email address/i);
    const bioTextarea = canvas.getByLabelText(/bio/i);
    const countrySelect = canvas.getByRole("combobox");
    const termsCheckbox = canvas.getByRole("checkbox", {
      name: /i agree to the terms/i,
    });
    const submitButton = canvas.getByRole("button", { name: /submit form/i });

    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(bioTextarea).toBeInTheDocument();
    expect(countrySelect).toBeInTheDocument();
    expect(termsCheckbox).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Test 2: Fill out first name
    await userEvent.click(firstNameInput);
    expect(firstNameInput).toHaveFocus();
    await userEvent.type(firstNameInput, "Jane");
    expect(firstNameInput).toHaveValue("Jane");

    // Test 3: Tab to last name
    await userEvent.tab();
    expect(lastNameInput).toHaveFocus();
    await userEvent.type(lastNameInput, "Smith");
    expect(lastNameInput).toHaveValue("Smith");

    // Test 4: Tab to email
    await userEvent.tab();
    expect(emailInput).toHaveFocus();
    await userEvent.type(emailInput, "jane.smith@example.com");
    expect(emailInput).toHaveValue("jane.smith@example.com");

    // Test 5: Tab to bio textarea
    await userEvent.tab();
    expect(bioTextarea).toHaveFocus();
    await userEvent.type(
      bioTextarea,
      "Software developer{Enter}Loves coding and design"
    );
    expect(bioTextarea).toHaveValue(
      "Software developer\nLoves coding and design"
    );

    // Test 6: Tab to country select
    await userEvent.tab();
    expect(countrySelect).toHaveFocus();
    await userEvent.click(countrySelect);

    // Wait for select animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Select United States
    const usOption = canvas.getByRole("option", { name: /united states/i });
    await userEvent.click(usOption);

    // Wait for select to close
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Test 7: Navigate to radio group and select option
    const emailRadio = canvas.getByRole("radio", { name: /email only/i });
    const smsRadio = canvas.getByRole("radio", { name: /sms only/i });
    const bothRadio = canvas.getByRole("radio", { name: /^both$/i });

    // Email is selected by default
    expect(emailRadio).toBeChecked();

    // Click SMS option
    await userEvent.click(smsRadio);
    expect(smsRadio).toBeChecked();
    expect(emailRadio).not.toBeChecked();

    // Test 8: Check newsletter checkbox
    const newsletterCheckbox = canvas.getByRole("checkbox", {
      name: /subscribe to newsletter/i,
    });
    await userEvent.click(newsletterCheckbox);
    expect(newsletterCheckbox).toBeChecked();

    // Test 9: Check updates checkbox
    const updatesCheckbox = canvas.getByRole("checkbox", {
      name: /receive product updates/i,
    });
    await userEvent.click(updatesCheckbox);
    expect(updatesCheckbox).toBeChecked();

    // Test 10: Toggle marketing switch
    const marketingSwitch = canvas.getByRole("switch", {
      name: /marketing emails/i,
    });
    expect(marketingSwitch).not.toBeChecked();
    await userEvent.click(marketingSwitch);
    expect(marketingSwitch).toBeChecked();

    // Test 11: Check terms checkbox (required)
    expect(termsCheckbox).not.toBeChecked();
    await userEvent.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    // Test 12: Verify all form fields are filled correctly
    expect(firstNameInput).toHaveValue("Jane");
    expect(lastNameInput).toHaveValue("Smith");
    expect(emailInput).toHaveValue("jane.smith@example.com");
    expect(bioTextarea).toHaveValue(
      "Software developer\nLoves coding and design"
    );
    expect(smsRadio).toBeChecked();
    expect(newsletterCheckbox).toBeChecked();
    expect(updatesCheckbox).toBeChecked();
    expect(marketingSwitch).toBeChecked();
    expect(termsCheckbox).toBeChecked();

    // Test 13: Submit the form
    await userEvent.click(submitButton);

    // The form should be submitted (handler logs to console)
    // In a real app, you'd verify navigation or success message
  },
};

export const RealTimeValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates advanced form validation with real-time field validation, custom validation rules, error states, and success indicators. Shows best practices for accessible error messaging and inline validation feedback.",
      },
    },
  },
  render: () => {
    interface FormErrors {
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
      phoneNumber?: string;
      age?: string;
    }

    interface FormTouched {
      email?: boolean;
      username?: boolean;
      password?: boolean;
      confirmPassword?: boolean;
      phoneNumber?: boolean;
      age?: boolean;
    }

    const [formValues, setFormValues] = useState({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      age: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<FormTouched>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Validation rules
    const validateEmail = useCallback((email: string): string | undefined => {
      if (!email) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "Please enter a valid email address";
      return undefined;
    }, []);

    const validateUsername = useCallback(
      (username: string): string | undefined => {
        if (!username) return "Username is required";
        if (username.length < 3)
          return "Username must be at least 3 characters";
        if (username.length > 20)
          return "Username must not exceed 20 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(username))
          return "Username can only contain letters, numbers, and underscores";
        return undefined;
      },
      []
    );

    const validatePassword = useCallback(
      (password: string): string | undefined => {
        if (!password) return "Password is required";
        if (password.length < 8)
          return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(password))
          return "Password must contain a lowercase letter";
        if (!/(?=.*[A-Z])/.test(password))
          return "Password must contain an uppercase letter";
        if (!/(?=.*\d)/.test(password)) return "Password must contain a number";
        if (!/(?=.*[@$!%*?&])/.test(password))
          return "Password must contain a special character (@$!%*?&)";
        return undefined;
      },
      []
    );

    const validateConfirmPassword = useCallback(
      (confirmPassword: string, password: string): string | undefined => {
        if (!confirmPassword) return "Please confirm your password";
        if (confirmPassword !== password) return "Passwords do not match";
        return undefined;
      },
      []
    );

    const validatePhoneNumber = useCallback(
      (phone: string): string | undefined => {
        if (!phone) return undefined; // Optional field
        const phoneRegex =
          /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
        if (!phoneRegex.test(phone))
          return "Please enter a valid phone number (e.g., 555-123-4567)";
        return undefined;
      },
      []
    );

    const validateAge = useCallback((age: string): string | undefined => {
      if (!age) return "Age is required";
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum)) return "Age must be a number";
      if (ageNum < 13) return "You must be at least 13 years old";
      if (ageNum > 120) return "Please enter a valid age";
      return undefined;
    }, []);

    // Real-time validation on change
    const handleChange = useCallback(
      (field: keyof typeof formValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));

        // Validate on change if field has been touched
        if (touched[field]) {
          let error: string | undefined;
          switch (field) {
            case "email":
              error = validateEmail(value);
              break;
            case "username":
              error = validateUsername(value);
              break;
            case "password":
              error = validatePassword(value);
              // Re-validate confirm password if it exists
              if (formValues.confirmPassword) {
                const confirmError = validateConfirmPassword(
                  formValues.confirmPassword,
                  value
                );
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: confirmError,
                }));
              }
              break;
            case "confirmPassword":
              error = validateConfirmPassword(value, formValues.password);
              break;
            case "phoneNumber":
              error = validatePhoneNumber(value);
              break;
            case "age":
              error = validateAge(value);
              break;
          }
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      },
      [
        touched,
        formValues.confirmPassword,
        formValues.password,
        validateEmail,
        validateUsername,
        validatePassword,
        validateConfirmPassword,
        validatePhoneNumber,
        validateAge,
      ]
    );

    // Validate on blur
    const handleBlur = useCallback(
      (field: keyof typeof formValues) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        let error: string | undefined;
        const value = formValues[field];

        switch (field) {
          case "email":
            error = validateEmail(value);
            break;
          case "username":
            error = validateUsername(value);
            break;
          case "password":
            error = validatePassword(value);
            break;
          case "confirmPassword":
            error = validateConfirmPassword(value, formValues.password);
            break;
          case "phoneNumber":
            error = validatePhoneNumber(value);
            break;
          case "age":
            error = validateAge(value);
            break;
        }

        setErrors((prev) => ({ ...prev, [field]: error }));
      },
      [
        formValues,
        validateEmail,
        validateUsername,
        validatePassword,
        validateConfirmPassword,
        validatePhoneNumber,
        validateAge,
      ]
    );

    // Validate all fields
    const validateAll = useCallback((): boolean => {
      const newErrors: FormErrors = {
        email: validateEmail(formValues.email),
        username: validateUsername(formValues.username),
        password: validatePassword(formValues.password),
        confirmPassword: validateConfirmPassword(
          formValues.confirmPassword,
          formValues.password
        ),
        phoneNumber: validatePhoneNumber(formValues.phoneNumber),
        age: validateAge(formValues.age),
      };

      setErrors(newErrors);
      setTouched({
        email: true,
        username: true,
        password: true,
        confirmPassword: true,
        phoneNumber: true,
        age: true,
      });

      return !Object.values(newErrors).some((error) => error !== undefined);
    }, [
      formValues,
      validateEmail,
      validateUsername,
      validatePassword,
      validateConfirmPassword,
      validatePhoneNumber,
      validateAge,
    ]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) {
          return;
        }

        setIsSubmitting(true);
        setSubmitSuccess(false);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormValues({
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            age: "",
          });
          setErrors({});
          setTouched({});
          setSubmitSuccess(false);
        }, 3000);
      },
      [validateAll]
    );

    const getFieldStatus = (field: keyof typeof formValues) => {
      if (!touched[field]) return "default";
      return errors[field] ? "error" : "success";
    };

    return (
      <Card className="w-125">
        <CardHeader>
          <CardTitle>Advanced Form Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email-realtime" required>
                Email Address
              </Label>
              <Input
                id="email-realtime"
                name="email"
                type="email"
                value={formValues.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="john@example.com"
                className={
                  touched.email
                    ? errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-green-500 focus-visible:ring-green-500"
                    : ""
                }
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={
                  errors.email ? "email-error" : "email-success"
                }
              />
              {touched.email && errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  ✕ {errors.email}
                </p>
              )}
              {touched.email && !errors.email && formValues.email && (
                <p id="email-success" className="text-sm text-green-600">
                  ✓ Valid email address
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username-realtime" required>
                Username
              </Label>
              <Input
                id="username-realtime"
                name="username"
                value={formValues.username}
                onChange={(e) => handleChange("username", e.target.value)}
                onBlur={() => handleBlur("username")}
                placeholder="johndoe123"
                className={
                  touched.username
                    ? errors.username
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-green-500 focus-visible:ring-green-500"
                    : ""
                }
                aria-invalid={touched.username && !!errors.username}
                aria-describedby={
                  errors.username ? "username-error" : "username-help"
                }
              />
              {touched.username && errors.username && (
                <p
                  id="username-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  ✕ {errors.username}
                </p>
              )}
              {touched.username && !errors.username && formValues.username && (
                <p className="text-sm text-green-600">
                  ✓ Username is available
                </p>
              )}
              <p id="username-help" className="text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password-realtime" required>
                  Password
                </Label>
                <Input
                  id="password-realtime"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  className={
                    touched.password
                      ? errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }
                  aria-invalid={touched.password && !!errors.password}
                  aria-describedby="password-requirements"
                />
                {touched.password && errors.password && (
                  <p className="text-sm text-red-600" role="alert">
                    ✕ {errors.password}
                  </p>
                )}
                {touched.password &&
                  !errors.password &&
                  formValues.password && (
                    <p className="text-sm text-green-600">✓ Strong password</p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password-realtime" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password-realtime"
                  name="confirmPassword"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="••••••••"
                  className={
                    touched.confirmPassword
                      ? errors.confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }
                  aria-invalid={
                    touched.confirmPassword && !!errors.confirmPassword
                  }
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-sm text-red-600" role="alert">
                    ✕ {errors.confirmPassword}
                  </p>
                )}
                {touched.confirmPassword &&
                  !errors.confirmPassword &&
                  formValues.confirmPassword && (
                    <p className="text-sm text-green-600">✓ Passwords match</p>
                  )}
              </div>
            </div>

            <div id="password-requirements" className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Password requirements:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 pl-4">
                <li
                  className={
                    formValues.password.length >= 8
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {formValues.password.length >= 8 ? "✓" : "○"} At least 8
                  characters
                </li>
                <li
                  className={
                    /(?=.*[a-z])/.test(formValues.password)
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {/(?=.*[a-z])/.test(formValues.password) ? "✓" : "○"} One
                  lowercase letter
                </li>
                <li
                  className={
                    /(?=.*[A-Z])/.test(formValues.password)
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {/(?=.*[A-Z])/.test(formValues.password) ? "✓" : "○"} One
                  uppercase letter
                </li>
                <li
                  className={
                    /(?=.*\d)/.test(formValues.password)
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {/(?=.*\d)/.test(formValues.password) ? "✓" : "○"} One number
                </li>
                <li
                  className={
                    /(?=.*[@$!%*?&])/.test(formValues.password)
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {/(?=.*[@$!%*?&])/.test(formValues.password) ? "✓" : "○"} One
                  special character (@$!%*?&)
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone-realtime">Phone Number (Optional)</Label>
                <Input
                  id="phone-realtime"
                  name="phoneNumber"
                  type="tel"
                  value={formValues.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  onBlur={() => handleBlur("phoneNumber")}
                  placeholder="555-123-4567"
                  className={
                    touched.phoneNumber
                      ? errors.phoneNumber
                        ? "border-red-500 focus-visible:ring-red-500"
                        : formValues.phoneNumber
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      : ""
                  }
                  aria-invalid={touched.phoneNumber && !!errors.phoneNumber}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-sm text-red-600" role="alert">
                    ✕ {errors.phoneNumber}
                  </p>
                )}
                {touched.phoneNumber &&
                  !errors.phoneNumber &&
                  formValues.phoneNumber && (
                    <p className="text-sm text-green-600">
                      ✓ Valid phone number
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age-realtime" required>
                  Age
                </Label>
                <Input
                  id="age-realtime"
                  name="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formValues.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  onBlur={() => handleBlur("age")}
                  placeholder="18"
                  className={
                    touched.age
                      ? errors.age
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }
                  aria-invalid={touched.age && !!errors.age}
                />
                {touched.age && errors.age && (
                  <p className="text-sm text-red-600" role="alert">
                    ✕ {errors.age}
                  </p>
                )}
                {touched.age && !errors.age && formValues.age && (
                  <p className="text-sm text-green-600">✓ Valid age</p>
                )}
              </div>
            </div>

            {submitSuccess && (
              <div
                className="p-4 bg-green-50 border-2 border-green-500 rounded-md"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm font-medium text-green-800">
                  ✓ Registration successful! Welcome aboard.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormValues({
                    email: "",
                    username: "",
                    password: "",
                    confirmPassword: "",
                    phoneNumber: "",
                    age: "",
                  });
                  setErrors({});
                  setTouched({});
                  setSubmitSuccess(false);
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  },
};
