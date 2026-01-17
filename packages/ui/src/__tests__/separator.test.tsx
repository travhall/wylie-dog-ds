import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Separator } from "../separator";

expect.extend(toHaveNoViolations);

describe("Separator", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit for decorative separator", async () => {
      const { container } = render(<Separator decorative />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit for non-decorative separator", async () => {
      const { container } = render(
        <Separator decorative={false} aria-label="Section divider" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should render when decorative", () => {
      const { container } = render(<Separator decorative />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toBeInTheDocument();
    });

    it("should have separator role when non-decorative", () => {
      render(<Separator decorative={false} aria-label="Section divider" />);
      const separator = screen.getByRole("separator");
      expect(separator).toBeInTheDocument();
    });

    it("should support aria-label for non-decorative separators", () => {
      render(<Separator decorative={false} aria-label="Content divider" />);
      const separator = screen.getByRole("separator", {
        name: "Content divider",
      });
      expect(separator).toBeInTheDocument();
    });

    it("should have proper aria-orientation for horizontal", () => {
      render(
        <Separator
          orientation="horizontal"
          decorative={false}
          aria-label="Divider"
        />
      );
      const separator = screen.getByRole("separator");
      // Radix UI doesn't add aria-orientation for horizontal (it's the default)
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should have proper aria-orientation for vertical", () => {
      const { container } = render(
        <Separator
          orientation="vertical"
          decorative={false}
          aria-label="Divider"
        />
      );
      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("Styling", () => {
    it("should apply horizontal styles by default", () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveClass("h-px", "w-full");
    });

    it("should apply horizontal styles when explicitly set", () => {
      const { container } = render(<Separator orientation="horizontal" />);
      const separator = container.querySelector(
        '[data-orientation="horizontal"]'
      );
      expect(separator).toHaveClass("h-px", "w-full");
    });

    it("should apply vertical styles", () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.querySelector(
        '[data-orientation="vertical"]'
      );
      expect(separator).toHaveClass("h-full", "w-px");
    });

    it("should apply custom className", () => {
      const { container } = render(<Separator className="custom-separator" />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveClass("custom-separator");
    });

    it("should have base styling classes", () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveClass("shrink-0");
      expect(separator).toHaveClass("bg-(--color-border-primary)");
    });
  });

  describe("Functionality", () => {
    it("should be decorative by default", () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should support non-decorative mode", () => {
      render(<Separator decorative={false} aria-label="Divider" />);
      const separator = screen.getByRole("separator");
      expect(separator).toBeInTheDocument();
    });

    it("should default to horizontal orientation", () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should support vertical orientation", () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("Integration", () => {
    it("should forward ref to separator element", () => {
      const ref = React.createRef<React.ComponentRef<typeof Separator>>();
      render(<Separator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should work within flex containers", () => {
      const { container } = render(
        <div className="flex gap-2">
          <span>Item 1</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Item 2</span>
        </div>
      );
      const separator = container.querySelector(
        '[data-orientation="vertical"]'
      );
      expect(separator).toBeInTheDocument();
    });

    it("should work between content blocks", () => {
      const { container } = render(
        <div>
          <p>Paragraph 1</p>
          <Separator className="my-4" />
          <p>Paragraph 2</p>
        </div>
      );
      const separator = container.querySelector(
        '[data-orientation="horizontal"]'
      );
      expect(separator).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle custom data attributes", () => {
      render(<Separator data-testid="custom-separator" />);
      expect(screen.getByTestId("custom-separator")).toBeInTheDocument();
    });

    it("should support additional props", () => {
      const { container } = render(<Separator id="my-separator" />);
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveAttribute("id", "my-separator");
    });

    it("should handle both orientation and custom className", () => {
      const { container } = render(
        <Separator orientation="vertical" className="bg-red-500" />
      );
      const separator = container.querySelector("[data-orientation]");
      expect(separator).toHaveClass("w-px", "h-full", "bg-red-500");
    });
  });
});
