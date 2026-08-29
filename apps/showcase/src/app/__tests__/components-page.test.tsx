import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComponentsPage from "../components/page";

describe("ComponentsPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<ComponentsPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<ComponentsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("All accessible.");
  });
});
