import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
} from "../context-menu";

expect.extend(toHaveNoViolations);

const TestContextMenu = () => (
  <ContextMenu>
    <ContextMenuTrigger>Right click me</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Cut</ContextMenuItem>
      <ContextMenuItem>Copy</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Paste</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);

describe("ContextMenu", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestContextMenu />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => expect(screen.getByText("Cut")).toBeInTheDocument());

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ContextMenu Component", () => {
    it("should render trigger", () => {
      render(<TestContextMenu />);
      expect(screen.getByText("Right click me")).toBeInTheDocument();
    });

    it("should not show content initially", () => {
      render(<TestContextMenu />);
      expect(screen.queryByText("Cut")).not.toBeInTheDocument();
    });

    it("should show content on right click", async () => {
      const user = userEvent.setup();
      render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => expect(screen.getByText("Cut")).toBeInTheDocument());
    });
  });

  describe("ContextMenuItem Component", () => {
    it("should render menu items when open", async () => {
      const user = userEvent.setup();
      render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => {
        expect(screen.getByText("Cut")).toBeInTheDocument();
        expect(screen.getByText("Copy")).toBeInTheDocument();
        expect(screen.getByText("Paste")).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem ref={ref}>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      const trigger = screen.getByText("Trigger");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => expect(ref.current).toBeInstanceOf(HTMLDivElement));
    });
  });

  describe("ContextMenuCheckboxItem Component", () => {
    it("should render checkbox items", async () => {
      const user = userEvent.setup();
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem>Show Toolbar</ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      const trigger = screen.getByText("Trigger");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() =>
        expect(screen.getByText("Show Toolbar")).toBeInTheDocument()
      );
    });
  });

  describe("ContextMenuRadioGroup Component", () => {
    it("should render radio items", async () => {
      const user = userEvent.setup();
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuRadioGroup value="option1">
              <ContextMenuRadioItem value="option1">
                Option 1
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="option2">
                Option 2
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      );

      const trigger = screen.getByText("Trigger");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });
    });
  });

  describe("ContextMenuSeparator Component", () => {
    it("should render separators", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => {
        const separators = container.querySelectorAll('[role="separator"]');
        expect(separators.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Integration", () => {
    it("should compose all sub-components correctly", async () => {
      const user = userEvent.setup();
      render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => {
        expect(screen.getByText("Cut")).toBeInTheDocument();
        expect(screen.getByText("Copy")).toBeInTheDocument();
        expect(screen.getByText("Paste")).toBeInTheDocument();
      });
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestContextMenu />);

      const trigger = screen.getByText("Right click me");
      await user.pointer({ keys: "[MouseRight]", target: trigger });

      await waitFor(() => expect(screen.getByText("Cut")).toBeInTheDocument());

      await user.keyboard("{Escape}");

      await waitFor(() =>
        expect(screen.queryByText("Cut")).not.toBeInTheDocument()
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty context menu", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent />
        </ContextMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();
    });
  });
});
