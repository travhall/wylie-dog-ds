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

  it("never renders fabricated token names that don't exist in @wyliedog/tokens", () => {
    const { container } = render(<TokensPage />);
    const text = container.textContent ?? "";
    const fabricatedTokenNames = [
      "--radius-xs",
      "--radius-sm",
      "--radius-md",
      "--radius-lg",
      "--radius-xl",
      "--ease-standard",
      "--ease-emphasized",
      "--ease-decelerate",
      "--ease-accelerate",
      "--space-row-y",
      "--space-gap",
      "--space-avatar",
    ];
    for (const name of fabricatedTokenNames) {
      expect(text).not.toContain(name);
    }
  });
});
