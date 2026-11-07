import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

    it("should scroll horizontally and snap", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent>Content</CarouselContent>
        </Carousel>
      );
      const content = container.querySelector(".overflow-x-auto");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("snap-x", "snap-mandatory");
    });

    it("applies extra props to a single element, not both wrapper divs", () => {
      const { container } = render(
        <Carousel>
          <CarouselContent
            id="my-carousel-content"
            data-testid="content-root"
          />
        </Carousel>
      );
      const matches = container.querySelectorAll("#my-carousel-content");
      expect(matches).toHaveLength(1);
    });

    it("does not double-fire onClick", () => {
      const handleClick = vi.fn();
      render(
        <Carousel>
          <CarouselContent onClick={handleClick}>Content</CarouselContent>
        </Carousel>
      );
      screen.getByText("Content").click();
      expect(handleClick).toHaveBeenCalledTimes(1);
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
      render(
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
          <CarouselPrevious disabled={false} onClick={handlePrev} />
          <CarouselNext disabled={false} onClick={handleNext} />
        </Carousel>
      );

      screen.getByRole("button", { name: /previous slide/i }).click();
      expect(handlePrev).toHaveBeenCalledTimes(1);

      screen.getByRole("button", { name: /next slide/i }).click();
      expect(handleNext).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Carousel scrolling", () => {
  let scrollLeft = 0;
  let scrollBy: ReturnType<typeof vi.fn>;
  const restore: Array<() => void> = [];

  const define = (name: string, descriptor: PropertyDescriptor) => {
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      name
    );
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      ...descriptor,
    });
    restore.push(() => {
      if (original)
        Object.defineProperty(HTMLElement.prototype, name, original);
      else
        delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
          name
        ];
    });
  };

  beforeEach(() => {
    scrollLeft = 0;
    scrollBy = vi.fn();
    // 3 slides of 320px in a 320px viewport: 960px of content
    define("scrollWidth", { get: () => 960 });
    define("clientWidth", { get: () => 320 });
    define("offsetWidth", { get: () => 320 });
    define("scrollLeft", {
      get: () => scrollLeft,
      set: (v: number) => {
        scrollLeft = v;
      },
    });
    define("scrollBy", { value: scrollBy, writable: true });
  });

  afterEach(() => {
    while (restore.length) restore.pop()!();
  });

  const viewport = (container: HTMLElement) =>
    container.querySelector(".overflow-x-auto") as HTMLElement;

  it("starts with previous disabled and next enabled", () => {
    render(<TestCarousel />);
    expect(
      screen.getByRole("button", { name: /previous slide/i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeEnabled();
  });

  it("scrolls forward by one slide when next is clicked", () => {
    render(<TestCarousel />);
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 320 });
  });

  it("scrolls back by one slide when previous is clicked", () => {
    const { container } = render(<TestCarousel />);
    scrollLeft = 320;
    act(() => {
      fireEvent.scroll(viewport(container));
    });
    fireEvent.click(screen.getByRole("button", { name: /previous slide/i }));
    expect(scrollBy).toHaveBeenCalledWith({ left: -320 });
  });

  it("disables next at the end and enables previous", () => {
    const { container } = render(<TestCarousel />);
    scrollLeft = 640;
    act(() => {
      fireEvent.scroll(viewport(container));
    });
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /previous slide/i })
    ).toBeEnabled();
  });

  it("disables both buttons when every slide already fits", () => {
    define("scrollWidth", { get: () => 320 });
    render(<TestCarousel />);
    expect(
      screen.getByRole("button", { name: /previous slide/i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });

  it("scrolls with the arrow keys", () => {
    const { container } = render(<TestCarousel />);
    fireEvent.keyDown(viewport(container), { key: "ArrowRight" });
    expect(scrollBy).toHaveBeenCalledWith({ left: 320 });
    scrollLeft = 320;
    act(() => {
      fireEvent.scroll(viewport(container));
    });
    fireEvent.keyDown(viewport(container), { key: "ArrowLeft" });
    expect(scrollBy).toHaveBeenCalledWith({ left: -320 });
  });

  it("makes the scroll area keyboard focusable", () => {
    const { container } = render(<TestCarousel />);
    expect(viewport(container)).toHaveAttribute("tabindex", "0");
  });

  it("describes itself as a carousel of slides", () => {
    const { container } = render(<TestCarousel />);
    expect(container.firstChild).toHaveAttribute(
      "aria-roledescription",
      "carousel"
    );
    expect(screen.getByText("Slide 1")).toHaveAttribute(
      "aria-roledescription",
      "slide"
    );
  });

  it("spaces slides with the item-spacing token only", () => {
    const { container } = render(<TestCarousel />);
    const track = viewport(container).firstElementChild as HTMLElement;
    expect(track).toHaveClass("-ml-(--space-carousel-item-spacing)");
    expect(track.className).not.toMatch(/\bgap-/);
    expect(screen.getByText("Slide 1")).toHaveClass(
      "pl-(--space-carousel-item-spacing)",
      "snap-start"
    );
  });

  it("centres the chevron in the button", () => {
    render(<TestCarousel />);
    expect(screen.getByRole("button", { name: /next slide/i })).toHaveClass(
      "inline-flex",
      "items-center",
      "justify-center"
    );
  });

  it("passes the track to a callback ref and an object ref", () => {
    const callback = vi.fn();
    const object = React.createRef<HTMLDivElement>();
    const { rerender } = render(
      <Carousel>
        <CarouselContent ref={callback}>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(callback).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    rerender(
      <Carousel>
        <CarouselContent ref={object}>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(object.current).toBeInstanceOf(HTMLDivElement);
  });

  it("runs the consumer's scroll and key handlers too", () => {
    const onScroll = vi.fn();
    const onKeyDown = vi.fn();
    const { container } = render(
      <Carousel>
        <CarouselContent onScroll={onScroll} onKeyDown={onKeyDown}>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    fireEvent.scroll(viewport(container));
    fireEvent.keyDown(viewport(container), { key: "Home" });
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("leaves arrow keys alone when they come from inside a slide", () => {
    render(<TestCarousel />);
    fireEvent.keyDown(screen.getByText("Slide 1"), { key: "ArrowRight" });
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("does not scroll when a button's own click handler prevents it", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselNext onClick={(event) => event.preventDefault()} />
      </Carousel>
    );
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("re-measures when the track is resized", () => {
    const observers: Array<{ callback: () => void; disconnect: () => void }> =
      [];
    class FakeResizeObserver {
      callback: () => void;
      disconnect = vi.fn();
      constructor(callback: () => void) {
        this.callback = callback;
        observers.push(this);
      }
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    const { unmount } = render(<TestCarousel />);
    expect(screen.getByRole("button", { name: /next slide/i })).toBeEnabled();
    define("scrollWidth", { get: () => 320 });
    act(() => observers[0].callback());
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("keeps the buttons usable outside a Carousel", () => {
    render(
      <>
        <CarouselPrevious />
        <CarouselNext />
      </>
    );
    expect(
      screen.getByRole("button", { name: /previous slide/i })
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("keeps a button disabled when the disabled prop is set", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselNext disabled />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });
});
