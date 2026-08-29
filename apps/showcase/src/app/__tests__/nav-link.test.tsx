import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname }));

// Imported after the mock so NavLink picks up the mocked usePathname.
const { NavLink } = await import("../nav-link");

describe("NavLink", () => {
  beforeEach(() => {
    usePathname.mockReset();
  });

  it("renders without throwing", () => {
    usePathname.mockReturnValue("/components");
    expect(() =>
      render(<NavLink href="/components" label="Components" />)
    ).not.toThrow();
  });

  it("renders the label as a link to href", () => {
    usePathname.mockReturnValue("/tokens");
    render(<NavLink href="/tokens" label="Tokens" />);
    const link = screen.getByRole("link", { name: "Tokens" });
    expect(link).toHaveAttribute("href", "/tokens");
  });

  it("applies the active-state class when the current path matches href", () => {
    usePathname.mockReturnValue("/components");
    render(<NavLink href="/components" label="Components" />);
    expect(screen.getByRole("link", { name: "Components" })).toHaveClass(
      "font-medium"
    );
  });

  it("applies the active-state class when the current path is a subroute of href", () => {
    usePathname.mockReturnValue("/components/inputs");
    render(<NavLink href="/components" label="Components" />);
    expect(screen.getByRole("link", { name: "Components" })).toHaveClass(
      "font-medium"
    );
  });

  it("does not apply the active-state class for a non-matching path", () => {
    usePathname.mockReturnValue("/tokens");
    render(<NavLink href="/components" label="Components" />);
    expect(screen.getByRole("link", { name: "Components" })).not.toHaveClass(
      "font-medium"
    );
  });
});
