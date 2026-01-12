import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { FeatureGrid } from "../feature-grid";

expect.extend(toHaveNoViolations);

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

  it("passes accessibility audit", async () => {
    const { container } = render(
      <FeatureGrid aria-label="Test feature-grid" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with default variant", () => {
    render(<FeatureGrid aria-label="Test feature-grid" />);
    const element = screen.getByLabelText("Test feature-grid");
    expect(element).toBeInTheDocument();
  });
});
