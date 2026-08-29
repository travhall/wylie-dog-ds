import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renders without throwing", () => {
    expect(() => render(<ThemeToggle />)).not.toThrow();
  });

  it("renders an accessible toggle button", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Toggle theme" })
    ).toBeInTheDocument();
  });

  it("toggles the `dark` class on <html> and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("wd-theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("wd-theme")).toBe("light");
  });
});
