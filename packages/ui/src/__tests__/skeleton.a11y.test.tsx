/**
 * Skeleton Component Accessibility Tests
 * Tests for loading state announcements and screen reader support
 */

import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'
import { 
  expectToPassA11yAudit, 
  testScreenReaderAnnouncements,
  a11yTestPatterns,
  describeA11y,
  commonA11yTests
} from '../lib/test-utils'

describeA11y('Skeleton', () => {
  // Common test cases
  commonA11yTests.passesAudit(() => <Skeleton />)
  commonA11yTests.hasCorrectRole(() => <Skeleton />, 'status')

  describe('Loading State Announcements', () => {
    it('announces default loading state to screen readers', () => {
      render(<Skeleton />)
      
      const skeleton = screen.getByRole('status')
      testScreenReaderAnnouncements(skeleton, {
        role: 'status',
        ariaLive: 'polite',
        ariaLabel: 'Loading content'
      })
      
      // Check for screen reader text
      expect(screen.getByText('Loading content')).toHaveClass('sr-only')
    })

    it('supports custom loading text', () => {
      const customText = 'Loading user profile'
      render(<Skeleton loadingText={customText} />)
      
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveAttribute('aria-label', customText)
      expect(screen.getByText(customText)).toBeInTheDocument()
    })

    it('can hide loading announcements when decorative', () => {
      render(<Skeleton showLoadingText={false} />)
      
      const skeleton = screen.getByRole('status')
      expect(skeleton).not.toHaveAttribute('aria-label')
      expect(screen.queryByText('Loading content')).not.toBeInTheDocument()
    })
  })

  describe('Visual Variants', () => {
    const variants = ['default', 'text', 'circular', 'rectangular'] as const

    variants.forEach(variant => {
      it(`passes accessibility audit with ${variant} variant`, async () => {
        const { container } = render(<Skeleton variant={variant} />)
        await expectToPassA11yAudit(container)
      })
    })
  })

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const

    sizes.forEach(size => {
      it(`passes accessibility audit with ${size} size`, async () => {
        const { container } = render(<Skeleton size={size} />)
        await expectToPassA11yAudit(container)
      })
    })
  })

  describe('Common Usage Patterns', () => {
    it('works correctly in lists', async () => {
      const { container } = render(
        <div>
          <Skeleton loadingText="Loading item 1" />
          <Skeleton loadingText="Loading item 2" />
          <Skeleton loadingText="Loading item 3" />
        </div>
      )
      
      await expectToPassA11yAudit(container)
      
      // Each skeleton should have its own announcement
      expect(screen.getByLabelText('Loading item 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading item 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading item 3')).toBeInTheDocument()
    })

    it('supports loading pattern testing', async () => {
      await a11yTestPatterns.loadingState(
        <Skeleton loadingText="Loading user data" />,
        'Loading user data'
      )
    })
  })
})
