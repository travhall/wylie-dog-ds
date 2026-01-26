import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Badge } from "../badge";

expect.extend(toHaveNoViolations);

describe("Badge", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<Badge>Default</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with all variants", async () => {
      const variants = [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "outline",
      ] as const;

      for (const variant of variants) {
        const { container, unmount } = render(
          <Badge variant={variant}>{variant}</Badge>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should have semantic role", () => {
      render(<Badge>New</Badge>);
      const badge = screen.getByText("New");
      // Badge is rendered as a div, which is appropriate for presentational badges
      expect(badge.tagName).toBe("DIV");
    });

    it("should support aria-label for icon badges", () => {
      render(<Badge aria-label="New item indicator">🆕</Badge>);

      const badge = screen.getByLabelText("New item indicator");
      expect(badge).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <div>
          <Badge aria-describedby="badge-description">Premium</Badge>
          <span id="badge-description">Premium user account</span>
        </div>
      );

      const badge = screen.getByText("Premium");
      const description = screen.getByText("Premium user account");

      expect(badge).toHaveAttribute("aria-describedby", "badge-description");
      expect(description).toBeInTheDocument();
    });
  });

  describe("Functionality", () => {
    it("should render with children", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should render complex children", () => {
      render(
        <Badge>
          <span>Status:</span>
          <span className="ml-1">Active</span>
        </Badge>
      );

      expect(screen.getByText("Status:")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render with numeric content", () => {
      render(<Badge>5</Badge>);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render with emoji content", () => {
      render(<Badge>🎉</Badge>);
      expect(screen.getByText("🎉")).toBeInTheDocument();
    });

    it("should accept custom id", () => {
      render(<Badge id="custom-badge">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("id", "custom-badge");
    });

    it("should accept data attributes", () => {
      render(
        <Badge data-testid="test-badge" data-analytics="badge-click">
          Test
        </Badge>
      );

      const badge = screen.getByTestId("test-badge");
      expect(badge).toHaveAttribute("data-analytics", "badge-click");
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText("Default");

      expect(badge).toHaveClass("bg-(--color-badge-default-background)");
      expect(badge).toHaveClass("text-(--color-badge-default-text)");
      expect(badge).toHaveClass("border-(--color-badge-default-border)");
    });

    it("should render secondary variant", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText("Secondary");

      expect(badge).toHaveClass("bg-(--color-badge-secondary-background)");
      expect(badge).toHaveClass("text-(--color-badge-secondary-text)");
      expect(badge).toHaveClass("border-(--color-badge-secondary-border)");
    });

    it("should render success variant", () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText("Success");

      expect(badge).toHaveClass("bg-(--color-badge-success-background)");
      expect(badge).toHaveClass("text-(--color-badge-success-text)");
      expect(badge).toHaveClass("border-(--color-badge-success-border)");
    });

    it("should render warning variant", () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText("Warning");

      expect(badge).toHaveClass("bg-(--color-badge-warning-background)");
      expect(badge).toHaveClass("text-(--color-badge-warning-text)");
      expect(badge).toHaveClass("border-(--color-badge-warning-border)");
    });

    it("should render destructive variant", () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText("Destructive");

      expect(badge).toHaveClass("bg-(--color-badge-destructive-background)");
      expect(badge).toHaveClass("text-(--color-badge-destructive-text)");
      expect(badge).toHaveClass("border-(--color-badge-destructive-border)");
    });

    it("should render outline variant", () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText("Outline");

      expect(badge).toHaveClass("bg-(--color-badge-outline-background)");
      expect(badge).toHaveClass("text-(--color-badge-outline-text)");
      expect(badge).toHaveClass("border-(--color-badge-outline-border)");
    });

    it("should have default variant when none specified", () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText("Default Badge");

      expect(badge).toHaveClass("bg-(--color-badge-default-background)");
    });

    it("should apply variant dynamically", () => {
      const { rerender } = render(<Badge variant="default">Badge</Badge>);
      let badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-(--color-badge-default-background)");

      rerender(<Badge variant="success">Badge</Badge>);
      badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-(--color-badge-success-background)");

      rerender(<Badge variant="destructive">Badge</Badge>);
      badge = screen.getByText("Badge");
      expect(badge).toHaveClass("bg-(--color-badge-destructive-background)");
    });
  });

  describe("Styling", () => {
    it("should have base styles applied", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");

      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("rounded-(--spacing-badge-radius)");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("px-(--spacing-badge-padding-md)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-md)");
      expect(badge).toHaveClass("font-semibold");
    });

    it("should have transition-colors class", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("transition-colors");
    });

    it("should accept custom className", () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("custom-class");
    });

    it("should merge custom className with base styles", () => {
      render(<Badge className="text-lg">Badge</Badge>);
      const badge = screen.getByText("Badge");

      // Should have base styles
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-md)");
      // And custom styles
      expect(badge).toHaveClass("text-lg");
    });

    it("should maintain inline-flex layout", () => {
      const { container } = render(
        <Badge>
          <span>Icon</span>
          <span className="ml-2">Label</span>
        </Badge>
      );

      const badge = container.querySelector('[class*="inline-flex"]');
      expect(badge).toHaveClass("items-center");
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Badge ref={ref}>Badge</Badge>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe("DIV");
    });

    it("should work with event handlers", () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);

      const badge = screen.getByText("Clickable Badge");
      badge.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should work with mouse events", () => {
      const { container } = render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      // Add event listeners after render to test direct events
      badge.addEventListener("mouseenter", handleMouseEnter);
      badge.addEventListener("mouseleave", handleMouseLeave);

      badge.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      badge.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);

      badge.removeEventListener("mouseenter", handleMouseEnter);
      badge.removeEventListener("mouseleave", handleMouseLeave);
    });

    it("should work as child in list", () => {
      render(
        <div>
          <Badge variant="success">New</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Error</Badge>
        </div>
      );

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should work with aria-label in icon badge scenario", () => {
      render(
        <div>
          <span>
            Status
            <Badge aria-label="Processing">⏳</Badge>
          </span>
        </div>
      );

      const badge = screen.getByLabelText("Processing");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("⏳");
    });

    it("should work with semantic HTML", () => {
      render(
        <div>
          <span>
            <strong>User Role:</strong>
            <Badge variant="success" className="ml-2">
              Administrator
            </Badge>
          </span>
        </div>
      );

      const badge = screen.getByText("Administrator");
      expect(badge).toBeInTheDocument();
    });

    it("should support all HTML attributes", () => {
      render(
        <Badge
          id="test-id"
          className="custom"
          data-testid="badge-test"
          title="Tooltip"
          style={{ opacity: 0.8 }}
        >
          Badge
        </Badge>
      );

      const badge = screen.getByTestId("badge-test");
      expect(badge).toHaveAttribute("id", "test-id");
      expect(badge).toHaveAttribute("title", "Tooltip");
      expect(badge).toHaveStyle({ opacity: "0.8" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long text", () => {
      const longText =
        "This is a very long badge text that might wrap depending on the container width";
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle single character", () => {
      render(<Badge>A</Badge>);
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("should handle whitespace", () => {
      render(<Badge> </Badge>);
      const badge = screen.getByText(
        (content, element) =>
          element?.className.includes("inline-flex") ?? false
      );
      expect(badge).toBeInTheDocument();
    });

    it("should handle special characters", () => {
      render(<Badge>!@#$%^&*()</Badge>);
      expect(screen.getByText("!@#$%^&*()")).toBeInTheDocument();
    });

    it("should handle unicode characters", () => {
      render(<Badge>你好世界</Badge>);
      expect(screen.getByText("你好世界")).toBeInTheDocument();
    });

    it("should handle numbers as string", () => {
      render(<Badge>12345</Badge>);
      expect(screen.getByText("12345")).toBeInTheDocument();
    });

    it("should handle HTML entities in text", () => {
      render(<Badge>&lt;script&gt;</Badge>);
      expect(screen.getByText("<script>")).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      const { container } = render(<Badge />);
      const badge = container.querySelector('[class*="inline-flex"]');
      expect(badge).toBeInTheDocument();
    });

    it("should handle multiple variant changes", () => {
      const { rerender } = render(<Badge>Badge</Badge>);

      const variants = [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "outline",
      ] as const;

      variants.forEach((variant) => {
        rerender(<Badge variant={variant}>Badge</Badge>);
        const badge = screen.getByText("Badge");
        expect(badge).toBeInTheDocument();
      });
    });

    it("should handle all props at once", () => {
      render(
        <Badge
          variant="success"
          id="badge-id"
          className="custom-class"
          data-testid="test"
          aria-label="Success badge"
          title="This is a success badge"
        >
          Success
        </Badge>
      );

      const badge = screen.getByLabelText("Success badge");
      expect(badge).toHaveAttribute("id", "badge-id");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("bg-(--color-badge-success-background)");
      expect(badge).toHaveAttribute("title", "This is a success badge");
    });

    it("should handle rapid re-renders with different variants", () => {
      const { rerender } = render(<Badge variant="default">Badge</Badge>);

      for (let i = 0; i < 50; i++) {
        const variants = [
          "default",
          "secondary",
          "success",
          "warning",
          "destructive",
          "outline",
        ] as const;
        const variant = variants[i % variants.length];
        rerender(<Badge variant={variant}>Badge</Badge>);
      }

      const badge = screen.getByText("Badge");
      expect(badge).toBeInTheDocument();
    });

    it("should handle className override of variant styles", () => {
      render(
        <Badge variant="default" className="bg-custom-color">
          Badge
        </Badge>
      );

      const badge = screen.getByText("Badge");
      // Will have both variant and custom class
      expect(badge).toHaveClass("bg-custom-color");
      expect(badge).toHaveClass("bg-(--color-badge-default-background)");
    });
  });

  describe("Visual Regression", () => {
    it("should maintain consistent size across variants", () => {
      const { container } = render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="destructive">Error</Badge>
        </div>
      );

      const badges = container.querySelectorAll('[class*="inline-flex"]');
      expect(badges).toHaveLength(3);

      badges.forEach((badge) => {
        expect(badge).toHaveClass(
          "text-(length:--font-size-badge-font-size-md)"
        );
        expect(badge).toHaveClass("px-(--spacing-badge-padding-md)");
      });
    });

    it("should maintain border consistency", () => {
      const { container } = render(
        <div>
          <Badge variant="default">Badge 1</Badge>
          <Badge variant="outline">Badge 2</Badge>
        </div>
      );

      const badges = container.querySelectorAll('[class*="border"]');
      badges.forEach((badge) => {
        expect(badge).toHaveClass("border");
      });
    });
  });
});
