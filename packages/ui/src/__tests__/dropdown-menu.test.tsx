import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu";

expect.extend(toHaveNoViolations);

const TestDropdownMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem>
        New File
        <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>Save</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe("DropdownMenu", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestDropdownMenu />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper aria-expanded state", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      const trigger = screen.getByText("Open Menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should have proper aria-haspopup attribute", () => {
      render(<TestDropdownMenu />);

      const trigger = screen.getByText("Open Menu");
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    });
  });

  describe("Functionality", () => {
    it("should render trigger", () => {
      render(<TestDropdownMenu />);
      expect(screen.getByText("Open Menu")).toBeInTheDocument();
    });

    it("should not show menu when closed", () => {
      render(<TestDropdownMenu />);
      expect(screen.queryByText("New File")).not.toBeInTheDocument();
    });

    it("should open menu on trigger click", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByText("New File")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
      });
    });

    it("should close menu on item click", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.queryByText("Save")).not.toBeInTheDocument();
      });
    });

    it("should execute item callback", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleSelect}>
              Click me
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Click me")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Click me"));

      expect(handleSelect).toHaveBeenCalled();
    });

    it("should not select disabled items", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              Disabled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Disabled")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Disabled"));

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should open on Enter key", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      const trigger = screen.getByText("Open Menu");
      trigger.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });

    it("should navigate items with arrow keys", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[1]).toHaveFocus();
    });

    it("should close on Escape key", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });
  });

  describe("Sub-components", () => {
    it("should render checkbox items", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Enabled</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>
              Disabled
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Enabled")).toBeInTheDocument();
        expect(screen.getByText("Disabled")).toBeInTheDocument();
      });
    });

    it("should render radio items", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });
    });

    it("should render separator", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]');
        expect(separator).toBeInTheDocument();
      });
    });

    it("should render label", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("should render shortcut", async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      await user.click(screen.getByText("Open Menu"));

      await waitFor(() => {
        expect(screen.getByText("⌘N")).toBeInTheDocument();
      });
    });
  });

  describe("Integration", () => {
    it("should forward ref to content", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent ref={ref}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty menu", async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent />
        </DropdownMenu>
      );

      await user.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });
  });
});
