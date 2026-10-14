import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "../menubar";

const INSET = "pl-(--space-menubar-item-inset)";

describe("Menubar helper components", () => {
  it("renders labels, shortcuts, inset items and sub content", async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Plain label</MenubarLabel>
            <MenubarLabel inset>Inset label</MenubarLabel>
            <MenubarItem inset>
              Inset item{" "}
              <MenubarShortcut className="custom-shortcut">⌘I</MenubarShortcut>
            </MenubarItem>
            <MenubarSub open>
              <MenubarSubTrigger inset>More</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Nested item</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    await user.click(screen.getByText("File"));
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
