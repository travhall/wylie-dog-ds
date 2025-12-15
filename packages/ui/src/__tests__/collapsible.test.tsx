import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../collapsible";

expect.extend(toHaveNoViolations);

const TestCollapsible = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <Collapsible open={open} onOpenChange={onOpenChange}>
    <CollapsibleTrigger>Toggle</CollapsibleTrigger>
    <CollapsibleContent>
      <div>Collapsible content</div>
    </CollapsibleContent>
  </Collapsible>
);

describe("Collapsible", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestCollapsible />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const { container } = render(<TestCollapsible open={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByText("Toggle");
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(screen.getByText("Collapsible content")).toBeInTheDocument();
      });
    });
  });

  describe("Collapsible Component", () => {
    it("should render with children", () => {
      render(
        <Collapsible>
          <div>Content</div>
        </Collapsible>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should toggle content on trigger click", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

      const trigger = screen.getByText("Toggle");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Collapsible content")).toBeInTheDocument();
      });
    });

    it("should work as controlled component", () => {
      const { rerender } = render(<TestCollapsible open={false} />);
      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

      rerender(<TestCollapsible open={true} />);
      expect(screen.getByText("Collapsible content")).toBeInTheDocument();
    });

    it("should call onOpenChange when toggled", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(<TestCollapsible onOpenChange={handleOpenChange} />);

      const trigger = screen.getByText("Toggle");
      await user.click(trigger);

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CollapsibleTrigger Component", () => {
    it("should render with children", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Trigger Text</CollapsibleTrigger>
        </Collapsible>
      );
      expect(screen.getByText("Trigger Text")).toBeInTheDocument();
    });

    it("should render as button", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        </Collapsible>
      );
      const trigger = screen.getByText("Trigger");
      expect(trigger.tagName).toBe("BUTTON");
    });

    it("should toggle on click", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByText("Toggle");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Collapsible content")).toBeInTheDocument();
      });

      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.queryByText("Collapsible content")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("CollapsibleContent Component", () => {
    it("should render content when open", () => {
      render(<TestCollapsible open={true} />);
      expect(screen.getByText("Collapsible content")).toBeInTheDocument();
    });

    it("should not render content when closed", () => {
      render(<TestCollapsible open={false} />);
      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent ref={ref}>Content</CollapsibleContent>
        </Collapsible>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent className="custom-content">
            <div>Content</div>
          </CollapsibleContent>
        </Collapsible>
      );

      const content = container.querySelector(".custom-content");
      expect(content).toBeInTheDocument();
    });

    it("should support complex content", () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <h3>Title</h3>
              <p>Paragraph</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      expect(screen.getByText("Toggle")).toBeInTheDocument();
      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

      await user.click(screen.getByText("Toggle"));

      await waitFor(() => {
        expect(screen.getByText("Collapsible content")).toBeInTheDocument();
      });
    });

    it("should work with multiple collapsibles", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Collapsible>
            <CollapsibleTrigger>Toggle 1</CollapsibleTrigger>
            <CollapsibleContent>Content 1</CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Toggle 2</CollapsibleTrigger>
            <CollapsibleContent>Content 2</CollapsibleContent>
          </Collapsible>
        </>
      );

      await user.click(screen.getByText("Toggle 1"));
      await waitFor(() => {
        expect(screen.getByText("Content 1")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Toggle 2"));
      await waitFor(() => {
        expect(screen.getByText("Content 2")).toBeInTheDocument();
      });
    });

    it("should handle rapid toggling", async () => {
      const user = userEvent.setup();
      render(<TestCollapsible />);

      const trigger = screen.getByText("Toggle");

      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Collapsible content")).toBeInTheDocument();
      });
    });

    it("should maintain content state when toggling", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <input type="text" aria-label="Test input" defaultValue="test" />
          </CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText("Toggle");
      await user.click(trigger);

      await waitFor(() => {
        const input = screen.getByLabelText("Test input") as HTMLInputElement;
        expect(input.value).toBe("test");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent />
        </Collapsible>
      );

      await user.click(screen.getByText("Toggle"));
      expect(true).toBe(true);
    });

    it("should handle Collapsible without CollapsibleContent", () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        </Collapsible>
      );
      expect(screen.getByText("Toggle")).toBeInTheDocument();
    });

    it("should handle defaultOpen prop", () => {
      render(
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Initially Open</CollapsibleContent>
        </Collapsible>
      );
      expect(screen.getByText("Initially Open")).toBeInTheDocument();
    });

    it("should handle disabled state", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible disabled>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      );

      const trigger = screen.getByText("Toggle");
      await user.click(trigger);

      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });
});
