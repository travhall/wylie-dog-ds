import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/preact";
import { SyncChangesSummary } from "../SyncChangesSummary";
import type { SyncChangeSummary } from "../../../plugin/sync/change-summary";

const summary: SyncChangeSummary = {
  applied: [
    {
      collection: "primitive",
      token: "space.025",
      kind: "changed",
      from: "1px",
      to: "2px",
    },
    {
      collection: "primitive",
      token: "space.010",
      kind: "added",
      to: "1px",
    },
    {
      collection: "components",
      token: "badge.default.text",
      kind: "changed",
      from: "Light: {a} · Dark: {b}",
      to: "{color.text.on-solid}",
    },
    { collection: "semantic", token: "old", kind: "removed", from: "5px" },
  ],
  kept: [
    {
      collection: "semantic",
      token: "color.text.info",
      kind: "changed",
      from: "{a}",
      to: "{b}",
    },
  ],
};

function setup(data: SyncChangeSummary = summary) {
  const onClose = vi.fn();
  render(<SyncChangesSummary summary={data} onClose={onClose} />);
  return { onClose };
}

describe("SyncChangesSummary", () => {
  it("is a labelled dialog that counts the applied changes", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(
      within(dialog).getByText("4 changes applied to Figma")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("1 difference kept as your Figma version.")
    ).toBeInTheDocument();
  });

  it("groups applied changes by kind and shows before and after", () => {
    setup();
    expect(screen.getByText("Changed (2)")).toBeInTheDocument();
    expect(screen.getByText("Added (1)")).toBeInTheDocument();
    expect(screen.getByText("Removed (1)")).toBeInTheDocument();
    expect(screen.getByText("space.025")).toBeInTheDocument();
    expect(screen.getByText("2px")).toBeInTheDocument();
    expect(screen.getByText("Light: {a} · Dark: {b}")).toBeInTheDocument();
    expect(screen.getByText(/→ removed/)).toBeInTheDocument();
  });

  it("lists kept differences in a collapsed section", () => {
    setup();
    const details = screen
      .getByText("Kept as in Figma (1)")
      .closest("details") as HTMLElement;
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(within(details).getByText("color.text.info")).toBeInTheDocument();
  });

  it("uses the singular and omits empty sections", () => {
    setup({
      applied: [{ collection: "c", token: "t", kind: "added", to: "1" }],
      kept: [],
    });
    expect(screen.getByText("1 change applied to Figma")).toBeInTheDocument();
    expect(
      screen.getByText("Every difference took the GitHub version.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Changed/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kept as in Figma/)).not.toBeInTheDocument();
  });

  it("says so when nothing was applied", () => {
    setup({
      applied: [],
      kept: [
        { collection: "c", token: "t", kind: "changed", from: "a", to: "b" },
      ],
    });
    expect(screen.getByText("No changes applied to Figma")).toBeInTheDocument();
    expect(
      screen.getByText("1 difference kept as your Figma version.")
    ).toBeInTheDocument();
  });

  it("pluralises the kept count", () => {
    const item = { collection: "c", token: "t", kind: "changed" as const };
    setup({ applied: [], kept: [item, { ...item, token: "u" }] });
    expect(
      screen.getByText("2 differences kept as your Figma version.")
    ).toBeInTheDocument();
  });

  it("closes from Done and from the backdrop, but not from the panel", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Done"));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
