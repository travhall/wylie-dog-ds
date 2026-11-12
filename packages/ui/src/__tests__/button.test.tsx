import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Button, buttonVariants } from "../button";

describe("Button", () => {
  describe("Functionality", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: "Click me" })
      ).toBeInTheDocument();
    });

    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should merge custom className with base styles", () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("inline-flex");
    });
  });

  describe("Variants", () => {
    it("should render default variant with expected classes", () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-(--color-button-primary-background)");
      expect(button).toHaveClass("text-(--color-button-primary-text)");
      expect(button).toHaveClass("border-(--color-button-primary-border)");
    });

    it("should render secondary variant with expected classes", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-(--color-button-secondary-background)");
      expect(button).toHaveClass("text-(--color-button-secondary-text)");
      expect(button).toHaveClass("border-(--color-button-secondary-border)");
    });

    it("should render outline variant with expected classes", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border-(--color-button-outline-border)");
      expect(button).toHaveClass("bg-(--color-button-outline-background)");
      expect(button).toHaveClass("text-(--color-button-outline-text)");
    });

    it("should render ghost variant with expected classes", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-(--color-button-ghost-background)");
      expect(button).toHaveClass("text-(--color-button-ghost-text)");
      expect(button).toHaveClass("border-transparent");
    });

    it("should render link variant with expected classes", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-(--color-button-link-text)");
      expect(button).toHaveClass(
        "underline-offset-(--space-button-link-underline-offset)"
      );
      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("border-transparent");
    });

    it("should render destructive variant with expected classes", () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-(--color-button-destructive-background)");
      expect(button).toHaveClass("text-(--color-button-destructive-text)");
      expect(button).toHaveClass("border-(--color-button-destructive-border)");
    });

    it("should default to the default variant when none is specified", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-(--color-button-primary-background)");
    });
  });

  describe("Sizes", () => {
    it("should render default size with expected classes", () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-(--space-button-padding-x-md)");
      expect(button).toHaveClass("py-(--space-button-padding-y-md)");
      expect(button).toHaveClass(
        "text-(length:--font-size-button-font-size-md)"
      );
    });

    it("should render sm size with expected classes", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-(--space-button-padding-x-sm)");
      expect(button).toHaveClass("py-(--space-button-padding-y-sm)");
      expect(button).toHaveClass(
        "text-(length:--font-size-button-font-size-sm)"
      );
    });

    it("should render md size with expected classes", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-(--space-button-padding-x-md)");
      expect(button).toHaveClass("py-(--space-button-padding-y-md)");
      expect(button).toHaveClass(
        "text-(length:--font-size-button-font-size-md)"
      );
    });

    it("should render lg size with expected classes", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-(--space-button-padding-x-lg)");
      expect(button).toHaveClass("py-(--space-button-padding-y-lg)");
      expect(button).toHaveClass(
        "text-(length:--font-size-button-font-size-lg)"
      );
    });

    it("should render icon size with expected classes", () => {
      render(<Button size="icon" aria-label="Icon button" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-(--space-button-icon-only-size)");
      expect(button).toHaveClass("w-(--space-button-icon-only-size)");
      expect(button).toHaveClass("rounded-(--space-button-radius)");
    });
  });

  describe("Disabled State", () => {
    it("should set the native disabled attribute and aria-disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should not call the click handler when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should render a loading spinner", () => {
      const { container } = render(<Button loading>Submitting</Button>);
      expect(container.querySelector(".wd-motion-spin")).toBeInTheDocument();
    });

    it("should disable the button when loading, even without an explicit disabled prop", () => {
      render(<Button loading>Submitting</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should not call the click handler when loading", () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Submitting
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should keep children visible when loading with a non-icon size", () => {
      render(<Button loading>Submitting</Button>);
      expect(screen.getByText("Submitting")).toBeInTheDocument();
    });

    it("should hide children when loading and size is icon", () => {
      render(
        <Button loading size="icon" aria-label="Save">
          <span data-testid="icon-child">Icon</span>
        </Button>
      );
      expect(screen.queryByTestId("icon-child")).not.toBeInTheDocument();
    });

    it("should keep the accessible name when an aria-label is supplied alongside loading+icon", () => {
      render(
        <Button loading size="icon" aria-label="Save">
          <span data-testid="icon-child">Icon</span>
        </Button>
      );
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    // Fixed by plan 061: `{!(loading && size === "icon") && children}` hides
    // children, and the loading spinner is `aria-hidden`, so a caller that
    // relies on an icon child for the accessible name (instead of passing
    // `aria-label`) would otherwise end up with a blank, unlabeled button.
    // Button now falls back to a default `aria-label` in this state.
    it("should fall back to a default accessible name when loading+icon hides the only child and no aria-label is given", () => {
      render(
        <Button loading size="icon">
          <span data-testid="icon-child">Icon</span>
        </Button>
      );
      expect(
        screen.getByRole("button", { name: "Loading" })
      ).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should forward ref to the native button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click me</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });
  });

  describe("buttonVariants Function", () => {
    it("should return base classes", () => {
      const classes = buttonVariants({});
      expect(classes).toContain("inline-flex");
      expect(classes).toContain("items-center");
      expect(classes).toContain("justify-center");
    });

    it("should include default variant and size classes when none specified", () => {
      const classes = buttonVariants({});
      expect(classes).toContain("bg-(--color-button-primary-background)");
      expect(classes).toContain("px-(--space-button-padding-x-md)");
    });
  });

  describe("Icon, type and busy state", () => {
    const Glyph = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="glyph" viewBox="0 0 24 24" {...props}>
        <path d="M4 12h16" />
      </svg>
    );

    it("renders the icon prop before the label, hidden from assistive technology", () => {
      render(<Button icon={Glyph}>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });
      const svg = screen.getByTestId("glyph");
      expect(button.firstElementChild).toBe(svg);
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it.each([
      ["sm", "sm"],
      ["md", "md"],
      ["default", "md"],
      ["lg", "lg"],
    ] as const)(
      "sizes an icon in a %s button from the %s button icon-size token with the sm stroke",
      (size, token) => {
        render(
          <Button size={size} icon={Glyph}>
            Go
          </Button>
        );
        const button = screen.getByRole("button", { name: "Go" });
        expect(button).toHaveClass(
          `[&_svg]:h-(--space-button-icon-size-${token})`,
          `[&_svg]:w-(--space-button-icon-size-${token})`,
          "[&_svg]:stroke-(length:--space-icon-stroke-width-sm)"
        );
        expect(screen.getByTestId("glyph")).toHaveClass(
          `h-(--space-button-icon-size-${token})`
        );
      }
    );

    it("sizes the icon-only button's icon from its own token with the md stroke", () => {
      render(<Button size="icon" icon={Glyph} aria-label="Like" />);
      const button = screen.getByRole("button", { name: "Like" });
      expect(button).toHaveClass(
        "[&_svg]:h-(--space-button-icon-only-icon-size)",
        "[&_svg]:stroke-(length:--space-icon-stroke-width-md)"
      );
      expect(screen.getByTestId("glyph")).toHaveClass(
        "h-(--space-button-icon-only-icon-size)"
      );
    });

    it("lets the spinner take the icon's place while loading", () => {
      render(
        <Button loading icon={Glyph}>
          Saving
        </Button>
      );
      expect(screen.queryByTestId("glyph")).toBeNull();
    });

    it("defaults type to button so it does not submit a form, and lets it be overridden", () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button>Plain</Button>
          <Button type="submit">Send</Button>
        </form>
      );
      expect(screen.getByRole("button", { name: "Plain" })).toHaveAttribute(
        "type",
        "button"
      );
      fireEvent.click(screen.getByRole("button", { name: "Plain" }));
      expect(onSubmit).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("sets aria-busy only while loading", () => {
      const { rerender } = render(<Button>Go</Button>);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
      rerender(<Button loading>Go</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Icon gap", () => {
    it("spaces an icon and its label with the icon gap token", () => {
      render(
        <Button>
          <svg data-testid="icon" />
          Add item
        </Button>
      );
      expect(screen.getByRole("button")).toHaveClass(
        "gap-(--space-button-icon-gap)"
      );
    });

    it("spaces the loading spinner and the label with the same gap, not a margin", () => {
      const { container } = render(<Button loading>Save</Button>);
      const spinner = container.querySelector("span[aria-hidden='true']");
      expect(spinner).toBeInTheDocument();
      expect(spinner?.getAttribute("class")).not.toMatch(/\bmr-/);
      expect(screen.getByRole("button")).toHaveClass(
        "gap-(--space-button-icon-gap)"
      );
    });
  });

  describe("Link variant", () => {
    it.each(["default", "sm", "md", "lg"] as const)(
      "renders with no padding at size %s",
      (size) => {
        render(
          <Button variant="link" size={size}>
            Read more
          </Button>
        );
        const button = screen.getByRole("button");
        expect(button).toHaveClass("px-0", "py-0", "h-auto");
        expect(button.getAttribute("class")).not.toContain(
          "px-(--space-button-padding-x"
        );
        expect(button.getAttribute("class")).not.toContain(
          "py-(--space-button-padding-y"
        );
      }
    );

    it("keeps its padding for other variants", () => {
      render(<Button size="md">Save</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-(--space-button-padding-x-md)");
      expect(button).not.toHaveClass("px-0");
    });
  });
});
