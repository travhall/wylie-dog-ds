import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

const componentCategoryModules = import.meta.glob("../components/*/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

const patternCategoryModules = import.meta.glob("../patterns/*/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

const COMPONENT_DIR_BY_PATH: Record<string, string> = {
  "../components/layout/page.tsx": "Layout-Structure",
  "../components/inputs/page.tsx": "Inputs-Controls",
  "../components/content-display/page.tsx": "Content-Display",
  "../components/feedback/page.tsx": "Feedback-Status",
  "../components/navigation/page.tsx": "Navigation",
  "../components/overlays/page.tsx": "Overlays-Popovers",
};

describe("component category pages share the hub-breadcrumb + count-badge template", () => {
  const entries = Object.entries(componentCategoryModules);

  it("discovers all 6 component category pages", () => {
    expect(entries.length).toBe(6);
  });

  it.each(entries)("%s has a link back to /components", (path, mod) => {
    render(<mod.default />);
    expect(
      screen.getByRole("link", { name: /all components/i })
    ).toBeInTheDocument();
  });

  it.each(entries)("%s shows its real component count", (path, mod) => {
    render(<mod.default />);
    const dirName = COMPONENT_DIR_BY_PATH[path];
    expect(dirName).toBeDefined();
    const expected = getComponentCategoryCounts().find(
      (c) => c.dirName === dirName
    )?.count;
    expect(expected).toBeGreaterThan(0);
    expect(screen.getByText(`${expected} components`)).toBeInTheDocument();
  });
});

describe("pattern category pages share the hub-breadcrumb template", () => {
  const entries = Object.entries(patternCategoryModules);

  it("discovers all 9 pattern category pages", () => {
    expect(entries.length).toBe(9);
  });

  it.each(entries)("%s has a link back to /patterns", (path, mod) => {
    render(<mod.default />);
    expect(
      screen.getByRole("link", { name: /all patterns/i })
    ).toBeInTheDocument();
  });
});
