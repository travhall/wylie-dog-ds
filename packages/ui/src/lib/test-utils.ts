/**
 * Accessibility Testing Utilities for Wylie Dog Design System
 * 
 * These utilities help with consistent accessibility testing across components
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations)

/**
 * Custom render function that includes accessibility testing
 */
export const renderWithA11y = async (
  ui: ReactElement,
  options?: RenderOptions
): Promise<RenderResult & { axeResults: any }> => {
  const result = render(ui, options)
  const axeResults = await axe(result.container)
  
  return {
    ...result,
    axeResults
  }
}

/**
 * Test that a component passes basic accessibility audit
 */
export const expectToPassA11yAudit = async (container: HTMLElement) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

/**
 * Test keyboard navigation for interactive elements
 */
export const testKeyboardNavigation = (element: HTMLElement) => {
  // Test that element can receive focus
  element.focus()
  expect(element).toHaveFocus()
  
  return {
    expectFocusable: () => expect(element).toHaveFocus(),
    expectNotFocusable: () => expect(element).not.toHaveFocus()
  }
}

/**
 * Test ARIA attributes are properly set
 */
export const testAriaAttributes = (
  element: HTMLElement,
  expectedAttributes: Record<string, string | boolean | null>
) => {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    if (value === null) {
      expect(element).not.toHaveAttribute(attr)
    } else if (typeof value === 'boolean') {
      expect(element).toHaveAttribute(attr, value.toString())
    } else {
      expect(element).toHaveAttribute(attr, value)
    }
  })
}

/**
 * Test screen reader announcements
 */
export const testScreenReaderAnnouncements = (
  element: HTMLElement,
  expectedAnnouncements: {
    role?: string
    ariaLive?: 'polite' | 'assertive' | 'off'
    ariaLabel?: string 
    ariaDescribedBy?: string
    ariaLabelledBy?: string
  }
) => {
  const { role, ariaLive, ariaLabel, ariaDescribedBy, ariaLabelledBy } = expectedAnnouncements
  
  if (role) expect(element).toHaveAttribute('role', role)
  if (ariaLive) expect(element).toHaveAttribute('aria-live', ariaLive)
  if (ariaLabel) expect(element).toHaveAttribute('aria-label', ariaLabel)
  if (ariaDescribedBy) expect(element).toHaveAttribute('aria-describedby', ariaDescribedBy)
  if (ariaLabelledBy) expect(element).toHaveAttribute('aria-labelledby', ariaLabelledBy)
}

/**
 * Common accessibility test patterns
 */
export const a11yTestPatterns = {
  /**
   * Test basic interactive component accessibility
   */
  interactiveComponent: async (
    component: ReactElement,
    options?: {
      expectedRole?: string  
      shouldBeFocusable?: boolean
      keyboardActivation?: boolean
    }
  ) => {
    const { expectedRole = 'button', shouldBeFocusable = true, keyboardActivation = true } = options || {}
    
    const { container, getByRole } = render(component)
    
    // Test accessibility audit
    await expectToPassA11yAudit(container)
    
    // Test role and focusability
    const element = getByRole(expectedRole)
    
    if (shouldBeFocusable) {
      testKeyboardNavigation(element).expectFocusable()
    }
    
    if (keyboardActivation) {
      // Test Enter and Space key activation
      const mockFn = vi.fn()
      element.onclick = mockFn
      
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      
      // Note: This is a basic test - component-specific tests should verify actual event handling
    }
    
    return { container, element }
  },

  /**
   * Test form field accessibility
   */
  formField: async (
    component: ReactElement,
    options?: {
      labelText?: string
      required?: boolean
      hasError?: boolean
      hasDescription?: boolean
    }
  ) => {
    const { container, getByRole, queryByText } = render(component)
    
    // Test accessibility audit
    await expectToPassA11yAudit(container)
    
    // Test form field basics
    const input = getByRole('textbox') || getByRole('combobox') || getByRole('spinbutton')
    
    // Test labeling
    if (options?.labelText) {
      expect(input).toHaveAccessibleName(options.labelText)
    }
    
    // Test required state
    if (options?.required) {
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('aria-required', 'true')
    }
    
    // Test error state
    if (options?.hasError) {
      expect(input).toHaveAttribute('aria-invalid', 'true')
    }
    
    return { container, input }
  },

  /**
   * Test loading state accessibility
   */
  loadingState: async (
    component: ReactElement,
    expectedLoadingText?: string
  ) => {
    const { container, getByRole } = render(component)
    
    // Test accessibility audit
    await expectToPassA11yAudit(container)
    
    // Test loading announcement
    const loadingElement = getByRole('status')
    
    if (expectedLoadingText) {
      expect(loadingElement).toHaveAttribute('aria-label', expectedLoadingText)
    }
    
    return { container, loadingElement }
  }
}

/**
 * Higher-order test function for component accessibility
 */
export const describeA11y = (
  componentName: string,
  testFn: () => void
) => {
  describe(`${componentName} Accessibility`, testFn)
}

/**
 * Common test cases that can be reused across components
 */
export const commonA11yTests = {
  passesAudit: (getComponent: () => ReactElement) => {
    it('passes accessibility audit', async () => {
      const { container } = render(getComponent())
      await expectToPassA11yAudit(container)
    })
  },

  supportsFocus: (getComponent: () => ReactElement, expectedRole: string = 'button') => {
    it('supports keyboard focus', () => {
      const { getByRole } = render(getComponent())
      const element = getByRole(expectedRole)
      testKeyboardNavigation(element).expectFocusable()
    })
  },

  hasCorrectRole: (getComponent: () => ReactElement, expectedRole: string) => {
    it(`has correct ARIA role: ${expectedRole}`, () => {
      const { getByRole } = render(getComponent())
      expect(getByRole(expectedRole)).toBeInTheDocument()
    })
  },

  handlesDisabledState: (getComponent: (disabled: boolean) => ReactElement) => {
    it('properly handles disabled state', async () => {
      const { container, getByRole } = render(getComponent(true))
      
      const element = getByRole('button', { hidden: true }) // disabled elements may be hidden from a11y tree
      expect(element).toBeDisabled()
      expect(element).toHaveAttribute('aria-disabled', 'true')
      
      await expectToPassA11yAudit(container)
    })
  }
}
