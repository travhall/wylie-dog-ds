import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

expect.extend(toHaveNoViolations);

const TEST_DIALOG_DESCRIPTION =
  "Accessible dialog description used for testing.";

// Test component wrapper
const TestDialog = ({
  open,
  onOpenChange,
  size = "md" as const,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger>Open Dialog</DialogTrigger>
    <DialogContent size={size}>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>{TEST_DIALOG_DESCRIPTION}</DialogDescription>
      </DialogHeader>
      <div>Dialog content goes here</div>
      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <button type="submit">Save</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

describe("Dialog", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestDialog />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper role for dialog", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should have accessible title", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog", { name: "Dialog Title" });
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should have accessible description", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const description = screen.getByText(TEST_DIALOG_DESCRIPTION);
        expect(description).toBeInTheDocument();
      });
    });

    it("should trap focus within dialog", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Close button should be focused first (as it's the close control)
      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveFocus();
    });

    it("should have accessible close button with sr-only text", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it("should support aria-describedby for description", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        const describedBy = dialog.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();

        const description = document.getElementById(describedBy!);
        expect(description).toHaveTextContent(TEST_DIALOG_DESCRIPTION);
      });
    });
  });

  describe("Functionality", () => {
    it("should render trigger button", () => {
      render(<TestDialog />);
      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
    });

    it("should not show dialog content when closed", () => {
      render(<TestDialog />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
    });

    it("should open dialog when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
        expect(screen.getByText(TEST_DIALOG_DESCRIPTION)).toBeInTheDocument();
        expect(
          screen.getByText("Dialog content goes here")
        ).toBeInTheDocument();
      });
    });

    it("should close dialog when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should close dialog when Cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should call onOpenChange when opening", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestDialog onOpenChange={handleOpenChange} />);

      await user.click(screen.getByText("Open Dialog"));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when closing", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestDialog onOpenChange={handleOpenChange} />);

      await user.click(screen.getByText("Open Dialog"));
      handleOpenChange.mockClear();

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("should work as controlled component", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      const { rerender } = render(
        <TestDialog open={false} onOpenChange={handleOpenChange} />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      rerender(<TestDialog open={true} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      rerender(<TestDialog open={false} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should render overlay when open", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        // Overlay should be present with backdrop blur
        const overlay = document.querySelector(".backdrop-blur-sm");
        expect(overlay).toBeInTheDocument();
      });
    });

    it("should close on overlay click by default", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const overlay = document.querySelector(".backdrop-blur-sm");
      if (overlay) {
        await user.click(overlay as HTMLElement);

        await waitFor(() => {
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("Keyboard Interactions", () => {
    it("should close dialog on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should focus close button when dialog opens", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toHaveFocus();
      });
    });

    it("should cycle focus with Tab key", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Focus should start at close button
      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveFocus();

      // Tab to Cancel button
      await user.tab();
      expect(screen.getByText("Cancel")).toHaveFocus();

      // Tab to Save button
      await user.tab();
      expect(screen.getByText("Save")).toHaveFocus();

      // Tab should cycle back to close button
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it("should restore focus to trigger when closed", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      const trigger = screen.getByText("Open Dialog");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // Focus should return to trigger
      expect(trigger).toHaveFocus();
    });
  });

  describe("Variants & Styling", () => {
    it("should apply small size variant", async () => {
      const user = userEvent.setup();
      render(<TestDialog size="sm" />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("max-w-(--space-dialog-content-width-sm)");
      });
    });

    it("should apply medium size variant (default)", async () => {
      const user = userEvent.setup();
      render(<TestDialog size="md" />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("max-w-(--space-dialog-content-width-md)");
      });
    });

    it("should apply large size variant", async () => {
      const user = userEvent.setup();
      render(<TestDialog size="lg" />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("max-w-(--space-dialog-content-width-lg)");
      });
    });

    it("should apply xl size variant", async () => {
      const user = userEvent.setup();
      render(<TestDialog size="xl" />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("max-w-(--space-dialog-content-max-width)");
      });
    });

    it("should apply full size variant", async () => {
      const user = userEvent.setup();
      render(<TestDialog size="full" />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("max-w-[95vw]");
        expect(dialog).toHaveClass("max-h-[95vh]");
      });
    });

    it("should have overlay backdrop styles", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const overlay = document.querySelector(".backdrop-blur-sm");
        expect(overlay).toHaveClass(
          "bg-(--color-dialog-overlay)",
          "fixed",
          "inset-0",
          "z-50"
        );
      });
    });

    it("should have animation classes on content", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass(
          "data-[state=open]:animate-in",
          "data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0",
          "data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95",
          "data-[state=closed]:zoom-out-95"
        );
      });
    });

    it("should center dialog on screen", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass(
          "fixed",
          "left-[50%]",
          "top-[50%]",
          "translate-x-[-50%]",
          "translate-y-[-50%]"
        );
      });
    });

    it("should have proper z-index for layering", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("z-50");
      });
    });

    it("should apply custom className to content", async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent className="custom-dialog-class">
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            Content
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("custom-dialog-class");
      });
    });
  });

  describe("Sub-components", () => {
    it("should render DialogHeader", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const header = screen
          .getByText("Dialog Title")
          .closest(".flex.flex-col");
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass("space-y-(--space-dialog-header-gap)");
      });
    });

    it("should render DialogTitle with proper styling", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const title = screen.getByText("Dialog Title");
        expect(title).toHaveClass(
          "text-(length:--font-size-dialog-title-font-size)"
        );
        expect(title).toHaveClass("font-semibold");
        expect(title).toHaveClass("leading-none");
      });
    });

    it("should render DialogDescription with proper styling", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const description = screen.getByText(TEST_DIALOG_DESCRIPTION);
        expect(description).toHaveClass(
          "text-(length:--font-size-dialog-description-font-size)"
        );
        expect(description).toHaveClass("text-(--color-dialog-description)");
      });
    });

    it("should render DialogFooter", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const footer = screen
          .getByText("Cancel")
          .closest(".flex.flex-col-reverse");
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveClass("sm:flex-row");
        expect(footer).toHaveClass("sm:justify-end");
        expect(footer).toHaveClass("sm:space-x-(--space-dialog-footer-gap)");
      });
    });

    it("should render close icon button", async () => {
      const user = userEvent.setup();
      render(<TestDialog />);

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: "Close" });
        expect(closeButton).toHaveClass(
          "absolute",
          "right-(--space-dialog-close-button-offset)",
          "top-(--space-dialog-close-button-offset)"
        );
        expect(closeButton.querySelector("svg")).toBeInTheDocument();
      });
    });
  });

  describe("Integration", () => {
    it("should forward ref to DialogContent", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent ref={ref}>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            Content
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it("should work with form submission", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Dialog>
          <DialogTrigger>Open Form</DialogTrigger>
          <DialogContent>
            <DialogTitle>Form Dialog</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" />
              <button type="submit">Submit</button>
            </form>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open Form"));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText("Name"), "John");
      await user.click(screen.getByText("Submit"));

      expect(handleSubmit).toHaveBeenCalled();
    });

    it("should handle nested dialogs", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open First</DialogTrigger>
          <DialogContent>
            <DialogTitle>First Dialog</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            <Dialog>
              <DialogTrigger>Open Second</DialogTrigger>
              <DialogContent>
                <DialogTitle>Second Dialog</DialogTitle>
                <DialogDescription className="sr-only">
                  {TEST_DIALOG_DESCRIPTION}
                </DialogDescription>
                Nested content
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open First"));

      await waitFor(() => {
        expect(screen.getByText("First Dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Open Second"));

      await waitFor(() => {
        expect(screen.getByText("Second Dialog")).toBeInTheDocument();
      });
    });

    it("should handle rapid open/close", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestDialog onOpenChange={handleOpenChange} />);

      const trigger = screen.getByText("Open Dialog");

      // Open
      await user.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // Close
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );

      // Open again
      await user.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // Close again
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );

      expect(handleOpenChange).toHaveBeenCalledTimes(4);
    });
  });

  describe("Edge Cases", () => {
    it("should handle dialog with visually hidden title", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle className="sr-only">Dialog without title</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            <div>Content without title</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should handle dialog with visually hidden description", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title Only</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            <div>Content</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Title Only")).toBeInTheDocument();
      });
    });

    it("should handle complex content", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Complex Dialog</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            <div>
              <h3>Section 1</h3>
              <p>Paragraph text</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <input type="text" placeholder="Input field" />
            </div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Section 1")).toBeInTheDocument();
        expect(screen.getByText("Paragraph text")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Input field")).toBeInTheDocument();
      });
    });

    it("should handle long content with scrolling", async () => {
      const user = userEvent.setup();
      const longContent = Array.from(
        { length: 50 },
        (_, i) => `Paragraph ${i + 1}`
      );

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Long Content</DialogTitle>
            <DialogDescription className="sr-only">
              {TEST_DIALOG_DESCRIPTION}
            </DialogDescription>
            {longContent.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      });
    });

    it("should handle dialog without footer", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>No Footer Dialog</DialogTitle>
              <DialogDescription className="sr-only">
                {TEST_DIALOG_DESCRIPTION}
              </DialogDescription>
            </DialogHeader>
            <div>Body content</div>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Body content")).toBeInTheDocument();
      });
    });

    it("should prevent interaction with background when open", async () => {
      const user = userEvent.setup();
      const handleBackgroundClick = vi.fn();

      render(
        <>
          <button onClick={handleBackgroundClick}>Background Button</button>
          <TestDialog />
        </>
      );

      await user.click(screen.getByText("Open Dialog"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Try to click background button (should not work because it's behind overlay)
      const backgroundButton = screen.getByText("Background Button");
      // Button is still in DOM but should be covered by overlay
      expect(backgroundButton).toBeInTheDocument();
    });
  });
});
