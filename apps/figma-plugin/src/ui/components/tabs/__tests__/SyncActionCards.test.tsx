import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { SyncActionCards } from "../sync/SyncActionCards";

const setup = (over = {}) => {
  const onPush = vi.fn();
  const onPull = vi.fn();
  render(
    <SyncActionCards
      loading={false}
      selectedCount={0}
      pushHint={null}
      onPush={onPush}
      onPull={onPull}
      {...over}
    />
  );
  return { onPush, onPull };
};

describe("SyncActionCards", () => {
  it("says in a sentence what Push and Pull do, and that you review first", () => {
    setup();
    expect(
      screen.getByText(/Send the ticked collections from Figma to GitHub/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bring everything in the repository into Figma/)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/You review the changes first/)).toHaveLength(2);
  });

  it("disables Push with a reason when nothing is ticked", () => {
    setup({ pushHint: "Tick the collections to push." });
    const push = screen.getByRole("button", { name: "Push" });
    expect(push).toBeDisabled();
    expect(
      screen.getByText("Tick the collections to push.")
    ).toBeInTheDocument();
    expect(push).toHaveAttribute("aria-describedby", "push-hint");
  });

  it("counts the ticked collections and pushes", () => {
    const { onPush } = setup({ selectedCount: 2 });
    const push = screen.getByRole("button", { name: "Push 2" });
    expect(push).toBeEnabled();
    fireEvent.click(push);
    expect(onPush).toHaveBeenCalled();
  });

  it("pulls everything, with nothing ticked", () => {
    const { onPull } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Pull" }));
    expect(onPull).toHaveBeenCalled();
  });

  it("disables both while a sync runs, and hides the hint", () => {
    setup({ loading: true, selectedCount: 1, pushHint: "Tick them." });
    expect(screen.getByRole("button", { name: "Push 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pull" })).toBeDisabled();
    expect(screen.queryByText("Tick them.")).not.toBeInTheDocument();
  });
});
