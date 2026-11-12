import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlusIcon } from "lucide-react";
import { Icon, iconVariants } from "../icon";

describe("Icon", () => {
  it("renders the glyph it is given", () => {
    const { container } = render(<Icon icon={PlusIcon} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies the token stroke weight to every glyph", () => {
    const { container } = render(<Icon icon={PlusIcon} />);
    expect(container.querySelector("svg")).toHaveClass(
      "stroke-(length:--space-icon-stroke-width)"
    );
  });

  it("draws the stroke at its token width at every size, not scaled by the glyph's grid", () => {
    // `icon.stroke-width` must mean the pixels drawn, as the Figma stroke bound to it does
    const { container } = render(<Icon icon={PlusIcon} size="sm" />);
    expect(container.querySelector("svg")).toHaveClass(
      "[&_*]:[vector-effect:non-scaling-stroke]"
    );
  });

  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "sets the %s size from the icon size token",
    (size) => {
      const { container } = render(<Icon icon={PlusIcon} size={size} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass(`h-(--space-icon-size-${size})`);
      expect(svg).toHaveClass(`w-(--space-icon-size-${size})`);
    }
  );

  it("adds no size class without a size, so the caller's className decides", () => {
    const { container } = render(
      <Icon icon={PlusIcon} className="h-(--space-x) w-(--space-x)" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-(--space-x)");
    expect(svg?.getAttribute("class")).not.toMatch(/space-icon-size/);
  });

  it("lets a className override the size", () => {
    const { container } = render(
      <Icon icon={PlusIcon} size="md" className="h-(--space-other)" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-(--space-other)");
    expect(svg).not.toHaveClass("h-(--space-icon-size-md)");
  });

  it("forwards its ref to the SVG element", () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Icon icon={PlusIcon} ref={ref} />);
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
  });

  it("passes other SVG props through, such as an accessible label", () => {
    const { getByLabelText } = render(
      <Icon icon={PlusIcon} aria-label="Add item" role="img" />
    );
    expect(getByLabelText("Add item")).toBeInTheDocument();
  });

  it("accepts any component that renders an SVG, not only lucide icons", () => {
    const Custom = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="custom" viewBox="0 0 24 24" {...props}>
        <path d="M2 12h20" />
      </svg>
    );
    const { getByTestId } = render(<Icon icon={Custom} size="lg" />);
    expect(getByTestId("custom")).toHaveClass("h-(--space-icon-size-lg)");
  });

  it("exposes iconVariants for callers that style their own element", () => {
    expect(iconVariants({ size: "sm" })).toContain("h-(--space-icon-size-sm)");
  });
});
