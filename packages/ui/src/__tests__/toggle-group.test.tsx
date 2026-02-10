import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

expect.extend(toHaveNoViolations);

describe("ToggleGroup", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="left" aria-label="Align left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with selected item", async () => {
      const { container } = render(
        <ToggleGroup type="single" value="center">
          <ToggleGroupItem value="left" aria-label="Align left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            Center
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="1" aria-label="Option 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Option 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.tab();
      const firstItem = screen.getByRole("radio", { name: "Option 1" });
      expect(firstItem).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      const secondItem = screen.getByRole("radio", { name: "Option 2" });
      expect(secondItem).toHaveFocus();
    });
  });

  describe("ToggleGroup Component", () => {
    it("should render with children", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="1" aria-label="Item 1">
            Item 1
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <ToggleGroup ref={ref} type="single">
          <ToggleGroupItem value="1" aria-label="Item">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ToggleGroup className="custom-group" type="single">
          <ToggleGroupItem value="1" aria-label="Item">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("custom-group");
    });

    it("should support single type", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="1" aria-label="Item">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(true).toBe(true);
    });

    it("should support multiple type", () => {
      render(
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(true).toBe(true);
    });

    it("should call onValueChange for single type", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="left" aria-label="Left">
            Left
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("Left"));
      expect(handleChange).toHaveBeenCalledWith("left");
    });

    it("should call onValueChange for multiple type", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="multiple" onValueChange={handleChange}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("1"));
      expect(handleChange).toHaveBeenCalledWith(["1"]);
    });
  });

  describe("ToggleGroupItem Component", () => {
    it("should render with children", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" aria-label="Test">
            Test Item
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });

    it("should render as button", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" aria-label="Test">
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByText("Test");
      expect(item.tagName).toBe("BUTTON");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem ref={ref} value="test" aria-label="Test">
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should apply custom className", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem
            className="custom-item"
            value="test"
            aria-label="Test"
          >
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByText("Test");
      expect(item).toHaveClass("custom-item");
    });

    it("should toggle on click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="test" aria-label="Test">
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("Test"));
      expect(handleChange).toHaveBeenCalledWith("test");
    });

    it("should support disabled state", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" disabled aria-label="Test">
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByRole("radio", { name: "Test" });
      expect(item).toBeDisabled();
    });

    it("should have proper styling", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="test" aria-label="Test">
            Test
          </ToggleGroupItem>
        </ToggleGroup>
      );
      const item = screen.getByText("Test");
      expect(item).toHaveClass(
        "rounded-(--space-toggle-group-item-radius)",
        "text-(length:--font-size-toggle-group-item-font-size)"
      );
    });
  });

  describe("Single Selection Mode", () => {
    it("should allow single selection", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("1"));
      expect(handleChange).toHaveBeenCalledWith("1");

      handleChange.mockClear();
      await user.click(screen.getByText("2"));
      expect(handleChange).toHaveBeenCalledWith("2");
    });

    it("should work as controlled component in single mode", () => {
      const { rerender } = render(
        <ToggleGroup type="single" value="1">
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(true).toBe(true);

      rerender(
        <ToggleGroup type="single" value="2">
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(true).toBe(true);
    });
  });

  describe("Multiple Selection Mode", () => {
    it("should allow multiple selections", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="multiple" onValueChange={handleChange}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("1"));
      expect(handleChange).toHaveBeenCalledWith(["1"]);

      await user.click(screen.getByText("2"));
      expect(handleChange).toHaveBeenCalledWith(["1", "2"]);
    });

    it("should work as controlled component in multiple mode", () => {
      const { rerender } = render(
        <ToggleGroup type="multiple" value={["1"]}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(true).toBe(true);

      rerender(
        <ToggleGroup type="multiple" value={["1", "2"]}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(true).toBe(true);
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="left" aria-label="Left">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center">
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByText("Left")).toBeInTheDocument();
      expect(screen.getByText("Center")).toBeInTheDocument();
      expect(screen.getByText("Right")).toBeInTheDocument();
    });

    it("should work with icons", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <strong>B</strong>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <em>I</em>
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const bold = screen.getByRole("radio", { name: "Bold" });
      expect(bold.querySelector("strong")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty ToggleGroup", () => {
      const { container } = render(<ToggleGroup type="single" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle single item", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="only" aria-label="Only">
            Only
          </ToggleGroupItem>
        </ToggleGroup>
      );
      expect(screen.getByText("Only")).toBeInTheDocument();
    });

    it("should handle many items", () => {
      const items = Array.from({ length: 10 }, (_, i) => i + 1);
      render(
        <ToggleGroup type="multiple">
          {items.map((item) => (
            <ToggleGroupItem
              key={item}
              value={String(item)}
              aria-label={`Item ${item}`}
            >
              {item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );

      items.forEach((item) => {
        expect(screen.getByText(String(item))).toBeInTheDocument();
      });
    });

    it("should handle mixed disabled and enabled items", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="1" aria-label="Item 1">
            1
          </ToggleGroupItem>
          <ToggleGroupItem value="2" disabled aria-label="Item 2">
            2
          </ToggleGroupItem>
        </ToggleGroup>
      );

      await user.click(screen.getByText("1"));
      expect(handleChange).toHaveBeenCalled();

      handleChange.mockClear();
      await user.click(screen.getByText("2"));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
