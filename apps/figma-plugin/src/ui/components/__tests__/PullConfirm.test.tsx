import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { PullConfirm } from "../PullConfirm";
import type { PullCheck } from "../PullConfirm";
import type { SyncStatusResult } from "../../../plugin/sync/conflict-aware-github-client";
import type { ChangeEntry } from "../../../plugin/sync/sync-baseline";

const status = (over: Partial<SyncStatusResult> = {}): SyncStatusResult => ({
  upToDate: false,
  hasBaseline: true,
  toPush: 0,
  toPull: 0,
  conflicts: 0,
  renamedLocal: 0,
  renamedRemote: 0,
  differences: 0,
  entries: [],
  ...over,
});

const change = (over: Partial<ChangeEntry> = {}): ChangeEntry => ({
  collection: "primitive",
  token: "a",
  side: "local",
  kind: "modified",
  ...over,
});

function setup(check: PullCheck) {
  const onConfirm = vi.fn();
  const onPushFirst = vi.fn();
  const onCancel = vi.fn();
  render(
    <PullConfirm
      check={check}
      onConfirm={onConfirm}
      onPushFirst={onPushFirst}
      onCancel={onCancel}
    />
  );
  return { onConfirm, onPushFirst, onCancel };
}

describe("PullConfirm", () => {
  it("disables Pull while it is still checking what would be overwritten", () => {
    setup({ phase: "checking" });
    expect(
      screen.getByText(/Checking what Pull would overwrite/)
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeDisabled();
  });

  it("falls back to the generic warning if the check fails, and still allows Pull", () => {
    const { onConfirm } = setup({ phase: "failed" });
    expect(
      screen.getByText("Overwrites local Figma variables.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalled();
    expect(screen.queryByText("Push first")).not.toBeInTheDocument();
  });

  it("lists the Figma changes a Pull would overwrite, first few only", () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      change({ token: `t${i}` })
    );
    setup({ phase: "done", status: status({ toPush: 7, entries }) });
    expect(
      screen.getByText(
        "7 changes made in Figma since the last sync will be overwritten:"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("primitive / t0")).toBeInTheDocument();
    expect(screen.getByText("primitive / t4")).toBeInTheDocument();
    expect(screen.queryByText("primitive / t5")).not.toBeInTheDocument();
    expect(screen.getByText("and 2 more")).toBeInTheDocument();
  });

  it("names a rename with both names and counts conflicts as overwritten", () => {
    setup({
      phase: "done",
      status: status({
        toPush: 1,
        conflicts: 1,
        entries: [
          change({ kind: "renamed", token: "z.1", renamedTo: "z.01" }),
          change({ token: "c", side: "both" }),
          change({ token: "from-github", side: "remote" }),
        ],
      }),
    });
    expect(screen.getByText(/2 changes made in Figma/)).toBeInTheDocument();
    expect(screen.getByText("primitive / z.1 → z.01")).toBeInTheDocument();
    expect(screen.getByText("primitive / c")).toBeInTheDocument();
    // Changes that only exist on GitHub are what Pull is for, not a loss.
    expect(screen.queryByText(/from-github/)).not.toBeInTheDocument();
  });

  it("offers Pull anyway and Push first when changes would be lost", () => {
    const { onConfirm, onPushFirst, onCancel } = setup({
      phase: "done",
      status: status({ toPush: 1, entries: [change()] }),
    });
    fireEvent.click(screen.getByText("Push first"));
    expect(onPushFirst).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Pull anyway"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("says nothing would be lost when only GitHub changed", () => {
    setup({
      phase: "done",
      status: status({
        toPull: 1,
        entries: [change({ side: "remote" })],
      }),
    });
    expect(
      screen.getByText(/No Figma changes since the last sync/)
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeEnabled();
    expect(screen.queryByText("Push first")).not.toBeInTheDocument();
  });

  it("without a baseline warns about differences without claiming a direction", () => {
    setup({
      phase: "done",
      status: status({ hasBaseline: false, differences: 3 }),
    });
    expect(
      screen.getByText(
        /differ in 3 tokens, and there is no record of which side changed/
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Pull anyway")).toBeInTheDocument();
    expect(screen.getByText("Push first")).toBeInTheDocument();
  });

  it("without a baseline and without differences, no alarm", () => {
    setup({
      phase: "done",
      status: status({ hasBaseline: false, differences: 0, upToDate: true }),
    });
    expect(
      screen.getByText(/Figma already matches GitHub/)
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeEnabled();
  });
});
