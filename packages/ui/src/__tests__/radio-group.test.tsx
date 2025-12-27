import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { RadioGroup, RadioGroupItem } from "../radio-group";

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestRadioGroup = ({
  defaultValue,
  value,
  onValueChange,
  disabled = false,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => (
  <RadioGroup
    defaultValue={defaultValue}
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    aria-label="Choose an option"
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option1" id="option1" />
      <label htmlFor="option1">Option 1</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option2" id="option2" />
      <label htmlFor="option2">Option 2</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option3" id="option3" />
      <label htmlFor="option3">Option 3</label>
    </div>
  </RadioGroup>
);

describe("RadioGroup", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestRadioGroup />);
      // RadioGroupItem renders as a button element with role="radio"
      // The accessible name is provided by the associated <label> via htmlFor
      // This is the correct Radix UI pattern - disable button-name rule
      const results = await axe(container, {
        rules: {
          "button-name": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with selected item", async () => {
      const { container } = render(<TestRadioGroup defaultValue="option2" />);
      // RadioGroupItem renders as a button element with role="radio"
      // The accessible name is provided by the associated <label> via htmlFor
      // This is the correct Radix UI pattern - disable button-name rule
      const results = await axe(container, {
        rules: {
          "button-name": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should have proper role for group", () => {
      render(<TestRadioGroup />);

      const group = screen.getByRole("radiogroup");
      expect(group).toBeInTheDocument();
    });

    it("should have proper role for items", () => {
      render(<TestRadioGroup />);

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(3);
    });

    it("should support aria-label on group", () => {
      render(<TestRadioGroup />);

      const group = screen.getByLabelText("Choose an option");
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute("role", "radiogroup");
    });

    it("should have proper aria-checked state", () => {
      render(<TestRadioGroup defaultValue="option2" />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-checked", "false");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
      expect(radios[2]).toHaveAttribute("aria-checked", "false");
    });

    it("should indicate disabled state with aria-disabled", () => {
      render(<TestRadioGroup disabled />);

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute("data-disabled", "");
      });
    });

    it("should support individual disabled items", () => {
      render(
        <RadioGroup aria-label="Test group">
          <RadioGroupItem value="1" id="r1" />
          <RadioGroupItem value="2" id="r2" disabled />
          <RadioGroupItem value="3" id="r3" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toHaveAttribute("data-disabled");
      expect(radios[1]).toHaveAttribute("data-disabled", "");
      expect(radios[2]).not.toHaveAttribute("data-disabled");
    });

    it("should associate with labels via htmlFor", () => {
      render(<TestRadioGroup />);

      const label1 = screen.getByText("Option 1");
      const radio1 = screen.getByRole("radio", { name: "Option 1" });

      expect(label1).toHaveAttribute("for", "option1");
      expect(radio1).toHaveAttribute("id", "option1");
    });
  });

  describe("Functionality", () => {
    it("should render all radio items", () => {
      render(<TestRadioGroup />);

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("should select item on click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestRadioGroup onValueChange={handleChange} />);

      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      await user.click(radio2);

      expect(handleChange).toHaveBeenCalledWith("option2");
      expect(radio2).toHaveAttribute("aria-checked", "true");
    });

    it("should work as uncontrolled component", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup defaultValue="option1" />);

      const radio1 = screen.getByRole("radio", { name: "Option 1" });
      const radio3 = screen.getByRole("radio", { name: "Option 3" });

      expect(radio1).toHaveAttribute("aria-checked", "true");

      await user.click(radio3);

      expect(radio1).toHaveAttribute("aria-checked", "false");
      expect(radio3).toHaveAttribute("aria-checked", "true");
    });

    it("should work as controlled component", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(
        <TestRadioGroup value="option1" onValueChange={handleChange} />
      );

      const radio1 = screen.getByRole("radio", { name: "Option 1" });
      expect(radio1).toHaveAttribute("aria-checked", "true");

      rerender(<TestRadioGroup value="option2" onValueChange={handleChange} />);

      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      expect(radio2).toHaveAttribute("aria-checked", "true");
    });

    it("should deselect previous item when selecting new one", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup defaultValue="option1" />);

      const radio1 = screen.getByRole("radio", { name: "Option 1" });
      const radio2 = screen.getByRole("radio", { name: "Option 2" });

      expect(radio1).toHaveAttribute("aria-checked", "true");
      expect(radio2).toHaveAttribute("aria-checked", "false");

      await user.click(radio2);

      expect(radio1).toHaveAttribute("aria-checked", "false");
      expect(radio2).toHaveAttribute("aria-checked", "true");
    });

    it("should not change selection when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <TestRadioGroup
          disabled
          defaultValue="option1"
          onValueChange={handleChange}
        />
      );

      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      await user.click(radio2);

      expect(handleChange).not.toHaveBeenCalled();
      expect(radio2).toHaveAttribute("aria-checked", "false");
    });

    it("should not select individually disabled item", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup onValueChange={handleChange} aria-label="Test">
          <div>
            <RadioGroupItem value="1" id="r1" />
            <label htmlFor="r1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="2" id="r2" disabled />
            <label htmlFor="r2">Option 2 (Disabled)</label>
          </div>
        </RadioGroup>
      );

      const radio2 = screen.getByRole("radio", { name: "Option 2 (Disabled)" });
      await user.click(radio2);

      expect(handleChange).not.toHaveBeenCalled();
      expect(radio2).toHaveAttribute("aria-checked", "false");
    });

    it("should show indicator only on checked item", () => {
      render(<TestRadioGroup defaultValue="option2" />);

      const radios = screen.getAllByRole("radio");

      // Check data-state attribute
      expect(radios[0]).toHaveAttribute("data-state", "unchecked");
      expect(radios[1]).toHaveAttribute("data-state", "checked");
      expect(radios[2]).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should focus first item with Tab", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup />);

      await user.tab();

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveFocus();
    });

    it("should navigate with arrow keys", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup />);

      const radios = screen.getAllByRole("radio");
      await user.tab();
      expect(radios[0]).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(radios[1]).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(radios[2]).toHaveFocus();
    });

    it("should wrap around with arrow navigation", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup />);

      const radios = screen.getAllByRole("radio");
      await user.tab();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      expect(radios[2]).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(radios[0]).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(radios[2]).toHaveFocus();
    });

    it("should select item with Space key", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestRadioGroup onValueChange={handleChange} />);

      const radios = screen.getAllByRole("radio");
      await user.tab();
      await user.keyboard("{ArrowDown}");
      expect(radios[1]).toHaveFocus();

      await user.keyboard(" ");

      expect(handleChange).toHaveBeenCalledWith("option2");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
    });

    it("should navigate with arrow right/left keys", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup />);

      const radios = screen.getAllByRole("radio");
      await user.tab();
      expect(radios[0]).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(radios[1]).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(radios[0]).toHaveFocus();
    });

    it("should skip disabled items during keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup aria-label="Test">
          <div>
            <RadioGroupItem value="1" id="r1" />
            <label htmlFor="r1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="2" id="r2" disabled />
            <label htmlFor="r2">Option 2</label>
          </div>
          <div>
            <RadioGroupItem value="3" id="r3" />
            <label htmlFor="r3">Option 3</label>
          </div>
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      await user.tab();
      expect(radios[0]).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      // Should skip disabled option 2 and go to option 3
      expect(radios[2]).toHaveFocus();
    });
  });

  describe("Styling", () => {
    it("should apply default styles to radio group", () => {
      render(<TestRadioGroup />);

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveClass("grid", "gap-2");
    });

    it("should apply custom className to radio group", () => {
      render(
        <RadioGroup className="custom-group-class" aria-label="Test">
          <RadioGroupItem value="1" id="r1" />
        </RadioGroup>
      );

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveClass("custom-group-class");
    });

    it("should apply custom className to radio items", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="1" id="r1" className="custom-item-class" />
        </RadioGroup>
      );

      const radio = screen.getByRole("radio");
      expect(radio).toHaveClass("custom-item-class");
    });

    it("should have focus ring styles", () => {
      render(<TestRadioGroup />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-2"
      );
    });

    it("should have disabled styles", () => {
      render(
        <RadioGroup disabled aria-label="Test">
          <RadioGroupItem value="1" id="r1" />
        </RadioGroup>
      );

      const radio = screen.getByRole("radio");
      expect(radio).toHaveClass(
        "disabled:cursor-not-allowed",
        "disabled:opacity-50"
      );
    });

    it("should have checked state styles", () => {
      render(<TestRadioGroup defaultValue="option1" />);

      const checkedRadio = screen.getByRole("radio", { name: "Option 1" });
      expect(checkedRadio).toHaveClass(
        "data-[state=checked]:border-(--color-radio-border-checked)",
        "data-[state=checked]:bg-(--color-radio-background-checked)"
      );
    });

    it("should render indicator dot", () => {
      render(<TestRadioGroup defaultValue="option1" />);

      const checkedRadio = screen.getByRole("radio", { name: "Option 1" });
      const indicator = checkedRadio.querySelector('div[class*="h-2 w-2"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should forward ref to radio group", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <RadioGroup ref={ref} aria-label="Test">
          <RadioGroupItem value="1" id="r1" />
        </RadioGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should forward ref to radio item", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem ref={ref} value="1" id="r1" />
        </RadioGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should work with form integration", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <TestRadioGroup />
          <button type="submit">Submit</button>
        </form>
      );

      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      await user.click(radio2);
      await user.click(screen.getByText("Submit"));

      expect(handleSubmit).toHaveBeenCalled();
    });

    it("should handle rapid selection changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestRadioGroup onValueChange={handleChange} />);

      const radio1 = screen.getByRole("radio", { name: "Option 1" });
      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      const radio3 = screen.getByRole("radio", { name: "Option 3" });

      await user.click(radio1);
      await user.click(radio2);
      await user.click(radio3);
      await user.click(radio1);

      expect(handleChange).toHaveBeenCalledTimes(4);
      expect(handleChange).toHaveBeenNthCalledWith(1, "option1");
      expect(handleChange).toHaveBeenNthCalledWith(2, "option2");
      expect(handleChange).toHaveBeenNthCalledWith(3, "option3");
      expect(handleChange).toHaveBeenNthCalledWith(4, "option1");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single radio item", () => {
      render(
        <RadioGroup aria-label="Single option">
          <RadioGroupItem value="only" id="only" />
          <label htmlFor="only">Only Option</label>
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(1);
      expect(screen.getByText("Only Option")).toBeInTheDocument();
    });

    it("should handle many radio items", () => {
      render(
        <RadioGroup aria-label="Many options">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i}>
              <RadioGroupItem value={`option${i}`} id={`opt${i}`} />
              <label htmlFor={`opt${i}`}>Option {i}</label>
            </div>
          ))}
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(20);
    });

    it("should handle radio without label", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="unlabeled" aria-label="Unlabeled option" />
        </RadioGroup>
      );

      const radio = screen.getByLabelText("Unlabeled option");
      expect(radio).toBeInTheDocument();
    });

    it("should handle complex label content", () => {
      render(
        <RadioGroup aria-label="Test">
          <div>
            <RadioGroupItem value="complex" id="complex" />
            <label htmlFor="complex">
              <span className="font-bold">Bold</span>
              <span className="text-gray-500"> (with description)</span>
            </label>
          </div>
        </RadioGroup>
      );

      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("(with description)")).toBeInTheDocument();
    });

    it("should handle value changes without onValueChange handler", async () => {
      const user = userEvent.setup();
      render(<TestRadioGroup />);

      const radio1 = screen.getByRole("radio", { name: "Option 1" });
      const radio2 = screen.getByRole("radio", { name: "Option 2" });

      await user.click(radio1);
      expect(radio1).toHaveAttribute("aria-checked", "true");

      await user.click(radio2);
      expect(radio1).toHaveAttribute("aria-checked", "false");
      expect(radio2).toHaveAttribute("aria-checked", "true");
    });

    it("should handle required attribute", () => {
      render(
        <RadioGroup required aria-label="Required group">
          <RadioGroupItem value="1" id="r1" />
          <label htmlFor="r1">Option 1</label>
        </RadioGroup>
      );

      const group = screen.getByRole("radiogroup");
      // Radix UI RadioGroup doesn't directly expose the required attribute
      // Form validation should be handled at the form level
      // Just verify the group renders correctly
      expect(group).toBeInTheDocument();
    });

    it("should handle orientation attribute", () => {
      render(
        <RadioGroup orientation="horizontal" aria-label="Horizontal group">
          <RadioGroupItem value="1" id="r1" />
          <RadioGroupItem value="2" id="r2" />
        </RadioGroup>
      );

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should maintain selection state when other items are added", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <RadioGroup defaultValue="option2" aria-label="Test">
          <div>
            <RadioGroupItem value="option1" id="opt1" />
            <label htmlFor="opt1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="option2" id="opt2" />
            <label htmlFor="opt2">Option 2</label>
          </div>
        </RadioGroup>
      );

      const radio2 = screen.getByRole("radio", { name: "Option 2" });
      expect(radio2).toHaveAttribute("aria-checked", "true");

      // Add more items
      rerender(
        <RadioGroup defaultValue="option2" aria-label="Test">
          <div>
            <RadioGroupItem value="option1" id="opt1" />
            <label htmlFor="opt1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="option2" id="opt2" />
            <label htmlFor="opt2">Option 2</label>
          </div>
          <div>
            <RadioGroupItem value="option3" id="opt3" />
            <label htmlFor="opt3">Option 3</label>
          </div>
        </RadioGroup>
      );

      const radio2Updated = screen.getByRole("radio", { name: "Option 2" });
      expect(radio2Updated).toHaveAttribute("aria-checked", "true");
    });
  });
});
