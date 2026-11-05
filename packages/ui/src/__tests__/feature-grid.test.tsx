import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { FeatureGrid } from "../feature-grid";

expect.extend(toHaveNoViolations);

const features = [
  {
    icon: <svg data-testid="icon-one" aria-hidden="true" />,
    title: "Fast",
    description: "Loads quickly",
  },
  {
    icon: <svg data-testid="icon-two" aria-hidden="true" />,
    title: "Accessible",
    description: "Checked in light and dark",
    badge: "New",
    badgeVariant: "info" as const,
  },
  {
    icon: <svg data-testid="icon-three" aria-hidden="true" />,
    title: "Tokenised",
    description: "One source of truth",
    badge: "Core",
  },
];

describe("FeatureGrid", () => {
  it("renders without crashing", () => {
    render(<FeatureGrid aria-label="Test feature-grid" />);
    const element = screen.getByLabelText("Test feature-grid");
    expect(element).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <FeatureGrid className="custom-class" aria-label="Test feature-grid" />
    );
    const element = screen.getByLabelText("Test feature-grid");
    expect(element).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<FeatureGrid ref={ref} aria-label="Test feature-grid" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("zooms the item and its icon on hover from tokens, with no tilt", () => {
    const { container } = render(
      <FeatureGrid aria-label="Test feature-grid" features={features} />
    );
    expect(
      container.querySelector(
        ".hover\\:scale-\\(--feature-grid-item-hover-scale\\)"
      )
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".group-hover\\:scale-\\(--feature-grid-icon-hover-scale\\)"
      )
    ).not.toBeNull();
    expect(container.innerHTML).not.toMatch(/rotate/);
  });

  it("passes accessibility audit", async () => {
    const { container } = render(
      <FeatureGrid aria-label="Test feature-grid" features={features} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with default variant", () => {
    render(<FeatureGrid aria-label="Test feature-grid" />);
    const element = screen.getByLabelText("Test feature-grid");
    expect(element).toBeInTheDocument();
  });

  describe("features", () => {
    it("renders each feature's icon, title and description", () => {
      render(
        <FeatureGrid aria-label="Test feature-grid" features={features} />
      );

      expect(
        screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
      ).toEqual(["Fast", "Accessible", "Tokenised"]);
      expect(screen.getByText("Loads quickly")).toBeInTheDocument();
      expect(screen.getByText("Checked in light and dark")).toBeInTheDocument();
      expect(screen.getByText("One source of truth")).toBeInTheDocument();
      expect(screen.getByTestId("icon-one")).toBeInTheDocument();
      expect(screen.getByTestId("icon-two")).toBeInTheDocument();
      expect(screen.getByTestId("icon-three")).toBeInTheDocument();
    });

    it("renders a badge only for features that have one", () => {
      render(
        <FeatureGrid aria-label="Test feature-grid" features={features} />
      );

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Core")).toBeInTheDocument();
      expect(screen.getByText("Fast").parentElement?.textContent).toBe(
        "FastLoads quickly"
      );
    });

    it("styles a badge with the variant it was given", () => {
      render(
        <FeatureGrid aria-label="Test feature-grid" features={features} />
      );
      expect(screen.getByText("New")).toHaveClass(
        "bg-(--color-badge-info-background)"
      );
    });

    it("falls back to the default badge variant", () => {
      render(
        <FeatureGrid aria-label="Test feature-grid" features={features} />
      );
      expect(screen.getByText("Core")).toHaveClass(
        "bg-(--color-badge-default-background)"
      );
    });
  });

  describe("layout", () => {
    it("lays out 1, 2, 3 and 4 columns at sm, md, lg and xl by default", () => {
      render(<FeatureGrid aria-label="Test feature-grid" />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "grid",
        "sm:grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4"
      );
    });

    it("emits only the breakpoints it is given", () => {
      render(
        <FeatureGrid aria-label="Test feature-grid" columns={{ lg: 3 }} />
      );
      const grid = screen.getByLabelText("Test feature-grid");
      expect(grid).toHaveClass("lg:grid-cols-3");
      expect(grid.className).not.toMatch(/\b(sm|md|xl):grid-cols/);
    });

    it("skips the middle breakpoints it is not given", () => {
      render(
        <FeatureGrid
          aria-label="Test feature-grid"
          columns={{ sm: 1, xl: 4 }}
        />
      );
      const grid = screen.getByLabelText("Test feature-grid");
      expect(grid).toHaveClass("sm:grid-cols-1", "xl:grid-cols-4");
      expect(grid.className).not.toMatch(/\b(md|lg):grid-cols/);
    });

    it("centres its items when asked", () => {
      render(<FeatureGrid aria-label="Test feature-grid" centered />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "justify-items-center"
      );
    });

    it("does not centre its items by default", () => {
      render(<FeatureGrid aria-label="Test feature-grid" />);
      expect(screen.getByLabelText("Test feature-grid")).not.toHaveClass(
        "justify-items-center"
      );
    });
  });

  describe("gap", () => {
    it("uses the container gap token by default", () => {
      render(<FeatureGrid aria-label="Test feature-grid" />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "gap-(--space-feature-grid-container-gap)"
      );
    });

    it("tightens to the item gap in the compact variant", () => {
      render(<FeatureGrid aria-label="Test feature-grid" variant="compact" />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "gap-(--space-feature-grid-item-gap)"
      );
    });

    it("uses the container gap in the spacious variant", () => {
      render(<FeatureGrid aria-label="Test feature-grid" variant="spacious" />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "gap-(--space-feature-grid-container-gap)"
      );
    });

    it("lets a custom gap replace the gap of the default variant only", () => {
      const { rerender } = render(
        <FeatureGrid aria-label="Test feature-grid" gap="gap-2" />
      );
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass("gap-2");

      rerender(
        <FeatureGrid
          aria-label="Test feature-grid"
          gap="gap-2"
          variant="compact"
        />
      );
      expect(screen.getByLabelText("Test feature-grid")).not.toHaveClass(
        "gap-2"
      );
    });

    it("falls back to the container gap token when the gap is empty", () => {
      render(<FeatureGrid aria-label="Test feature-grid" gap="" />);
      expect(screen.getByLabelText("Test feature-grid")).toHaveClass(
        "gap-(--space-feature-grid-container-gap)"
      );
    });
  });
});
