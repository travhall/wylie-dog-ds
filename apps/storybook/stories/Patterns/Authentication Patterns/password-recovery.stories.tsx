import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@wyliedog/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Alert, AlertDescription } from "@wyliedog/ui/alert";

const meta: Meta = {
  title: "Patterns/Authentication Patterns/Password Recovery",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Password recovery and reset patterns including email verification, reset token validation, and password update flows. Demonstrates multi-step processes with clear user feedback.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

/**
 * Forgot Password - Email Step
 *
 * The initial step where users enter their email to receive a password reset link.
 * Includes validation and success/error feedback.
 */
export const ForgotPasswordEmail: Story = {
  render: () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        if (email.includes("invalid")) {
          setError("No account found with this email address.");
          setIsLoading(false);
        } else {
          setIsSubmitted(true);
          setIsLoading(false);
        }
      }, 1500);
    };

    if (isSubmitted) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                If you don't see the email, check your spam folder or{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 font-medium"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  try another email address
                </Button>
                .
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <p className="text-sm font-medium">Didn't receive the email?</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Try another email
            </Button>
            <a
              href="#"
              className="text-sm text-center text-muted-foreground hover:text-foreground"
            >
              Back to login
            </a>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you instructions to reset your
            password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
              />
              <p className="text-sm text-muted-foreground">
                We'll send a password reset link to this email
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
            <a
              href="#"
              className="text-sm text-center text-muted-foreground hover:text-foreground"
            >
              Back to login
            </a>
          </CardFooter>
        </form>
      </Card>
    );
  },
};

/**
 * Reset Password Form
 *
 * The form where users create a new password after clicking the reset link.
 * Includes password strength indicator and confirmation matching.
 */
export const ResetPasswordForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      password: "",
      confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getPasswordStrength = (password: string) => {
      if (password.length === 0) return { strength: 0, label: "", color: "" };
      if (password.length < 8)
        return { strength: 1, label: "Too short", color: "bg-destructive" };
      if (password.length < 10)
        return {
          strength: 2,
          label: "Weak",
          color: "bg-(--color-status-warning)",
        };
      if (password.length < 14)
        return {
          strength: 3,
          label: "Good",
          color: "bg-(--color-status-info)",
        };
      return {
        strength: 4,
        label: "Strong",
        color: "bg-(--color-status-success)",
      };
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      setTimeout(() => {
        console.log("Password reset:", formData);
        setIsSuccess(true);
        setIsLoading(false);
      }, 1500);
    };

    const handleChange = (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    const passwordStrength = getPasswordStrength(formData.password);

    if (isSuccess) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You can now sign in with your new password.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => console.log("Go to login")}
            >
              Continue to login
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create new password</CardTitle>
          <CardDescription>
            Your new password must be different from previously used passwords
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : "password-requirements"
                }
              />
              {errors.password ? (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              ) : (
                <>
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  <div
                    id="password-requirements"
                    className="text-sm text-muted-foreground space-y-1"
                  >
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-(--color-status-success)"
                            : ""
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password)
                            ? "text-(--color-status-success)"
                            : ""
                        }
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password)
                            ? "text-(--color-status-success)"
                            : ""
                        }
                      >
                        One lowercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(formData.password)
                            ? "text-(--color-status-success)"
                            : ""
                        }
                      >
                        One number
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting password..." : "Reset password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  },
};

/**
 * Password Reset - Invalid/Expired Link
 *
 * Error state shown when a password reset link is invalid or has expired.
 * Provides clear guidance and options to request a new link.
 */
export const InvalidResetLink: Story = {
  render: () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResent, setIsResent] = useState(false);

    const handleResend = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        console.log("Resend reset link:", email);
        setIsResent(true);
        setIsLoading(false);
      }, 1500);
    };

    if (isResent) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a new password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                The new link will expire in 1 hour. Please check your inbox and
                spam folder.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <a
              href="#"
              className="text-sm text-center text-muted-foreground hover:text-foreground w-full"
            >
              Back to login
            </a>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset link invalid or expired</CardTitle>
          <CardDescription>
            This password reset link is no longer valid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Password reset links expire after 1 hour for security reasons.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-medium">Why did this happen?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>The link has expired (older than 1 hour)</li>
              <li>The link has already been used</li>
              <li>You requested a new reset link</li>
            </ul>
          </div>

          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email address</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a new reset link
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send new reset link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <a
            href="#"
            className="text-sm text-center text-muted-foreground hover:text-foreground w-full"
          >
            Back to login
          </a>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * Multi-Step Password Recovery Flow
 *
 * A complete password recovery flow with step indicators.
 * Demonstrates progressive disclosure and clear navigation between steps.
 */
export const MultiStepPasswordRecovery: Story = {
  render: () => {
    const [step, setStep] = useState<"email" | "verify" | "reset" | "success">(
      "email"
    );
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        setStep("verify");
        setIsLoading(false);
      }, 1500);
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        setStep("reset");
        setIsLoading(false);
      }, 1500);
    };

    const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) return;
      setIsLoading(true);
      setTimeout(() => {
        setStep("success");
        setIsLoading(false);
      }, 1500);
    };

    const steps = [
      { id: "email", label: "Email" },
      { id: "verify", label: "Verify" },
      { id: "reset", label: "New Password" },
      { id: "success", label: "Complete" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === step);

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between mb-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === "email" && (
            <>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your email address to receive a verification code
              </CardDescription>
            </>
          )}
          {step === "verify" && (
            <>
              <CardTitle>Verify your identity</CardTitle>
              <CardDescription>
                Enter the 6-digit code we sent to {email}
              </CardDescription>
            </>
          )}
          {step === "reset" && (
            <>
              <CardTitle>Create new password</CardTitle>
              <CardDescription>
                Enter a strong password for your account
              </CardDescription>
            </>
          )}
          {step === "success" && (
            <>
              <CardTitle>Password reset complete</CardTitle>
              <CardDescription>
                Your password has been successfully updated
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-step">Email address</Label>
                <Input
                  id="email-step"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending code..." : "Send verification code"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => console.log("Resend code")}
                  >
                    Resend
                  </Button>
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify code"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating password..." : "Update password"}
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  You can now sign in with your new password.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full"
                onClick={() => console.log("Go to login")}
              >
                Continue to login
              </Button>
            </div>
          )}
        </CardContent>

        {step !== "success" && (
          <CardFooter>
            <a
              href="#"
              className="text-sm text-center text-muted-foreground hover:text-foreground w-full"
            >
              Back to login
            </a>
          </CardFooter>
        )}
      </Card>
    );
  },
};
