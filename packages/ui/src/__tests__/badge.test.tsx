import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Badge, badgeVariants } from "../badge";

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

  describe("Size Variants", () => {
    it("should apply sm size token classes", () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText("Small");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-sm)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-sm)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-sm)");
    });

    it("should apply md size token classes (default)", () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText("Medium");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-md)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-md)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-md)");
    });

    it("should apply lg size token classes", () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText("Large");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-lg)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-lg)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-lg)");
    });

    it("should default to md size when size is not specified", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-md)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-md)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-md)");
    });

    it("should change size classes dynamically", () => {
      const { rerender } = render(<Badge size="sm">Badge</Badge>);
      let badge = screen.getByText("Badge");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-sm)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-sm)");

      rerender(<Badge size="lg">Badge</Badge>);
      badge = screen.getByText("Badge");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-lg)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-lg)");
    });

    it("should pass accessibility audit for all sizes", async () => {
      for (const size of ["sm", "md", "lg"] as const) {
        const { container, unmount } = render(
          <Badge size={size}>{size}</Badge>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });
  });

  describe("Interactive Prop", () => {
    it("should apply cursor-pointer when interactive", () => {
      render(<Badge interactive>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("cursor-pointer");
    });

    it("should apply focus ring token classes when interactive", () => {
      render(<Badge interactive>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("focus:outline-none");
      expect(badge).toHaveClass("focus:ring-(length:--space-focus-ring-width)");
      expect(badge).toHaveClass("focus:ring-(--color-border-focus)");
      expect(badge).toHaveClass(
        "focus:ring-offset-(--space-focus-ring-offset)"
      );
    });

    it("should apply disabled state classes when interactive", () => {
      render(<Badge interactive>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("disabled:opacity-(--badge-disabled-opacity)");
      expect(badge).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should auto-inject role=button and tabIndex=0 when interactive without asChild", () => {
      render(<Badge interactive>Badge</Badge>);
      const badge = screen.getByRole("button");
      expect(badge).toHaveAttribute("tabindex", "0");
      expect(badge).toHaveTextContent("Badge");
    });

    it("should not inject role or tabIndex when interactive is false", () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).not.toHaveAttribute("role", "button");
      expect(badge).not.toHaveAttribute("tabindex");
    });

    it("should not apply cursor-pointer when not interactive", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).not.toHaveClass("cursor-pointer");
    });

    it("should apply compound hover/focus/disabled classes for default variant", () => {
      render(
        <Badge interactive variant="default">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass(
        "hover:bg-(--color-badge-default-background-hover)"
      );
      expect(badge).toHaveClass(
        "focus:bg-(--color-badge-default-background-focus)"
      );
      expect(badge).toHaveClass(
        "disabled:bg-(--color-badge-default-background-disabled)"
      );
    });

    it("should apply compound classes for all variants when interactive", () => {
      const variants = [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "outline",
      ] as const;

      for (const variant of variants) {
        const { unmount } = render(
          <Badge interactive variant={variant}>
            {variant}
          </Badge>
        );
        const badge = screen.getByText(variant);
        expect(badge).toHaveClass(
          `hover:bg-(--color-badge-${variant}-background-hover)`
        );
        expect(badge).toHaveClass(
          `focus:bg-(--color-badge-${variant}-background-focus)`
        );
        expect(badge).toHaveClass(
          `disabled:bg-(--color-badge-${variant}-background-disabled)`
        );
        unmount();
      }
    });

    it("should handle click events when interactive", () => {
      const handleClick = vi.fn();
      render(
        <Badge interactive onClick={handleClick}>
          Badge
        </Badge>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyboard events when interactive", () => {
      const handleKeyDown = vi.fn();
      render(
        <Badge interactive onKeyDown={handleKeyDown}>
          Badge
        </Badge>
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("should pass accessibility audit when interactive with aria-label", async () => {
      const { container } = render(
        <Badge interactive aria-label="Filter: active">
          Active
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("asChild Prop", () => {
    it("should render as anchor when asChild with <a>", () => {
      const { container } = render(
        <Badge asChild>
          <a href="#docs">Documentation</a>
        </Badge>
      );
      expect((container.firstChild as HTMLElement).tagName).toBe("A");
    });

    it("should render as button when asChild with <button>", () => {
      const { container } = render(
        <Badge asChild>
          <button type="button">Action</button>
        </Badge>
      );
      expect((container.firstChild as HTMLElement).tagName).toBe("BUTTON");
    });

    it("should apply badge styles to child element", () => {
      const { container } = render(
        <Badge asChild variant="success">
          <a href="#docs">Success link</a>
        </Badge>
      );
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveClass("bg-(--color-badge-success-background)");
      expect(el).toHaveClass("rounded-(--space-badge-radius)");
      expect(el).toHaveClass("border");
    });

    it("should apply interactive compound classes when both interactive and asChild", () => {
      const { container } = render(
        <Badge interactive asChild variant="destructive">
          <a href="#action">Danger</a>
        </Badge>
      );
      const el = container.firstChild as HTMLElement;
      expect(el.tagName).toBe("A");
      expect(el).toHaveClass("cursor-pointer");
      expect(el).toHaveClass(
        "hover:bg-(--color-badge-destructive-background-hover)"
      );
    });

    it("should not inject role or tabIndex when asChild is true", () => {
      const { container } = render(
        <Badge interactive asChild>
          <a href="#link">Link Badge</a>
        </Badge>
      );
      const el = container.firstChild as HTMLElement;
      // The <a> has its own implicit role — Card should not add role="button"
      expect(el).not.toHaveAttribute("role");
      expect(el).not.toHaveAttribute("tabindex");
    });

    it("should pass accessibility audit with asChild anchor", async () => {
      const { container } = render(
        <Badge interactive asChild variant="default">
          <a href="#docs">Documentation</a>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with asChild button", async () => {
      const { container } = render(
        <Badge interactive asChild variant="success">
          <button type="button">Approve</button>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("badgeVariants Function", () => {
    it("should return base classes", () => {
      const classes = badgeVariants({});
      expect(classes).toContain("inline-flex");
      expect(classes).toContain("items-center");
      expect(classes).toContain("border");
      expect(classes).toContain("rounded-(--space-badge-radius)");
      expect(classes).toContain("transition-colors");
    });

    it("should include default variant classes when no variant specified", () => {
      const classes = badgeVariants({});
      expect(classes).toContain("bg-(--color-badge-default-background)");
      expect(classes).toContain("text-(--color-badge-default-text)");
    });

    it("should return correct classes for each variant", () => {
      const variants = [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "outline",
      ] as const;

      for (const variant of variants) {
        const classes = badgeVariants({ variant });
        expect(classes).toContain(`bg-(--color-badge-${variant}-background)`);
        expect(classes).toContain(`text-(--color-badge-${variant}-text)`);
      }
    });

    it("should include interactive classes when interactive is true", () => {
      const classes = badgeVariants({ interactive: true });
      expect(classes).toContain("cursor-pointer");
      expect(classes).toContain("focus:outline-none");
    });

    it("should include compound hover classes for variant + interactive", () => {
      const classes = badgeVariants({
        variant: "destructive",
        interactive: true,
      });
      expect(classes).toContain(
        "hover:bg-(--color-badge-destructive-background-hover)"
      );
      expect(classes).toContain(
        "focus:bg-(--color-badge-destructive-background-focus)"
      );
      expect(classes).toContain(
        "disabled:bg-(--color-badge-destructive-background-disabled)"
      );
    });

    it("should not include interactive classes when interactive is false", () => {
      const classes = badgeVariants({ interactive: false });
      expect(classes).not.toContain("cursor-pointer");
      expect(classes).not.toContain("focus:outline-none");
    });

    it("should include correct size classes", () => {
      expect(badgeVariants({ size: "sm" })).toContain(
        "px-(--space-badge-padding-x-sm)"
      );
      expect(badgeVariants({ size: "md" })).toContain(
        "px-(--space-badge-padding-x-md)"
      );
      expect(badgeVariants({ size: "lg" })).toContain(
        "px-(--space-badge-padding-x-lg)"
      );
    });
  });

  describe("Styling", () => {
    it("should have base styles applied", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");

      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("rounded-(--space-badge-radius)");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("px-(--space-badge-padding-x-md)");
      expect(badge).toHaveClass("py-(--space-badge-padding-y-md)");
      expect(badge).toHaveClass("text-(length:--font-size-badge-font-size-md)");
      expect(badge).toHaveClass("font-(--font-weight-badge-font-weight)");
      expect(badge).toHaveClass("leading-(--line-height-badge-line-height)");
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
        expect(badge).toHaveClass("px-(--space-badge-padding-x-md)");
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
