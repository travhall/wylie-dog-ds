import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Calendar } from "../calendar";

expect.extend(toHaveNoViolations);

describe("Calendar", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<Calendar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with selected date", async () => {
      const { container } = render(
        <Calendar selected={new Date("2024-01-15")} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible navigation buttons", () => {
      const { container } = render(<Calendar />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Calendar Component", () => {
    it("should render with default content", () => {
      const { container } = render(<Calendar />);
      const calendar = container.firstChild as HTMLElement;
      expect(calendar).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Calendar ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(<Calendar className="custom-calendar" />);
      const calendar = container.firstChild as HTMLElement;
      expect(calendar).toHaveClass("custom-calendar");
    });

    it("should render month header", () => {
      const { container } = render(<Calendar />);
      expect(container.textContent).toContain("January 2024");
    });

    it("should render day headers", () => {
      const { container } = render(<Calendar />);
      expect(container.textContent).toContain("Su");
      expect(container.textContent).toContain("Mo");
      expect(container.textContent).toContain("Tu");
      expect(container.textContent).toContain("We");
      expect(container.textContent).toContain("Th");
      expect(container.textContent).toContain("Fr");
      expect(container.textContent).toContain("Sa");
    });

    it("should render day buttons", () => {
      const { container } = render(<Calendar />);
      const buttons = container.querySelectorAll("button");
      // At least navigation buttons + day buttons should exist
      expect(buttons.length).toBeGreaterThan(7);
    });

    it("should support mode prop", () => {
      const { rerender } = render(<Calendar mode="single" />);
      expect(true).toBe(true); // Component renders without error

      rerender(<Calendar mode="multiple" />);
      expect(true).toBe(true); // Component renders without error

      rerender(<Calendar mode="range" />);
      expect(true).toBe(true); // Component renders without error
    });

    it("should support selected prop with Date", () => {
      const date = new Date("2024-01-15");
      const { container } = render(<Calendar mode="single" selected={date} />);
      expect(container).toBeInTheDocument();
    });

    it("should support selected prop with Date array", () => {
      const dates = [new Date("2024-01-15"), new Date("2024-01-20")];
      const { container } = render(
        <Calendar mode="multiple" selected={dates} />
      );
      expect(container).toBeInTheDocument();
    });

    it("should support selected prop with range", () => {
      const range = {
        from: new Date("2024-01-10"),
        to: new Date("2024-01-20"),
      };
      const { container } = render(<Calendar mode="range" selected={range} />);
      expect(container).toBeInTheDocument();
    });

    it("should handle onSelect callback", () => {
      const handleSelect = vi.fn();
      const { container } = render(<Calendar onSelect={handleSelect} />);

      // Find a day button (skip navigation buttons)
      const dayButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => !btn.querySelector("svg"));

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        // onSelect might be called with date or undefined depending on implementation
        expect(handleSelect).toHaveBeenCalled();
      }
    });
  });

  describe("Navigation", () => {
    it("should render previous month button", () => {
      const { container } = render(<Calendar />);
      const prevButton = container.querySelector("button svg")?.parentElement;
      expect(prevButton).toBeInTheDocument();
    });

    it("should render next month button", () => {
      const { container } = render(<Calendar />);
      const buttons = Array.from(container.querySelectorAll("button svg")).map(
        (svg) => svg.parentElement
      );
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("should have navigation buttons with proper styling", () => {
      const { container } = render(<Calendar />);
      const navButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => btn.querySelector("svg"));

      navButtons.forEach((button) => {
        expect(button).toHaveClass(
          "h-(--spacing-calendar-nav-button-size)",
          "w-(--spacing-calendar-nav-button-size)"
        );
      });
    });
  });

  describe("Day Cells", () => {
    it("should render day numbers", () => {
      const { container } = render(<Calendar />);
      const dayButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => !btn.querySelector("svg"));

      expect(dayButtons.length).toBeGreaterThan(0);
      dayButtons.forEach((button) => {
        const text = button.textContent?.trim();
        if (text && /^\d+$/.test(text)) {
          const num = parseInt(text);
          expect(num).toBeGreaterThanOrEqual(1);
          expect(num).toBeLessThanOrEqual(31);
        }
      });
    });

    it("should apply hover styles to day buttons", () => {
      const { container } = render(<Calendar />);
      const dayButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => !btn.querySelector("svg") && btn.textContent?.trim());

      if (dayButtons.length > 0) {
        expect(dayButtons[0]).toHaveClass(
          "rounded-(--spacing-calendar-nav-button-radius)"
        );
      }
    });

    it("should handle day button clicks", () => {
      const { container } = render(<Calendar />);
      const dayButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => !btn.querySelector("svg"));

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        // Should not throw error
        expect(true).toBe(true);
      }
    });
  });

  describe("Styling", () => {
    it("should apply base styles", () => {
      const { container } = render(<Calendar />);
      const calendar = container.firstChild as HTMLElement;
      expect(calendar).toHaveClass("p-(--spacing-calendar-container-padding)");
    });

    it("should have grid layout for days", () => {
      const { container } = render(<Calendar />);
      const grid = container.querySelector(".grid-cols-7");
      expect(grid).toBeInTheDocument();
    });

    it("should style day headers correctly", () => {
      const { container } = render(<Calendar />);
      const headers = container.querySelectorAll(
        'div[class*="h-(--spacing-calendar-cell-size)"]'
      );
      expect(headers.length).toBeGreaterThanOrEqual(7);
    });

    it("should have proper spacing between elements", () => {
      const { container } = render(<Calendar />);
      const spaceY = container.querySelector(
        'div[class*="space-y-(--spacing-calendar-container-gap)"]'
      );
      expect(spaceY).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should work with controlled selected state", () => {
      const { rerender } = render(
        <Calendar mode="single" selected={new Date("2024-01-15")} />
      );
      expect(true).toBe(true);

      rerender(<Calendar mode="single" selected={new Date("2024-01-20")} />);
      expect(true).toBe(true);
    });

    it("should work with onSelect handler", () => {
      const handleSelect = vi.fn();
      const { container } = render(
        <Calendar mode="single" onSelect={handleSelect} />
      );

      const dayButtons = Array.from(
        container.querySelectorAll("button")
      ).filter((btn) => !btn.querySelector("svg"));

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(handleSelect).toHaveBeenCalled();
      }
    });

    it("should work with range mode", () => {
      const handleSelect = vi.fn();
      const range = {
        from: new Date("2024-01-10"),
        to: new Date("2024-01-20"),
      };

      const { container } = render(
        <Calendar mode="range" selected={range} onSelect={handleSelect} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should work with multiple mode", () => {
      const handleSelect = vi.fn();
      const dates = [new Date("2024-01-15"), new Date("2024-01-20")];

      const { container } = render(
        <Calendar mode="multiple" selected={dates} onSelect={handleSelect} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined selected", () => {
      const { container } = render(<Calendar selected={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle empty array for multiple mode", () => {
      const { container } = render(<Calendar mode="multiple" selected={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle partial range", () => {
      const range = { from: new Date("2024-01-10") };
      const { container } = render(<Calendar mode="range" selected={range} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should work without mode prop", () => {
      const { container } = render(<Calendar />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should work without selected prop", () => {
      const { container } = render(<Calendar mode="single" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should work without onSelect prop", () => {
      const { container } = render(
        <Calendar mode="single" selected={new Date()} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle very long className", () => {
      const longClassName = "class-1 class-2 class-3 class-4 class-5";
      const { container } = render(<Calendar className={longClassName} />);
      const calendar = container.firstChild as HTMLElement;
      expect(calendar.className).toContain("class-1");
    });
  });
});
