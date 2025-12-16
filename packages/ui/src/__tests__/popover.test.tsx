import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestPopover = ({
  open,
  onOpenChange,
  side = "bottom" as const,
  sideOffset,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger>Open Popover</PopoverTrigger>
    <PopoverContent side={side} sideOffset={sideOffset}>
      <div>
        <h3>Popover Heading</h3>
        <p>This is the popover content</p>
      </div>
    </PopoverContent>
  </Popover>
);

describe("Popover", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestPopover />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper aria-expanded state", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      const trigger = screen.getByText("Open Popover");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should have proper aria-haspopup attribute", () => {
      render(<TestPopover />);

      const trigger = screen.getByText("Open Popover");
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("should have proper aria-controls association", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      const trigger = screen.getByText("Open Popover");
      await user.click(trigger);

      await waitFor(() => {
        const controlsId = trigger.getAttribute("aria-controls");
        expect(controlsId).toBeTruthy();

        const content = document.getElementById(controlsId!);
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe("Functionality", () => {
    it("should render trigger", () => {
      render(<TestPopover />);
      expect(screen.getByText("Open Popover")).toBeInTheDocument();
    });

    it("should not show popover content when closed", () => {
      render(<TestPopover />);
      expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();
    });

    it("should show popover on trigger click", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      const trigger = screen.getByText("Open Popover");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
        expect(
          screen.getByText("This is the popover content")
        ).toBeInTheDocument();
      });
    });

    it("should close popover on trigger click when open", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      const trigger = screen.getByText("Open Popover");

      // Open
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });

      // Close
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();
      });
    });

    it("should call onOpenChange when opening", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestPopover onOpenChange={handleOpenChange} />);

      await user.click(screen.getByText("Open Popover"));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when closing", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestPopover onOpenChange={handleOpenChange} />);

      const trigger = screen.getByText("Open Popover");

      await user.click(trigger);
      handleOpenChange.mockClear();

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });

      await user.click(trigger);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("should work as controlled component", async () => {
      const handleOpenChange = vi.fn();
      const { rerender } = render(
        <TestPopover open={false} onOpenChange={handleOpenChange} />
      );

      expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();

      rerender(<TestPopover open={true} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });

      rerender(<TestPopover open={false} onOpenChange={handleOpenChange} />);

      await waitFor(() => {
        expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();
      });
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();
      });
    });

    it("should close when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Outside Button</button>
          <TestPopover />
        </div>
      );

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Outside Button"));

      await waitFor(() => {
        expect(screen.queryByText("Popover Heading")).not.toBeInTheDocument();
      });
    });
  });

  describe("Positioning", () => {
    it("should position popover on bottom by default", async () => {
      const user = userEvent.setup();
      render(<TestPopover side="bottom" />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content = screen
          .getByText("Popover Heading")
          .closest("[data-side]");
        expect(content).toHaveAttribute("data-side", "bottom");
      });
    });

    it("should position popover on top", async () => {
      const user = userEvent.setup();
      render(<TestPopover side="top" />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content = screen
          .getByText("Popover Heading")
          .closest("[data-side]");
        expect(content).toHaveAttribute("data-side", "top");
      });
    });

    it("should position popover on right", async () => {
      const user = userEvent.setup();
      render(<TestPopover side="right" />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(
        () => {
          const heading = screen.getByText("Popover Heading");
          const content = heading.closest("[data-side]");
          expect(content).not.toBeNull();
          expect(content).toHaveAttribute("data-side", "right");
        },
        { timeout: 3000 }
      );
    });

    it("should position popover on left", async () => {
      const user = userEvent.setup();
      render(<TestPopover side="left" />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content = screen
          .getByText("Popover Heading")
          .closest("[data-side]");
        expect(content).toHaveAttribute("data-side", "left");
      });
    });

    it("should support custom sideOffset", async () => {
      const user = userEvent.setup();
      render(<TestPopover sideOffset={16} />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        expect(screen.getByText("Popover Heading")).toBeInTheDocument();
      });
    });
  });

  describe("Styling", () => {
    it("should have default popover styling", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content = screen
          .getByText("Popover Heading")
          .closest('[class*="rounded-md"]');
        expect(content).toHaveClass("rounded-md");
        expect(content).toHaveClass("border");
        expect(content).toHaveClass("bg-[var(--color-popover-background)]");
        expect(content).toHaveClass("p-4");
      });
    });

    it("should have animation classes", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content =
          screen.getByText("Popover Heading").parentElement?.parentElement;
        expect(content).toHaveClass("data-[state=open]:animate-in");
        expect(content).toHaveClass("data-[state=closed]:animate-out");
        expect(content).toHaveClass("data-[state=open]:fade-in-0");
        expect(content).toHaveClass("data-[state=closed]:fade-out-0");
      });
    });

    it("should have side-specific animation classes", async () => {
      const user = userEvent.setup();
      render(<TestPopover side="top" />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content =
          screen.getByText("Popover Heading").parentElement?.parentElement;
        expect(content).toHaveClass("data-[side=top]:slide-in-from-bottom-2");
      });
    });

    it("should apply custom className", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent className="custom-popover-class">
            Custom content
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(
        () => {
          const content = screen.getByText("Custom content").parentElement;
          expect(content).toHaveClass("custom-popover-class");
        },
        { timeout: 3000 }
      );
    });

    it("should have proper z-index", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content =
          screen.getByText("Popover Heading").parentElement?.parentElement;
        expect(content).toHaveClass("z-50");
      });
    });

    it("should have fixed width", async () => {
      const user = userEvent.setup();
      render(<TestPopover />);

      await user.click(screen.getByText("Open Popover"));

      await waitFor(() => {
        const content =
          screen.getByText("Popover Heading").parentElement?.parentElement;
        expect(content).toHaveClass("w-72");
      });
    });
  });

  describe("Integration", () => {
    it("should forward ref to PopoverContent", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent ref={ref}>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it("should work with interactive content", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <button onClick={handleClick}>Action Button</button>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Action Button")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Action Button"));

      expect(handleClick).toHaveBeenCalled();
    });

    it("should work with form elements", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Popover>
          <PopoverTrigger>Open Form</PopoverTrigger>
          <PopoverContent>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" />
              <button type="submit">Submit</button>
            </form>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open Form"));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText("Name"), "John");
      await user.click(screen.getByText("Submit"));

      expect(handleSubmit).toHaveBeenCalled();
    });

    it("should handle rapid open/close", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestPopover onOpenChange={handleOpenChange} />);

      const trigger = screen.getByText("Open Popover");

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should toggle 4 times
      expect(handleOpenChange).toHaveBeenCalledTimes(4);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty popover content", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent />
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        const content = document.querySelector('[data-state="open"]');
        expect(content).toBeInTheDocument();
      });
    });

    it("should handle very long content", async () => {
      const user = userEvent.setup();
      const longText = Array.from(
        { length: 50 },
        (_, i) => `Line ${i + 1}`
      ).join("\n");

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>{longText}</div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(
        () => {
          // Text joined with \n is broken up, use regex matcher
          expect(screen.getByText(/Line 1/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should handle complex nested content", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Title</h3>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <button>Action</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Action")).toBeInTheDocument();
      });
    });

    it("should handle custom trigger element", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button className="custom-button">Custom Trigger</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole("button", { name: "Custom Trigger" });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Content")).toBeInTheDocument();
      });
    });

    it("should not close when clicking inside popover", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>
              <p>Content</p>
              <button>Inside Button</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Content")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Inside Button"));

      // Popover should still be open
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should handle multiple popovers independently", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Popover>
            <PopoverTrigger>Open First</PopoverTrigger>
            <PopoverContent>First Content</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Open Second</PopoverTrigger>
            <PopoverContent>Second Content</PopoverContent>
          </Popover>
        </div>
      );

      await user.click(screen.getByText("Open First"));

      await waitFor(() => {
        expect(screen.getByText("First Content")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Open Second"));

      await waitFor(() => {
        expect(screen.getByText("Second Content")).toBeInTheDocument();
      });
    });

    it("should support align prop", async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent align="start">Aligned Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        const content = screen
          .getByText("Aligned Content")
          .closest("[data-align]");
        expect(content).toHaveAttribute("data-align", "start");
      });
    });
  });
});
