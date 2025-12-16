import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Card, CardHeader, CardTitle, CardContent } from "../card";

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
      const longContent = "Lorem ipsum dolor sit amet. ".repeat(100);
      render(
        <Card>
          <CardContent>{longContent}</CardContent>
        </Card>
      );

      // Use a partial match for very long text
      expect(
        screen.getByText(/Lorem ipsum dolor sit amet/)
      ).toBeInTheDocument();
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
