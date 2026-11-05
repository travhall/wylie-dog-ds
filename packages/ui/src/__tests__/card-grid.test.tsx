import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { CardGrid } from "../card-grid";

expect.extend(toHaveNoViolations);

describe("CardGrid", () => {
  it("renders without crashing", () => {
    render(<CardGrid aria-label="Test card-grid" />);
    const element = screen.getByLabelText("Test card-grid");
    expect(element).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<CardGrid className="custom-class" aria-label="Test card-grid" />);
    const element = screen.getByLabelText("Test card-grid");
    expect(element).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<CardGrid ref={ref} aria-label="Test card-grid" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes accessibility audit", async () => {
    const { container } = render(<CardGrid aria-label="Test card-grid" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with default variant", () => {
    render(<CardGrid aria-label="Test card-grid" />);
    const element = screen.getByLabelText("Test card-grid");
    expect(element).toBeInTheDocument();
  });

  it("renders its children", () => {
    render(
      <CardGrid aria-label="Test card-grid">
        <div>First card</div>
        <div>Second card</div>
      </CardGrid>
    );
    expect(screen.getByText("First card")).toBeInTheDocument();
    expect(screen.getByText("Second card")).toBeInTheDocument();
  });

  describe("columns", () => {
    it("lays out 1, 2, 3 and 4 columns at sm, md, lg and xl by default", () => {
      render(<CardGrid aria-label="Test card-grid" />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(
        "grid",
        "sm:grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4"
      );
    });

    it("emits only the breakpoints it is given", () => {
      render(<CardGrid aria-label="Test card-grid" columns={{ md: 2 }} />);
      const grid = screen.getByLabelText("Test card-grid");
      expect(grid).toHaveClass("md:grid-cols-2");
      expect(grid.className).not.toMatch(/\b(sm|lg|xl):grid-cols/);
    });

    it("skips the middle breakpoints it is not given", () => {
      render(
        <CardGrid aria-label="Test card-grid" columns={{ sm: 1, xl: 4 }} />
      );
      const grid = screen.getByLabelText("Test card-grid");
      expect(grid).toHaveClass("sm:grid-cols-1", "xl:grid-cols-4");
      expect(grid.className).not.toMatch(/\b(md|lg):grid-cols/);
    });
  });

  describe("variants", () => {
    it.each([
      ["default", "gap-(--space-card-grid-gap-horizontal)"],
      ["compact", "gap-(--space-card-grid-gap-vertical)"],
      ["spacious", "gap-(--space-card-grid-gap-horizontal)"],
      ["elevated", "gap-(--space-card-grid-gap-horizontal)"],
      ["masonry", "gap-(--space-card-grid-item-padding)"],
    ] as const)("%s uses its own gap token", (variant, gapClass) => {
      render(<CardGrid aria-label="Test card-grid" variant={variant} />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(gapClass);
    });

    it("lets a custom gap replace the gap of the default variant only", () => {
      const { rerender } = render(
        <CardGrid aria-label="Test card-grid" gap="gap-2" />
      );
      expect(screen.getByLabelText("Test card-grid")).toHaveClass("gap-2");

      rerender(
        <CardGrid aria-label="Test card-grid" gap="gap-2" variant="compact" />
      );
      const grid = screen.getByLabelText("Test card-grid");
      expect(grid).not.toHaveClass("gap-2");
      expect(grid).toHaveClass("gap-(--space-card-grid-gap-vertical)");
    });

    it("falls back to the default gap token when the gap is empty", () => {
      render(<CardGrid aria-label="Test card-grid" gap="" />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(
        "gap-(--space-card-grid-gap-horizontal)"
      );
    });

    it("pads the elevated variant", () => {
      render(<CardGrid aria-label="Test card-grid" variant="elevated" />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(
        "p-(--space-card-grid-item-padding)"
      );
    });

    it("drives the masonry variant with fixed responsive columns and ignores `columns`", () => {
      render(
        <CardGrid
          aria-label="Test card-grid"
          variant="masonry"
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        />
      );
      const grid = screen.getByLabelText("Test card-grid");
      expect(grid).toHaveClass(
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "auto-rows-auto"
      );
      expect(grid).not.toHaveClass("grid");
      expect(grid).not.toHaveClass("xl:grid-cols-4");
    });
  });

  describe("options", () => {
    it("centres its items when asked", () => {
      render(<CardGrid aria-label="Test card-grid" centered />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(
        "justify-items-center"
      );
    });

    it("does not centre its items by default", () => {
      render(<CardGrid aria-label="Test card-grid" />);
      expect(screen.getByLabelText("Test card-grid")).not.toHaveClass(
        "justify-items-center"
      );
    });

    it("lifts its children on hover when interactive", () => {
      render(<CardGrid aria-label="Test card-grid" interactive />);
      expect(screen.getByLabelText("Test card-grid")).toHaveClass(
        "[&>*]:hover:scale-(--card-grid-item-hover-scale)",
        "[&>*]:hover:-translate-y-(--space-card-grid-item-hover-lift)",
        "[&>*]:duration-(--duration-card-grid-item-duration)"
      );
    });

    it("leaves its children still by default", () => {
      render(<CardGrid aria-label="Test card-grid" />);
      expect(screen.getByLabelText("Test card-grid").className).not.toContain(
        "[&>*]:hover"
      );
    });
  });
});
