import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../carousel";

expect.extend(toHaveNoViolations);

const TestCarousel = () => (
  <Carousel>
    <CarouselContent>
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
      <CarouselItem>Slide 3</CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

describe("Carousel", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestCarousel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible navigation buttons", () => {
      render(<TestCarousel />);
      expect(
        screen.getByRole("button", { name: /previous slide/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next slide/i })
      ).toBeInTheDocument();
    });

    it("should pass accessibility audit with single item", async () => {
      const { container } = render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Single Item</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Carousel Component", () => {
    it("should render with children", () => {
      render(
        <Carousel>
          <div>Carousel content</div>
        </Carousel>
      );
      expect(screen.getByText("Carousel content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Carousel ref={ref}>Content</Carousel>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Carousel className="custom-carousel">Content</Carousel>
      );
      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass("custom-carousel");
    });

    it("should have relative positioning", () => {
      const { container } = render(<Carousel>Content</Carousel>);
      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass("relative");
    });
  });

  describe("CarouselContent Component", () => {
    it("should render with children", () => {
      render(
        <Carousel>
          <CarouselContent>
            <div>Content items</div>
          </CarouselContent>
        </Carousel>
      );
      expect(screen.getByText("Content items")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel>
          <CarouselContent ref={ref}>Content</CarouselContent>
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent className="custom-content">Content</CarouselContent>
        </Carousel>
      );
      const content = container.querySelector(".custom-content");
      expect(content).toBeInTheDocument();
    });

    it("should have overflow hidden", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent>Content</CarouselContent>
        </Carousel>
      );
      const content = container.querySelector(".overflow-hidden");
      expect(content).toBeInTheDocument();
    });
  });

  describe("CarouselItem Component", () => {
    it("should render with children", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item text</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(screen.getByText("Item text")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem ref={ref}>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent>
            <CarouselItem className="custom-item">Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = container.querySelector(".custom-item");
      expect(item).toBeInTheDocument();
    });

    it("should have proper flex properties", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      const item = screen.getByText("Item");
      expect(item).toHaveClass("basis-full");
    });

    it("should support multiple items", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
            <CarouselItem>Item 3</CarouselItem>
          </CarouselContent>
        </Carousel>
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });
  });

  describe("CarouselPrevious Component", () => {
    it("should render previous button", () => {
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      );
      expect(
        screen.getByRole("button", { name: /previous slide/i })
      ).toBeInTheDocument();
    });

    it("should render chevron icon", () => {
      const { container } = render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Carousel>
          <CarouselPrevious ref={ref} />
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should apply custom className", () => {
      render(
        <Carousel>
          <CarouselPrevious className="custom-prev" />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /previous slide/i });
      expect(button).toHaveClass("custom-prev");
    });

    it("should be positioned absolutely", () => {
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /previous slide/i });
      expect(button).toHaveClass(
        "absolute",
        "-left-(--space-carousel-button-offset)"
      );
    });

    it("should handle onClick", () => {
      const handleClick = vi.fn();
      render(
        <Carousel>
          <CarouselPrevious onClick={handleClick} />
        </Carousel>
      );

      const button = screen.getByRole("button", { name: /previous slide/i });
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should support disabled state", () => {
      render(
        <Carousel>
          <CarouselPrevious disabled />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /previous slide/i });
      expect(button).toBeDisabled();
    });
  });

  describe("CarouselNext Component", () => {
    it("should render next button", () => {
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      );
      expect(
        screen.getByRole("button", { name: /next slide/i })
      ).toBeInTheDocument();
    });

    it("should render chevron icon", () => {
      const { container } = render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Carousel>
          <CarouselNext ref={ref} />
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should apply custom className", () => {
      render(
        <Carousel>
          <CarouselNext className="custom-next" />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /next slide/i });
      expect(button).toHaveClass("custom-next");
    });

    it("should be positioned absolutely", () => {
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /next slide/i });
      expect(button).toHaveClass(
        "absolute",
        "-right-(--space-carousel-button-offset)"
      );
    });

    it("should handle onClick", () => {
      const handleClick = vi.fn();
      render(
        <Carousel>
          <CarouselNext onClick={handleClick} />
        </Carousel>
      );

      const button = screen.getByRole("button", { name: /next slide/i });
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should support disabled state", () => {
      render(
        <Carousel>
          <CarouselNext disabled />
        </Carousel>
      );
      const button = screen.getByRole("button", { name: /next slide/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", () => {
      render(<TestCarousel />);

      expect(screen.getByText("Slide 1")).toBeInTheDocument();
      expect(screen.getByText("Slide 2")).toBeInTheDocument();
      expect(screen.getByText("Slide 3")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /previous slide/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next slide/i })
      ).toBeInTheDocument();
    });

    it("should work without navigation buttons", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Slide 1</CarouselItem>
            <CarouselItem>Slide 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      );

      expect(screen.getByText("Slide 1")).toBeInTheDocument();
      expect(screen.getByText("Slide 2")).toBeInTheDocument();
    });

    it("should work with only one navigation button", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Slide</CarouselItem>
          </CarouselContent>
          <CarouselNext />
        </Carousel>
      );

      expect(
        screen.getByRole("button", { name: /next slide/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /previous slide/i })
      ).not.toBeInTheDocument();
    });

    it("should handle complex carousel items", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>
              <div>
                <h3>Slide Title</h3>
                <p>Slide description</p>
                <button type="button">Action</button>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      );

      expect(screen.getByText("Slide Title")).toBeInTheDocument();
      expect(screen.getByText("Slide description")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action" })
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty carousel", () => {
      const { container } = render(<Carousel />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle empty CarouselContent", () => {
      render(
        <Carousel>
          <CarouselContent />
        </Carousel>
      );
      expect(true).toBe(true);
    });

    it("should handle single item", () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Only Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      );
      expect(screen.getByText("Only Item")).toBeInTheDocument();
    });

    it("should handle many items", () => {
      const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
      render(
        <Carousel>
          <CarouselContent>
            {items.map((item, i) => (
              <CarouselItem key={i}>{item}</CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      );

      items.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("should handle navigation buttons with custom event handlers", () => {
      const handlePrev = vi.fn();
      const handleNext = vi.fn();

      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselPrevious onClick={handlePrev} />
          <CarouselNext onClick={handleNext} />
        </Carousel>
      );

      screen.getByRole("button", { name: /previous slide/i }).click();
      expect(handlePrev).toHaveBeenCalledTimes(1);

      screen.getByRole("button", { name: /next slide/i }).click();
      expect(handleNext).toHaveBeenCalledTimes(1);
    });
  });
});
