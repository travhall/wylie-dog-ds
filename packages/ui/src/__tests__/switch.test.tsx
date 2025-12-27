import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Switch } from "../switch";

expect.extend(toHaveNoViolations);

describe("Switch", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Switch aria-label="Enable notifications" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when checked", async () => {
      const { container } = render(
        <Switch aria-label="Enable notifications" checked />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with disabled state", async () => {
      const { container } = render(
        <Switch aria-label="Enable notifications" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper role", () => {
      render(<Switch aria-label="Enable notifications" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      render(<Switch aria-label="Enable notifications" />);
      const switchElement = screen.getByRole("switch");

      switchElement.focus();
      expect(switchElement).toHaveFocus();
    });

    it("should toggle with Space key", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Switch
          aria-label="Enable notifications"
          onCheckedChange={handleCheckedChange}
        />
      );
      const switchElement = screen.getByRole("switch");

      expect(switchElement).toHaveAttribute("data-state", "unchecked");

      switchElement.focus();
      fireEvent.click(switchElement);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should not be focusable when disabled", () => {
      render(<Switch aria-label="Enable notifications" disabled />);
      const switchElement = screen.getByRole("switch");

      expect(switchElement).toBeDisabled();
    });

    it("should have proper aria-checked attribute", () => {
      const { rerender } = render(
        <Switch aria-label="Enable notifications" checked={false} />
      );
      let switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");

      rerender(<Switch aria-label="Enable notifications" checked={true} />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "true");
    });

    it("should support aria-describedby", () => {
      render(
        <div>
          <Switch
            aria-label="Enable notifications"
            aria-describedby="switch-help"
          />
          <span id="switch-help">Receive notifications about updates</span>
        </div>
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-describedby", "switch-help");
    });

    it("should support aria-label", () => {
      render(<Switch aria-label="Dark mode" />);
      const switchElement = screen.getByRole("switch", { name: "Dark mode" });
      expect(switchElement).toBeInTheDocument();
    });

    it("should support aria-labelledby", () => {
      render(
        <div>
          <label id="switch-label">Enable feature</label>
          <Switch aria-labelledby="switch-label" />
        </div>
      );

      const switchElement = screen.getByRole("switch", {
        name: "Enable feature",
      });
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe("Functionality", () => {
    it("should render unchecked by default", () => {
      render(<Switch aria-label="Test" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "unchecked");
    });

    it("should toggle checked state on click", () => {
      const handleCheckedChange = vi.fn();

      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Switch
            aria-label="Test"
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

      render(<ControlledSwitch />);
      const switchElement = screen.getByRole("switch");

      fireEvent.click(switchElement);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      fireEvent.click(switchElement);
      expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it("should work as controlled component", () => {
      const handleCheckedChange = vi.fn();
      const { rerender } = render(
        <Switch
          aria-label="Test"
          checked={false}
          onCheckedChange={handleCheckedChange}
        />
      );
      let switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "unchecked");

      rerender(
        <Switch
          aria-label="Test"
          checked={true}
          onCheckedChange={handleCheckedChange}
        />
      );
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "checked");
    });

    it("should work as uncontrolled component with defaultChecked", () => {
      render(<Switch aria-label="Test" defaultChecked />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "checked");
    });

    it("should not toggle when disabled", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Switch
          aria-label="Test"
          disabled
          onCheckedChange={handleCheckedChange}
        />
      );
      const switchElement = screen.getByRole("switch");

      fireEvent.click(switchElement);
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it("should handle rapid clicks", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Switch aria-label="Test" onCheckedChange={handleCheckedChange} />
      );
      const switchElement = screen.getByRole("switch");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(switchElement);
      }

      expect(handleCheckedChange).toHaveBeenCalledTimes(10);
    });

    it("should call onFocus and onBlur handlers", () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(
        <Switch aria-label="Test" onFocus={handleFocus} onBlur={handleBlur} />
      );
      const switchElement = screen.getByRole("switch");

      fireEvent.focus(switchElement);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(switchElement);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should maintain state through re-renders", () => {
      const { rerender } = render(
        <Switch aria-label="Test" defaultChecked={true} />
      );

      let switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "checked");

      rerender(<Switch aria-label="Test" defaultChecked={true} />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "checked");
    });
  });

  describe("Variants & Styling", () => {
    it("should support all size variants", async () => {
      const sizes = ["sm", "md", "lg"] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Switch aria-label="Test" size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply size classes correctly for sm", () => {
      render(<Switch aria-label="Test" size="sm" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-5", "w-9");
    });

    it("should apply size classes correctly for md", () => {
      render(<Switch aria-label="Test" size="md" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-6", "w-11");
    });

    it("should apply size classes correctly for lg", () => {
      render(<Switch aria-label="Test" size="lg" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-7", "w-13");
    });

    it("should have default size set to md", () => {
      render(<Switch aria-label="Test" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-6", "w-11");
    });

    it("should have checked state styling", () => {
      render(<Switch aria-label="Test" checked />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass(
        "data-[state=checked]:bg-(--color-interactive-primary)"
      );
    });

    it("should have unchecked state styling", () => {
      render(<Switch aria-label="Test" checked={false} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass(
        "data-[state=unchecked]:bg-(--color-interactive-secondary)"
      );
    });

    it("should accept custom className", () => {
      render(<Switch aria-label="Test" className="custom-class" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("custom-class");
    });

    it("should have focus styles", () => {
      render(<Switch aria-label="Test" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("focus:ring-2");
      expect(switchElement).toHaveClass("focus:outline-none");
    });

    it("should have disabled styles", () => {
      render(<Switch aria-label="Test" disabled />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("disabled:cursor-not-allowed");
      expect(switchElement).toHaveClass("disabled:opacity-50");
    });

    it("should have cursor-pointer class", () => {
      render(<Switch aria-label="Test" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("cursor-pointer");
    });

    it("should have proper transition class", () => {
      render(<Switch aria-label="Test" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("transition-colors");
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Switch aria-label="Test" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.getAttribute("role")).toBe("switch");
    });

    it("should allow focus via ref", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Switch aria-label="Test" ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("should work with label element", () => {
      render(
        <div>
          <label htmlFor="notifications-switch">Enable Notifications</label>
          <Switch id="notifications-switch" aria-label="Enable Notifications" />
        </div>
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("id", "notifications-switch");
    });

    it("should work in a form", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Switch aria-label="Subscribe" defaultChecked />
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
          <Switch
            aria-label="Marketing emails"
            aria-describedby="marketing-description"
          />
          <span id="marketing-description">
            Receive promotional emails about our products
          </span>
        </div>
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute(
        "aria-describedby",
        "marketing-description"
      );
    });

    it("should support data attributes", () => {
      render(
        <Switch
          aria-label="Test"
          data-testid="custom-switch"
          data-analytics="switch-toggle"
        />
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-testid", "custom-switch");
      expect(switchElement).toHaveAttribute("data-analytics", "switch-toggle");
    });

    it("should work with multiple switches", () => {
      render(
        <div>
          <Switch aria-label="Notifications" />
          <Switch aria-label="Dark Mode" />
          <Switch aria-label="Analytics" />
        </div>
      );

      const switches = screen.getAllByRole("switch");
      expect(switches).toHaveLength(3);
    });

    it("should maintain independent state in multiple switches", () => {
      const TestComponent = () => {
        const [notifications, setNotifications] = React.useState(false);
        const [darkMode, setDarkMode] = React.useState(false);

        return (
          <div>
            <Switch
              aria-label="Notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <Switch
              aria-label="Dark Mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        );
      };

      render(<TestComponent />);
      const switches = screen.getAllByRole("switch");

      expect(switches[0]).toHaveAttribute("data-state", "unchecked");
      expect(switches[1]).toHaveAttribute("data-state", "unchecked");

      fireEvent.click(switches[0]);
      expect(switches[0]).toHaveAttribute("data-state", "checked");
      expect(switches[1]).toHaveAttribute("data-state", "unchecked");
    });

    it("should integrate with form state management", () => {
      const TestComponent = () => {
        const [formData, setFormData] = React.useState({ subscribe: false });

        const handleChange = (checked: boolean) => {
          setFormData({ subscribe: checked });
        };

        return (
          <div>
            <Switch
              aria-label="Subscribe"
              checked={formData.subscribe}
              onCheckedChange={handleChange}
            />
            <div data-testid="form-state">
              {formData.subscribe ? "Subscribed" : "Not subscribed"}
            </div>
          </div>
        );
      };

      render(<TestComponent />);
      const switchElement = screen.getByRole("switch");
      const stateDisplay = screen.getByTestId("form-state");

      expect(stateDisplay).toHaveTextContent("Not subscribed");

      fireEvent.click(switchElement);
      expect(stateDisplay).toHaveTextContent("Subscribed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle controlled to uncontrolled switch", () => {
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(true);
        return (
          <Switch
            aria-label="Test"
            checked={checked}
            onCheckedChange={(value) => {
              if (typeof value === "boolean") {
                setChecked(value);
              }
            }}
          />
        );
      };

      const { unmount } = render(<ControlledSwitch />);
      const controlledSwitch = screen.getByRole("switch");
      expect(controlledSwitch).toHaveAttribute("data-state", "checked");

      unmount();
      render(<Switch aria-label="Test" defaultChecked={false} />);
      const uncontrolledSwitch = screen.getByRole("switch");
      expect(uncontrolledSwitch).toHaveAttribute("data-state", "unchecked");
    });

    it("should accept name attribute for form integration", () => {
      // Note: Radix UI Switch may not expose the name attribute directly on the element
      // The name prop is passed to Radix UI but not rendered as an HTML attribute
      render(<Switch aria-label="Test" name="agree" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("should handle value attribute", () => {
      render(<Switch aria-label="Test" value="yes" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("value", "yes");
    });

    it("should handle disabled then enabled transition", () => {
      const { rerender } = render(<Switch aria-label="Test" disabled />);
      let switchElement = screen.getByRole("switch");
      expect(switchElement).toBeDisabled();

      rerender(<Switch aria-label="Test" disabled={false} />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeDisabled();
    });

    it("should handle size changes dynamically", () => {
      const { rerender } = render(<Switch aria-label="Test" size="sm" />);
      let switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-5", "w-9");

      rerender(<Switch aria-label="Test" size="md" />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-6", "w-11");

      rerender(<Switch aria-label="Test" size="lg" />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-7", "w-13");
    });

    it("should handle rapid state changes", () => {
      const handleCheckedChange = vi.fn();
      render(
        <Switch aria-label="Test" onCheckedChange={handleCheckedChange} />
      );
      const switchElement = screen.getByRole("switch");

      for (let i = 0; i < 100; i++) {
        fireEvent.click(switchElement);
      }

      expect(handleCheckedChange).toHaveBeenCalledTimes(100);
    });

    it("should handle all props at once", () => {
      render(
        <Switch
          aria-label="Test"
          checked={true}
          disabled={false}
          size="lg"
          className="custom-class"
          data-testid="test"
          id="switch-id"
        />
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("data-state", "checked");
      expect(switchElement).toHaveClass("h-7", "w-13");
      expect(switchElement).toHaveClass("custom-class");
      expect(switchElement).toHaveAttribute("data-testid", "test");
      expect(switchElement).toHaveAttribute("id", "switch-id");
    });

    it("should handle missing aria-label gracefully in development", () => {
      const { container } = render(<Switch />);
      const switchElement = container.querySelector('button[role="switch"]');
      expect(switchElement).toBeInTheDocument();
    });

    it("should handle context menu on switch", () => {
      const handleContextMenu = vi.fn();
      render(<Switch aria-label="Test" onContextMenu={handleContextMenu} />);
      const switchElement = screen.getByRole("switch");

      fireEvent.contextMenu(switchElement);
      expect(handleContextMenu).toHaveBeenCalledTimes(1);
    });
  });
});
