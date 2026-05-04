import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import {
  Form,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  useFormField,
} from "@wyliedog/ui/form";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Textarea } from "@wyliedog/ui/textarea";
import { useState, useRef, useEffect } from "react";

const meta: Meta = {
  title: "Patterns/Form Patterns/Form Validation",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Validation patterns using the system Form components and controlled state. No external validation library required.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers: wire the auto-generated FormField id to the underlying input.
// FormLabel sets htmlFor to the context id; these helpers consume the same
// context so the label <-> input association is correct.
// ---------------------------------------------------------------------------

/**
 * An Input that automatically receives the `id` from the nearest FormField
 * context. All other Input props are passed through.
 */
function FormInput(props: Omit<React.ComponentProps<typeof Input>, "id">) {
  const { id } = useFormField();
  return <Input id={id} {...props} />;
}

/**
 * A Textarea that automatically receives the `id` from the nearest FormField
 * context. All other Textarea props are passed through.
 */
function FormTextarea(
  props: Omit<React.ComponentProps<typeof Textarea>, "id">
) {
  const { id } = useFormField();
  return <Textarea id={id} {...props} />;
}

// ---------------------------------------------------------------------------
// Story 1: RequiredFieldValidation
// ---------------------------------------------------------------------------

function RequiredFieldValidationComponent() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (vals: typeof values) => {
    const errs: Record<string, string> = {};
    if (!vals.name.trim()) errs.name = "Name is required";
    if (!vals.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!vals.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="w-100 rounded-(--space-dialog-content-radius) border border-(--color-border-success) bg-(--color-background-success-subtle) p-6 text-center"
      >
        <p className="font-semibold text-(--color-text-success)">
          Message sent successfully!
        </p>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          We'll get back to you at {values.email}.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setSubmitted(false);
            setValues({ name: "", email: "", message: "" });
            setErrors({});
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="w-100 space-y-6" noValidate>
      <FormField error={!!errors.name} required>
        <FormLabel>Name</FormLabel>
        <FormInput
          name="rfv-name"
          placeholder="Your full name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <FormMessage>{errors.name}</FormMessage>
      </FormField>

      <FormField error={!!errors.email} required>
        <FormLabel>Email</FormLabel>
        <FormInput
          name="rfv-email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <FormMessage>{errors.email}</FormMessage>
      </FormField>

      <FormField error={!!errors.message} required>
        <FormLabel>Message</FormLabel>
        <FormTextarea
          name="rfv-message"
          placeholder="How can we help?"
          rows={4}
          value={values.message}
          onChange={(e) =>
            setValues((v) => ({ ...v, message: e.target.value }))
          }
        />
        <FormMessage>{errors.message}</FormMessage>
      </FormField>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </Form>
  );
}

export const RequiredFieldValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Contact form with submit-time validation. All fields are required; errors appear after a failed submit attempt. On success the form is replaced with a confirmation state.",
      },
    },
  },
  render: () => <RequiredFieldValidationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click Submit with all fields empty
    const submitBtn = canvas.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    // All three error messages should appear
    expect(await canvas.findByText("Name is required")).toBeInTheDocument();
    expect(canvas.getByText("Email is required")).toBeInTheDocument();
    expect(canvas.getByText("Message is required")).toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Story 2: InlineValidation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InlineValidationComponent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBlur = () => {
    if (!email.trim()) {
      setError("Email is required");
    } else if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address");
    } else {
      setError("");
    }
  };

  return (
    <Form className="w-100 space-y-6" noValidate>
      <FormField error={!!error}>
        <FormLabel>Email address</FormLabel>
        <FormDescription>
          Validation runs when you leave the field.
        </FormDescription>
        <FormInput
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Clear error as soon as input becomes valid while typing
            if (error && EMAIL_RE.test(e.target.value)) {
              setError("");
            }
          }}
          onBlur={handleBlur}
        />
        <FormMessage>{error}</FormMessage>
      </FormField>
    </Form>
  );
}

export const InlineValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Email field that validates on blur. The error appears immediately when the field loses focus with an invalid value, and clears once the value passes validation.",
      },
    },
  },
  render: () => <InlineValidationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Type an invalid email then tab away
    await userEvent.type(input, "not-an-email");
    await userEvent.tab();
    expect(
      await canvas.findByText("Enter a valid email address")
    ).toBeInTheDocument();

    // Fix the value — error should clear
    await userEvent.clear(input);
    await userEvent.type(input, "hello@example.com");
    await userEvent.tab();
    expect(
      canvas.queryByText("Enter a valid email address")
    ).not.toBeInTheDocument();
    expect(canvas.queryByText("Email is required")).not.toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Story 3: PasswordStrength
// ---------------------------------------------------------------------------

type Strength = "Weak" | "Fair" | "Strong";

function getStrength(password: string): Strength | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  return "Strong";
}

const strengthBarColor: Record<Strength, string> = {
  Weak: "bg-(--color-status-danger)",
  Fair: "bg-(--color-status-warning)",
  Strong: "bg-(--color-status-success)",
};

const strengthTextColor: Record<Strength, string> = {
  Weak: "text-(--color-text-danger)",
  Fair: "text-(--color-text-warning)",
  Strong: "text-(--color-text-success)",
};

const strengthBarWidth: Record<Strength, string> = {
  Weak: "w-1/3",
  Fair: "w-2/3",
  Strong: "w-full",
};

/** Inner component for the password input — uses FormField context id. */
function PasswordInput({
  onStrengthChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "id"> & {
  onStrengthChange?: (s: Strength | null) => void;
}) {
  const { id } = useFormField();
  return (
    <Input
      id={id}
      type="password"
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        onStrengthChange?.(getStrength(e.target.value));
      }}
    />
  );
}

function PasswordStrengthComponent() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<Strength | null>(null);
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleConfirmBlur = () => {
    if (confirm && confirm !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  return (
    <Form className="w-100 space-y-6" noValidate>
      <FormField>
        <FormLabel>Password</FormLabel>
        <PasswordInput
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onStrengthChange={setStrength}
        />
        {strength && (
          <div className="space-y-1" aria-live="polite">
            <div className="h-1.5 w-full rounded-full bg-(--color-border-default)">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthBarWidth[strength]} ${strengthBarColor[strength]}`}
              />
            </div>
            <p
              className={`text-sm font-medium ${strengthTextColor[strength]}`}
              data-strength={strength}
            >
              {strength}
            </p>
          </div>
        )}
        <FormDescription>
          Use 12+ characters with uppercase letters, numbers, and symbols.
        </FormDescription>
      </FormField>

      <FormField error={!!confirmError}>
        <FormLabel>Confirm password</FormLabel>
        <FormInput
          type="password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError && e.target.value === password) {
              setConfirmError("");
            }
          }}
          onBlur={handleConfirmBlur}
        />
        <FormMessage>{confirmError}</FormMessage>
      </FormField>
    </Form>
  );
}

export const PasswordStrength: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Password field with a live strength indicator computed from length and character variety (no external library). A confirm field validates on blur.",
      },
    },
  },
  render: () => <PasswordStrengthComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // getByLabelText works because FormLabel sets htmlFor to the same id
    // that PasswordInput receives from useFormField()
    const passwordField = canvas.getByLabelText("Password");

    // Type a weak password
    await userEvent.type(passwordField, "abc");
    expect(canvas.getByText("Weak")).toBeInTheDocument();

    // Type a strong password
    await userEvent.clear(passwordField);
    await userEvent.type(passwordField, "Str0ng!P@ssword99");
    expect(canvas.getByText("Strong")).toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Story 4: MultiStepValidation
// ---------------------------------------------------------------------------

type Step1Values = { username: string; email: string };
type Step2Values = { firstName: string; bio: string };

function MultiStepValidationComponent() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1Values>({ username: "", email: "" });
  const [step2, setStep2] = useState<Step2Values>({ firstName: "", bio: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!step1.username.trim()) errs.username = "Username is required";
    if (!step1.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) {
      errs.email = "Enter a valid email address";
    }
    return errs;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!step2.firstName.trim()) errs.firstName = "First name is required";
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setErrors({});
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div role="status" className="w-100 space-y-2 text-center p-6">
        <p className="font-semibold text-(--color-text-success)">
          Account created!
        </p>
        <p className="text-sm text-(--color-text-secondary)">
          Welcome, {step2.firstName || step1.username}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-100 space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                step === n
                  ? "bg-(--color-background-accent-primary) text-(--color-text-on-accent)"
                  : step > n
                    ? "bg-(--color-background-success-subtle) text-(--color-text-success)"
                    : "bg-(--color-background-secondary) text-(--color-text-secondary)"
              }`}
              aria-current={step === n ? "step" : undefined}
            >
              {n}
            </span>
            <span className="text-sm text-(--color-text-secondary)">
              {n === 1 ? "Account" : "Profile"}
            </span>
            {n < 2 && (
              <span className="text-(--color-border-default) mx-1">—</span>
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <FormField error={!!errors.username} required>
            <FormLabel>Username</FormLabel>
            <FormInput
              placeholder="yourhandle"
              value={step1.username}
              onChange={(e) =>
                setStep1((v) => ({ ...v, username: e.target.value }))
              }
            />
            <FormMessage>{errors.username}</FormMessage>
          </FormField>

          <FormField error={!!errors.email} required>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="email"
              placeholder="you@example.com"
              value={step1.email}
              onChange={(e) =>
                setStep1((v) => ({ ...v, email: e.target.value }))
              }
            />
            <FormMessage>{errors.email}</FormMessage>
          </FormField>

          <Button type="submit" className="w-full">
            Next
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <FormField error={!!errors.firstName} required>
            <FormLabel>First name</FormLabel>
            <FormInput
              placeholder="Jane"
              value={step2.firstName}
              onChange={(e) =>
                setStep2((v) => ({ ...v, firstName: e.target.value }))
              }
            />
            <FormMessage>{errors.firstName}</FormMessage>
          </FormField>

          <FormField>
            <FormLabel>Bio</FormLabel>
            <FormDescription>
              Optional — tell us about yourself.
            </FormDescription>
            <FormTextarea
              placeholder="A few words about you…"
              rows={3}
              value={step2.bio}
              onChange={(e) => setStep2((v) => ({ ...v, bio: e.target.value }))}
            />
          </FormField>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Create account
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

export const MultiStepValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two-step form that validates each step before advancing. The Back button returns without re-validating. A step indicator shows progress.",
      },
    },
  },
  render: () => <MultiStepValidationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click Next on empty Step 1
    const nextBtn = canvas.getByRole("button", { name: /next/i });
    await userEvent.click(nextBtn);

    expect(await canvas.findByText("Username is required")).toBeInTheDocument();
    expect(canvas.getByText("Email is required")).toBeInTheDocument();

    // Fill Step 1 and advance
    const usernameInput = canvas.getByPlaceholderText("yourhandle");
    const emailInput = canvas.getByPlaceholderText("you@example.com");
    await userEvent.type(usernameInput, "janesmith");
    await userEvent.type(emailInput, "jane@example.com");
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));

    // Step 2 should now be visible
    expect(await canvas.findByPlaceholderText("Jane")).toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Story 5: AsyncValidation
// ---------------------------------------------------------------------------

const TAKEN_USERNAMES = ["admin", "user", "test"];

function AsyncValidationComponent() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!value.trim()) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    timerRef.current = setTimeout(() => {
      const taken = TAKEN_USERNAMES.includes(value.toLowerCase());
      setStatus(taken ? "taken" : "available");
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Form className="w-100 space-y-6" noValidate>
      <FormField error={status === "taken"}>
        <FormLabel>Username</FormLabel>
        <FormDescription>
          Checks availability after you stop typing (600 ms debounce). Reserved
          names: admin, user, test.
        </FormDescription>
        <div className="relative">
          <FormInput
            placeholder="Pick a username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsername(e.target.value);
            }}
          />
          {status === "checking" && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-label="Checking availability"
            >
              <span
                className="block h-4 w-4 animate-spin rounded-full border-2 border-(--color-border-focus) border-t-transparent"
                aria-hidden="true"
              />
            </span>
          )}
        </div>

        {status === "available" && (
          <p
            className="text-sm font-medium text-(--color-text-success)"
            role="status"
          >
            ✓ Available
          </p>
        )}
        {status === "taken" && <FormMessage>✗ Already taken</FormMessage>}
      </FormField>
    </Form>
  );
}

export const AsyncValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Username field with 600 ms debounced availability check (simulated — no real API). Reserved names: "admin", "user", "test".',
      },
    },
  },
  render: () => <AsyncValidationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Type a taken username and wait for debounce
    await userEvent.type(input, "admin");
    await new Promise((r) => setTimeout(r, 800));
    expect(await canvas.findByText("✗ Already taken")).toBeInTheDocument();

    // Clear and type an available username
    await userEvent.clear(input);
    await userEvent.type(input, "travishall");
    await new Promise((r) => setTimeout(r, 800));
    expect(await canvas.findByText("✓ Available")).toBeInTheDocument();
  },
};
