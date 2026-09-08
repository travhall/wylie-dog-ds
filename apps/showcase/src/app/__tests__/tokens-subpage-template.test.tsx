import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";

const tokensSubpageModules = import.meta.glob(
  "../tokens/{colors,spacing,typography,borders,elevation,motion}/page.tsx",
  { eager: true }
) as Record<string, { default: ComponentType }>;

describe("tokens sub-pages share the shared shell (breadcrumb + lateral nav)", () => {
  const entries = Object.entries(tokensSubpageModules);

  it("discovers all 6 tokens sub-pages", () => {
    expect(entries.length).toBe(6);
  });

  it.each(entries)("%s has a link back to /tokens", (path, mod) => {
    render(<mod.default />);
    expect(
      screen.getByRole("link", { name: /all tokens/i })
    ).toBeInTheDocument();
  });

  it.each(entries)("%s shows the lateral cross-category nav", (path, mod) => {
    render(<mod.default />);
    expect(
      screen.getByRole("navigation", { name: /token categories/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /color/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /typography/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /spacing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /radius/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /elevation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /motion/i })).toBeInTheDocument();
  });
});
