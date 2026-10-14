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
      "Figma variables and the token files, in sync."
    );
  });

  it("describes the plugin as it exists, not a CLI", () => {
    const { container } = render(<PluginPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Figma plugin");
    expect(text).toContain("personal access token");
    // The page once described a command-line sync that does not exist.
    expect(text).not.toContain("sync:figma");
    expect(text).not.toContain("token-bridge");
  });

  it("lists the three real collections", () => {
    const { container } = render(<PluginPage />);
    const text = container.textContent ?? "";
    for (const name of ["primitive", "semantic", "components"]) {
      expect(text).toContain(name);
    }
  });
});
