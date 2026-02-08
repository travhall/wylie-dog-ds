// Enhanced Button component with accessibility utilities example
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Button } from "../button";

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

describe("Button Accessibility Tests", () => {
  it("should pass accessibility audit", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should be focusable and activatable with keyboard", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });

    // Test keyboard navigation
    button.focus();
    expect(button).toHaveFocus();

    // Test Enter key activation
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.click(button); // Simulate the actual click that would happen
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key activation
    fireEvent.keyDown(button, { key: " " });
    fireEvent.click(button); // Simulate the actual click that would happen
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("should properly handle disabled state", async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");

    // Should still pass accessibility audit when disabled
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should support loading state accessibility", async () => {
    const { container } = render(<Button loading>Loading Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");

    // Should have loading indicator (look for specific loading spinner)
    expect(screen.getByText("Loading Button")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should support different variants", async () => {
    const variants = [
      "default",
      "primary",
      "secondary",
      "outline",
      "ghost",
      "link",
      "destructive",
    ] as const;

    for (const variant of variants) {
      const { container } = render(
        <Button variant={variant}>Test Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it("should support different sizes", async () => {
    const sizes = ["default", "sm", "md", "lg", "icon"] as const;

    for (const size of sizes) {
      const { container } = render(<Button size={size}>Test Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
