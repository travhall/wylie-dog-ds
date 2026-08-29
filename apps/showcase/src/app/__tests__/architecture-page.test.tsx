import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArchitecturePage from "../architecture/page";

describe("ArchitecturePage", () => {
  it("renders without throwing", () => {
    expect(() => render(<ArchitecturePage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<ArchitecturePage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("The monorepo that ships everything.");
  });
});
