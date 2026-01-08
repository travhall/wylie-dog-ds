"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Github,
  Twitter,
} from "lucide-react";

export default function AuthenticationFormPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-(--color-text-primary)">
            Authentication Form
          </h1>
          <p className="text-lg text-(--color-text-secondary) max-w-3xl">
            Complete authentication patterns with login, registration, and
            password recovery. Demonstrates form validation, social login
            options, and security best practices.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Authentication Forms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-(--color-text-primary)"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-(--color-text-primary)"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="glass border-(--color-border-primary)/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-(--color-border-primary)/20 bg-transparent text-(--color-interactive-primary)"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-(--color-text-secondary)"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-(--color-interactive-primary) hover:text-(--color-interactive-primary-hover)"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button className="w-full">Sign In</Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-(--color-border-primary)/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-(--color-background-primary) px-2 text-(--color-text-tertiary)">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full border-(--color-border-primary)/20"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-(--color-border-primary)/20"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-(--color-text-primary)"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-(--color-text-primary)"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-(--color-text-primary)"
                    >
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-(--color-text-primary)"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-(--color-border-primary)/20 bg-transparent text-(--color-interactive-primary)"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-(--color-text-secondary)"
                    >
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <Button className="w-full">Create Account</Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-(--color-border-primary)/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-(--color-background-primary) px-2 text-(--color-text-tertiary)">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full border-(--color-border-primary)/20"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-(--color-border-primary)/20"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-(--color-interactive-primary) mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-(--color-text-primary)">
                      Reset Your Password
                    </h3>
                    <p className="text-(--color-text-secondary) text-sm">
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reset-email"
                      className="text-(--color-text-primary)"
                    >
                      Email
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="glass border-(--color-border-primary)/20"
                    />
                  </div>
                  <Button className="w-full">Send Reset Link</Button>
                  <Button
                    variant="outline"
                    className="w-full border-(--color-border-primary)/20"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Validation States */}
        <Card className="glass border-(--color-border-primary)/10">
          <CardHeader>
            <CardTitle className="text-(--color-text-primary)">
              Validation States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label
                  htmlFor="valid-email"
                  className="text-(--color-text-primary)"
                >
                  Valid Email
                </Label>
                <Input
                  id="valid-email"
                  type="email"
                  defaultValue="user@example.com"
                  className="glass border-(--color-text-success)/30"
                />
                <div className="flex items-center text-sm text-(--color-text-success)">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Email format is valid
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="invalid-email"
                  className="text-(--color-text-primary)"
                >
                  Invalid Email
                </Label>
                <Input
                  id="invalid-email"
                  type="email"
                  defaultValue="invalid-email"
                  className="glass border-(--color-text-danger)/30"
                />
                <div className="flex items-center text-sm text-(--color-text-danger)">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please enter a valid email address
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="weak-password"
                  className="text-(--color-text-primary)"
                >
                  Weak Password
                </Label>
                <Input
                  id="weak-password"
                  type="password"
                  defaultValue="123"
                  className="glass border-(--color-text-danger)/30"
                />
                <div className="flex items-center text-sm text-(--color-text-danger)">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Password must be at least 8 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="strong-password"
                  className="text-(--color-text-primary)"
                >
                  Strong Password
                </Label>
                <Input
                  id="strong-password"
                  type="password"
                  defaultValue="StrongP@ssw0rd!"
                  className="glass border-(--color-text-success)/30"
                />
                <div className="flex items-center text-sm text-(--color-text-success)">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Password strength: Strong
                </div>
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
                <Shield className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Secure Authentication
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Implements security best practices including password
                    validation and secure form handling.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Social Login
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Supports OAuth providers for seamless social authentication
                    integration.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Eye className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Password Visibility
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Toggle password visibility for better user experience and
                    error prevention.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-(--color-interactive-primary) mt-1" />
                <div>
                  <h3 className="font-medium mb-1 text-(--color-text-primary)">
                    Real-time Validation
                  </h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Immediate feedback on form validation with clear error
                    messages and success states.
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
                  Security Considerations
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                  <li>Always use HTTPS for authentication forms</li>
                  <li>
                    Implement rate limiting to prevent brute force attacks
                  </li>
                  <li>Use secure password storage (bcrypt, argon2)</li>
                  <li>Implement CSRF protection</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-(--color-text-primary)">
                  Best Practices
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                  <li>
                    Provide clear error messages without revealing sensitive
                    info
                  </li>
                  <li>Offer password strength indicators</li>
                  <li>
                    Include "Remember me" option with appropriate security
                  </li>
                  <li>Test social login flows thoroughly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
