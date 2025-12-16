import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Skeleton } from "../skeleton";

expect.extend(toHaveNoViolations);

describe("Skeleton", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<Skeleton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have status role", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toBeInTheDocument();
    });

    it("should have aria-live polite", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-live", "polite");
    });

    it("should have default loading text for screen readers", () => {
      render(<Skeleton />);
      expect(screen.getByText("Loading content")).toBeInTheDocument();
    });

    it("should support custom loading text", () => {
      render(<Skeleton loadingText="Loading profile picture" />);
      expect(screen.getByText("Loading profile picture")).toBeInTheDocument();
    });

    it("should show screen reader text by default", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-label", "Loading content");
    });

    it("should hide screen reader text when showLoadingText is false", () => {
      render(<Skeleton showLoadingText={false} />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).not.toHaveAttribute("aria-label");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded-md");
    });

    it("should apply text variant styles", () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded", "h-4");
    });

    it("should apply circular variant styles", () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("should apply rectangular variant styles", () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded-sm");
    });
  });

  describe("Sizes", () => {
    it("should not apply size classes when size is not specified", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).not.toHaveClass("h-4", "w-4");
    });

    it("should apply small size", () => {
      render(<Skeleton size="sm" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("h-4", "w-4");
    });

    it("should apply medium size", () => {
      render(<Skeleton size="md" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("h-6", "w-6");
    });

    it("should apply large size", () => {
      render(<Skeleton size="lg" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("h-8", "w-8");
    });

    it("should apply extra large size", () => {
      render(<Skeleton size="xl" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("h-12", "w-12");
    });
  });

  describe("Styling", () => {
    it("should have base animation class", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("should have background color", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("bg-[var(--color-skeleton-background)]");
    });

    it("should apply custom className", () => {
      render(<Skeleton className="custom-skeleton h-20 w-full" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("custom-skeleton", "h-20", "w-full");
    });

    it("should combine variant and size classes", () => {
      render(<Skeleton variant="circular" size="lg" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded-full", "h-8", "w-8");
    });

    it("should combine variant and custom className", () => {
      render(<Skeleton variant="text" className="w-3/4" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded", "h-4", "w-3/4");
    });
  });

  describe("Integration", () => {
    it("should forward ref to skeleton element", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Skeleton ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should work in card layout", () => {
      const { container } = render(
        <div className="space-y-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      );
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(3);
    });

    it("should work in list layout", () => {
      render(
        <div>
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" />
        </div>
      );
      const skeletons = screen.getAllByRole("status");
      expect(skeletons).toHaveLength(3);
    });

    it("should support data attributes", () => {
      render(<Skeleton data-testid="loading-skeleton" />);
      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty loadingText", () => {
      render(<Skeleton loadingText="" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-label", "");
    });

    it("should support additional HTML attributes", () => {
      render(<Skeleton id="my-skeleton" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("id", "my-skeleton");
    });

    it("should handle size override with custom className", () => {
      render(<Skeleton size="sm" className="h-16 w-16" />);
      const skeleton = screen.getByRole("status");
      // Custom className should override size
      expect(skeleton).toHaveClass("h-16", "w-16");
    });

    it("should work without any props", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });
});
