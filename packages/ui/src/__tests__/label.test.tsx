import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Label } from "../label";

expect.extend(toHaveNoViolations);

describe("Label", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Label htmlFor="test-input">Test Label</Label>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with required indicator", async () => {
      const { container } = render(
        <Label htmlFor="test-input" required>
          Required Field
        </Label>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper aria-label for required indicator", () => {
      render(
        <Label htmlFor="test-input" required>
          Email
        </Label>
      );

      const requiredIndicator = screen.getByLabelText("required");
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveTextContent("*");
    });

    it("should associate with form field via htmlFor", () => {
      render(
        <div>
          <Label htmlFor="email-input">Email</Label>
          <input type="email" id="email-input" />
        </div>
      );

      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email-input");
    });
  });

  describe("Functionality", () => {
    it("should render with children", () => {
      render(<Label>Test Label</Label>);
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("should render required indicator when required prop is true", () => {
      render(<Label required>Username</Label>);

      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("required")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not render required indicator when required prop is false", () => {
      render(<Label required={false}>Username</Label>);

      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.queryByLabelText("required")).not.toBeInTheDocument();
    });

    it("should support custom required indicator", () => {
      render(
        <Label required requiredIndicator="(required)">
          Email
        </Label>
      );

      const indicator = screen.getByLabelText("required");
      expect(indicator).toHaveTextContent("(required)");
    });

    it("should hide required indicator visually but keep for screen readers", () => {
      render(
        <Label required requiredIndicatorSrOnly>
          Password
        </Label>
      );

      const indicator = screen.getByLabelText("required");
      expect(indicator).toHaveClass("sr-only");
    });

    it("should apply error styling when error prop is true", () => {
      render(<Label error>Error Label</Label>);

      const label = screen.getByText("Error Label");
      expect(label).toHaveClass("text-(--color-text-danger)");
    });

    it("should apply normal styling when error prop is false", () => {
      render(<Label error={false}>Normal Label</Label>);

      const label = screen.getByText("Normal Label");
      expect(label).toHaveClass("text-(--color-text-primary)");
    });
  });

  describe("Variants & Styling", () => {
    it("should support all size variants", async () => {
      const sizes = ["sm", "md", "lg"] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Label size={size}>Test Label</Label>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply size classes correctly", () => {
      const { rerender } = render(<Label size="sm">Small</Label>);
      let label = screen.getByText("Small");
      expect(label).toHaveClass("text-xs");

      rerender(<Label size="md">Medium</Label>);
      label = screen.getByText("Medium");
      expect(label).toHaveClass("text-sm");

      rerender(<Label size="lg">Large</Label>);
      label = screen.getByText("Large");
      expect(label).toHaveClass("text-base");
    });

    it("should accept custom className", () => {
      render(<Label className="custom-class">Custom</Label>);

      const label = screen.getByText("Custom");
      expect(label).toHaveClass("custom-class");
    });

    it("should have peer-disabled styles", () => {
      render(<Label>Disabled Field</Label>);

      const label = screen.getByText("Disabled Field");
      expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
      expect(label).toHaveClass("peer-disabled:opacity-70");
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLabelElement>();
      render(<Label ref={ref}>Test</Label>);

      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
      expect(ref.current?.tagName).toBe("LABEL");
    });

    it("should work with form inputs", () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input type="text" id="username" />
        </div>
      );

      const label = screen.getByText("Username");
      const input = document.getElementById("username");

      expect(label).toHaveAttribute("for", "username");
      expect(input).toBeInTheDocument();
    });

    it("should support all HTML label attributes", () => {
      render(
        <Label
          htmlFor="test"
          id="test-label"
          data-testid="custom-label"
          aria-describedby="description"
        >
          Test
        </Label>
      );

      const label = screen.getByText("Test");
      expect(label).toHaveAttribute("for", "test");
      expect(label).toHaveAttribute("id", "test-label");
      expect(label).toHaveAttribute("data-testid", "custom-label");
      expect(label).toHaveAttribute("aria-describedby", "description");
    });

    it("should work with required and error states together", () => {
      render(
        <Label required error>
          Important Field
        </Label>
      );

      const label = screen.getByText("Important Field");
      const indicator = screen.getByLabelText("required");

      expect(label).toHaveClass("text-(--color-text-danger)");
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = render(<Label />);
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });

    it("should handle complex children", () => {
      render(
        <Label htmlFor="complex">
          <span>First Name</span>
          <span className="ml-2 text-gray-500">(optional)</span>
        </Label>
      );

      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("(optional)")).toBeInTheDocument();
    });

    it("should handle very long label text", () => {
      const longText =
        "This is a very long label text that might wrap to multiple lines in the UI";
      render(<Label>{longText}</Label>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle different required indicators", () => {
      const indicators = ["*", "(required)", "•", "REQUIRED"];

      indicators.forEach((indicator) => {
        const { unmount } = render(
          <Label required requiredIndicator={indicator}>
            Field
          </Label>
        );

        expect(screen.getByLabelText("required")).toHaveTextContent(indicator);
        unmount();
      });
    });

    it("should handle empty string as required indicator", () => {
      render(
        <Label required requiredIndicator="">
          Field
        </Label>
      );

      const indicator = screen.getByLabelText("required");
      expect(indicator).toBeEmptyDOMElement();
    });
  });
});
