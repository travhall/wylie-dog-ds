import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "../context-menu";

const INSET = "pl-(--space-context-menu-item-inset)";

async function openMenu() {
  const user = userEvent.setup();
  await user.pointer({
    keys: "[MouseRight]",
    target: screen.getByText("Right click me"),
  });
  await waitFor(() =>
    expect(screen.getByText("Plain label")).toBeInTheDocument()
  );
}

describe("ContextMenu helper components", () => {
  it("renders a label with and without inset", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Plain label</ContextMenuLabel>
          <ContextMenuLabel inset>Inset label</ContextMenuLabel>
        </ContextMenuContent>
      </ContextMenu>
    );
    await openMenu();
    expect(screen.getByText("Plain label").className).not.toContain(INSET);
    expect(screen.getByText("Inset label").className).toContain(INSET);
  });

  it("renders a shortcut and merges a custom className", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Plain label</ContextMenuLabel>
          <ContextMenuItem>
            Copy{" "}
            <ContextMenuShortcut className="custom-shortcut">
              ⌘C
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await openMenu();
    const shortcut = screen.getByText("⌘C");
    expect(shortcut).toHaveClass("custom-shortcut");
    expect(shortcut).toHaveClass("ml-auto");
  });

  it("applies inset to items and sub triggers, and renders sub content", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Plain label</ContextMenuLabel>
          <ContextMenuItem inset>Inset item</ContextMenuItem>
          <ContextMenuSub open>
            <ContextMenuSubTrigger inset>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Nested item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
    await openMenu();
    expect(screen.getByText("Inset item").className).toContain(INSET);
    expect(screen.getByText("More").className).toContain(INSET);
    expect(screen.getByText("Nested item")).toBeInTheDocument();
  });
});
