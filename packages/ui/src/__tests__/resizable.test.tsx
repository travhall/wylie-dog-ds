import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../resizable";

expect.extend(toHaveNoViolations);

describe("Resizable", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ResizablePanelGroup", () => {
    it("should render with children", () => {
      render(
        <ResizablePanelGroup>
          <div>Child content</div>
        </ResizablePanelGroup>
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ResizablePanelGroup ref={ref}>Content</ResizablePanelGroup>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ResizablePanelGroup className="custom-group">
          Content
        </ResizablePanelGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("custom-group");
    });

    it("should have horizontal direction by default", () => {
      const { container } = render(
        <ResizablePanelGroup>Content</ResizablePanelGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveAttribute("data-panel-group-direction", "horizontal");
    });

    it("should support vertical direction", () => {
      const { container } = render(
        <ResizablePanelGroup direction="vertical">Content</ResizablePanelGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveAttribute("data-panel-group-direction", "vertical");
    });

    it("should apply flex w-full classes", () => {
      const { container } = render(
        <ResizablePanelGroup>Content</ResizablePanelGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("flex", "w-full");
    });
  });

  describe("ResizablePanel", () => {
    it("should render with children", () => {
      render(<ResizablePanel>Panel content</ResizablePanel>);
      expect(screen.getByText("Panel content")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ResizablePanel ref={ref}>Content</ResizablePanel>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ResizablePanel className="custom-panel">Content</ResizablePanel>
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveClass("custom-panel");
    });

    it("should have flex-1 class", () => {
      const { container } = render(<ResizablePanel>Content</ResizablePanel>);
      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveClass("flex-1");
    });

    it("should accept size props", () => {
      const { container } = render(
        <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
          Content
        </ResizablePanel>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("ResizableHandle", () => {
    it("should render without handle by default", () => {
      const { container } = render(<ResizableHandle />);
      const icon = container.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });

    it("should render with handle when withHandle is true", () => {
      const { container } = render(<ResizableHandle withHandle />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ResizableHandle ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ResizableHandle className="custom-handle" />
      );
      const handle = container.firstChild as HTMLElement;
      expect(handle).toHaveClass("custom-handle");
    });

    it("should have relative flex classes", () => {
      const { container } = render(<ResizableHandle />);
      const handle = container.firstChild as HTMLElement;
      expect(handle).toHaveClass("relative", "flex");
    });
  });

  describe("Integration", () => {
    it("should compose all components correctly", () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Left Panel</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>Right Panel</ResizablePanel>
        </ResizablePanelGroup>
      );

      expect(screen.getByText("Left Panel")).toBeInTheDocument();
      expect(screen.getByText("Right Panel")).toBeInTheDocument();
    });

    it("should work with vertical layout", () => {
      render(
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>Top Panel</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Bottom Panel</ResizablePanel>
        </ResizablePanelGroup>
      );

      expect(screen.getByText("Top Panel")).toBeInTheDocument();
      expect(screen.getByText("Bottom Panel")).toBeInTheDocument();
    });

    it("should support multiple panels", () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 3</ResizablePanel>
        </ResizablePanelGroup>
      );

      expect(screen.getByText("Panel 1")).toBeInTheDocument();
      expect(screen.getByText("Panel 2")).toBeInTheDocument();
      expect(screen.getByText("Panel 3")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty panel group", () => {
      const { container } = render(<ResizablePanelGroup />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle panel without content", () => {
      const { container } = render(<ResizablePanel />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
