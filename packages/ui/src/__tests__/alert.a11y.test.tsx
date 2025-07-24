/**
 * Alert Component Accessibility Tests
 * Tests for smart urgency handling and proper ARIA announcements
 */

import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'
import { 
  expectToPassA11yAudit, 
  testScreenReaderAnnouncements,
  describeA11y,
  commonA11yTests
} from '../lib/test-utils'

describeA11y('Alert', () => {
  // Basic accessibility tests
  commonA11yTests.passesAudit(() => 
    <Alert>
      <AlertTitle>Test Alert</AlertTitle>
      <AlertDescription>Test description</AlertDescription>
    </Alert>
  )

  describe('Smart Urgency Handling', () => {
    it('uses high urgency for destructive alerts', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Critical Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      testScreenReaderAnnouncements(alert, {
        role: 'alert',
        ariaLive: 'assertive'
      })
    })

    it('uses high urgency for warning alerts', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please be careful</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      testScreenReaderAnnouncements(alert, {
        role: 'alert',
        ariaLive: 'polite'
      })
    })

    it('uses medium urgency for success alerts', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('status')
      testScreenReaderAnnouncements(alert, {
        role: 'status',
        ariaLive: 'polite'
      })
    })

    it('uses low urgency for default alerts', () => {
      render(
        <Alert variant="default">
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>General information</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('region')
      testScreenReaderAnnouncements(alert, {
        role: 'region',
        ariaLive: 'off'
      })
    })

    it('allows role override for custom urgency', () => {
      render(
        <Alert variant="default" role="alert">
          <AlertTitle>Custom Alert</AlertTitle>
          <AlertDescription>Custom urgency handling</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).not.toHaveAttribute('aria-live')
    })
  })

  describe('Alert Structure', () => {
    it('properly structures alert with title and description', async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test description with more details</AlertDescription>
        </Alert>
      )
      
      await expectToPassA11yAudit(container)
      
      // Check title is a heading
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title.tagName).toBe('H5')
      
      // Check description exists
      expect(screen.getByText('Test description with more details')).toBeInTheDocument()
    })

    it('works with title only', async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title Only Alert</AlertTitle>
        </Alert>
      )
      
      await expectToPassA11yAudit(container)
      expect(screen.getByRole('heading', { name: 'Title Only Alert' })).toBeInTheDocument()
    })

    it('works with description only', async () => {
      const { container } = render(
        <Alert>
          <AlertDescription>Description only alert</AlertDescription>
        </Alert>
      )
      
      await expectToPassA11yAudit(container)
      expect(screen.getByText('Description only alert')).toBeInTheDocument()
    })
  })

  describe('All Variants', () => {
    const variants = ['default', 'destructive', 'warning', 'success'] as const

    variants.forEach(variant => {
      it(`passes accessibility audit with ${variant} variant`, async () => {
        const { container } = render(
          <Alert variant={variant}>
            <AlertTitle>Test Alert</AlertTitle>
            <AlertDescription>Test description</AlertDescription>
          </Alert>
        )
        
        await expectToPassA11yAudit(container)
      })
    })
  })

  describe('Real-world Usage Patterns', () => {
    it('handles form validation errors', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            Please correct the following errors:
            <ul>
              <li>Email is required</li>
              <li>Password must be at least 8 characters</li>
            </ul>
          </AlertDescription>
        </Alert>
      )
      
      await expectToPassA11yAudit(container)
      
      // Should interrupt screen reader for critical validation errors
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('handles success notifications', async () => {
      const { container } = render(
        <Alert variant="success">
          <AlertTitle>Changes Saved</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      )
      
      await expectToPassA11yAudit(container)
      
      // Should announce politely for success messages
      const alert = screen.getByRole('status')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })
  })
})
