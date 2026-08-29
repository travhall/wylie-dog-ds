import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TokensPage from "../tokens/page";

describe("TokensPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<TokensPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<TokensPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(
      "The contract everything renders against."
    );
  });
});
