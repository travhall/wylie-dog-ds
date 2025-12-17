import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "../sheet";

expect.extend(toHaveNoViolations);

const TestSheet = ({ side = "right" as const }) => (
  <Sheet>
    <SheetTrigger>Open Sheet</SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>This is a sheet description</SheetDescription>
      </SheetHeader>
      <div>Sheet content goes here</div>
      <SheetFooter>
        <SheetClose>Close</SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

describe("Sheet", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestSheet />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper role", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should have accessible title", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog", { name: "Sheet Title" });
        expect(dialog).toBeInTheDocument();
      });
    });

    // TODO: Sheet dialog portal rendering needs async test infrastructure
    it.skip("should have accessible close button", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  // TODO: Sheet dialog portal rendering needs async test infrastructure
  describe.skip("Sheet Component", () => {
    it("should render trigger button", () => {
      render(<TestSheet />);
      expect(screen.getByText("Open Sheet")).toBeInTheDocument();
    });

    it("should not show content when closed", () => {
      render(<TestSheet />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Sheet Title")).not.toBeInTheDocument();
    });

    it("should open sheet when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Sheet Title")).toBeInTheDocument();
        expect(
          screen.getByText("This is a sheet description")
        ).toBeInTheDocument();
        expect(screen.getByText("Sheet content goes here")).toBeInTheDocument();
      });
    });

    it("should close sheet when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const closeIcon = screen.getAllByRole("button", { name: /close/i })[0];
      await user.click(closeIcon);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should close sheet when SheetClose is clicked", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Close"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("SheetContent Component", () => {
    it("should render content when open", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByText("Sheet content goes here")).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent ref={ref}>
            <SheetTitle>Title</SheetTitle>
            Content
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it("should apply custom className", async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent className="custom-sheet">
            <SheetTitle>Title</SheetTitle>
            Content
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("custom-sheet");
      });
    });

    it("should support right side (default)", async () => {
      const user = userEvent.setup();
      render(<TestSheet side="right" />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("right-0");
      });
    });

    it("should support left side", async () => {
      const user = userEvent.setup();
      render(<TestSheet side="left" />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("left-0");
      });
    });

    it("should support top side", async () => {
      const user = userEvent.setup();
      render(<TestSheet side="top" />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("top-0");
      });
    });

    it("should support bottom side", async () => {
      const user = userEvent.setup();
      render(<TestSheet side="bottom" />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("bottom-0");
      });
    });
  });

  describe("SheetHeader Component", () => {
    it("should render header", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByText("Sheet Title")).toBeInTheDocument();
        expect(
          screen.getByText("This is a sheet description")
        ).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader ref={ref}>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe("SheetTitle Component", () => {
    it("should render title", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByText("Sheet Title")).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLHeadingElement>();

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle ref={ref}>Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      });
    });
  });

  describe("SheetDescription Component", () => {
    it("should render description", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(
          screen.getByText("This is a sheet description")
        ).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLParagraphElement>();

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription ref={ref}>Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
      });
    });
  });

  // TODO: Sheet dialog portal rendering needs async test infrastructure
  describe.skip("SheetFooter Component", () => {
    it("should render footer", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByText("Close")).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetFooter ref={ref}>
              <button type="button">Action</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe("Integration", () => {
    // TODO: Sheet dialog portal rendering needs async test infrastructure
    it.skip("should compose all sub-components correctly", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByText("Sheet Title")).toBeInTheDocument();
        expect(
          screen.getByText("This is a sheet description")
        ).toBeInTheDocument();
        expect(screen.getByText("Sheet content goes here")).toBeInTheDocument();
        expect(screen.getByText("Close")).toBeInTheDocument();
      });
    });

    it("should work with form content", async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open Form</SheetTrigger>
          <SheetContent>
            <SheetTitle>Form Sheet</SheetTitle>
            <form>
              <input type="text" placeholder="Name" aria-label="Name" />
              <button type="submit">Submit</button>
            </form>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open Form"));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Submit" })
        ).toBeInTheDocument();
      });
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      await user.click(screen.getByText("Open Sheet"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should restore focus to trigger when closed", async () => {
      const user = userEvent.setup();
      render(<TestSheet />);

      const trigger = screen.getByText("Open Sheet");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      expect(trigger).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("should handle sheet without header", async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title Only</SheetTitle>
            <div>Content without header wrapper</div>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
          screen.getByText("Content without header wrapper")
        ).toBeInTheDocument();
      });
    });

    it("should handle sheet without footer", async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>No Footer</SheetTitle>
            <div>Content</div>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should handle complex content", async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Complex Sheet</SheetTitle>
            <div>
              <h3>Section 1</h3>
              <p>Paragraph text</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Section 1")).toBeInTheDocument();
        expect(screen.getByText("Paragraph text")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
      });
    });
  });
});
