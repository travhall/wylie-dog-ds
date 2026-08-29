import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ShowcasePage from "../page";

describe("ShowcasePage (home)", () => {
  it("renders without throwing", () => {
    expect(() => render(<ShowcasePage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<ShowcasePage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(
      "The design system that closes the gap between design and code."
    );
  });
});
