import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";

const routeModules = import.meta.glob("../**/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

describe("all app routes", () => {
  const routes = Object.entries(routeModules);

  it("discovers every page.tsx route", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)("%s renders without throwing", (path, mod) => {
    const Page = mod.default;
    expect(() => render(<Page />)).not.toThrow();
  });

  it.each(routes)("%s has a level-1 heading", (path, mod) => {
    const Page = mod.default;
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
