import type { Meta, StoryObj } from "@storybook/react-vite";
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
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
