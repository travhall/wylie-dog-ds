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
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  useFormField,
} from "@wyliedog/ui/form";

function FormInput(props: Omit<React.ComponentProps<typeof Input>, "id">) {
  const { id } = useFormField();
  return <Input id={id} {...props} />;
}

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
  parameters: {
    docs: {
      description: {
        story:
          "Email input step to initiate a password reset. Simulates an API call and transitions to a confirmation screen on success, or shows an error alert if the email is invalid.",
      },
    },
  },
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

            <div className="rounded-lg border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-medium">Didn't receive the email?</p>
              <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
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
            <Button
              variant="ghost"
              className="w-full text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Back to login
            </Button>
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
        <Form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField required>
              <FormLabel>Email address</FormLabel>
              <FormInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              <p className="text-sm text-gray-500">
                We'll send a password reset link to this email
              </p>
            </FormField>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Back to login
            </Button>
          </CardFooter>
        </Form>
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
  parameters: {
    docs: {
      description: {
        story:
          "New-password entry form shown after clicking a reset link. Includes a live strength bar, per-requirement checklist, and a confirm-password field that validates on submit.",
      },
    },
  },
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
          color: "bg-yellow-600",
        };
      if (password.length < 14)
        return {
          strength: 3,
          label: "Good",
          color: "bg-(--color-interactive-primary)",
        };
      return {
        strength: 4,
        label: "Strong",
        color: "bg-green-600",
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
        <Form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <FormField error={!!errors.password} required>
              <FormLabel>New password</FormLabel>
              <FormInput
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <FormMessage>{errors.password}</FormMessage>
              {!errors.password && (
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
                                : "bg-(--color-background-secondary)"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  <div
                    id="password-requirements"
                    className="text-sm text-gray-500 space-y-1"
                  >
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-(--color-text-success)"
                            : ""
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password)
                            ? "text-(--color-text-success)"
                            : ""
                        }
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password)
                            ? "text-(--color-text-success)"
                            : ""
                        }
                      >
                        One lowercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(formData.password)
                            ? "text-(--color-text-success)"
                            : ""
                        }
                      >
                        One number
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </FormField>

            <FormField error={!!errors.confirmPassword} required>
              <FormLabel>Confirm new password</FormLabel>
              <FormInput
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
              />
              <FormMessage>{errors.confirmPassword}</FormMessage>
            </FormField>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting password..." : "Reset password"}
            </Button>
          </CardFooter>
        </Form>
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
            <Button
              variant="ghost"
              className="w-full text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Back to login
            </Button>
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

          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <p className="text-sm font-medium">Why did this happen?</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>The link has expired (older than 1 hour)</li>
              <li>The link has already been used</li>
              <li>You requested a new reset link</li>
            </ul>
          </div>

          <Form onSubmit={handleResend} className="space-y-4">
            <FormField required>
              <FormLabel>Email address</FormLabel>
              <FormInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                We'll send you a new reset link
              </p>
            </FormField>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send new reset link"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Back to login
          </Button>
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
  parameters: {
    docs: {
      description: {
        story:
          "Four-step password recovery flow (email → verify → new password → complete) with a step indicator. Each step validates before advancing and the progress bar reflects the current stage.",
      },
    },
  },
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
                        ? "bg-(--color-interactive-primary) text-(--color-text-inverse)"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-500">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index < currentStepIndex
                        ? "bg-(--color-interactive-primary)"
                        : "bg-(--color-background-secondary)"
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
            <Form onSubmit={handleEmailSubmit} className="space-y-4">
              <FormField required>
                <FormLabel>Email address</FormLabel>
                <FormInput
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending code..." : "Send verification code"}
              </Button>
            </Form>
          )}

          {step === "verify" && (
            <Form onSubmit={handleVerifySubmit} className="space-y-4">
              <FormField required>
                <FormLabel>Verification code</FormLabel>
                <FormInput
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">
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
              </FormField>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify code"}
              </Button>
            </Form>
          )}

          {step === "reset" && (
            <Form onSubmit={handleResetSubmit} className="space-y-4">
              <FormField required>
                <FormLabel>New password</FormLabel>
                <FormInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <FormField required>
                <FormLabel>Confirm password</FormLabel>
                <FormInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating password..." : "Update password"}
              </Button>
            </Form>
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
            <Button
              variant="ghost"
              className="w-full text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Back to login
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  },
};
