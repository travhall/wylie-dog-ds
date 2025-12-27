import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "../menubar";

expect.extend(toHaveNoViolations);

const TestMenubar = () => (
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>New File</MenubarItem>
        <MenubarItem>Open</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Save</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Cut</MenubarItem>
        <MenubarItem>Copy</MenubarItem>
        <MenubarItem>Paste</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
);

describe("Menubar", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestMenubar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestMenubar />);

      await user.click(screen.getByText("File"));
      await waitFor(() =>
        expect(screen.getByText("New File")).toBeInTheDocument()
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Menubar Component", () => {
    it("should render with children", () => {
      render(<TestMenubar />);
      expect(screen.getByText("File")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Menubar ref={ref}>
          <MenubarMenu />
        </Menubar>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Menubar className="custom-menubar">
          <MenubarMenu />
        </Menubar>
      );
      const menubar = container.firstChild as HTMLElement;
      expect(menubar).toHaveClass("custom-menubar");
    });
  });

  describe("MenubarTrigger Component", () => {
    it("should open menu on click", async () => {
      const user = userEvent.setup();
      render(<TestMenubar />);

      await user.click(screen.getByText("File"));
      await waitFor(() =>
        expect(screen.getByText("New File")).toBeInTheDocument()
      );
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger ref={ref}>Test</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Item</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("MenubarItem Component", () => {
    it("should render menu items when open", async () => {
      const user = userEvent.setup();
      render(<TestMenubar />);

      await user.click(screen.getByText("File"));
      await waitFor(() => {
        expect(screen.getByText("New File")).toBeInTheDocument();
        expect(screen.getByText("Open")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
            <MenubarContent>
              <MenubarItem ref={ref}>Item</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("Menu"));
      await waitFor(() => expect(ref.current).toBeInstanceOf(HTMLDivElement));
    });
  });

  describe("MenubarCheckboxItem Component", () => {
    it("should render checkbox items", async () => {
      const user = userEvent.setup();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem>Show Toolbar</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("View"));
      await waitFor(() =>
        expect(screen.getByText("Show Toolbar")).toBeInTheDocument()
      );
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem ref={ref}>Item</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("Menu"));
      await waitFor(() => expect(ref.current).toBeInstanceOf(HTMLDivElement));
    });
  });

  describe("MenubarRadioGroup Component", () => {
    it("should render radio items", async () => {
      const user = userEvent.setup();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Options</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="option1">
                <MenubarRadioItem value="option1">Option 1</MenubarRadioItem>
                <MenubarRadioItem value="option2">Option 2</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("Options"));
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });
    });
  });

  describe("MenubarSeparator Component", () => {
    it("should render separators", async () => {
      const user = userEvent.setup();
      render(<TestMenubar />);

      await user.click(screen.getByText("File"));
      await waitFor(() => {
        expect(screen.getByText("New File")).toBeInTheDocument();
      });

      // Separators are rendered in portal (document.body)
      const separators = document.body.querySelectorAll('[role="separator"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Item 1</MenubarItem>
              <MenubarSeparator ref={ref} />
              <MenubarItem>Item 2</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("Menu"));
      await waitFor(() => expect(ref.current).toBeInstanceOf(HTMLDivElement));
    });
  });

  describe("Integration", () => {
    it("should work with multiple menus", async () => {
      const user = userEvent.setup();
      render(<TestMenubar />);

      await user.click(screen.getByText("File"));
      await waitFor(() =>
        expect(screen.getByText("New File")).toBeInTheDocument()
      );

      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByText("New File")).not.toBeInTheDocument()
      );

      await user.click(screen.getByText("Edit"));
      await waitFor(() => expect(screen.getByText("Cut")).toBeInTheDocument());
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<TestMenubar />);

      await user.tab();
      expect(screen.getByText("File")).toHaveFocus();
      await user.keyboard("{Enter}");

      await waitFor(() =>
        expect(screen.getByText("New File")).toBeInTheDocument()
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty menubar", () => {
      render(<Menubar />);
      expect(true).toBe(true);
    });

    it("should handle menu without items", async () => {
      const user = userEvent.setup();
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Empty</MenubarTrigger>
            <MenubarContent />
          </MenubarMenu>
        </Menubar>
      );

      await user.click(screen.getByText("Empty"));
      expect(true).toBe(true);
    });
  });
});
