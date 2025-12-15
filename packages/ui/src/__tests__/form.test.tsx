import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";
import { Input } from "../input";

expect.extend(toHaveNoViolations);

describe("Form", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Form>
          <FormField>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input aria-label="Username" />
            </FormControl>
            <FormDescription>Enter your username</FormDescription>
          </FormField>
        </Form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with error state", async () => {
      const { container } = render(
        <Form>
          <FormField error>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input aria-label="Email" />
            </FormControl>
            <FormMessage>Invalid email address</FormMessage>
          </FormField>
        </Form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with required field", async () => {
      const { container } = render(
        <Form>
          <FormField required>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" aria-label="Password" required />
            </FormControl>
          </FormField>
        </Form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Form Component", () => {
    it("should render with children", () => {
      render(
        <Form>
          <div>Form content</div>
        </Form>
      );
      expect(screen.getByText("Form content")).toBeInTheDocument();
    });

    it("should render as form element", () => {
      const { container } = render(<Form>Content</Form>);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Form className="custom-form">Content</Form>
      );
      const form = container.querySelector("form");
      expect(form).toHaveClass("custom-form");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLFormElement>();
      render(<Form ref={ref}>Content</Form>);

      expect(ref.current).toBeInstanceOf(HTMLFormElement);
    });

    it("should handle onSubmit", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );

      const button = screen.getByRole("button");
      button.click();

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("FormField Component", () => {
    it("should render with children", () => {
      render(
        <FormField>
          <FormLabel>Test Field</FormLabel>
        </FormField>
      );
      expect(screen.getByText("Test Field")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <FormField ref={ref}>
          <div>Content</div>
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <FormField className="custom-field">
          <div>Content</div>
        </FormField>
      );
      const field = container.firstChild as HTMLElement;
      expect(field).toHaveClass("custom-field");
    });

    it("should render error state", () => {
      render(
        <FormField error>
          <FormLabel>Email</FormLabel>
          <FormMessage>Error message</FormMessage>
        </FormField>
      );
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("should render required state", () => {
      render(
        <FormField required>
          <FormLabel>Required Field</FormLabel>
        </FormField>
      );
      const label = screen.getByText("Required Field");
      const asterisk = label.querySelector(
        ".text-\\[var\\(--color-text-danger\\)\\]"
      );
      expect(asterisk).toBeInTheDocument();
    });
  });

  describe("FormItem Component", () => {
    it("should render with children", () => {
      render(
        <FormItem>
          <div>Item content</div>
        </FormItem>
      );
      expect(screen.getByText("Item content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FormItem ref={ref}>Content</FormItem>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <FormItem className="custom-item">Content</FormItem>
      );
      const item = container.firstChild as HTMLElement;
      expect(item).toHaveClass("custom-item");
    });
  });

  describe("FormLabel Component", () => {
    it("should render with children", () => {
      render(
        <FormField>
          <FormLabel>Username Label</FormLabel>
        </FormField>
      );
      expect(screen.getByText("Username Label")).toBeInTheDocument();
    });

    it("should render as label element", () => {
      render(
        <FormField>
          <FormLabel>Test Label</FormLabel>
        </FormField>
      );
      const label = screen.getByText("Test Label");
      expect(label.tagName).toBe("LABEL");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLabelElement>();
      render(
        <FormField>
          <FormLabel ref={ref}>Label</FormLabel>
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });

    it("should apply custom className", () => {
      render(
        <FormField>
          <FormLabel className="custom-label">Label</FormLabel>
        </FormField>
      );
      const label = screen.getByText("Label");
      expect(label).toHaveClass("custom-label");
    });

    it("should support size variants", () => {
      const { rerender } = render(
        <FormField>
          <FormLabel size="sm">Small</FormLabel>
        </FormField>
      );
      let label = screen.getByText("Small");
      expect(label).toHaveClass("text-xs");

      rerender(
        <FormField>
          <FormLabel size="md">Medium</FormLabel>
        </FormField>
      );
      label = screen.getByText("Medium");
      expect(label).toHaveClass("text-sm");

      rerender(
        <FormField>
          <FormLabel size="lg">Large</FormLabel>
        </FormField>
      );
      label = screen.getByText("Large");
      expect(label).toHaveClass("text-base");
    });

    it("should show required indicator when field is required", () => {
      render(
        <FormField required>
          <FormLabel>Required Field</FormLabel>
        </FormField>
      );
      const label = screen.getByText("Required Field");
      expect(label.textContent).toContain("*");
    });

    it("should apply error styling when field has error", () => {
      render(
        <FormField error>
          <FormLabel>Error Field</FormLabel>
        </FormField>
      );
      const label = screen.getByText("Error Field");
      expect(label).toHaveClass("text-[var(--color-text-danger)]");
    });
  });

  describe("FormControl Component", () => {
    it("should render with children", () => {
      render(
        <FormControl>
          <div>Control content</div>
        </FormControl>
      );
      expect(screen.getByText("Control content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FormControl ref={ref}>Content</FormControl>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <FormControl className="custom-control">Content</FormControl>
      );
      const control = container.firstChild as HTMLElement;
      expect(control).toHaveClass("custom-control");
    });
  });

  describe("FormDescription Component", () => {
    it("should render with children", () => {
      render(
        <FormField>
          <FormDescription>This is a description</FormDescription>
        </FormField>
      );
      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("should render as paragraph element", () => {
      render(
        <FormField>
          <FormDescription>Description text</FormDescription>
        </FormField>
      );
      const description = screen.getByText("Description text");
      expect(description.tagName).toBe("P");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(
        <FormField>
          <FormDescription ref={ref}>Description</FormDescription>
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it("should apply custom className", () => {
      render(
        <FormField>
          <FormDescription className="custom-description">
            Description
          </FormDescription>
        </FormField>
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("custom-description");
    });

    it("should have proper ID for accessibility", () => {
      render(
        <FormField>
          <FormDescription>Description text</FormDescription>
        </FormField>
      );
      const description = screen.getByText("Description text");
      expect(description).toHaveAttribute("id");
    });
  });

  describe("FormMessage Component", () => {
    it("should render error message when field has error", () => {
      render(
        <FormField error>
          <FormMessage>This field is required</FormMessage>
        </FormField>
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should not render when field has no error", () => {
      render(
        <FormField>
          <FormMessage>This should not appear</FormMessage>
        </FormField>
      );
      expect(
        screen.queryByText("This should not appear")
      ).not.toBeInTheDocument();
    });

    it("should have role alert for accessibility", () => {
      render(
        <FormField error>
          <FormMessage>Error message</FormMessage>
        </FormField>
      );
      const message = screen.getByRole("alert");
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent("Error message");
    });

    it("should have aria-live polite for screen readers", () => {
      render(
        <FormField error>
          <FormMessage>Error message</FormMessage>
        </FormField>
      );
      const message = screen.getByText("Error message");
      expect(message).toHaveAttribute("aria-live", "polite");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(
        <FormField error>
          <FormMessage ref={ref}>Message</FormMessage>
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it("should apply custom className", () => {
      render(
        <FormField error>
          <FormMessage className="custom-message">Message</FormMessage>
        </FormField>
      );
      const message = screen.getByText("Message");
      expect(message).toHaveClass("custom-message");
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(
        <Form>
          <FormField>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" aria-label="Email Address" />
            </FormControl>
            <FormDescription>We'll never share your email</FormDescription>
          </FormField>
        </Form>
      );

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(
        screen.getByText("We'll never share your email")
      ).toBeInTheDocument();
    });

    it("should work with multiple fields", () => {
      render(
        <Form>
          <FormField>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input aria-label="Username" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" aria-label="Email" />
            </FormControl>
          </FormField>
        </Form>
      );

      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should handle form submission with multiple fields", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input name="username" aria-label="Username" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" name="password" aria-label="Password" />
            </FormControl>
          </FormField>
          <button type="submit">Submit</button>
        </Form>
      );

      const button = screen.getByRole("button");
      button.click();

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should show error states correctly", () => {
      render(
        <Form>
          <FormField error>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input aria-label="Email" />
            </FormControl>
            <FormMessage>Invalid email format</FormMessage>
          </FormField>
        </Form>
      );

      const label = screen.getByText("Email");
      expect(label).toHaveClass("text-[var(--color-text-danger)]");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email format"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty Form", () => {
      const { container } = render(<Form />);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should handle FormField without FormLabel", () => {
      render(
        <FormField>
          <FormControl>
            <Input aria-label="Test input" />
          </FormControl>
        </FormField>
      );
      expect(screen.getByLabelText("Test input")).toBeInTheDocument();
    });

    it("should handle FormField without FormDescription", () => {
      render(
        <FormField>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input aria-label="Username" />
          </FormControl>
        </FormField>
      );
      expect(screen.getByText("Username")).toBeInTheDocument();
    });

    it("should handle both required and error states", () => {
      render(
        <FormField required error>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input aria-label="Email" />
          </FormControl>
          <FormMessage>Required field</FormMessage>
        </FormField>
      );

      const label = screen.getByText("Email");
      expect(label.textContent).toContain("*");
      expect(label).toHaveClass("text-[var(--color-text-danger)]");
      expect(screen.getByRole("alert")).toHaveTextContent("Required field");
    });
  });
});
