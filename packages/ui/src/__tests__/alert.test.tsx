import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Alert, AlertTitle, AlertDescription } from "../alert";

expect.extend(toHaveNoViolations);

describe("Alert", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit for default alert", async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>This is an informational message.</AlertDescription>
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit for destructive alert", async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have region role for default variant", () => {
      render(
        <Alert>
          <AlertDescription>Default message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toBeInTheDocument();
    });

    it("should have alert role for destructive variant", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Error message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should have alert role for warning variant", () => {
      render(
        <Alert variant="warning">
          <AlertDescription>Warning message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should have status role for success variant", () => {
      render(
        <Alert variant="success">
          <AlertDescription>Success message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("status");
      expect(alert).toBeInTheDocument();
    });

    it("should support custom role override", () => {
      render(
        <Alert variant="default" role="alert">
          <AlertDescription>Custom role message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should have assertive aria-live for destructive", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Error</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });

    it("should have polite aria-live for warning", () => {
      render(
        <Alert variant="warning">
          <AlertDescription>Warning</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have polite aria-live for success", () => {
      render(
        <Alert variant="success">
          <AlertDescription>Success</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("status");
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have off aria-live for default", () => {
      render(
        <Alert variant="default">
          <AlertDescription>Info</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toHaveAttribute("aria-live", "off");
    });

    it("should not set aria-live when role is overridden", () => {
      render(
        <Alert variant="destructive" role="status">
          <AlertDescription>Message</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("status");
      expect(alert).not.toHaveAttribute("aria-live");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      render(
        <Alert>
          <AlertDescription>Default</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toHaveClass(
        "bg-(--color-alert-default-background)",
        "border-(--color-alert-default-border)",
        "text-(--color-alert-default-text)"
      );
    });

    it("should apply destructive variant styles", () => {
      render(
        <Alert variant="destructive">
          <AlertDescription>Error</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass(
        "bg-(--color-alert-destructive-background)",
        "border-(--color-alert-destructive-border)",
        "text-(--color-alert-destructive-text)"
      );
    });

    it("should apply warning variant styles", () => {
      render(
        <Alert variant="warning">
          <AlertDescription>Warning</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass(
        "bg-(--color-alert-warning-background)",
        "border-(--color-alert-warning-border)",
        "text-(--color-alert-warning-text)"
      );
    });

    it("should apply success variant styles", () => {
      render(
        <Alert variant="success">
          <AlertDescription>Success</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("status");
      expect(alert).toHaveClass(
        "bg-(--color-alert-success-background)",
        "border-(--color-alert-success-border)",
        "text-(--color-alert-success-text)"
      );
    });
  });

  describe("AlertTitle", () => {
    it("should render title as h5", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByText("Alert Title");
      expect(title.tagName).toBe("H5");
    });

    it("should have proper title styling", () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByText("Alert Title");
      expect(title).toHaveClass(
        "mb-1",
        "font-medium",
        "leading-none",
        "tracking-tight"
      );
    });

    it("should support custom className", () => {
      render(
        <Alert>
          <AlertTitle className="custom-title">Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByText("Title");
      expect(title).toHaveClass("custom-title");
    });

    it("should forward ref", () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(
        <Alert>
          <AlertTitle ref={ref}>Title</AlertTitle>
        </Alert>
      );
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe("AlertDescription", () => {
    it("should render description text", () => {
      render(
        <Alert>
          <AlertDescription>This is a description</AlertDescription>
        </Alert>
      );
      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("should have proper description styling", () => {
      render(
        <Alert>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-sm", "opacity-90");
    });

    it("should support custom className", () => {
      render(
        <Alert>
          <AlertDescription className="custom-desc">Desc</AlertDescription>
        </Alert>
      );
      const description = screen.getByText("Desc");
      expect(description).toHaveClass("custom-desc");
    });

    it("should forward ref", () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(
        <Alert>
          <AlertDescription ref={ref}>Description</AlertDescription>
        </Alert>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Styling", () => {
    it("should have base styling classes", () => {
      render(
        <Alert>
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toHaveClass(
        "relative",
        "w-full",
        "rounded-lg",
        "border",
        "border-l-4",
        "px-4",
        "py-3",
        "text-sm"
      );
    });

    it("should apply custom className", () => {
      render(
        <Alert className="custom-alert">
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toHaveClass("custom-alert");
    });

    it("should combine variant and custom className", () => {
      render(
        <Alert variant="warning" className="shadow-lg">
          <AlertDescription>Warning</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("shadow-lg");
      expect(alert).toHaveClass("bg-(--color-alert-warning-background)");
    });
  });

  describe("Integration", () => {
    it("should forward ref to alert element", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Alert ref={ref}>
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should work with title and description together", () => {
      render(
        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>Please read this carefully.</AlertDescription>
        </Alert>
      );
      expect(screen.getByText("Important")).toBeInTheDocument();
      expect(
        screen.getByText("Please read this carefully.")
      ).toBeInTheDocument();
    });

    it("should work with only title", () => {
      render(
        <Alert>
          <AlertTitle>Title Only</AlertTitle>
        </Alert>
      );
      expect(screen.getByText("Title Only")).toBeInTheDocument();
    });

    it("should work with only description", () => {
      render(
        <Alert>
          <AlertDescription>Description only</AlertDescription>
        </Alert>
      );
      expect(screen.getByText("Description only")).toBeInTheDocument();
    });

    it("should support custom children", () => {
      render(
        <Alert>
          <div>
            <p>Custom content</p>
            <button>Action</button>
          </div>
        </Alert>
      );
      expect(screen.getByText("Custom content")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action" })
      ).toBeInTheDocument();
    });

    it("should support data attributes", () => {
      render(
        <Alert data-testid="my-alert">
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );
      expect(screen.getByTestId("my-alert")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty alert", () => {
      const { container } = render(<Alert />);
      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
    });

    it("should support additional HTML attributes", () => {
      render(
        <Alert id="my-alert">
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole("region");
      expect(alert).toHaveAttribute("id", "my-alert");
    });

    it("should handle long content", () => {
      const longText = "Lorem ipsum dolor sit, ".repeat(50);
      render(
        <Alert>
          <AlertDescription>{longText}</AlertDescription>
        </Alert>
      );
      // Use partial text match for long content
      expect(screen.getByText(/Lorem ipsum dolor sit,/)).toBeInTheDocument();
    });

    it("should maintain structure with all variants", () => {
      const variants = [
        "default",
        "destructive",
        "warning",
        "success",
      ] as const;
      variants.forEach((variant) => {
        const { unmount } = render(
          <Alert variant={variant}>
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
        );
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        unmount();
      });
    });
  });
});
