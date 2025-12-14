# Component Test Template

This template provides a standardized approach to testing components in the Wylie Dog Design System.

## Test File Structure

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { YourComponent } from '../your-component';

expect.extend(toHaveNoViolations);

describe('YourComponent', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit', async () => {
      const { container } = render(<YourComponent>Content</YourComponent>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', () => {
      // Test Tab, Enter, Space, Arrow keys as appropriate
    });

    it('should have proper ARIA attributes', () => {
      // Test aria-label, aria-labelledby, role, etc.
    });

    it('should announce state changes to screen readers', () => {
      // Test aria-live, aria-expanded, aria-selected, etc.
    });
  });

  describe('Functionality', () => {
    it('should render with default props', () => {
      render(<YourComponent>Content</YourComponent>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle user interactions', () => {
      const handleInteraction = vi.fn();
      // Test clicks, focus, blur, etc.
    });

    it('should handle disabled state', () => {
      // Test disabled behavior
    });
  });

  describe('Variants & Styling', () => {
    it('should support all variants', async () => {
      const variants = ['default', 'primary', 'secondary'] as const;
      for (const variant of variants) {
        const { container } = render(<YourComponent variant={variant}>Test</YourComponent>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should support all sizes', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const { container } = render(<YourComponent size={size}>Test</YourComponent>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      // Test with no children or empty props
    });

    it('should handle long content', () => {
      // Test with very long strings
    });

    it('should handle rapid interactions', () => {
      // Test double clicks, rapid toggling, etc.
    });
  });

  describe('Integration', () => {
    it('should work with form libraries', () => {
      // Test with react-hook-form or similar if applicable
    });

    it('should forward refs correctly', () => {
      const ref = React.createRef<HTMLElement>();
      render(<YourComponent ref={ref}>Content</YourComponent>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });
});
```

## Key Testing Principles

### 1. Accessibility First
- Every component MUST pass `axe` accessibility audit
- Test keyboard navigation (Tab, Enter, Space, Arrows, Escape)
- Verify ARIA attributes are correct
- Test with screen reader announcements in mind

### 2. User-Centric Testing
- Test from user perspective, not implementation details
- Use `getByRole`, `getByLabelText`, `getByText` (avoid `getByTestId`)
- Focus on behavior, not internal state

### 3. Comprehensive Coverage
- Test all props and variants
- Test disabled/loading/error states
- Test edge cases (empty, very long content, rapid interactions)
- Test ref forwarding

### 4. Async Handling
- Use `waitFor` for async state changes
- Use `findBy*` queries for elements that appear asynchronously
- Test loading states and transitions

### 5. Event Simulation
- Test both mouse and keyboard interactions
- Test focus management
- Test form submissions where applicable

## Common Test Patterns

### Testing Controlled Components
```typescript
it('should work as a controlled component', () => {
  const handleChange = vi.fn();
  const { rerender } = render(
    <YourComponent value="initial" onChange={handleChange} />
  );

  // Trigger change
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } });
  expect(handleChange).toHaveBeenCalledWith('new');

  // Rerender with new value
  rerender(<YourComponent value="new" onChange={handleChange} />);
  expect(screen.getByRole('textbox')).toHaveValue('new');
});
```

### Testing Keyboard Navigation
```typescript
it('should navigate with keyboard', () => {
  render(<YourComponent>Content</YourComponent>);
  const element = screen.getByRole('button');

  element.focus();
  expect(element).toHaveFocus();

  fireEvent.keyDown(element, { key: 'Enter' });
  // Assert expected behavior
});
```

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const handleAsync = vi.fn().mockResolvedValue('result');
  render(<YourComponent onSubmit={handleAsync} />);

  fireEvent.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(handleAsync).toHaveBeenCalled();
  });
});
```

### Testing Error States
```typescript
it('should display error messages', () => {
  render(<YourComponent error="Error message" />);

  const errorElement = screen.getByRole('alert');
  expect(errorElement).toHaveTextContent('Error message');
  expect(errorElement).toHaveAttribute('aria-live', 'polite');
});
```

## Coverage Targets

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

## Test Naming Conventions

- Use descriptive "should" statements
- Group related tests with `describe` blocks
- Use clear, specific test names that explain the expected behavior

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run accessibility tests only
pnpm test:a11y

# Generate coverage report
pnpm test:coverage
```

## Accessibility Test Checklist

- [ ] Passes axe audit with no violations
- [ ] Keyboard navigable (Tab, Enter, Space, Arrows)
- [ ] Proper ARIA roles and attributes
- [ ] Focus management works correctly
- [ ] Screen reader announcements are appropriate
- [ ] Disabled state is properly announced
- [ ] Error states are announced
- [ ] Works with reduced motion preferences
- [ ] Sufficient color contrast
- [ ] Touch targets are adequate size (44x44px minimum)
