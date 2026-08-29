import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PluginPage from "../plugin/page";

describe("PluginPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<PluginPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<PluginPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(
      "One source of truth. No manual handoff."
    );
  });
});
