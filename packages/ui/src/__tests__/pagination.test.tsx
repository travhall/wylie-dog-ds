import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../pagination";

expect.extend(toHaveNoViolations);

const TestPagination = () => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#" isActive>
          1
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">2</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">3</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem>
        <PaginationNext href="#" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

describe("Pagination", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestPagination />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have navigation role", () => {
      render(<TestPagination />);
      const nav = screen.getByRole("navigation", { name: /pagination/i });
      expect(nav).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      render(<TestPagination />);
      const currentPage = screen.getByRole("link", { name: "1" });
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });

    it("should have accessible previous button", () => {
      render(<TestPagination />);
      const prev = screen.getByRole("link", { name: /previous/i });
      expect(prev).toBeInTheDocument();
    });

    it("should have accessible next button", () => {
      render(<TestPagination />);
      const next = screen.getByRole("link", { name: /next/i });
      expect(next).toBeInTheDocument();
    });
  });

  describe("Pagination Component", () => {
    it("should render as nav element", () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Pagination className="custom-pagination">
          <PaginationContent />
        </Pagination>
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("custom-pagination");
    });
  });

  describe("PaginationContent Component", () => {
    it("should render as ul element", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const list = container.querySelector("ul");
      expect(list).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLUListElement>();
      render(
        <Pagination>
          <PaginationContent ref={ref}>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(ref.current).toBeInstanceOf(HTMLUListElement);
    });
  });

  describe("PaginationItem Component", () => {
    it("should render as li element", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const item = container.querySelector("li");
      expect(item).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLIElement>();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem ref={ref}>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(ref.current).toBeInstanceOf(HTMLLIElement);
    });
  });

  describe("PaginationLink Component", () => {
    it("should render as anchor element", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: "1" });
      expect(link.tagName).toBe("A");
    });

    it("should have href attribute", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: "2" });
      expect(link).toHaveAttribute("href", "/page/2");
    });

    it("should apply active state styling", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: "1" });
      expect(link).toHaveAttribute("aria-current", "page");
    });

    it("should apply custom className", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink className="custom-link" href="#">
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: "1" });
      expect(link).toHaveClass("custom-link");
    });
  });

  describe("PaginationPrevious Component", () => {
    it("should render previous link", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(
        screen.getByRole("link", { name: /previous/i })
      ).toBeInTheDocument();
    });

    it("should render chevron icon", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should have aria-label", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: /previous/i });
      expect(link).toHaveAttribute("aria-label", "Go to previous page");
    });
  });

  describe("PaginationNext Component", () => {
    it("should render next link", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument();
    });

    it("should render chevron icon", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should have aria-label", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const link = screen.getByRole("link", { name: /next/i });
      expect(link).toHaveAttribute("aria-label", "Go to next page");
    });
  });

  describe("PaginationEllipsis Component", () => {
    it("should render ellipsis", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByText("More pages")).toBeInTheDocument();
    });

    it("should have aria-hidden attribute", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const ellipsis = container.querySelector('[aria-hidden="true"]');
      expect(ellipsis).toBeInTheDocument();
    });

    it("should render ellipsis icon", () => {
      const { container } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(<TestPagination />);

      expect(
        screen.getByRole("link", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "2" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "3" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText("More pages")).toBeInTheDocument();
    });

    it("should work with many pages", () => {
      render(
        <Pagination>
          <PaginationContent>
            {Array.from({ length: 10 }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`#${i + 1}`}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      );

      for (let i = 1; i <= 10; i++) {
        expect(
          screen.getByRole("link", { name: String(i) })
        ).toBeInTheDocument();
      }
    });

    it("should handle active page state", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      const activePage = screen.getByRole("link", { name: "2" });
      expect(activePage).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single page", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    });

    it("should handle pagination without prev/next", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(
        screen.queryByRole("link", { name: /previous/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /next/i })
      ).not.toBeInTheDocument();
    });

    it("should handle disabled previous on first page", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      const prev = screen.getByRole("link", { name: /previous/i });
      expect(prev).toHaveClass("pointer-events-none", "opacity-50");
    });

    it("should handle disabled next on last page", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      const next = screen.getByRole("link", { name: /next/i });
      expect(next).toHaveClass("pointer-events-none", "opacity-50");
    });
  });
});
