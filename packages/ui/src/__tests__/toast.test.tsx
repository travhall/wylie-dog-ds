import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
} from "../toast";

expect.extend(toHaveNoViolations);

describe("Toast", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Toast>
          <ToastTitle>Toast Title</ToastTitle>
          <ToastDescription>Toast description</ToastDescription>
          <ToastClose />
        </Toast>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with action", async () => {
      const { container } = render(
        <Toast>
          <ToastTitle>Action Toast</ToastTitle>
          <ToastDescription>With action button</ToastDescription>
          <ToastAction>Undo</ToastAction>
          <ToastClose />
        </Toast>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have role alert", () => {
      render(
        <Toast>
          <ToastTitle>Notification</ToastTitle>
        </Toast>
      );
      const toast = screen.getByRole("alert");
      expect(toast).toBeInTheDocument();
    });

    it("should have aria-live assertive", () => {
      const { container } = render(
        <Toast>
          <ToastTitle>Important</ToastTitle>
        </Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveAttribute("aria-live", "assertive");
    });

    it("should have accessible close button", () => {
      render(
        <Toast>
          <ToastTitle>Notification</ToastTitle>
          <ToastClose />
        </Toast>
      );
      const closeButton = screen.getByRole("button", {
        name: /close notification/i,
      });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("Toast Component", () => {
    it("should render with children", () => {
      render(
        <Toast>
          <div>Toast content</div>
        </Toast>
      );
      expect(screen.getByText("Toast content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Toast ref={ref}>Content</Toast>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Toast className="custom-toast">Content</Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("custom-toast");
    });

    it("should support default variant", () => {
      const { container } = render(
        <Toast variant="default">Default toast</Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-[var(--color-toast-background)]");
    });

    it("should support destructive variant", () => {
      const { container } = render(
        <Toast variant="destructive">Error toast</Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-red-500", "text-white");
    });

    it("should support success variant", () => {
      const { container } = render(
        <Toast variant="success">Success toast</Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-green-500", "text-white");
    });

    it("should support warning variant", () => {
      const { container } = render(
        <Toast variant="warning">Warning toast</Toast>
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-yellow-500", "text-black");
    });
  });

  describe("ToastTitle Component", () => {
    it("should render with children", () => {
      render(
        <Toast>
          <ToastTitle>Success</ToastTitle>
        </Toast>
      );
      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Toast>
          <ToastTitle ref={ref}>Title</ToastTitle>
        </Toast>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      render(
        <Toast>
          <ToastTitle className="custom-title">Title</ToastTitle>
        </Toast>
      );
      const title = screen.getByText("Title");
      expect(title).toHaveClass("custom-title");
    });

    it("should have proper styling", () => {
      render(
        <Toast>
          <ToastTitle>Styled Title</ToastTitle>
        </Toast>
      );
      const title = screen.getByText("Styled Title");
      expect(title).toHaveClass("text-sm", "font-semibold");
    });
  });

  describe("ToastDescription Component", () => {
    it("should render with children", () => {
      render(
        <Toast>
          <ToastDescription>This is a description</ToastDescription>
        </Toast>
      );
      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Toast>
          <ToastDescription ref={ref}>Description</ToastDescription>
        </Toast>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      render(
        <Toast>
          <ToastDescription className="custom-desc">
            Description
          </ToastDescription>
        </Toast>
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("custom-desc");
    });

    it("should have proper styling", () => {
      render(
        <Toast>
          <ToastDescription>Styled description</ToastDescription>
        </Toast>
      );
      const description = screen.getByText("Styled description");
      expect(description).toHaveClass("text-sm", "opacity-90");
    });
  });

  describe("ToastAction Component", () => {
    it("should render with children", () => {
      render(
        <Toast>
          <ToastAction>Undo</ToastAction>
        </Toast>
      );
      expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Toast>
          <ToastAction ref={ref}>Action</ToastAction>
        </Toast>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should apply custom className", () => {
      render(
        <Toast>
          <ToastAction className="custom-action">Action</ToastAction>
        </Toast>
      );
      const action = screen.getByRole("button");
      expect(action).toHaveClass("custom-action");
    });

    it("should handle onClick", () => {
      const handleClick = vi.fn();
      render(
        <Toast>
          <ToastAction onClick={handleClick}>Click me</ToastAction>
        </Toast>
      );

      const button = screen.getByRole("button", { name: "Click me" });
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should support disabled state", () => {
      render(
        <Toast>
          <ToastAction disabled>Disabled</ToastAction>
        </Toast>
      );
      const button = screen.getByRole("button", { name: "Disabled" });
      expect(button).toBeDisabled();
    });
  });

  describe("ToastClose Component", () => {
    it("should render close button", () => {
      render(
        <Toast>
          <ToastClose />
        </Toast>
      );
      const closeButton = screen.getByRole("button", {
        name: /close notification/i,
      });
      expect(closeButton).toBeInTheDocument();
    });

    it("should render close icon", () => {
      render(
        <Toast>
          <ToastClose />
        </Toast>
      );
      const closeButton = screen.getByRole("button");
      const icon = closeButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Toast>
          <ToastClose ref={ref} />
        </Toast>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should apply custom className", () => {
      render(
        <Toast>
          <ToastClose className="custom-close" />
        </Toast>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-close");
    });

    it("should handle onClick", () => {
      const handleClick = vi.fn();
      render(
        <Toast>
          <ToastClose onClick={handleClick} />
        </Toast>
      );

      const button = screen.getByRole("button");
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should support custom sr-only text", () => {
      render(
        <Toast>
          <ToastClose srText="Dismiss notification" />
        </Toast>
      );
      const closeButton = screen.getByRole("button", {
        name: "Dismiss notification",
      });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(
        <Toast>
          <ToastTitle>Success</ToastTitle>
          <ToastDescription>Your changes have been saved</ToastDescription>
          <ToastAction>Undo</ToastAction>
          <ToastClose />
        </Toast>
      );

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText("Your changes have been saved")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /close/i })
      ).toBeInTheDocument();
    });

    it("should work without title", () => {
      render(
        <Toast>
          <ToastDescription>Simple notification</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(screen.getByText("Simple notification")).toBeInTheDocument();
    });

    it("should work without description", () => {
      render(
        <Toast>
          <ToastTitle>Title only</ToastTitle>
          <ToastClose />
        </Toast>
      );

      expect(screen.getByText("Title only")).toBeInTheDocument();
    });

    it("should work without action button", () => {
      render(
        <Toast>
          <ToastTitle>No action</ToastTitle>
          <ToastDescription>Just a notification</ToastDescription>
          <ToastClose />
        </Toast>
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1); // Only close button
    });

    it("should work with different variants", () => {
      const { rerender, container } = render(
        <Toast variant="success">
          <ToastTitle>Success</ToastTitle>
        </Toast>
      );
      let toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-green-500");

      rerender(
        <Toast variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
      );
      toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass("bg-red-500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty Toast", () => {
      const { container } = render(<Toast />);
      const toast = container.firstChild as HTMLElement;
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute("role", "alert");
    });

    it("should handle long title text", () => {
      const longTitle =
        "This is a very long toast title that might wrap to multiple lines";
      render(
        <Toast>
          <ToastTitle>{longTitle}</ToastTitle>
        </Toast>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle long description text", () => {
      const longDescription =
        "This is a very long toast description that contains a lot of information and might need to wrap across multiple lines in the notification";
      render(
        <Toast>
          <ToastDescription>{longDescription}</ToastDescription>
        </Toast>
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("should handle multiple actions", () => {
      render(
        <Toast>
          <ToastTitle>Multiple actions</ToastTitle>
          <ToastAction>Action 1</ToastAction>
          <ToastAction>Action 2</ToastAction>
          <ToastClose />
        </Toast>
      );

      expect(
        screen.getByRole("button", { name: "Action 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action 2" })
      ).toBeInTheDocument();
    });

    it("should maintain styling with custom HTML in title", () => {
      render(
        <Toast>
          <ToastTitle>
            <strong>Bold</strong> title
          </ToastTitle>
        </Toast>
      );

      const title = screen.getByText("Bold");
      expect(title.tagName).toBe("STRONG");
    });
  });
});
