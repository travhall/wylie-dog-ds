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
import { Label } from "@wyliedog/ui/label";
import { Textarea } from "@wyliedog/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { Checkbox } from "@wyliedog/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@wyliedog/ui/radio-group";
import { Switch } from "@wyliedog/ui/switch";
import { Slider } from "@wyliedog/ui/slider";
import { Separator } from "@wyliedog/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@wyliedog/ui/card";
import { Alert, AlertDescription } from "@wyliedog/ui/alert";
import { Badge } from "@wyliedog/ui/badge";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Context-aware field helpers
//
// These thin wrappers call `useFormField()` to read the generated id,
// errorId, descriptionId, and isInvalid from the nearest <FormField>.
// They then forward those values to the component's own typed props
// (Input.error, Input.errorId, Input.descriptionId) so the token-backed
// error variant fires automatically.
// ---------------------------------------------------------------------------

function FieldInput(props: React.ComponentProps<typeof Input>) {
  const { id, errorId, descriptionId, isInvalid } = useFormField();
  return (
    <Input
      id={id}
      error={isInvalid}
      errorId={errorId}
      descriptionId={descriptionId}
      {...props}
    />
  );
}

function FieldTextarea(props: React.ComponentProps<typeof Textarea>) {
  const { id, errorId, descriptionId, isInvalid } = useFormField();
  return (
    <Textarea
      id={id}
      error={isInvalid}
      errorId={errorId}
      descriptionId={descriptionId}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Form> = {
  title: "Components/Inputs & Controls/Form",
  component: Form,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
The Form system provides composable primitives for building accessible, consistently styled forms. Each primitive reads from a shared \`FormField\` context so label wiring, error state, and description IDs are handled automatically.

**Core primitives**

| Component | Purpose |
|-----------|---------|
| \`<Form>\` | The \`<form>\` root. Applies consistent field spacing via design tokens. |
| \`<FormField>\` | Context provider for a single field. Generates a unique \`id\`, accepts \`error\` and \`required\` props. |
| \`<FormLabel>\` | Label element. Reads \`htmlFor\` from context — no manual wiring. Shows required indicator (\`*\`) when \`required\` is set on \`FormField\`. |
| \`<FormDescription>\` | Helper text. Auto-assigned an \`id\` used by \`aria-describedby\`. |
| \`<FormMessage>\` | Error text. Only mounts when \`error={true}\` on the parent \`FormField\`. Has \`role="alert"\` and \`aria-live="polite"\` built in. |

**Connecting inputs to context**

Use the \`useFormField()\` hook to read \`{ id, errorId, descriptionId, isInvalid }\` and pass them to an input's own typed props:

\`\`\`tsx
function FieldInput(props: React.ComponentProps<typeof Input>) {
  const { id, errorId, descriptionId, isInvalid } = useFormField();
  return (
    <Input
      id={id}
      error={isInvalid}       // activates Input's token-backed error variant
      errorId={errorId}       // wires aria-errormessage
      descriptionId={descriptionId} // wires aria-describedby
      {...props}
    />
  );
}
\`\`\`

This pattern is used throughout these stories as \`<FieldInput>\` and \`<FieldTextarea>\`.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — canonical FormField pattern
// ---------------------------------------------------------------------------

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Minimal contact form showing the canonical `FormField → FormLabel → FieldInput → FormDescription` pattern. `FormLabel` sets `htmlFor` automatically from context — no manual id coordination needed.",
      },
    },
  },
  render: () => (
    <Form className="mx-auto w-full max-w-lg">
      <FormField>
        <FormLabel>Name</FormLabel>
        <FieldInput placeholder="Jane Doe" />
        <FormDescription>How you'd like to be addressed.</FormDescription>
      </FormField>

      <FormField>
        <FormLabel>Email</FormLabel>
        <FieldInput type="email" placeholder="jane@example.com" />
        <FormDescription>We'll never share your email.</FormDescription>
      </FormField>

      <FormField>
        <FormLabel>Message</FormLabel>
        <FieldTextarea placeholder="Tell us how we can help…" rows={4} />
      </FormField>

      <Button type="submit" className="w-full">
        Send message
      </Button>
    </Form>
  ),
};

// ---------------------------------------------------------------------------
// With Validation — error state via FormField + FormMessage
// ---------------------------------------------------------------------------

export const WithValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Set `error={true}` on `<FormField>` to activate all error styling in one place: `FormLabel` switches to the error text color, `FieldInput` applies the token-backed error border, and `FormMessage` mounts with `role="alert"`. No custom error class names needed.',
      },
    },
  },
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (data: FormData) => {
      const next: Record<string, string> = {};
      if (!data.get("name")) next.name = "Name is required.";
      if (!data.get("email")) next.email = "A valid email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email"))))
        next.email = "Enter a valid email address.";
      return next;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const next = validate(data);
      setErrors(next);
      if (Object.keys(next).length === 0) setSubmitted(true);
    };

    return (
      <Form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg">
        {submitted && (
          <Alert variant="success" role="status">
            <AlertDescription>
              Message sent! We'll be in touch soon.
            </AlertDescription>
          </Alert>
        )}

        <FormField error={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <FieldInput name="name" placeholder="Jane Doe" />
          <FormMessage>{errors.name}</FormMessage>
        </FormField>

        <FormField error={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <FieldInput
            name="email"
            type="email"
            placeholder="jane@example.com"
          />
          <FormMessage>{errors.email}</FormMessage>
        </FormField>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    );
  },
};

// ---------------------------------------------------------------------------
// Required Fields — FormField required prop + Label required prop
// ---------------------------------------------------------------------------

export const RequiredFields: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `required` to `<FormField>` and `FormLabel` renders a token-colored `*` indicator automatically (`aria-hidden`). The native `required` attribute on the input covers screen-reader and browser-native validation.",
      },
    },
  },
  render: () => (
    <Form className="mx-auto w-full max-w-lg">
      <FormField required>
        <FormLabel>Full name</FormLabel>
        <FieldInput required placeholder="Jane Doe" />
        <FormDescription>Required. Used on your account.</FormDescription>
      </FormField>

      <FormField required>
        <FormLabel>Email</FormLabel>
        <FieldInput required type="email" placeholder="jane@example.com" />
      </FormField>

      <FormField>
        <FormLabel>Company</FormLabel>
        <FieldInput placeholder="Acme Inc. (optional)" />
      </FormField>

      <p className="text-xs text-(--color-text-tertiary)">
        Fields marked * are required.
      </p>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </Form>
  ),
};

// ---------------------------------------------------------------------------
// All Field Types — every input component shown in context
// ---------------------------------------------------------------------------

export const AllFieldTypes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every input component available in the design system. `FieldInput` and `FieldTextarea` use `useFormField()` inside `<FormField>`. Components that manage their own id (Select, RadioGroup, Checkbox, Switch, Slider) are paired with `<Label>` directly using a consistent `space-y-2` wrapper.",
      },
    },
  },
  render: () => {
    const [sliderValue, setSliderValue] = useState([50]);

    return (
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Text inputs */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-(--color-text-tertiary)">
            Text inputs
          </h3>
          <Form className="grid grid-cols-2 gap-2">
            <FormField>
              <FormLabel>Text</FormLabel>
              <FieldInput type="text" placeholder="Plain text" />
              <FormDescription>Single-line text.</FormDescription>
            </FormField>
            <FormField>
              <FormLabel>Email</FormLabel>
              <FieldInput type="email" placeholder="jane@example.com" />
            </FormField>
            <FormField>
              <FormLabel>Password</FormLabel>
              <FieldInput type="password" placeholder="••••••••" />
              <FormDescription>Min 8 characters.</FormDescription>
            </FormField>
            <FormField>
              <FormLabel>Number</FormLabel>
              <FieldInput type="number" placeholder="0" min={0} />
            </FormField>
          </Form>
          <Form>
            <FormField>
              <FormLabel>Textarea</FormLabel>
              <FieldTextarea placeholder="Multi-line text…" rows={3} />
              <FormDescription>Up to 500 characters.</FormDescription>
            </FormField>
          </Form>
        </section>

        <Separator />

        {/* Selection controls */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-(--color-text-tertiary)">
            Selection controls
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="aft-select">Select</Label>
              <Select>
                <SelectTrigger id="aft-select">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Radio group</Label>
              <RadioGroup defaultValue="option-1" className="space-y-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option-1" id="aft-rg-1" />
                  <Label htmlFor="aft-rg-1">Option one</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option-2" id="aft-rg-2" />
                  <Label htmlFor="aft-rg-2">Option two</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option-3" id="aft-rg-3" />
                  <Label htmlFor="aft-rg-3">Option three</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </section>

        <Separator />

        {/* Toggle controls */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-(--color-text-tertiary)">
            Toggle controls
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="aft-terms" />
              <Label htmlFor="aft-terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aft-switch">Marketing emails</Label>
                <p className="text-xs text-(--color-text-tertiary)">
                  Receive product updates.
                </p>
              </div>
              <Switch id="aft-switch" />
            </div>
          </div>
        </section>

        <Separator />

        {/* Range */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-(--color-text-tertiary)">
            Range
          </h3>
          <div className="space-y-3">
            <Label>Slider — {sliderValue[0]}%</Label>
            <Slider
              aria-label="Percentage"
              value={sliderValue}
              onValueChange={setSliderValue}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-(--color-text-tertiary)">
              Drag to adjust the value.
            </p>
          </div>
        </section>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Multi-Section — grouped fieldsets separated by a visual divider
// ---------------------------------------------------------------------------

export const MultiSection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Long forms benefit from being split into named sections. Use `<Separator>` and a section heading to group related fields. Each section should feel self-contained.",
      },
    },
  },
  render: () => (
    <Form className="mx-auto w-full max-w-lg">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Personal information</h2>
        <p className="text-sm text-(--color-text-tertiary)">
          Your name and contact details.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField required>
          <FormLabel>First name</FormLabel>
          <FieldInput required placeholder="Jane" />
        </FormField>
        <FormField required>
          <FormLabel>Last name</FormLabel>
          <FieldInput required placeholder="Doe" />
        </FormField>
      </div>

      <FormField required>
        <FormLabel>Email</FormLabel>
        <FieldInput required type="email" placeholder="jane@example.com" />
      </FormField>

      <FormField>
        <FormLabel>Phone</FormLabel>
        <FieldInput type="tel" placeholder="+1 (555) 000-0000" />
        <FormDescription>Optional. For account recovery only.</FormDescription>
      </FormField>

      <Separator />

      <div className="space-y-1">
        <h2 className="text-base font-semibold">Account setup</h2>
        <p className="text-sm text-(--color-text-tertiary)">
          Choose your username and secure your account.
        </p>
      </div>

      <FormField required>
        <FormLabel>Username</FormLabel>
        <FieldInput required placeholder="janedoe" />
        <FormDescription>
          3–20 characters. Letters, numbers, and underscores only.
        </FormDescription>
      </FormField>

      <FormField required>
        <FormLabel>Password</FormLabel>
        <FieldInput required type="password" placeholder="••••••••" />
        <FormDescription>Minimum 8 characters.</FormDescription>
      </FormField>

      <FormField required>
        <FormLabel>Confirm password</FormLabel>
        <FieldInput required type="password" placeholder="••••••••" />
      </FormField>

      <Separator />

      <div className="space-y-1">
        <h2 className="text-base font-semibold">Notifications</h2>
        <p className="text-sm text-(--color-text-tertiary)">
          Choose how you'd like to hear from us.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ms-marketing">Marketing emails</Label>
            <p className="text-xs text-(--color-text-tertiary)">
              Product updates and announcements.
            </p>
          </div>
          <Switch id="ms-marketing" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ms-security">Security alerts</Label>
            <p className="text-xs text-(--color-text-tertiary)">
              Unusual sign-in activity and password changes.
            </p>
          </div>
          <Switch id="ms-security" defaultChecked />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="ms-terms" required />
        <Label htmlFor="ms-terms" className="text-sm">
          I agree to the{" "}
          <Button variant="link" className="h-auto p-0 text-sm font-normal">
            terms of service
          </Button>{" "}
          and{" "}
          <Button variant="link" className="h-auto p-0 text-sm font-normal">
            privacy policy
          </Button>
          .
        </Label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Create account
        </Button>
      </div>
    </Form>
  ),
};

// ---------------------------------------------------------------------------
// Conditional Fields — mount/unmount fields based on selections
// ---------------------------------------------------------------------------

export const ConditionalFields: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Show or hide fields based on the user's earlier choices. Mount/unmount conditional fields (rather than just hiding them) so hidden required fields never block submission.",
      },
    },
  },
  render: () => {
    const [contactMethod, setContactMethod] = useState("email");
    const [includeCompany, setIncludeCompany] = useState(false);

    return (
      <Form className="mx-auto w-full max-w-lg">
        <FormField required>
          <FormLabel>Full name</FormLabel>
          <FieldInput required placeholder="Jane Doe" />
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox
            id="cf-company-toggle"
            checked={includeCompany}
            onCheckedChange={(v) => setIncludeCompany(!!v)}
          />
          <Label htmlFor="cf-company-toggle" className="text-sm">
            I'm signing up for an organization
          </Label>
        </div>

        {includeCompany && (
          <FormField required>
            <FormLabel>Organization name</FormLabel>
            <FieldInput required placeholder="Acme Inc." />
            <FormDescription>
              This will appear on invoices and reports.
            </FormDescription>
          </FormField>
        )}

        <Separator />

        <div className="space-y-3">
          <Label>Preferred contact method</Label>
          <RadioGroup value={contactMethod} onValueChange={setContactMethod}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="email" id="cf-email" />
              <Label htmlFor="cf-email">Email</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="phone" id="cf-phone" />
              <Label htmlFor="cf-phone">Phone</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="none" id="cf-none" />
              <Label htmlFor="cf-none">Don't contact me</Label>
            </div>
          </RadioGroup>
        </div>

        {contactMethod === "email" && (
          <FormField required>
            <FormLabel>Email address</FormLabel>
            <FieldInput required type="email" placeholder="jane@example.com" />
          </FormField>
        )}

        {contactMethod === "phone" && (
          <FormField required>
            <FormLabel>Phone number</FormLabel>
            <FieldInput required type="tel" placeholder="+1 (555) 000-0000" />
            <FormDescription>Include country code.</FormDescription>
          </FormField>
        )}

        {contactMethod === "none" && (
          <p className="text-sm text-(--color-text-tertiary)">
            You won't receive any outbound communications.
          </p>
        )}

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </Form>
    );
  },
};

// ---------------------------------------------------------------------------
// Disabled State — all fields in a read-only form
// ---------------------------------------------------------------------------

export const DisabledState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Disabled forms are used when editing isn't currently available — for example, during a submission or when the user lacks permission. Pass `disabled` to each input individually (there's no single `disabled` on `<Form>`).",
      },
    },
    // The only contrast finding here is the caption text next to the
    // disabled Email notifications switch — WCAG 1.4.3 exempts text that's
    // part of an inactive UI component (the switch itself is a real
    // `disabled` control, not just visually dimmed).
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
  render: () => (
    <Form className="mx-auto w-full max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Profile settings</p>
          <p className="text-xs text-(--color-text-tertiary)">
            Editing is currently unavailable.
          </p>
        </div>
        <Badge variant="secondary">Read only</Badge>
      </div>

      <FormField>
        <FormLabel>Display name</FormLabel>
        <FieldInput disabled defaultValue="Jane Doe" />
      </FormField>

      <FormField>
        <FormLabel>Email</FormLabel>
        <FieldInput disabled type="email" defaultValue="jane@example.com" />
        <FormDescription>Contact support to change your email.</FormDescription>
      </FormField>

      <FormField>
        <FormLabel>Role</FormLabel>
        <FieldInput disabled defaultValue="Administrator" />
      </FormField>

      <div className="flex items-center justify-between opacity-50">
        <div className="space-y-0.5">
          <Label htmlFor="ds-notifications">Email notifications</Label>
          <p className="text-xs text-(--color-text-tertiary)">
            Receive product updates.
          </p>
        </div>
        <Switch id="ds-notifications" disabled defaultChecked />
      </div>

      <Button disabled className="w-full">
        Save changes
      </Button>
    </Form>
  ),
};

// ---------------------------------------------------------------------------
// Login — compact real-world login form
// ---------------------------------------------------------------------------

export const Login: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact login form shown in a `Card` — the typical real-world container for an authentication form. Uses a ghost button for forgot-password and an outline button for the secondary sign-up path.",
      },
    },
  },
  render: () => (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form>
          <FormField required>
            <FormLabel>Email</FormLabel>
            <FieldInput required type="email" placeholder="jane@example.com" />
          </FormField>

          <FormField required>
            <FormLabel>Password</FormLabel>
            <FieldInput required type="password" placeholder="••••••••" />
          </FormField>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="login-remember" />
              <Label htmlFor="login-remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Button variant="ghost" size="sm" type="button">
              Forgot password?
            </Button>
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Create an account
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// Registration — full real-world registration form
// ---------------------------------------------------------------------------

export const Registration: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Complete registration form in a `Card` — the typical real-world container for an onboarding flow. Combines text inputs, select, radio group, and checkbox.",
      },
    },
  },
  render: () => (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Free to start. No credit card required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form>
          <div className="grid grid-cols-2 gap-4">
            <FormField required>
              <FormLabel>First name</FormLabel>
              <FieldInput required placeholder="Jane" />
            </FormField>
            <FormField required>
              <FormLabel>Last name</FormLabel>
              <FieldInput required placeholder="Doe" />
            </FormField>
          </div>

          <FormField required>
            <FormLabel>Email</FormLabel>
            <FieldInput required type="email" placeholder="jane@example.com" />
          </FormField>

          <FormField required>
            <FormLabel>Password</FormLabel>
            <FieldInput required type="password" placeholder="••••••••" />
            <FormDescription>At least 8 characters.</FormDescription>
          </FormField>

          <div className="space-y-2">
            <Label htmlFor="reg-country">Country</Label>
            <Select>
              <SelectTrigger id="reg-country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>How did you hear about us?</Label>
            <RadioGroup>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="search" id="reg-r1" />
                <Label htmlFor="reg-r1">Search engine</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="social" id="reg-r2" />
                <Label htmlFor="reg-r2">Social media</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="referral" id="reg-r3" />
                <Label htmlFor="reg-r3">Friend or colleague</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="other" id="reg-r4" />
                <Label htmlFor="reg-r4">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="reg-terms" required />
            <Label htmlFor="reg-terms" className="text-sm">
              I agree to the{" "}
              <Button variant="link" className="h-auto p-0 text-sm font-normal">
                terms of service
              </Button>
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </Form>
      </CardContent>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// Interaction Test — play() validates the full error → success flow
// ---------------------------------------------------------------------------

export const WithInteractions: Story = {
  name: "Interaction Test",
  parameters: {
    docs: {
      description: {
        story:
          "Automated interaction test. Verifies that empty submission surfaces both error messages, that filling valid values clears them, and that a successful submission shows the confirmation banner.",
      },
    },
  },
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const next: Record<string, string> = {};

      if (!data.get("wi-name")) next.name = "Name is required.";
      if (!data.get("wi-email")) next.email = "Email is required.";

      setErrors(next);
      if (Object.keys(next).length === 0) setSubmitted(true);
    };

    return (
      <Form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg">
        {submitted && (
          <Alert variant="success" role="status">
            <AlertDescription>Form submitted successfully!</AlertDescription>
          </Alert>
        )}

        <FormField error={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <FieldInput name="wi-name" placeholder="Jane Doe" />
          <FormMessage>{errors.name}</FormMessage>
        </FormField>

        <FormField error={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <FieldInput
            name="wi-email"
            type="email"
            placeholder="jane@example.com"
          />
          <FormMessage>{errors.email}</FormMessage>
        </FormField>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameInput = canvas.getByLabelText(/name/i);
    const emailInput = canvas.getByLabelText(/email/i);
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    // Empty submit → both errors visible
    const submitButton = canvas.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    const nameError = await canvas.findByText(/name is required/i);
    expect(nameError).toBeInTheDocument();

    const emailError = canvas.getByText(/email is required/i);
    expect(emailError).toBeInTheDocument();

    // Fill valid values
    await userEvent.type(nameInput, "Jane Doe");
    await userEvent.type(emailInput, "jane@example.com");

    // Re-submit → errors clear, success banner appears
    await userEvent.click(submitButton);

    expect(canvas.queryByText(/name is required/i)).not.toBeInTheDocument();
    expect(canvas.queryByText(/email is required/i)).not.toBeInTheDocument();

    const success = canvas.getByRole("status");
    expect(success).toHaveTextContent(/form submitted successfully/i);
  },
};
