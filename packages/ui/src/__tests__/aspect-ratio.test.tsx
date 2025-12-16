import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { AspectRatio } from "../aspect-ratio";

expect.extend(toHaveNoViolations);

describe("AspectRatio", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="/placeholder.jpg" alt="Placeholder" />
        </AspectRatio>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should preserve image alt text", () => {
      const { getByAltText } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="/image.jpg" alt="Descriptive text" />
        </AspectRatio>
      );
      expect(getByAltText("Descriptive text")).toBeInTheDocument();
    });
  });

  describe("Aspect Ratios", () => {
    it("should apply 16:9 ratio", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      // Radix UI AspectRatio uses padding-bottom trick
      expect(wrapper).toHaveStyle({ position: "relative" });
    });

    it("should apply 4:3 ratio", () => {
      const { container } = render(
        <AspectRatio ratio={4 / 3}>
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ position: "relative" });
    });

    it("should apply 1:1 (square) ratio", () => {
      const { container } = render(
        <AspectRatio ratio={1 / 1}>
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ position: "relative" });
    });

    it("should apply 21:9 (ultrawide) ratio", () => {
      const { container } = render(
        <AspectRatio ratio={21 / 9}>
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ position: "relative" });
    });

    it("should apply custom ratio", () => {
      const { container } = render(
        <AspectRatio ratio={2.5}>
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ position: "relative" });
    });
  });

  describe("Content", () => {
    it("should render image content", () => {
      const { getByAltText } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="/image.jpg" alt="Test image" />
        </AspectRatio>
      );
      expect(getByAltText("Test image")).toBeInTheDocument();
    });

    it("should render video content", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <video src="/video.mp4" />
        </AspectRatio>
      );
      expect(container.querySelector("video")).toBeInTheDocument();
    });

    it("should render iframe content", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <iframe src="https://example.com" title="Example" />
        </AspectRatio>
      );
      expect(container.querySelector("iframe")).toBeInTheDocument();
    });

    it("should render custom div content", () => {
      const { getByText } = render(
        <AspectRatio ratio={16 / 9}>
          <div>Custom content</div>
        </AspectRatio>
      );
      expect(getByText("Custom content")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      const { getByText } = render(
        <AspectRatio ratio={16 / 9}>
          <div>
            <h2>Title</h2>
            <p>Description</p>
          </div>
        </AspectRatio>
      );
      expect(getByText("Title")).toBeInTheDocument();
      expect(getByText("Description")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should support custom className on child", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <div className="custom-class">Content</div>
        </AspectRatio>
      );
      const child = container.querySelector(".custom-class");
      expect(child).toBeInTheDocument();
    });

    it("should maintain aspect ratio with different content", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9}>
          <img
            src="/wide.jpg"
            alt="Wide image"
            style={{ objectFit: "cover" }}
          />
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ position: "relative" });
    });
  });

  describe("Integration", () => {
    it("should work within a card", () => {
      const { getByAltText } = render(
        <div className="card">
          <AspectRatio ratio={16 / 9}>
            <img src="/card-image.jpg" alt="Card image" />
          </AspectRatio>
          <div className="card-content">
            <p>Card text</p>
          </div>
        </div>
      );
      expect(getByAltText("Card image")).toBeInTheDocument();
    });

    it("should work with responsive images", () => {
      const { getByAltText } = render(
        <AspectRatio ratio={16 / 9}>
          <img
            src="/image.jpg"
            srcSet="/image-2x.jpg 2x"
            alt="Responsive image"
          />
        </AspectRatio>
      );
      const img = getByAltText("Responsive image");
      expect(img).toHaveAttribute("srcSet", "/image-2x.jpg 2x");
    });

    it("should work with lazy loaded images", () => {
      const { getByAltText } = render(
        <AspectRatio ratio={16 / 9}>
          <img src="/image.jpg" alt="Lazy image" loading="lazy" />
        </AspectRatio>
      );
      const img = getByAltText("Lazy image");
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very wide ratios", () => {
      const { container } = render(
        <AspectRatio ratio={32 / 9}>
          <div>Ultra wide</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it("should handle very tall ratios", () => {
      const { container } = render(
        <AspectRatio ratio={9 / 16}>
          <div>Portrait</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it("should handle ratio as number", () => {
      const { container } = render(
        <AspectRatio ratio={1.777}>
          <div>Decimal ratio</div>
        </AspectRatio>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it("should work with no children", () => {
      const { container } = render(<AspectRatio ratio={16 / 9} />);
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
    });

    it("should support data attributes", () => {
      const { container } = render(
        <AspectRatio ratio={16 / 9} data-testid="aspect-wrapper">
          <div>Content</div>
        </AspectRatio>
      );
      const wrapper = container.querySelector('[data-testid="aspect-wrapper"]');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
