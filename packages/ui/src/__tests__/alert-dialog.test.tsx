import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog';

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestAlertDialog = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

describe('AlertDialog', () => {
  describe('Accessibility', () => {
    it('should pass accessibility audit when closed', async () => {
      const { container } = render(<TestAlertDialog />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper role for alert dialog', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should have accessible title', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog', {
          name: 'Are you absolutely sure?',
        });
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should have accessible description', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const description = screen.getByText(
          /This action cannot be undone/
        );
        expect(description).toBeInTheDocument();
      });
    });

    it('should support aria-describedby for description', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        const describedBy = dialog.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const description = document.getElementById(describedBy!);
        expect(description).toHaveTextContent(
          /This action cannot be undone/
        );
      });
    });
  });

  describe('Functionality', () => {
    it('should render trigger button', () => {
      render(<TestAlertDialog />);
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    it('should not show dialog content when closed', () => {
      render(<TestAlertDialog />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Are you absolutely sure?')
      ).not.toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(
          screen.getByText('Are you absolutely sure?')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/This action cannot be undone/)
        ).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when action is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when opening', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestAlertDialog onOpenChange={handleOpenChange} />);

      await user.click(screen.getByText('Delete Account'));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should call onOpenChange when closing via cancel', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestAlertDialog onOpenChange={handleOpenChange} />);

      await user.click(screen.getByText('Delete Account'));
      handleOpenChange.mockClear();

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('should work as controlled component', async () => {
      const handleOpenChange = vi.fn();
      const { rerender } = render(
        <TestAlertDialog open={false} onOpenChange={handleOpenChange} />
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

      rerender(<TestAlertDialog open={true} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      rerender(<TestAlertDialog open={false} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should render overlay when open', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const overlay = document.querySelector('[data-state="open"]');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should execute action callback', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAction}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Confirm'));

      expect(handleAction).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should close dialog on Escape key', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should restore focus to trigger when closed', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      const trigger = screen.getByText('Delete Account');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      expect(trigger).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('should have overlay backdrop styles', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const overlay = document.querySelector(
          '[class*="bg-[var(--color-dialog-overlay)]"]'
        );
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should have animation classes on content', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toHaveClass('data-[state=open]:animate-in');
        expect(dialog).toHaveClass('data-[state=closed]:animate-out');
      });
    });

    it('should center dialog on screen', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toHaveClass('fixed');
        expect(dialog).toHaveClass('left-[50%]');
        expect(dialog).toHaveClass('top-[50%]');
        expect(dialog).toHaveClass('translate-x-[-50%]');
        expect(dialog).toHaveClass('translate-y-[-50%]');
      });
    });

    it('should apply custom className to content', async () => {
      const user = userEvent.setup();
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent className="custom-alert-class">
            <AlertDialogTitle>Title</AlertDialogTitle>
            Content
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toHaveClass('custom-alert-class');
      });
    });
  });

  describe('Sub-components', () => {
    it('should render AlertDialogHeader', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const header = screen
          .getByText('Are you absolutely sure?')
          .closest('.flex.flex-col');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass('space-y-2');
      });
    });

    it('should render AlertDialogTitle with proper styling', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const title = screen.getByText('Are you absolutely sure?');
        expect(title).toHaveClass('text-lg');
        expect(title).toHaveClass('font-semibold');
      });
    });

    it('should render AlertDialogDescription with proper styling', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const description = screen.getByText(/This action cannot be undone/);
        expect(description).toHaveClass('text-sm');
      });
    });

    it('should render AlertDialogFooter', async () => {
      const user = userEvent.setup();
      render(<TestAlertDialog />);

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        const footer = screen.getByText('Cancel').closest('.flex.flex-col-reverse');
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveClass('sm:flex-row');
        expect(footer).toHaveClass('sm:justify-end');
      });
    });
  });

  describe('Integration', () => {
    it('should forward ref to AlertDialogContent', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent ref={ref}>
            <AlertDialogTitle>Title</AlertDialogTitle>
            Content
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it('should handle destructive actions', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Delete Item'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Yes, delete'));

      expect(handleDelete).toHaveBeenCalled();
    });

    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestAlertDialog onOpenChange={handleOpenChange} />);

      const trigger = screen.getByText('Delete Account');

      // Open
      await user.click(trigger);
      await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument());

      // Close
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      );

      // Open again
      await user.click(trigger);
      await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument());

      // Close again
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      );

      expect(handleOpenChange).toHaveBeenCalledTimes(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dialog without description', async () => {
      const user = userEvent.setup();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title Only</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText('Title Only')).toBeInTheDocument();
      });
    });

    it('should handle dialog without header', async () => {
      const user = userEvent.setup();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent aria-label="Confirmation dialog">
            <div>Simple confirmation</div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog', {
          name: 'Confirmation dialog',
        });
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should handle long content', async () => {
      const user = userEvent.setup();
      const longText = Array.from({ length: 20 }, (_, i) => `Paragraph ${i + 1}.`).join(
        ' '
      );

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Long Content</AlertDialogTitle>
            <AlertDialogDescription>{longText}</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/Paragraph 1/)).toBeInTheDocument();
      });
    });

    it('should handle custom action buttons', async () => {
      const user = userEvent.setup();
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Multiple Actions</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSecondary}>
                Secondary
              </AlertDialogAction>
              <AlertDialogAction onClick={handlePrimary}>Primary</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Secondary'));

      expect(handleSecondary).toHaveBeenCalled();
    });

    it('should prevent interaction with background when open', async () => {
      const user = userEvent.setup();
      const handleBackgroundClick = vi.fn();

      render(
        <>
          <button onClick={handleBackgroundClick}>Background Button</button>
          <TestAlertDialog />
        </>
      );

      await user.click(screen.getByText('Delete Account'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const backgroundButton = screen.getByText('Background Button');
      expect(backgroundButton).toBeInTheDocument();
    });

    it('should handle missing footer', async () => {
      const user = userEvent.setup();

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>No Footer</AlertDialogTitle>
            <AlertDialogDescription>Content only</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText('Content only')).toBeInTheDocument();
      });
    });
  });
});
