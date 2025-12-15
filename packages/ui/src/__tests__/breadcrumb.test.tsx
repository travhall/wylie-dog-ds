import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../breadcrumb";

expect.extend(toHaveNoViolations);

const TestBreadcrumb = () => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/products">Products</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Current Page</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

describe("Breadcrumb", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestBreadcrumb />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA label", () => {
      render(<TestBreadcrumb />);
      const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      render(<TestBreadcrumb />);
      const currentPage = screen.getByText("Current Page");
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Breadcrumb Component", () => {
    it("should render as nav element", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList />
        </Breadcrumb>
      );
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLElement>();
      render(
        <Breadcrumb ref={ref}>
          <BreadcrumbList />
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });

    it("should apply custom className", () => {
      render(
        <Breadcrumb className="custom-breadcrumb">
          <BreadcrumbList />
        </Breadcrumb>
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("custom-breadcrumb");
    });
  });

  describe("BreadcrumbList Component", () => {
    it("should render as ol element", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const list = container.querySelector("ol");
      expect(list).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLOListElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList ref={ref}>
            <BreadcrumbItem>Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLOListElement);
    });
  });

  describe("BreadcrumbItem Component", () => {
    it("should render as li element", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const item = container.querySelector("li");
      expect(item).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLIElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem ref={ref}>Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  describe("BreadcrumbLink Component", () => {
    it("should render as anchor element", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test">Link</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const link = screen.getByText("Link");
      expect(link.tagName).toBe("A");
    });

    it("should have href attribute", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test">Link</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const link = screen.getByText("Link");
      expect(link).toHaveAttribute("href", "/test");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink ref={ref} href="/test">
                Link
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe("BreadcrumbPage Component", () => {
    it("should render as span element", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const page = screen.getByText("Current");
      expect(page.tagName).toBe("SPAN");
    });

    it('should have aria-current="page"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const page = screen.getByText("Current");
      expect(page).toHaveAttribute("aria-current", "page");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage ref={ref}>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe("BreadcrumbSeparator Component", () => {
    it("should render as li element", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      );
      const separator = container.querySelector('li[role="presentation"]');
      expect(separator).toBeInTheDocument();
    });

    it("should have aria-hidden attribute", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      );
      const separator = container.querySelector('li[role="presentation"]');
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });

    it("should render default chevron icon", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should support custom separator", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText("/")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLIElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator ref={ref} />
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  describe("BreadcrumbEllipsis Component", () => {
    it("should render ellipsis icon", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should have aria-hidden attribute", () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const ellipsis = container.querySelector('[aria-hidden="true"]');
      expect(ellipsis).toBeInTheDocument();
    });

    it("should have sr-only text", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText("More")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis ref={ref} />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(<TestBreadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Current Page")).toBeInTheDocument();
    });

    it("should work with long breadcrumb trail", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/level1">Level 1</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/level2">Level 2</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/level3">Level 3</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByText("Level 1")).toBeInTheDocument();
      expect(screen.getByText("Level 2")).toBeInTheDocument();
      expect(screen.getByText("Level 3")).toBeInTheDocument();
    });

    it("should work with ellipsis for collapsed breadcrumbs", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("More")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single item breadcrumb", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should handle breadcrumb without separators", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
    });

    it("should handle custom separator characters", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>|</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText("|")).toBeInTheDocument();
    });
  });
});
