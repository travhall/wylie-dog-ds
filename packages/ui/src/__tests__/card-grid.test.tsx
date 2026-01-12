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
});
