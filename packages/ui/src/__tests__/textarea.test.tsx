import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { Textarea } from '../textarea';

expect.extend(toHaveNoViolations);

describe('Textarea', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit', async () => {
      const { container } = render(
        <Textarea aria-label="Test textarea" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass accessibility audit with error state', async () => {
      const { container } = render(
        <Textarea
          aria-label="Test textarea"
          error
          errorId="textarea-error"
          aria-describedby="textarea-error"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass accessibility audit with description', async () => {
      const { container } = render(
        <div>
          <Textarea
            aria-label="Test textarea"
            descriptionId="textarea-description"
            aria-describedby="textarea-description"
          />
          <span id="textarea-description">Enter your message here</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have aria-invalid when error is true', () => {
      render(<Textarea aria-label="Test" error />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is false', () => {
      render(<Textarea aria-label="Test" error={false} />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should support aria-describedby with errorId only', () => {
      render(
        <Textarea
          aria-label="Test"
          errorId="error-message"
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('should support aria-describedby with descriptionId only', () => {
      render(
        <Textarea
          aria-label="Test"
          descriptionId="helper-text"
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('should combine errorId and descriptionId in aria-describedby', () => {
      render(
        <Textarea
          aria-label="Test"
          descriptionId="helper-text"
          errorId="error-message"
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text error-message');
    });

    it('should be keyboard navigable', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });

      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Textarea aria-label="Test" disabled />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });

      expect(textarea).toBeDisabled();
    });
  });

  describe('Functionality', () => {
    it('should render with placeholder', () => {
      render(
        <Textarea
          aria-label="Test"
          placeholder="Enter text here"
        />
      );
      const textarea = screen.getByPlaceholderText('Enter text here');
      expect(textarea).toBeInTheDocument();
    });

    it('should accept text input', () => {
      render(<Textarea aria-label="Test" defaultValue="" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: 'Hello, World!' } });
      expect(textarea.value).toBe('Hello, World!');
    });

    it('should work as controlled component', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Textarea
          aria-label="Test"
          value="Initial"
          onChange={handleChange}
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: 'Updated' } });
      expect(handleChange).toHaveBeenCalled();

      rerender(
        <Textarea
          aria-label="Test"
          value="Updated"
          onChange={handleChange}
        />
      );
      expect(textarea.value).toBe('Updated');
    });

    it('should work as uncontrolled component with defaultValue', () => {
      render(
        <Textarea
          aria-label="Test"
          defaultValue="Initial value"
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial value');
    });

    it('should not accept input when disabled', () => {
      const handleChange = vi.fn();
      render(
        <Textarea
          aria-label="Test"
          disabled
          onChange={handleChange}
          value=""
          readOnly
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;

      // With disabled and readOnly, the textarea should not change value
      fireEvent.change(textarea, { target: { value: 'New text' } });
      expect(textarea).toBeDisabled();
      expect(textarea.value).toBe('');
    });

    it('should handle focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(
        <Textarea
          aria-label="Test"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' });

      fireEvent.focus(textarea);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(textarea);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(
        <Textarea
          aria-label="Test"
          onClick={handleClick}
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' });

      fireEvent.click(textarea);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply error styling when error prop is true', () => {
      render(<Textarea aria-label="Test" error />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('border-[var(--color-input-border-error)]');
    });

    it('should apply normal styling when error prop is false', () => {
      render(<Textarea aria-label="Test" error={false} />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('border-[var(--color-input-border)]');
    });
  });

  describe('Variants & Styling', () => {
    it('should support all size variants', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Textarea aria-label="Test" size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<Textarea aria-label="Test" size="sm" />);
      let textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('min-h-[80px]', 'text-xs');

      rerender(<Textarea aria-label="Test" size="md" />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('min-h-[100px]', 'text-sm');

      rerender(<Textarea aria-label="Test" size="lg" />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('min-h-[120px]', 'text-base');
    });

    it('should support all resize variants', async () => {
      const resizeTypes = ['none', 'both', 'horizontal', 'vertical'] as const;

      for (const resize of resizeTypes) {
        const { container, unmount } = render(
          <Textarea aria-label="Test" resize={resize} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it('should apply resize classes correctly', () => {
      const { rerender } = render(<Textarea aria-label="Test" resize="none" />);
      let textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('resize-none');

      rerender(<Textarea aria-label="Test" resize="both" />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('resize');

      rerender(<Textarea aria-label="Test" resize="horizontal" />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('resize-x');

      rerender(<Textarea aria-label="Test" resize="vertical" />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('resize-y');
    });

    it('should have default resize set to vertical', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('resize-y');
    });

    it('should have default size set to md', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('min-h-[100px]', 'text-sm');
    });

    it('should accept custom className', () => {
      render(<Textarea aria-label="Test" className="custom-class" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('custom-class');
    });

    it('should have focus styles', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('focus:ring-2');
      expect(textarea).toHaveClass('focus:outline-none');
    });

    it('should have disabled styles', () => {
      render(<Textarea aria-label="Test" disabled />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('should have hover styles when not in error state', () => {
      render(<Textarea aria-label="Test" error={false} />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('hover:bg-[var(--color-input-background-hover)]');
    });

    it('should have transition class', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('transition-colors');
    });
  });

  describe('Integration', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} aria-label="Test" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current?.tagName).toBe('TEXTAREA');
    });

    it('should allow focus via ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} aria-label="Test" />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('should support HTML textarea attributes', () => {
      render(
        <Textarea
          aria-label="Test"
          id="test-textarea"
          name="message"
          data-testid="custom-textarea"
          maxLength={500}
          minLength={10}
          cols={40}
          rows={5}
        />
      );

      const textarea = screen.getByTestId('custom-textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('minlength', '10');
      expect(textarea).toHaveAttribute('cols', '40');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should work with label element', () => {
      render(
        <div>
          <label htmlFor="message">Message</label>
          <Textarea id="message" aria-label="Message" />
        </div>
      );

      const textarea = screen.getByRole('textbox', { name: 'Message' });
      expect(textarea).toHaveAttribute('id', 'message');
    });

    it('should work with error message association', () => {
      render(
        <div>
          <Textarea
            aria-label="Password"
            error
            errorId="password-error"
            aria-describedby="password-error"
          />
          <span id="password-error" role="alert">
            Password must be at least 8 characters
          </span>
        </div>
      );

      const textarea = screen.getByRole('textbox', { name: 'Password' });
      const errorMessage = screen.getByText('Password must be at least 8 characters');

      expect(textarea).toHaveAttribute('aria-describedby', 'password-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should work with helper text association', () => {
      render(
        <div>
          <Textarea
            aria-label="Bio"
            descriptionId="bio-helper"
            aria-describedby="bio-helper"
          />
          <span id="bio-helper">Maximum 500 characters</span>
        </div>
      );

      const textarea = screen.getByRole('textbox', { name: 'Bio' });
      const helperText = screen.getByText('Maximum 500 characters');

      expect(textarea).toHaveAttribute('aria-describedby', 'bio-helper');
      expect(helperText).toBeInTheDocument();
    });

    it('should work with both error and description IDs', () => {
      render(
        <div>
          <Textarea
            aria-label="Review"
            descriptionId="review-help"
            errorId="review-error"
            aria-describedby="review-help review-error"
          />
          <span id="review-help">Share your experience</span>
          <span id="review-error" role="alert">Error: Text is too short</span>
        </div>
      );

      const textarea = screen.getByRole('textbox', { name: 'Review' });
      expect(textarea).toHaveAttribute('aria-describedby', 'review-help review-error');
    });

    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Textarea
            aria-label="Message"
            name="message"
            defaultValue="Hello"
          />
          <button type="submit">Send</button>
        </form>
      );

      const submitButton = screen.getByRole('button', { name: 'Send' });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text input', () => {
      const longText = 'A'.repeat(5000);
      render(
        <Textarea
          aria-label="Test"
          defaultValue={longText}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle multiline text input', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      render(
        <Textarea
          aria-label="Test"
          defaultValue={multilineText}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });

    it('should handle empty textarea', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle rapid input changes', () => {
      const handleChange = vi.fn();
      render(
        <Textarea
          aria-label="Test"
          onChange={handleChange}
        />
      );
      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;

      for (let i = 0; i < 100; i++) {
        fireEvent.change(textarea, { target: { value: `Text ${i}` } });
      }

      expect(handleChange).toHaveBeenCalledTimes(100);
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:",.<>?/`~';
      render(
        <Textarea
          aria-label="Test"
          defaultValue={specialText}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا بالعالم';
      render(
        <Textarea
          aria-label="Test"
          defaultValue={unicodeText}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(unicodeText);
    });

    it('should handle error and size together', () => {
      render(
        <Textarea
          aria-label="Test"
          error
          size="lg"
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('border-[var(--color-input-border-error)]');
      expect(textarea).toHaveClass('min-h-[120px]');
    });

    it('should handle error and resize together', () => {
      render(
        <Textarea
          aria-label="Test"
          error
          resize="none"
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('border-[var(--color-input-border-error)]');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should handle all props together', () => {
      render(
        <Textarea
          aria-label="Test"
          error
          size="lg"
          resize="horizontal"
          errorId="error-id"
          descriptionId="desc-id"
          placeholder="Enter text"
          maxLength={1000}
          disabled
          className="custom-class"
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveClass('border-[var(--color-input-border-error)]');
      expect(textarea).toHaveClass('min-h-[120px]');
      expect(textarea).toHaveClass('resize-x');
      expect(textarea).toHaveAttribute('aria-describedby', 'desc-id error-id');
      expect(textarea).toHaveAttribute('placeholder', 'Enter text');
      expect(textarea).toHaveAttribute('maxlength', '1000');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('custom-class');
    });

    it('should handle empty errorId and descriptionId', () => {
      render(
        <Textarea
          aria-label="Test"
          errorId=""
          descriptionId=""
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test' });
      // Empty strings should not create aria-describedby
      expect(textarea).not.toHaveAttribute('aria-describedby');
    });

    it('should handle dynamic error state changes', () => {
      const { rerender } = render(
        <Textarea aria-label="Test" error={false} />
      );
      let textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-invalid', 'false');

      rerender(<Textarea aria-label="Test" error={true} />);
      textarea = screen.getByRole('textbox', { name: 'Test' });
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('border-[var(--color-input-border-error)]');
    });
  });
});
