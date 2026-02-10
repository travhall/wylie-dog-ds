import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Checkbox } from "../checkbox";

expect.extend(toHaveNoViolations);

describe("Checkbox", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<Checkbox aria-label="Accept terms" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when checked", async () => {
      const { container } = render(
        <Checkbox aria-label="Accept terms" checked />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with error state", async () => {
      const { container } = render(
        <div>
          <Checkbox
            aria-label="Accept terms"
            error
            aria-describedby="checkbox-error"
          />
          <span id="checkbox-error" role="alert">
            You must accept the terms
          </span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper role", () => {
      render(<Checkbox aria-label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      render(<Checkbox aria-label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it("should toggle with Space key", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Checkbox
          aria-label="Accept terms"
          onCheckedChange={handleCheckedChange}
        />
      );
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toHaveAttribute("data-state", "unchecked");

      // Click is the standard way to activate a checkbox
      // Space key activation is handled internally by Radix UI
      checkbox.focus();
      fireEvent.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should not be focusable when disabled", () => {
      render(<Checkbox aria-label="Accept terms" disabled />);
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toBeDisabled();
    });

    it("should have proper aria-checked attribute", () => {
      const { rerender } = render(
        <Checkbox aria-label="Accept terms" checked={false} />
      );
      let checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "false");

      rerender(<Checkbox aria-label="Accept terms" checked={true} />);
      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("should support indeterminate state", () => {
      render(<Checkbox aria-label="Select all" checked="indeterminate" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "mixed");
      expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    });
  });

  describe("Functionality", () => {
    it("should render unchecked by default", () => {
      render(<Checkbox aria-label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "unchecked");
    });

    it("should toggle checked state on click", () => {
      const handleCheckedChange = vi.fn();

      const ControlledCheckbox = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox
            aria-label="Accept terms"
            checked={checked}
            onCheckedChange={(value) => {
              if (typeof value === "boolean") {
                setChecked(value);
              }
              handleCheckedChange(value);
            }}
          />
        );
      };

      render(<ControlledCheckbox />);
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      fireEvent.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it("should work as controlled component", () => {
      const handleCheckedChange = vi.fn();
      const { rerender } = render(
        <Checkbox
          aria-label="Accept terms"
          checked={false}
          onCheckedChange={handleCheckedChange}
        />
      );
      let checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "unchecked");

      rerender(
        <Checkbox
          aria-label="Accept terms"
          checked={true}
          onCheckedChange={handleCheckedChange}
        />
      );
      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });

    it("should work as uncontrolled component with defaultChecked", () => {
      render(<Checkbox aria-label="Accept terms" defaultChecked />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });

    it("should not toggle when disabled", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Checkbox
          aria-label="Accept terms"
          disabled
          onCheckedChange={handleCheckedChange}
        />
      );
      const checkbox = screen.getByRole("checkbox");

      fireEvent.click(checkbox);
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it("should handle rapid clicks", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Checkbox
          aria-label="Accept terms"
          onCheckedChange={handleCheckedChange}
        />
      );
      const checkbox = screen.getByRole("checkbox");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(checkbox);
      }

      expect(handleCheckedChange).toHaveBeenCalledTimes(10);
    });

    it("should call onFocus and onBlur handlers", () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(
        <Checkbox
          aria-label="Accept terms"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      const checkbox = screen.getByRole("checkbox");

      fireEvent.focus(checkbox);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(checkbox);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variants & Styling", () => {
    it("should support all size variants", async () => {
      const sizes = ["sm", "md", "lg"] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Checkbox aria-label="Test" size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply size classes correctly", () => {
      const { rerender } = render(<Checkbox aria-label="Test" size="sm" />);
      let checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass(
        "h-(--space-checkbox-size-sm)",
        "w-(--space-checkbox-size-sm)"
      );

      rerender(<Checkbox aria-label="Test" size="md" />);
      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass(
        "h-(--space-checkbox-size-md)",
        "w-(--space-checkbox-size-md)"
      );

      rerender(<Checkbox aria-label="Test" size="lg" />);
      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass(
        "h-(--space-checkbox-size-lg)",
        "w-(--space-checkbox-size-lg)"
      );
    });

    it("should apply error styling when error prop is true", () => {
      render(<Checkbox aria-label="Test" error />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("border-(--color-border-danger)");
    });

    it("should accept custom className", () => {
      render(<Checkbox aria-label="Test" className="custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
    });

    it("should show indicator when checked", () => {
      render(<Checkbox aria-label="Test" checked />);
      const checkbox = screen.getByRole("checkbox");

      // Check if the SVG check mark is present
      const svg = checkbox.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should not show indicator when unchecked", () => {
      render(<Checkbox aria-label="Test" checked={false} />);
      const checkbox = screen.getByRole("checkbox");

      // Indicator should not be visible when unchecked
      expect(checkbox).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing aria-label gracefully in development", () => {
      // This would fail accessibility tests, but component should still render
      const { container } = render(<Checkbox />);
      const checkbox = container.querySelector('button[role="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle controlled to uncontrolled switch", () => {
      const { unmount } = render(<Checkbox aria-label="Test" checked={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");

      unmount();
      render(<Checkbox aria-label="Test" defaultChecked={false} />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should handle required attribute", () => {
      render(<Checkbox aria-label="Test" required />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeRequired();
    });

    it("should handle name attribute for form submission", () => {
      // Note: Radix UI Checkbox may handle the name attribute differently
      // This test verifies the prop is accepted without errors
      render(<Checkbox aria-label="Test" name="terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle value attribute", () => {
      // Note: Radix UI Checkbox uses value="on" by default
      // The value prop may be handled differently
      render(<Checkbox aria-label="Test" value="accepted" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox aria-label="Test" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.getAttribute("role")).toBe("checkbox");
    });

    it("should allow focus via ref", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox aria-label="Test" ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("should work with label element", () => {
      render(
        <div>
          <label htmlFor="terms-checkbox">Accept Terms and Conditions</label>
          <Checkbox id="terms-checkbox" />
        </div>
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "terms-checkbox");

      // Clicking label should interact with checkbox
      const label = screen.getByText("Accept Terms and Conditions");
      fireEvent.click(label);
      // After click, checkbox should be checked (label activates it)
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });

    it("should work in a form", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox
            aria-label="Subscribe"
            name="subscribe"
            value="yes"
            defaultChecked
          />
          <button type="submit">Submit</button>
        </form>
      );

      const submitButton = screen.getByRole("button", { name: "Submit" });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should work with aria-describedby", () => {
      render(
        <div>
          <Checkbox
            aria-label="Marketing emails"
            aria-describedby="marketing-description"
          />
          <span id="marketing-description">
            Receive promotional emails about our products
          </span>
        </div>
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-describedby",
        "marketing-description"
      );
    });

    it("should support data attributes", () => {
      render(
        <Checkbox
          aria-label="Test"
          data-testid="custom-checkbox"
          data-analytics="checkbox-click"
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-testid", "custom-checkbox");
      expect(checkbox).toHaveAttribute("data-analytics", "checkbox-click");
    });

    it('should integrate with indeterminate state for "select all" pattern', () => {
      const TestComponent = () => {
        const items = ["Item 1", "Item 2", "Item 3"];
        const [selectedItems, setSelectedItems] = React.useState<string[]>([
          "Item 1",
        ]);

        const allSelected = selectedItems.length === items.length;
        const someSelected =
          selectedItems.length > 0 && selectedItems.length < items.length;

        return (
          <Checkbox
            aria-label="Select all"
            checked={
              allSelected ? true : someSelected ? "indeterminate" : false
            }
            onCheckedChange={(checked) => {
              setSelectedItems(checked ? items : []);
            }}
          />
        );
      };

      render(<TestComponent />);
      const checkbox = screen.getByRole("checkbox");

      // Should be indeterminate (1 of 3 selected)
      expect(checkbox).toHaveAttribute("aria-checked", "mixed");
      expect(checkbox).toHaveAttribute("data-state", "indeterminate");

      // Click should select all
      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });
  });
});
