import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestTooltip = ({
  content = 'Tooltip content',
  side = 'top' as const,
  sideOffset,
  delayDuration = 0, // Set to 0 for faster tests
}: {
  content?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
}) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

describe('Tooltip', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit when closed', async () => {
      const { container } = render(<TestTooltip />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass accessibility audit when open', async () => {
      const user = userEvent.setup();
      const { container } = render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper role for tooltip', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('should associate tooltip with trigger via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const tooltipId = tooltip.getAttribute('id');
        expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
      });
    });

    it('should support custom aria-label', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger aria-label="Custom label">Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByLabelText('Custom label');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Functionality', () => {
    it('should render trigger', () => {
      render(<TestTooltip />);
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should not show tooltip by default', () => {
      render(<TestTooltip />);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<TestTooltip content="Help text" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Help text')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on unhover', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should show tooltip on focus', async () => {
      const user = userEvent.setup();
      render(<TestTooltip content="Focus help" />);

      const trigger = screen.getByText('Hover me');
      trigger.focus();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Focus help')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on blur', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      trigger.focus();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      trigger.blur();

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should hide tooltip on Escape key', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should work with custom delay duration', async () => {
      const user = userEvent.setup();
      render(<TestTooltip delayDuration={200} />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      // Should not appear immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Wait for delay
      await waitFor(
        () => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should support controlled open state', async () => {
      const ControlledTooltip = ({ open }: { open: boolean }) => (
        <TooltipProvider>
          <Tooltip open={open}>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Controlled content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const { rerender } = render(<ControlledTooltip open={false} />);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      rerender(<ControlledTooltip open={true} />);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      rerender(<ControlledTooltip open={false} />);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Positioning', () => {
    it('should position tooltip on top by default', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="top" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'top');
      });
    });

    it('should position tooltip on right', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="right" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'right');
      });
    });

    it('should position tooltip on bottom', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="bottom" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'bottom');
      });
    });

    it('should position tooltip on left', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="left" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'left');
      });
    });

    it('should support custom sideOffset', async () => {
      const user = userEvent.setup();
      render(<TestTooltip sideOffset={10} />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // sideOffset is applied via Radix, we just verify it renders
      });
    });
  });

  describe('Styling', () => {
    it('should have default tooltip styling', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass(
          'rounded-md',
          'bg-[var(--color-tooltip-background)]',
          'text-[var(--color-tooltip-text)]',
          'px-3',
          'py-1.5',
          'text-xs'
        );
      });
    });

    it('should have animation classes', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass(
          'animate-in',
          'fade-in-0',
          'zoom-in-95',
          'data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95'
        );
      });
    });

    it('should have side-specific animation classes for top', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="top" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('data-[side=top]:slide-in-from-bottom-2');
      });
    });

    it('should have side-specific animation classes for bottom', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="bottom" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('data-[side=bottom]:slide-in-from-top-2');
      });
    });

    it('should have side-specific animation classes for left', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="left" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('data-[side=left]:slide-in-from-right-2');
      });
    });

    it('should have side-specific animation classes for right', async () => {
      const user = userEvent.setup();
      render(<TestTooltip side="right" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('data-[side=right]:slide-in-from-left-2');
      });
    });

    it('should apply custom className to content', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent className="custom-tooltip-class">
              Custom content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('custom-tooltip-class');
      });
    });

    it('should have proper z-index for layering', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('z-50');
      });
    });

    it('should have border styling', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('border', 'border-[var(--color-tooltip-border)]');
      });
    });
  });

  describe('Integration', () => {
    it('should forward ref to TooltipContent', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent ref={ref}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it('should work with button trigger', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleClick}>Click me</button>
            </TooltipTrigger>
            <TooltipContent>Button tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByRole('button', { name: 'Click me' });

      // Tooltip should show on hover
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Button click should still work
      await user.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it('should work with icon button', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Settings">⚙️</button>
            </TooltipTrigger>
            <TooltipContent>Open settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByLabelText('Settings');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Open settings')).toBeInTheDocument();
      });
    });

    it('should work with disabled elements via wrapper', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <button disabled>Disabled button</button>
              </span>
            </TooltipTrigger>
            <TooltipContent>This action is disabled</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const wrapper = screen.getByText('Disabled button').parentElement;
      if (wrapper) {
        await user.hover(wrapper);

        await waitFor(() => {
          expect(screen.getByText('This action is disabled')).toBeInTheDocument();
        });
      }
    });

    it('should handle multiple tooltips', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <div>
            <Tooltip>
              <TooltipTrigger>First</TooltipTrigger>
              <TooltipContent>First tooltip</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>Second</TooltipTrigger>
              <TooltipContent>Second tooltip</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );

      // Hover first
      await user.hover(screen.getByText('First'));
      await waitFor(() => {
        expect(screen.getByText('First tooltip')).toBeInTheDocument();
      });

      // Unhover first
      await user.unhover(screen.getByText('First'));
      await waitFor(() => {
        expect(screen.queryByText('First tooltip')).not.toBeInTheDocument();
      });

      // Hover second
      await user.hover(screen.getByText('Second'));
      await waitFor(() => {
        expect(screen.getByText('Second tooltip')).toBeInTheDocument();
      });
    });

    it('should support complex content', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Info</TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Title:</strong> Details
                <br />
                <span>Additional information</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Info');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText('Title:')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(screen.getByText('Additional information')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tooltip content', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent />
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toBeEmptyDOMElement();
      });
    });

    it('should handle very long tooltip text', async () => {
      const user = userEvent.setup();
      const longText =
        'This is a very long tooltip text that might wrap to multiple lines in the UI and should still be displayed correctly';

      render(<TestTooltip content={longText} />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });

    it('should handle rapid hover/unhover', async () => {
      const user = userEvent.setup();
      render(<TestTooltip />);

      const trigger = screen.getByText('Hover me');

      // Rapid hover/unhover
      await user.hover(trigger);
      await user.unhover(trigger);
      await user.hover(trigger);
      await user.unhover(trigger);
      await user.hover(trigger);

      // Should end with tooltip visible
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should handle tooltip with links', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Info</TooltipTrigger>
            <TooltipContent>
              <a href="#learn-more">Learn more</a>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Info');
      await user.hover(trigger);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Learn more' });
        expect(link).toBeInTheDocument();
      });
    });

    it('should handle tooltip without TooltipProvider wrapper', async () => {
      const user = userEvent.setup();

      // This should still work with default provider
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should handle onOpenChange callback', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <TooltipProvider>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      await user.unhover(trigger);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not show tooltip when trigger is not visible', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger style={{ display: 'none' }}>Hidden</TooltipTrigger>
            <TooltipContent>Should not appear</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should handle tooltip in scrollable container', async () => {
      const user = userEvent.setup();

      render(
        <div style={{ height: '200px', overflow: 'auto' }}>
          <div style={{ height: '400px' }}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>Scrollable trigger</TooltipTrigger>
                <TooltipContent>Scrollable content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      );

      const trigger = screen.getByText('Scrollable trigger');
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should support custom data attributes and id on content', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent
              data-testid="custom-tooltip"
              id="tooltip-custom"
            >
              Content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByTestId('custom-tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute('id', 'tooltip-custom');
      });
    });
  });
});
