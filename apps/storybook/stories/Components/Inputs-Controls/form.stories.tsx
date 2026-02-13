import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Form } from "@wyliedog/ui/form";
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
import { useState } from "react";

const meta: Meta<typeof Form> = {
  title: "Components/Inputs & Controls/Form",
  component: Form,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Form wrapper component with validation support and accessible form patterns.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for layout and spacing",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    onSubmit: {
      description: "Form submission handler",
      table: {
        type: { summary: "(e: React.FormEvent) => void" },
        category: "Behavior",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Simple contact form with name, email, and message fields.",
      },
    },
  },
  render: () => (
    <Form className="w-100 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Enter your message" />
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </Form>
  ),
};

export const WithValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Form with client-side validation that shows error states on required fields.",
      },
    },
  },
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newErrors: Record<string, string> = {};

      if (!formData.get("name")) {
        newErrors.name = "Name is required";
      }
      if (!formData.get("email")) {
        newErrors.email = "Email is required";
      }

      setErrors(newErrors);
    };

    return (
      <Form onSubmit={handleSubmit} className="w-100 space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className={errors.name ? "text-(--color-status-danger)" : ""}
          >
            Name {errors.name && "*"}
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            className={errors.name ? "border-(--color-border-danger)" : ""}
          />
          {errors.name && (
            <p className="text-sm text-(--color-status-danger)">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className={errors.email ? "text-(--color-status-danger)" : ""}
          >
            Email {errors.email && "*"}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className={errors.email ? "border-(--color-border-danger)" : ""}
          />
          {errors.email && (
            <p className="text-sm text-(--color-status-danger)">
              {errors.email}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    );
  },
};

export const Registration: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Multi-field registration form with text inputs, select, radio group, and checkbox.",
      },
    },
  },
  render: () => (
    <Form className="w-100 space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select>
          <SelectTrigger>
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
        <Label>Preferences</Label>
        <RadioGroup defaultValue="email">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="r1" />
            <Label htmlFor="r1">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="r2" />
            <Label htmlFor="r2">SMS notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="r3" />
            <Label htmlFor="r3">No notifications</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms" className="text-sm">
          I agree to the terms and conditions
        </Label>
      </div>

      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </Form>
  ),
};

export const Login: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact login form with email, password, remember-me checkbox, and sign-up option.",
      },
    },
  },
  render: () => (
    <Form className="w-87.5 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="text-sm text-(--color-text-secondary)">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>
          <Button variant="ghost" size="sm">
            Forgot password?
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full">
          Sign In
        </Button>
        <Button type="button" variant="outline" className="w-full">
          Sign up
        </Button>
      </div>
    </Form>
  ),
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Interactive tests covering validation error display on empty submit, error clearing on valid input, and successful submission.",
      },
    },
  },
  render: () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const newErrors: Record<string, string> = {};

      if (!formData.get("wi-name")) newErrors.name = "Name is required";
      if (!formData.get("wi-email")) newErrors.email = "Email is required";

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) setSubmitted(true);
    };

    return (
      <Form onSubmit={handleSubmit} className="w-100 space-y-6">
        {submitted && (
          <p
            role="status"
            className="text-sm font-medium text-(--color-status-success)"
          >
            Form submitted successfully!
          </p>
        )}
        <div className="space-y-2">
          <Label
            htmlFor="wi-name"
            className={errors.name ? "text-(--color-status-danger)" : ""}
          >
            Name {errors.name && "*"}
          </Label>
          <Input
            id="wi-name"
            name="wi-name"
            placeholder="Enter your name"
            className={errors.name ? "border-(--color-border-danger)" : ""}
          />
          {errors.name && (
            <p role="alert" className="text-sm text-(--color-status-danger)">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="wi-email"
            className={errors.email ? "text-(--color-status-danger)" : ""}
          >
            Email {errors.email && "*"}
          </Label>
          <Input
            id="wi-email"
            name="wi-email"
            type="email"
            placeholder="Enter your email"
            className={errors.email ? "border-(--color-border-danger)" : ""}
          />
          {errors.email && (
            <p role="alert" className="text-sm text-(--color-status-danger)">
              {errors.email}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Inputs are present and initially empty
    const nameInput = canvas.getByLabelText(/name/i);
    const emailInput = canvas.getByLabelText(/email/i);
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    // Test 2: Submitting with empty fields shows both error messages
    const submitButton = canvas.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    const nameError = await canvas.findByRole("alert", {
      name: /name is required/i,
    });
    expect(nameError).toBeInTheDocument();

    const emailError = canvas.getByText(/email is required/i);
    expect(emailError).toBeInTheDocument();

    // Test 3: Typing into name field (errors remain until re-submit)
    await userEvent.type(nameInput, "Jane Doe");
    expect(nameInput).toHaveValue("Jane Doe");

    // Test 4: Typing a valid email
    await userEvent.type(emailInput, "jane@example.com");
    expect(emailInput).toHaveValue("jane@example.com");

    // Test 5: Re-submitting with valid values clears errors and shows success
    await userEvent.click(submitButton);

    expect(canvas.queryByText(/name is required/i)).not.toBeInTheDocument();
    expect(canvas.queryByText(/email is required/i)).not.toBeInTheDocument();

    const successMessage = canvas.getByRole("status");
    expect(successMessage).toHaveTextContent(/form submitted successfully/i);
  },
};
