import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../dropdown-menu";

const INSET = "pl-(--space-dropdown-menu-item-inset)";

describe("DropdownMenu helper components", () => {
  it("renders labels, shortcuts, inset items and sub content", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Plain label</DropdownMenuLabel>
          <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
          <DropdownMenuItem inset>
            Inset item{" "}
            <DropdownMenuShortcut className="custom-shortcut">
              ⌘I
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByText("Open menu"));
    await waitFor(() =>
      expect(screen.getByText("Plain label")).toBeInTheDocument()
    );

    expect(screen.getByText("Plain label").className).not.toContain(INSET);
    expect(screen.getByText("Inset label").className).toContain(INSET);
    expect(screen.getByText(/Inset item/).className).toContain(INSET);
    expect(screen.getByText("⌘I")).toHaveClass("custom-shortcut");
    expect(screen.getByText("More").className).toContain(INSET);
    expect(screen.getByText("Nested item")).toBeInTheDocument();
  });
});
