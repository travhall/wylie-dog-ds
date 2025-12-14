import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Toggle } from '../toggle';

expect.extend(toHaveNoViolations);

describe('Toggle', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit when off', async () => {
      const { container } = render(<Toggle aria-label="Toggle bold">B</Toggle>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass accessibility audit when on', async () => {
      const { container } = render(<Toggle aria-label="Toggle bold" defaultPressed>B</Toggle>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have button role', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(<Toggle aria-label="Toggle bold">B</Toggle>);
      const toggle = screen.getByLabelText('Toggle bold');
      expect(toggle).toBeInTheDocument();
    });

    it('should have aria-pressed attribute', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed');
    });

    it('should set aria-pressed to false when not pressed', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should set aria-pressed to true when pressed', () => {
      render(<Toggle aria-label="Toggle" defaultPressed>Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should support disabled state', () => {
      render(<Toggle aria-label="Toggle" disabled>Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toBeDisabled();
    });
  });

  describe('Functionality', () => {
    it('should toggle state on click', async () => {
      const user = userEvent.setup();
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
      });

      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('should work as uncontrolled component', () => {
      render(<Toggle aria-label="Toggle" defaultPressed={false}>Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should work as controlled component', () => {
      const { rerender } = render(<Toggle aria-label="Toggle" pressed={false}>Toggle</Toggle>);

      let toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      rerender(<Toggle aria-label="Toggle" pressed={true}>Toggle</Toggle>);

      toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should call onPressedChange when toggled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Toggle aria-label="Toggle" onPressedChange={handleChange}>Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Toggle aria-label="Toggle" disabled onPressedChange={handleChange}>Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should toggle with Space key', async () => {
      const user = userEvent.setup();
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      toggle.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should toggle with Enter key', async () => {
      const user = userEvent.setup();
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      toggle.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles by default', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('bg-transparent');
    });

    it('should apply default variant styles explicitly', () => {
      render(<Toggle aria-label="Toggle" variant="default">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('bg-transparent');
    });

    it('should apply outline variant styles', () => {
      render(<Toggle aria-label="Toggle" variant="outline">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('border');
    });
  });

  describe('Sizes', () => {
    it('should apply default size by default', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-10', 'px-3');
    });

    it('should apply default size explicitly', () => {
      render(<Toggle aria-label="Toggle" size="default">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-10', 'px-3');
    });

    it('should apply small size', () => {
      render(<Toggle aria-label="Toggle" size="sm">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-9', 'px-2.5');
    });

    it('should apply large size', () => {
      render(<Toggle aria-label="Toggle" size="lg">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-11', 'px-5');
    });
  });

  describe('Styling', () => {
    it('should have base styling classes', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded-md');
    });

    it('should apply custom className', () => {
      render(<Toggle aria-label="Toggle" className="custom-class">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('custom-class');
    });

    it('should combine variant and size classes', () => {
      render(<Toggle aria-label="Toggle" variant="outline" size="lg">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('border', 'h-11', 'px-5');
    });

    it('should have pressed state styling', () => {
      render(<Toggle aria-label="Toggle" defaultPressed>Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'on');
    });

    it('should have unpressed state styling', () => {
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');
    });
  });

  describe('Integration', () => {
    it('should forward ref to toggle element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Toggle ref={ref} aria-label="Toggle">Toggle</Toggle>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should render children', () => {
      render(<Toggle aria-label="Toggle"><span>Custom Content</span></Toggle>);
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should work with icons', () => {
      render(
        <Toggle aria-label="Toggle bold">
          <svg data-testid="icon">
            <path />
          </svg>
        </Toggle>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should support data attributes', () => {
      render(<Toggle aria-label="Toggle" data-testid="my-toggle">Toggle</Toggle>);
      expect(screen.getByTestId('my-toggle')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const user = userEvent.setup();
      render(<Toggle aria-label="Toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');

      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should support additional HTML attributes', () => {
      render(<Toggle aria-label="Toggle" id="my-toggle" title="Toggle button">Toggle</Toggle>);
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('id', 'my-toggle');
      expect(toggle).toHaveAttribute('title', 'Toggle button');
    });

    it('should handle empty children gracefully', () => {
      render(<Toggle aria-label="Toggle" />);
      const toggle = screen.getByRole('button');
      expect(toggle).toBeInTheDocument();
    });

    it('should combine all props correctly', () => {
      render(
        <Toggle
          aria-label="Toggle"
          variant="outline"
          size="lg"
          className="custom"
          defaultPressed
        >
          Toggle
        </Toggle>
      );
      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('border', 'h-11', 'px-5', 'custom');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
