import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  expectToPassA11yAudit,
  testScreenReaderAnnouncements,
  a11yTestPatterns,
  commonA11yTests,
} from "../test-utils";

describe("test-utils", () => {
  describe("expectToPassA11yAudit", () => {
    it("should pass for accessible component", async () => {
      const { container } = render(<button>Accessible Button</button>);
      await expectToPassA11yAudit(container);
    });

    it("should not throw for valid markup", async () => {
      const { container } = render(
        <div>
          <label htmlFor="input">Label</label>
          <input id="input" type="text" />
        </div>
      );
      await expect(expectToPassA11yAudit(container)).resolves.not.toThrow();
    });
  });

  describe("testScreenReaderAnnouncements", () => {
    it("should verify role attribute", () => {
      const { container } = render(<div role="status">Loading...</div>);
      const element = container.firstChild as HTMLElement;

      testScreenReaderAnnouncements(element, { role: "status" });
    });

    it("should verify aria-live attribute", () => {
      const { container } = render(
        <div role="status" aria-live="polite">
          Notification
        </div>
      );
      const element = container.firstChild as HTMLElement;

      testScreenReaderAnnouncements(element, {
        role: "status",
        ariaLive: "polite",
      });
    });

    it("should verify aria-label", () => {
      const { container } = render(
        <div role="region" aria-label="Main content">
          Content
        </div>
      );
      const element = container.firstChild as HTMLElement;

      testScreenReaderAnnouncements(element, {
        role: "region",
        ariaLabel: "Main content",
      });
    });

    it("should verify aria-describedby", () => {
      const { container } = render(
        <div>
          <input aria-describedby="helper-text" />
          <div id="helper-text">Helper text</div>
        </div>
      );
      const input = container.querySelector("input") as HTMLElement;

      testScreenReaderAnnouncements(input, {
        ariaDescribedBy: "helper-text",
      });
    });

    it("should verify aria-labelledby", () => {
      const { container } = render(
        <div>
          <h2 id="dialog-title">Dialog Title</h2>
          <div role="dialog" aria-labelledby="dialog-title">
            Content
          </div>
        </div>
      );
      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;

      testScreenReaderAnnouncements(dialog, {
        role: "dialog",
        ariaLabelledBy: "dialog-title",
      });
    });
  });

  describe("a11yTestPatterns.loadingState", () => {
    it("should test loading state component", async () => {
      const result = await a11yTestPatterns.loadingState(
        <div role="status" aria-label="Loading content">
          Loading...
        </div>,
        "Loading content"
      );

      expect(result.loadingElement).toHaveAttribute(
        "aria-label",
        "Loading content"
      );
    });

    it("should test loading state without label", async () => {
      const result = await a11yTestPatterns.loadingState(
        <div role="status">Loading...</div>
      );

      expect(result.loadingElement).toHaveAttribute("role", "status");
    });
  });

  describe("commonA11yTests", () => {
    describe("passesAudit", () => {
      const getComponent = () => <button>Accessible Button</button>;

      // Actually call the helper to generate and run the test
      commonA11yTests.passesAudit(getComponent);
    });

    describe("hasCorrectRole", () => {
      const getComponent = () => <button>Button</button>;

      // Call the helper
      commonA11yTests.hasCorrectRole(getComponent, "button");

      // Test with custom role
      const getCustomComponent = () => (
        <div role="tabpanel" id="panel">
          Panel content
        </div>
      );
      commonA11yTests.hasCorrectRole(getCustomComponent, "tabpanel");
    });
  });
});
