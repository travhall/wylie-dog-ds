import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from "../card";

expect.extend(toHaveNoViolations);

describe("Card", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card content goes here</CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with minimal content", async () => {
      const { container } = render(<Card>Simple content</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading hierarchy", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Main Title");
    });
  });

  describe("Card Component", () => {
    it("should render with children", () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });

    it("should render as div element", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe("DIV");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should support HTML attributes", () => {
      render(
        <Card
          data-testid="test-card"
          aria-label="Information card"
          role="region"
        >
          Content
        </Card>
      );

      const card = screen.getByTestId("test-card");
      expect(card).toHaveAttribute("aria-label", "Information card");
      expect(card).toHaveAttribute("role", "region");
    });

    it("should handle onClick events", () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} role="button" tabIndex={0}>
          Clickable Card
        </Card>
      );

      const card = screen.getByRole("button");
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("CardHeader Component", () => {
    it("should render with children", () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByText("Header");
      expect(header).toHaveClass("custom-header");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should support multiple children", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <p>Subtitle text</p>
          </CardHeader>
        </Card>
      );

      expect(screen.getByRole("heading")).toHaveTextContent("Title");
      expect(screen.getByText("Subtitle text")).toBeInTheDocument();
    });
  });

  describe("CardTitle Component", () => {
    it("should render as h3 element", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toHaveTextContent("Test Title");
    });

    it("should apply custom className", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByRole("heading");
      expect(title).toHaveClass("custom-title");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(
        <Card>
          <CardHeader>
            <CardTitle ref={ref}>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current?.tagName).toBe("H3");
    });

    it("should support HTML attributes", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle id="card-title" data-analytics="title">
              Title
            </CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByRole("heading");
      expect(title).toHaveAttribute("id", "card-title");
      expect(title).toHaveAttribute("data-analytics", "title");
    });

    it("should handle long titles", () => {
      const longTitle =
        "This is a very long title that might wrap to multiple lines in the card component";
      render(
        <Card>
          <CardHeader>
            <CardTitle>{longTitle}</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByRole("heading");
      expect(title).toHaveTextContent(longTitle);
    });
  });

  describe("CardContent Component", () => {
    it("should render with children", () => {
      render(
        <Card>
          <CardContent>Content text</CardContent>
        </Card>
      );
      expect(screen.getByText("Content text")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );

      const content = screen.getByText("Content");
      expect(content).toHaveClass("custom-content");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should support complex content", () => {
      render(
        <Card>
          <CardContent>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </CardContent>
        </Card>
      );

      expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("CardDescription Component", () => {
    it("should render as paragraph element", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description text</CardDescription>
          </CardHeader>
        </Card>
      );
      const desc = screen.getByText("Description text");
      expect(desc.tagName).toBe("P");
    });

    it("should apply custom className", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-desc">
              Description
            </CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Description")).toHaveClass("custom-desc");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(
        <Card>
          <CardHeader>
            <CardDescription ref={ref}>Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it("should apply description token classes", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );
      const desc = screen.getByText("Description");
      expect(desc).toHaveClass(
        "text-(length:--font-size-card-header-description-font-size)"
      );
      expect(desc).toHaveClass("text-(--color-card-header-description-color)");
    });
  });

  describe("CardFooter Component", () => {
    it("should render with children", () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText("Footer")).toHaveClass("custom-footer");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply flex layout by default", () => {
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = container.querySelector('[class*="flex items-center"]');
      expect(footer).toBeInTheDocument();
    });

    it("should render multiple footer actions", () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Submit</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });
  });

  describe("Interactive Prop", () => {
    it("should apply cursor-pointer and transition-colors when interactive", () => {
      const { container } = render(<Card interactive>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("cursor-pointer");
      expect(card).toHaveClass("transition-colors");
    });

    it("should apply hover state token class when interactive", () => {
      const { container } = render(<Card interactive>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("hover:bg-(--color-card-background-hover)");
    });

    it("should apply focus state token classes when interactive", () => {
      const { container } = render(<Card interactive>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("focus:bg-(--color-card-background-focus)");
      expect(card).toHaveClass("focus:outline-none");
      expect(card).toHaveClass("focus:ring-(length:--space-focus-ring-width)");
      expect(card).toHaveClass("focus:ring-(--color-border-focus)");
    });

    it("should apply active and disabled state token classes when interactive", () => {
      const { container } = render(<Card interactive>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("active:bg-(--color-card-background-active)");
      expect(card).toHaveClass(
        "disabled:bg-(--color-card-background-disabled)"
      );
    });

    it("should auto-inject role=button and tabIndex=0 when interactive without asChild", () => {
      const { container } = render(<Card interactive>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabindex", "0");
    });

    it("should not inject role or tabIndex when interactive is false (default)", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute("role", "button");
      expect(card).not.toHaveAttribute("tabindex");
    });

    it("should not apply interactive classes when interactive is false", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass("cursor-pointer");
      expect(card).not.toHaveClass("hover:bg-(--color-card-background-hover)");
    });

    it("should handle click events when interactive", () => {
      const handleClick = vi.fn();
      render(
        <Card interactive onClick={handleClick}>
          Content
        </Card>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyboard events when interactive", () => {
      const handleKeyDown = vi.fn();
      render(
        <Card interactive onKeyDown={handleKeyDown}>
          Content
        </Card>
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("should pass accessibility audit when interactive with aria-label", async () => {
      const { container } = render(
        <Card interactive aria-label="Select premium plan">
          <CardHeader>
            <CardTitle>Premium Plan</CardTitle>
          </CardHeader>
          <CardContent>Click to select</CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("asChild Prop", () => {
    it("should render as button when asChild with <button>", () => {
      const { container } = render(
        <Card asChild>
          <button type="button">Content</button>
        </Card>
      );
      expect((container.firstChild as HTMLElement).tagName).toBe("BUTTON");
    });

    it("should render as anchor when asChild with <a>", () => {
      const { container } = render(
        <Card asChild>
          <a href="#demo">Content</a>
        </Card>
      );
      expect((container.firstChild as HTMLElement).tagName).toBe("A");
    });

    it("should apply card styles to child element", () => {
      const { container } = render(
        <Card asChild>
          <button type="button">Content</button>
        </Card>
      );
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveClass("bg-(--color-card-background)");
      expect(el).toHaveClass("rounded-(--space-card-radius)");
      expect(el).toHaveClass("border-(--color-card-border)");
    });

    it("should apply interactive styles when both interactive and asChild", () => {
      const { container } = render(
        <Card interactive asChild>
          <button type="button">Content</button>
        </Card>
      );
      const el = container.firstChild as HTMLElement;
      expect(el.tagName).toBe("BUTTON");
      expect(el).toHaveClass("cursor-pointer");
      expect(el).toHaveClass("hover:bg-(--color-card-background-hover)");
    });

    it("should not inject role or tabIndex when asChild is true", () => {
      const { container } = render(
        <Card interactive asChild>
          <button type="button">Content</button>
        </Card>
      );
      const el = container.firstChild as HTMLElement;
      // The <button> element natively has role=button — Card should not add it again
      expect(el).not.toHaveAttribute("role");
    });

    it("should pass accessibility audit with asChild anchor", async () => {
      const { container } = render(
        <Card interactive asChild>
          <a href="#demo">
            <CardHeader>
              <CardTitle>Linked Card</CardTitle>
            </CardHeader>
            <CardContent>Navigate somewhere</CardContent>
          </a>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with asChild button", async () => {
      const { container } = render(
        <Card interactive asChild>
          <button type="button">
            <CardHeader>
              <CardTitle>Button Card</CardTitle>
            </CardHeader>
            <CardContent>Click to select</CardContent>
          </button>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("cardVariants Function", () => {
    it("should return base classes", () => {
      const classes = cardVariants({});
      expect(classes).toContain("flex");
      expect(classes).toContain("flex-col");
      expect(classes).toContain("border");
      expect(classes).toContain("bg-(--color-card-background)");
      expect(classes).toContain("rounded-(--space-card-radius)");
    });

    it("should return interactive classes when interactive is true", () => {
      const classes = cardVariants({ interactive: true });
      expect(classes).toContain("cursor-pointer");
      expect(classes).toContain("transition-colors");
      expect(classes).toContain("hover:bg-(--color-card-background-hover)");
      expect(classes).toContain("focus:bg-(--color-card-background-focus)");
      expect(classes).toContain("active:bg-(--color-card-background-active)");
      expect(classes).toContain(
        "disabled:bg-(--color-card-background-disabled)"
      );
    });

    it("should not return interactive classes when interactive is false", () => {
      const classes = cardVariants({ interactive: false });
      expect(classes).not.toContain("cursor-pointer");
      expect(classes).not.toContain("hover:bg-(--color-card-background-hover)");
    });

    it("should return same base classes regardless of interactive value", () => {
      const base = cardVariants({ interactive: false });
      const interactive = cardVariants({ interactive: true });
      expect(interactive).toContain("bg-(--color-card-background)");
      expect(base).toContain("bg-(--color-card-background)");
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
          </CardHeader>
          <CardContent>
            This is a complete card with all components.
          </CardContent>
        </Card>
      );

      expect(screen.getByRole("heading")).toHaveTextContent("Complete Card");
      expect(
        screen.getByText(/complete card with all components/i)
      ).toBeInTheDocument();
    });

    it("should work with multiple cards", async () => {
      const { container } = render(
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>Content 1</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>Content 2</CardContent>
          </Card>
        </div>
      );

      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent("Card 1");
      expect(headings[1]).toHaveTextContent("Card 2");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should work without CardHeader", () => {
      render(
        <Card>
          <CardContent>Just content, no header</CardContent>
        </Card>
      );

      expect(screen.getByText("Just content, no header")).toBeInTheDocument();
    });

    it("should work without CardContent", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Just a header</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByRole("heading")).toHaveTextContent("Just a header");
    });

    it("should support interactive cards", async () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
          aria-label="Clickable card"
        >
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>Click me!</CardContent>
        </Card>
      );

      const card = screen.getByRole("button");

      // Test click
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Test keyboard activation
      fireEvent.keyDown(card, { key: "Enter" });
      expect(handleClick).toHaveBeenCalledTimes(2);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-labelledby pattern", async () => {
      const { container } = render(
        <Card aria-labelledby="card-title-1" role="region">
          <CardHeader>
            <CardTitle id="card-title-1">Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>This card is properly labeled</CardContent>
        </Card>
      );

      const card = screen.getByRole("region");
      expect(card).toHaveAttribute("aria-labelledby", "card-title-1");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle nested cards", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Parent Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Nested Card</CardTitle>
              </CardHeader>
              <CardContent>Nested content</CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent("Parent Card");
      expect(headings[1]).toHaveTextContent("Nested Card");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should work with form elements", async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <input type="text" aria-label="Username" />
              <input type="password" aria-label="Password" />
              <button type="submit">Login</button>
            </form>
          </CardContent>
        </Card>
      );

      const submitButton = screen.getByRole("button", { name: "Login" });
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty Card", () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe("DIV");
    });

    it("should handle empty CardHeader", () => {
      render(
        <Card>
          <CardHeader />
        </Card>
      );
      // Should render without errors
      expect(true).toBe(true);
    });

    it("should handle empty CardTitle", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle />
          </CardHeader>
        </Card>
      );
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
      expect(heading).toBeEmptyDOMElement();
    });

    it("should handle empty CardContent", () => {
      render(
        <Card>
          <CardContent />
        </Card>
      );
      // Should render without errors
      expect(true).toBe(true);
    });

    it("should handle very long content", () => {
      const longContent = "Lorem ipsum dolor sit. ".repeat(100);
      render(
        <Card>
          <CardContent>{longContent}</CardContent>
        </Card>
      );

      // Use a partial match for very long text
      expect(screen.getByText(/Lorem ipsum dolor sit/)).toBeInTheDocument();
    });

    it("should support multiple CardContent sections", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Multi-section Card</CardTitle>
          </CardHeader>
          <CardContent>Section 1</CardContent>
          <CardContent>Section 2</CardContent>
          <CardContent>Section 3</CardContent>
        </Card>
      );

      expect(screen.getByText("Section 1")).toBeInTheDocument();
      expect(screen.getByText("Section 2")).toBeInTheDocument();
      expect(screen.getByText("Section 3")).toBeInTheDocument();
    });
  });
});
