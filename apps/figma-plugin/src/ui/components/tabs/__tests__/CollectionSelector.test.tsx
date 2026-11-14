import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { CollectionSelector } from "../sync/CollectionSelector";

const collections = [
  { id: "1", name: "palette", variableCount: 6 },
  { id: "2", name: "theme", variableCount: 3 },
];

const setup = (over = {}) => {
  const handlers = {
    onToggle: vi.fn(),
    onSelectAll: vi.fn(),
    onClear: vi.fn(),
  };
  render(
    <CollectionSelector
      collections={collections}
      selected={new Set(["2"])}
      {...handlers}
      {...over}
    />
  );
  return handlers;
};

describe("CollectionSelector", () => {
  it("says these are the collections to push, with counts", () => {
    setup();
    expect(screen.getByText("Collections to push")).toBeInTheDocument();
    expect(screen.getByText("palette")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("toggles a collection by clicking its row", () => {
    const { onToggle } = setup();
    fireEvent.click(screen.getByText("palette"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("selects all and clears", () => {
    const { onSelectAll, onClear } = setup();
    fireEvent.click(screen.getByText("Select all"));
    fireEvent.click(screen.getByText("Clear"));
    expect(onSelectAll).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
  });

  it("marks the collections that changed in Figma", () => {
    setup({ changedNames: new Set(["theme"]) });
    expect(screen.getAllByText("changed in Figma")).toHaveLength(1);
  });

  it("renders nothing for no collections", () => {
    setup({ collections: [] });
    expect(screen.queryByText("Collections to push")).not.toBeInTheDocument();
  });
});
