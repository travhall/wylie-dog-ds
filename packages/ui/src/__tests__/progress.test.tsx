import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Progress } from "../progress";

expect.extend(toHaveNoViolations);

describe("Progress", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Progress value={50} aria-label="Progress" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit at 0%", async () => {
      const { container } = render(
        <Progress value={0} aria-label="Progress" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit at 100%", async () => {
      const { container } = render(
        <Progress value={100} aria-label="Progress" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with all variants", async () => {
      const variants = [
        "default",
        "success",
        "warning",
        "destructive",
      ] as const;

      for (const variant of variants) {
        const { container, unmount } = render(
          <Progress value={75} variant={variant} aria-label="Progress" />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should have proper role", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("should have aria-valuemin attribute", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
    });

    it("should have aria-valuemax attribute", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
    });

    it("should have aria-valuenow attribute", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "50");
    });

    it("should update aria-valuenow with value changes", () => {
      const { rerender } = render(<Progress value={25} />);
      let progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "25");

      rerender(<Progress value={50} />);
      progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "50");

      rerender(<Progress value={75} />);
      progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "75");
    });

    it("should support custom max value", () => {
      render(<Progress value={50} max={200} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemax", "200");
    });

    it("should support aria-label", () => {
      render(<Progress value={50} aria-label="Upload progress" />);
      const progress = screen.getByRole("progressbar", {
        name: "Upload progress",
      });
      expect(progress).toBeInTheDocument();
    });

    it("should support aria-labelledby", () => {
      render(
        <div>
          <h3 id="progress-label">File Upload</h3>
          <Progress value={50} aria-labelledby="progress-label" />
        </div>
      );

      const progress = screen.getByRole("progressbar", { name: "File Upload" });
      expect(progress).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <div>
          <Progress
            value={50}
            aria-label="Progress"
            aria-describedby="progress-desc"
          />
          <span id="progress-desc">50 out of 100 items completed</span>
        </div>
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-describedby", "progress-desc");
    });
  });

  describe("Functionality", () => {
    it("should render with default value of 0", () => {
      render(<Progress />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "0");
    });

    it("should render with default max of 100", () => {
      render(<Progress />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
    });

    it("should calculate percentage correctly", () => {
      render(<Progress value={50} max={100} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      // 50% progress means translateX(-50%)
      expect(innerDiv).toHaveStyle({ transform: "translateX(-50%)" });
    });

    it("should calculate percentage with custom max value", () => {
      render(<Progress value={75} max={150} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      // 75 / 150 = 50%, so translateX(-50%)
      expect(innerDiv).toHaveStyle({ transform: "translateX(-50%)" });
    });

    it("should clamp value between 0 and 100 percent", () => {
      const { rerender } = render(<Progress value={-50} max={100} />);
      let progress = screen.getByRole("progressbar");
      let innerDiv = progress.querySelector("div");
      // Negative value should clamp to 0%
      expect(innerDiv).toHaveStyle({ transform: "translateX(-100%)" });

      rerender(<Progress value={150} max={100} />);
      progress = screen.getByRole("progressbar");
      innerDiv = progress.querySelector("div");
      // Value exceeding max should clamp to 100%
      expect(innerDiv).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should handle zero max value gracefully", () => {
      render(<Progress value={0} max={0} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("should update progress on value change", () => {
      const { rerender } = render(<Progress value={0} />);
      let innerDiv = screen.getByRole("progressbar").querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-100%)" });

      rerender(<Progress value={25} />);
      innerDiv = screen.getByRole("progressbar").querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-75%)" });

      rerender(<Progress value={50} />);
      innerDiv = screen.getByRole("progressbar").querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-50%)" });

      rerender(<Progress value={100} />);
      innerDiv = screen.getByRole("progressbar").querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should handle fractional values", () => {
      render(<Progress value={33.33} max={100} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-66.67%)" });
    });

    it("should handle very small values", () => {
      render(<Progress value={1} max={1000} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");
      expect(innerDiv).toHaveStyle({ transform: "translateX(-99.9%)" });
    });

    it("should accept id attribute", () => {
      render(<Progress value={50} id="upload-progress" />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("id", "upload-progress");
    });

    it("should accept data attributes", () => {
      render(
        <Progress
          value={50}
          data-testid="progress-bar"
          data-analytics="progress-50"
        />
      );
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("data-testid", "progress-bar");
      expect(progress).toHaveAttribute("data-analytics", "progress-50");
    });
  });

  describe("Variants & Styling", () => {
    it("should support all size variants", async () => {
      const sizes = ["sm", "md", "lg"] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Progress value={50} size={size} aria-label="Progress" />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply size classes correctly", () => {
      const { rerender } = render(<Progress value={50} size="sm" />);
      let progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("h-1");

      rerender(<Progress value={50} size="md" />);
      progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("h-2");

      rerender(<Progress value={50} size="lg" />);
      progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("h-3");
    });

    it("should have default size set to md", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("h-2");
    });

    it("should support all variant types", async () => {
      const variants = [
        "default",
        "success",
        "warning",
        "destructive",
      ] as const;

      for (const variant of variants) {
        const { container, unmount } = render(
          <Progress value={50} variant={variant} aria-label="Progress" />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply default variant styling", () => {
      render(<Progress value={50} variant="default" />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("bg-(--color-progress-default-fill)");
    });

    it("should apply success variant styling", () => {
      render(<Progress value={50} variant="success" />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("bg-(--color-progress-success-fill)");
    });

    it("should apply warning variant styling", () => {
      render(<Progress value={50} variant="warning" />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("bg-(--color-progress-warning-fill)");
    });

    it("should apply destructive variant styling", () => {
      render(<Progress value={50} variant="destructive" />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("bg-(--color-progress-destructive-fill)");
    });

    it("should have default variant when none specified", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("bg-(--color-progress-default-fill)");
    });

    it("should have background color", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("bg-(--color-progress-background)");
    });

    it("should have overflow hidden", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("overflow-hidden");
    });

    it("should have rounded corners", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("rounded-full");
    });

    it("should have full width", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("w-full");
    });

    it("should have transition animation", () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveClass("transition-all");
      expect(innerDiv).toHaveClass("duration-300");
      expect(innerDiv).toHaveClass("ease-in-out");
    });

    it("should accept custom className", () => {
      render(<Progress value={50} className="custom-class" />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("custom-class");
    });

    it("should merge custom className with base styles", () => {
      render(<Progress value={50} className="custom-width" />);
      const progress = screen.getByRole("progressbar");

      expect(progress).toHaveClass("w-full");
      expect(progress).toHaveClass("custom-width");
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Progress value={50} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("role")).toBe("progressbar");
    });

    it("should work with aria-label for accessibility", () => {
      render(<Progress value={75} aria-label="Loading progress" />);

      const progress = screen.getByRole("progressbar", {
        name: "Loading progress",
      });
      expect(progress).toHaveAttribute("aria-valuenow", "75");
    });

    it("should work with labels and descriptions", () => {
      render(
        <div>
          <h3 id="progress-title">File Upload</h3>
          <Progress
            value={50}
            aria-labelledby="progress-title"
            aria-describedby="progress-desc"
          />
          <p id="progress-desc">50 MB of 100 MB uploaded</p>
        </div>
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-labelledby", "progress-title");
      expect(progress).toHaveAttribute("aria-describedby", "progress-desc");
    });

    it("should work in a container", () => {
      render(
        <div className="space-y-4">
          <div>
            <h3>Task 1</h3>
            <Progress value={25} />
          </div>
          <div>
            <h3>Task 2</h3>
            <Progress value={50} />
          </div>
          <div>
            <h3>Task 3</h3>
            <Progress value={100} />
          </div>
        </div>
      );

      const progresses = screen.getAllByRole("progressbar");
      expect(progresses).toHaveLength(3);
      expect(progresses[0]).toHaveAttribute("aria-valuenow", "25");
      expect(progresses[1]).toHaveAttribute("aria-valuenow", "50");
      expect(progresses[2]).toHaveAttribute("aria-valuenow", "100");
    });

    it("should work with display text", () => {
      render(
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Download</span>
            <span>75%</span>
          </div>
          <Progress value={75} aria-label="Download progress" />
        </div>
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("should support all HTML attributes", () => {
      render(
        <Progress
          value={50}
          id="main-progress"
          className="custom"
          data-testid="progress-test"
          title="Progress indicator"
          style={{ maxWidth: "500px" }}
        />
      );

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("id", "main-progress");
      expect(progress).toHaveClass("custom");
      expect(progress).toHaveAttribute("data-testid", "progress-test");
      expect(progress).toHaveAttribute("title", "Progress indicator");
    });
  });

  describe("Edge Cases", () => {
    it("should handle value of 0", () => {
      render(<Progress value={0} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "0");
    });

    it("should handle value of 100", () => {
      render(<Progress value={100} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuenow", "100");
    });

    it("should handle value less than 0", () => {
      render(<Progress value={-10} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      // Should clamp to 0% (translateX(-100%))
      expect(innerDiv).toHaveStyle({ transform: "translateX(-100%)" });
    });

    it("should handle value greater than max", () => {
      render(<Progress value={150} max={100} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      // Should clamp to 100% (translateX(-0%))
      expect(innerDiv).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should handle very large max value", () => {
      render(<Progress value={500000} max={1000000} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      // 50% progress
      expect(innerDiv).toHaveStyle({ transform: "translateX(-50%)" });
    });

    it("should handle decimal values", () => {
      render(<Progress value={33.33} max={100} />);
      const progress = screen.getByRole("progressbar");
      const innerDiv = progress.querySelector("div");

      expect(innerDiv).toHaveStyle({ transform: "translateX(-66.67%)" });
    });

    it("should handle rapid value changes", () => {
      const { rerender } = render(<Progress value={0} />);

      for (let i = 0; i <= 100; i += 10) {
        rerender(<Progress value={i} />);
        const progress = screen.getByRole("progressbar");
        expect(progress).toHaveAttribute("aria-valuenow", `${i}`);
      }
    });

    it("should handle size and variant together", () => {
      render(<Progress value={75} size="lg" variant="success" />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveClass("h-3");

      const innerDiv = progress.querySelector("div");
      expect(innerDiv).toHaveClass("bg-(--color-progress-success-fill)");
    });

    it("should handle all props together", () => {
      render(
        <Progress
          value={60}
          max={100}
          size="lg"
          variant="warning"
          id="test-progress"
          className="custom-class"
          data-testid="test"
          aria-label="Test progress"
        />
      );

      const progress = screen.getByRole("progressbar", {
        name: "Test progress",
      });
      expect(progress).toHaveAttribute("aria-valuenow", "60");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
      expect(progress).toHaveClass("h-3", "custom-class");
      expect(progress).toHaveAttribute("id", "test-progress");
      expect(progress).toHaveAttribute("data-testid", "test");
    });

    it("should handle empty max", () => {
      render(<Progress value={50} max={0} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("should handle NaN gracefully", () => {
      render(<Progress value={NaN} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("should handle Infinity gracefully", () => {
      render(<Progress value={Infinity} />);
      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });
  });

  describe("Animation", () => {
    it("should animate progress changes", () => {
      const { rerender } = render(<Progress value={0} />);
      let innerDiv = screen.getByRole("progressbar").querySelector("div");

      expect(innerDiv).toHaveClass("transition-all");

      rerender(<Progress value={50} />);
      innerDiv = screen.getByRole("progressbar").querySelector("div");

      expect(innerDiv).toHaveClass("duration-300");
      expect(innerDiv).toHaveClass("ease-in-out");
    });

    it("should maintain animation timing", () => {
      render(<Progress value={50} />);
      const innerDiv = screen.getByRole("progressbar").querySelector("div");

      expect(innerDiv).toHaveClass("transition-all");
      expect(innerDiv).toHaveClass("duration-300");
      expect(innerDiv).toHaveClass("ease-in-out");
    });
  });
});
