import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComponentsPage from "../components/page";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

describe("ComponentsPage", () => {
  it("renders without throwing", () => {
    expect(() => render(<ComponentsPage />)).not.toThrow();
  });

  it("shows the hero heading", () => {
    render(<ComponentsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("All accessible.");
  });

  const CATEGORY_TITLE_TO_DIR: Record<string, string> = {
    "Content Display": "Content-Display",
    "Feedback & Status": "Feedback-Status",
    "Inputs & Controls": "Inputs-Controls",
    "Layout & Structure": "Layout-Structure",
    Navigation: "Navigation",
    "Overlays & Popovers": "Overlays-Popovers",
  };

  it.each(Object.entries(CATEGORY_TITLE_TO_DIR))(
    "shows the real story count for %s",
    (title, dirName) => {
      render(<ComponentsPage />);
      const expected = getComponentCategoryCounts().find(
        (c) => c.dirName === dirName
      )?.count;
      expect(expected).toBeGreaterThan(0);

      const heading = screen.getByRole("heading", { level: 2, name: title });
      const header = heading.closest("header");
      expect(header).not.toBeNull();
      expect(header).toHaveTextContent(`${expected} components`);
    }
  );
});
