import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PatternsPage from "../patterns/page";

describe("PatternsPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<PatternsPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<PatternsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(
      "Complete UI solutions, not just components."
    );
  });
});
