import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PatternsPage from "../patterns/page";
import { getPatternCategoryCounts } from "@/lib/showcase-metadata";

describe("PatternsPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<PatternsPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<PatternsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(
      "Complete UI solutions, not just components."
    );
  });

  const CATEGORY_TITLE_TO_DIR: Record<string, string> = {
    Authentication: "Authentication Patterns",
    "Data display": "Data Patterns",
    Feedback: "Feedback Patterns",
    Forms: "Form Patterns",
    Layout: "Layout Patterns",
    Navigation: "Navigation Patterns",
    "Page compositions": "Page Compositions",
    Responsive: "Responsive",
    Accessibility: "Accessibility",
  };

  it.each(Object.entries(CATEGORY_TITLE_TO_DIR))(
    "shows the real pattern count for %s",
    (title, dirName) => {
      render(<PatternsPage />);
      const expected = getPatternCategoryCounts().find(
        (c) => c.dirName === dirName
      )?.count;
      expect(expected).toBeGreaterThan(0);

      const heading = screen.getByRole("heading", { level: 2, name: title });
      const header = heading.closest("header");
      expect(header).not.toBeNull();
      expect(header).toHaveTextContent(
        `${expected} pattern${expected === 1 ? "" : "s"}`
      );
    }
  );
});
