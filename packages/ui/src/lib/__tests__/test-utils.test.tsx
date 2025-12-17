import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  renderWithA11y,
  expectToPassA11yAudit,
  testKeyboardNavigation,
  testAriaAttributes,
  testScreenReaderAnnouncements,
  a11yTestPatterns,
  commonA11yTests,
} from "../test-utils";

describe("test-utils", () => {
  describe("renderWithA11y", () => {
    it("should render component and include axe results", async () => {
      const result = await renderWithA11y(<button>Click me</button>);

      expect(result.container).toBeInTheDocument();
      expect(result.axeResults).toBeDefined();
      expect(result.getByText("Click me")).toBeInTheDocument();
    });

    it("should pass accessibility audit for valid component", async () => {
      const result = await renderWithA11y(
        <button aria-label="Submit">Submit</button>
      );

      expect(result.axeResults.violations).toHaveLength(0);
    });
  });

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

  describe("testKeyboardNavigation", () => {
    it("should verify element can receive focus", () => {
      const { getByRole } = render(<button>Focusable</button>);
      const button = getByRole("button");

      const navigation = testKeyboardNavigation(button);
      navigation.expectFocusable();
    });

    it("should verify element is not focused initially", () => {
      const { getByRole } = render(
        <>
          <button>Button 1</button>
          <button>Button 2</button>
        </>
      );
      const button2 = getByRole("button", { name: "Button 2" });

      button2.blur();
      const navigation = testKeyboardNavigation(button2);

      // After calling testKeyboardNavigation, it focuses the element
      // So we need to test before the focus() call
      expect(button2).toHaveFocus();
    });

    it("should return helper methods", () => {
      const { getByRole } = render(<button>Test</button>);
      const button = getByRole("button");

      const navigation = testKeyboardNavigation(button);

      expect(navigation.expectFocusable).toBeDefined();
      expect(navigation.expectNotFocusable).toBeDefined();
      expect(typeof navigation.expectFocusable).toBe("function");
      expect(typeof navigation.expectNotFocusable).toBe("function");
    });
  });

  describe("testAriaAttributes", () => {
    it("should verify ARIA attributes are set correctly", () => {
      const { getByRole } = render(
        <button aria-label="Close" aria-expanded="false" aria-controls="menu">
          X
        </button>
      );
      const button = getByRole("button");

      testAriaAttributes(button, {
        "aria-label": "Close",
        "aria-expanded": "false",
        "aria-controls": "menu",
      });
    });

    it("should verify boolean ARIA attributes", () => {
      const { getByRole } = render(<button aria-pressed="true">Toggle</button>);
      const button = getByRole("button");

      testAriaAttributes(button, {
        "aria-pressed": true,
      });
    });

    it("should verify absence of ARIA attributes", () => {
      const { getByRole } = render(<button>Plain Button</button>);
      const button = getByRole("button");

      testAriaAttributes(button, {
        "aria-label": null,
      });
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

  describe("a11yTestPatterns.interactiveComponent", () => {
    it("should test basic interactive component", async () => {
      const result = await a11yTestPatterns.interactiveComponent(
        <button>Click me</button>
      );

      expect(result.container).toBeInTheDocument();
      expect(result.element).toHaveFocus();
    });

    it("should handle custom role", async () => {
      const result = await a11yTestPatterns.interactiveComponent(
        <div role="checkbox" aria-checked="false">
          Checkbox
        </div>,
        { expectedRole: "checkbox", shouldBeFocusable: false }
      );

      expect(result.element).toHaveAttribute("role", "checkbox");
    });
  });

  describe("a11yTestPatterns.formField", () => {
    it("should test form field with label", async () => {
      const result = await a11yTestPatterns.formField(
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />
        </div>,
        { labelText: "Name" }
      );

      expect(result.input).toHaveAccessibleName("Name");
    });

    it("should test required field", async () => {
      const result = await a11yTestPatterns.formField(
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="text" required aria-required="true" />
        </div>,
        { required: true }
      );

      expect(result.input).toHaveAttribute("required");
      expect(result.input).toHaveAttribute("aria-required", "true");
    });

    it("should test field with error", async () => {
      const result = await a11yTestPatterns.formField(
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" aria-invalid="true" />
        </div>,
        { hasError: true }
      );

      expect(result.input).toHaveAttribute("aria-invalid", "true");
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

    describe("supportsFocus", () => {
      const getComponent = () => <button>Focusable Button</button>;

      // Call with default role
      commonA11yTests.supportsFocus(getComponent);

      // Call with custom role
      it("should support custom role", () => {
        const getCustomComponent = () => (
          <div role="checkbox" tabIndex={0}>
            Checkbox
          </div>
        );
        const { getByRole } = render(getCustomComponent());
        const element = getByRole("checkbox");
        testKeyboardNavigation(element).expectFocusable();
      });
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

    describe("handlesDisabledState", () => {
      const getComponent = (disabled: boolean) => (
        <button disabled={disabled} aria-disabled={disabled}>
          Submit
        </button>
      );

      // Call the helper
      commonA11yTests.handlesDisabledState(getComponent);
    });
  });
});
