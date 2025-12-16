import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestSelect = ({
  defaultValue,
  value,
  onValueChange,
  disabled = false,
  error = false,
  size = "md" as const,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
}) => (
  <Select
    defaultValue={defaultValue}
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
  >
    <SelectTrigger size={size} error={error} aria-label="Select option">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
    </SelectContent>
  </Select>
);

describe("Select", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestSelect />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper aria-expanded state", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should support aria-label on trigger", () => {
      render(<TestSelect />);

      const trigger = screen.getByLabelText("Select option");
      expect(trigger).toBeInTheDocument();
    });

    it("should indicate disabled state with aria-disabled", () => {
      render(<TestSelect disabled />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-disabled", "");
    });

    it("should have proper roles for options", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);
      });
    });
  });

  describe("Functionality", () => {
    it("should render with placeholder", () => {
      render(<TestSelect />);

      expect(screen.getByText("Select a fruit")).toBeInTheDocument();
    });

    it("should open dropdown on trigger click", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("Orange")).toBeInTheDocument();
      });
    });

    it("should select item on click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestSelect onValueChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Apple"));

      expect(handleChange).toHaveBeenCalledWith("apple");
    });

    it("should work as uncontrolled component", async () => {
      const user = userEvent.setup();
      render(<TestSelect defaultValue="banana" />);

      expect(screen.getByText("Banana")).toBeInTheDocument();

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Orange")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Orange"));

      await waitFor(() => {
        expect(screen.getByText("Orange")).toBeInTheDocument();
      });
    });

    it("should work as controlled component", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(
        <TestSelect value="apple" onValueChange={handleChange} />
      );

      expect(screen.getByText("Apple")).toBeInTheDocument();

      rerender(<TestSelect value="banana" onValueChange={handleChange} />);

      expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    it("should not open when disabled", async () => {
      const user = userEvent.setup();
      render(<TestSelect disabled />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      // Wait a bit to ensure it doesn't open
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should show item indicator for selected item", async () => {
      const user = userEvent.setup();
      render(<TestSelect defaultValue="apple" />);

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const appleOption = screen.getByText("Apple");
        expect(appleOption.closest('[role="option"]')).toHaveAttribute(
          "aria-selected",
          "true"
        );
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should open on Enter key", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("should open on Space key", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard(" ");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("should navigate options with arrow keys", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      // Should focus third item
      const options = screen.getAllByRole("option");
      expect(options[2]).toHaveFocus();
    });

    it("should select focused item with Enter", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestSelect onValueChange={handleChange} />);

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("apple");
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Variants & Styling", () => {
    it("should apply small size variant", () => {
      render(<TestSelect size="sm" />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-8", "px-3", "text-xs");
    });

    it("should apply medium size variant (default)", () => {
      render(<TestSelect size="md" />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-10", "px-3", "text-sm");
    });

    it("should apply large size variant", () => {
      render(<TestSelect size="lg" />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-12", "px-4", "text-base");
    });

    it("should apply error styling", () => {
      render(<TestSelect error />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("border-[var(--color-input-border-error)]");
    });

    it("should apply normal styling when not in error state", () => {
      render(<TestSelect error={false} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("border-[var(--color-input-border)]");
    });

    it("should have disabled styles", () => {
      render(<TestSelect disabled />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50"
      );
    });

    it("should render dropdown icon", () => {
      render(<TestSelect />);

      const trigger = screen.getByRole("combobox");
      const icon = trigger.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("SelectItem Component", () => {
    it("should render item text", async () => {
      const user = userEvent.setup();
      render(<TestSelect />);

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });
    });

    it("should support disabled items", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Select option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2" disabled>
              Option 2 (Disabled)
            </SelectItem>
            <SelectItem value="3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const disabledOption = screen.getByText("Option 2 (Disabled)");
        expect(disabledOption.closest('[role="option"]')).toHaveAttribute(
          "data-disabled",
          ""
        );
      });
    });

    it("should apply custom className to items", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Select option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" className="custom-item-class">
              Custom Item
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const customItem = screen.getByText("Custom Item");
        expect(customItem.closest('[role="option"]')).toHaveClass(
          "custom-item-class"
        );
      });
    });
  });

  describe("SelectGroup and SelectSeparator", () => {
    it("should render groups with separators", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Select fruit">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Carrot")).toBeInTheDocument();

        const separator = document.querySelector('[role="separator"]');
        expect(separator).toBeInTheDocument();
      });
    });

    it("should apply custom className to separator", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Select option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectSeparator className="custom-separator" />
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]');
        expect(separator).toHaveClass("custom-separator");
      });
    });
  });

  describe("Integration", () => {
    it("should forward ref to trigger", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Select>
          <SelectTrigger ref={ref} aria-label="Select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should work with form integration", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <TestSelect />
          <button type="submit">Submit</button>
        </form>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Apple"));
      await user.click(screen.getByText("Submit"));

      expect(handleSubmit).toHaveBeenCalled();
    });

    it("should handle rapid selection changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestSelect onValueChange={handleChange} />);

      // Select apple
      await user.click(screen.getByRole("combobox"));
      await waitFor(() =>
        expect(screen.getByText("Apple")).toBeInTheDocument()
      );
      await user.click(screen.getByText("Apple"));

      // Select banana
      await user.click(screen.getByRole("combobox"));
      await waitFor(() =>
        expect(screen.getByText("Banana")).toBeInTheDocument()
      );
      await user.click(screen.getByText("Banana"));

      // Select orange
      await user.click(screen.getByRole("combobox"));
      await waitFor(() =>
        expect(screen.getByText("Orange")).toBeInTheDocument()
      );
      await user.click(screen.getByText("Orange"));

      expect(handleChange).toHaveBeenCalledTimes(3);
      expect(handleChange).toHaveBeenNthCalledWith(1, "apple");
      expect(handleChange).toHaveBeenNthCalledWith(2, "banana");
      expect(handleChange).toHaveBeenNthCalledWith(3, "orange");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty select", () => {
      render(
        <Select>
          <SelectTrigger aria-label="Empty select">
            <SelectValue placeholder="No options" />
          </SelectTrigger>
          <SelectContent>{/* No items */}</SelectContent>
        </Select>
      );

      expect(screen.getByText("No options")).toBeInTheDocument();
    });

    it("should handle single option", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Single option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="only">Only Option</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(screen.getByText("Only Option")).toBeInTheDocument();
      });
    });

    it("should handle very long option text", async () => {
      const user = userEvent.setup();
      const longText =
        "This is a very long option text that should be truncated or wrapped appropriately";

      render(
        <Select>
          <SelectTrigger aria-label="Long text">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">{longText}</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });

    it("should handle special characters in values", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger aria-label="Special chars">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value-with-dashes">Dashes</SelectItem>
            <SelectItem value="value_with_underscores">Underscores</SelectItem>
            <SelectItem value="value.with.dots">Dots</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByRole("combobox"));
      await waitFor(() =>
        expect(screen.getByText("Dashes")).toBeInTheDocument()
      );
      await user.click(screen.getByText("Dashes"));

      expect(handleChange).toHaveBeenCalledWith("value-with-dashes");
    });

    it("should handle custom trigger content", async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Custom trigger">
            <div className="flex items-center gap-2">
              <span>🍎</span>
              <SelectValue placeholder="Select fruit" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText("🍎")).toBeInTheDocument();
      expect(screen.getByText("Select fruit")).toBeInTheDocument();

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });
    });
  });
});
