/**
 * Accessibility Testing Utilities for Wylie Dog Design System
 *
 * These utilities help with consistent accessibility testing across components
 */

import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { axe, toHaveNoViolations } from "jest-axe";

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

/**
 * Test that a component passes basic accessibility audit
 */
export const expectToPassA11yAudit = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * Test screen reader announcements
 */
export const testScreenReaderAnnouncements = (
  element: HTMLElement,
  expectedAnnouncements: {
    role?: string;
    ariaLive?: "polite" | "assertive" | "off";
    ariaLabel?: string;
    ariaDescribedBy?: string;
    ariaLabelledBy?: string;
  }
) => {
  const { role, ariaLive, ariaLabel, ariaDescribedBy, ariaLabelledBy } =
    expectedAnnouncements;

  if (role) expect(element).toHaveAttribute("role", role);
  if (ariaLive) expect(element).toHaveAttribute("aria-live", ariaLive);
  if (ariaLabel) expect(element).toHaveAttribute("aria-label", ariaLabel);
  if (ariaDescribedBy)
    expect(element).toHaveAttribute("aria-describedby", ariaDescribedBy);
  if (ariaLabelledBy)
    expect(element).toHaveAttribute("aria-labelledby", ariaLabelledBy);
};

/**
 * Common accessibility test patterns
 */
export const a11yTestPatterns = {
  /**
   * Test loading state accessibility
   */
  loadingState: async (
    component: ReactElement,
    expectedLoadingText?: string
  ) => {
    const { container, getByRole } = render(component);

    // Test accessibility audit
    await expectToPassA11yAudit(container);

    // Test loading announcement
    const loadingElement = getByRole("status");

    if (expectedLoadingText) {
      expect(loadingElement).toHaveAttribute("aria-label", expectedLoadingText);
    }

    return { container, loadingElement };
  },
};

/**
 * Higher-order test function for component accessibility
 */
export const describeA11y = (componentName: string, testFn: () => void) => {
  describe(`${componentName} Accessibility`, testFn);
};

/**
 * Common test cases that can be reused across components
 */
export const commonA11yTests = {
  passesAudit: (getComponent: () => ReactElement) => {
    it("passes accessibility audit", async () => {
      const { container } = render(getComponent());
      await expectToPassA11yAudit(container);
    });
  },

  hasCorrectRole: (getComponent: () => ReactElement, expectedRole: string) => {
    it(`has correct ARIA role: ${expectedRole}`, () => {
      const { getByRole } = render(getComponent());
      expect(getByRole(expectedRole)).toBeInTheDocument();
    });
  },
};
