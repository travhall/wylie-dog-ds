import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/preact";
import { DiffReview } from "../DiffReview";
import { buildSyncDiff } from "../../../plugin/sync/sync-diff";
import type { SyncDirection } from "../../../plugin/sync/sync-diff";
import { buildBaseline, hashTokens } from "../../../plugin/sync/sync-baseline";
import type {
  ExportData,
  ProcessedToken,
} from "../../../plugin/variables/processor";

const tok = (
  $value: unknown,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type: "number", $value, ...extra });

const col = (
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData => ({ [name]: { variables } });

const agreed = (tokens: ExportData[]) =>
  buildBaseline(hashTokens(tokens), hashTokens(tokens));

function diffOf(
  direction: SyncDirection,
  local: ExportData[],
  remote: ExportData[],
  base: ExportData[] | null = remote
) {
  return buildSyncDiff({
    direction,
    baseline: base ? agreed(base) : null,
    localTokens: local,
    remoteTokens: remote,
  });
}

const synced = [col("primitive", { a: tok(1), b: tok(2) })];

function setup(
  diff: ReturnType<typeof diffOf>,
  props: Partial<Parameters<typeof DiffReview>[0]> = {}
) {
  const handlers = {
    onConfirm: vi.fn(),
    onAdvanced: vi.fn(),
    onPushFirst: vi.fn(),
    onClose: vi.fn(),
  };
  render(<DiffReview diff={diff} {...handlers} {...props} />);
  return handlers;
}

describe("DiffReview: empty states", () => {
  it.each([
    ["push", "Nothing to push", /would change nothing/],
    ["pull", "Nothing to pull", /would change nothing/],
    ["overview", "Figma and GitHub are in sync", /hold the same tokens/],
  ] as const)(
    "says so plainly for %s and offers only Close",
    (direction, title, message) => {
      const { onClose } = setup(diffOf(direction, synced, synced));
      expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(message);
      expect(screen.queryByText(/^Push to|^Pull from/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("Close"));
      expect(onClose).toHaveBeenCalled();
    }
  );
});

describe("DiffReview: Push", () => {
  const local = [col("primitive", { a: tok(9), c: tok(3) })];

  it("groups rows by what will happen, with counts and old to new values", () => {
    setup(diffOf("push", local, synced), { branch: "main" });
    expect(
      screen.getByRole("dialog", {
        name: "Push will change 3 tokens on GitHub",
      })
    ).toBeInTheDocument();
    const changed = screen.getByRole("region", {
      name: "Will be changed on GitHub",
    });
    expect(within(changed).getByText("a")).toBeInTheDocument();
    expect(within(changed).getByText("1")).toBeInTheDocument();
    expect(within(changed).getByText("9")).toBeInTheDocument();
    expect(screen.getByText("Will be added to GitHub (1)")).toBeInTheDocument();
    expect(
      screen.getByText("Will be removed from GitHub (1)")
    ).toBeInTheDocument();
    expect(screen.getByText("3 to push")).toBeInTheDocument();
  });

  it("names the branch on the button and confirms", () => {
    const { onConfirm } = setup(diffOf("push", local, synced), {
      branch: "main",
    });
    fireEvent.click(screen.getByText("Push to main"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("in pull request mode says so and relabels the button", () => {
    setup(diffOf("push", local, synced), { branch: "main", prMode: true });
    expect(screen.getByRole("note")).toHaveTextContent(
      "This opens a pull request against main. Nothing changes on main until it is merged."
    );
    expect(screen.getByText("Open pull request")).toBeInTheDocument();
  });

  it("shows no pull request notice in direct mode", () => {
    setup(diffOf("push", local, synced), { branch: "main" });
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });
});

describe("DiffReview: rows", () => {
  it("shows a rename with both names", () => {
    const remote = [col("primitive", { "z.1": tok(10) })];
    const renamed = [col("primitive", { "z.01": tok(10) })];
    setup(diffOf("push", renamed, remote));
    expect(
      screen.getByRole("region", { name: "Will be renamed on GitHub" })
    ).toHaveTextContent("z.1 → z.01");
  });

  it("lists every mode and draws a swatch for colours", () => {
    const base = [
      col("semantic", {
        bg: tok("#ffffff", {
          valuesByMode: { Light: "#ffffff", Dark: "#000000" },
        }),
      }),
    ];
    const edited = [
      col("semantic", {
        bg: tok("#ffffff", {
          valuesByMode: { Light: "#ffffff", Dark: "#111111" },
        }),
      }),
    ];
    setup(diffOf("push", edited, base));
    expect(screen.getByText("#111111", { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText("Dark:")).toHaveLength(2);
    expect(document.querySelector('[title="#111111"]')).toBeInTheDocument();
  });

  it("notes a description change", () => {
    const edited = [
      col("primitive", {
        a: tok(1, { $description: "documented" }),
        b: tok(2),
      }),
    ];
    setup(diffOf("push", edited, synced));
    expect(screen.getByText("description changed")).toBeInTheDocument();
  });

  it("labels Figma-only edits a Pull would overwrite", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    setup(diffOf("pull", local, synced));
    expect(screen.getByText("Overwrites your Figma edit")).toBeInTheDocument();
  });
});

describe("DiffReview: long lists", () => {
  const many = (n: number) =>
    col(
      "primitive",
      Object.fromEntries(Array.from({ length: n }, (_, i) => [`t${i}`, tok(i)]))
    );

  it("shows a filter only for longer lists, and filters by name", () => {
    setup(diffOf("push", [many(12)], [many(0)]));
    const filter = screen.getByLabelText("Filter tokens");
    fireEvent.input(filter, { target: { value: "t11" } });
    expect(screen.getByText("t11")).toBeInTheDocument();
    expect(screen.queryByText("t3")).not.toBeInTheDocument();
    fireEvent.input(filter, { target: { value: "zzz" } });
    expect(screen.getByText(/No tokens match/)).toBeInTheDocument();
  });

  it("does not show a filter for a short list", () => {
    setup(diffOf("push", [many(3)], [many(0)]));
    expect(screen.queryByLabelText("Filter tokens")).not.toBeInTheDocument();
  });

  it("renders a window of 100 rows and pages the rest", () => {
    setup(diffOf("push", [many(130)], [many(0)]));
    expect(screen.getAllByRole("listitem")).toHaveLength(100);
    fireEvent.click(screen.getByText(/Show 30 more/));
    expect(screen.getAllByRole("listitem")).toHaveLength(130);
  });
});

describe("DiffReview: Pull deletions and choices", () => {
  const remote = [col("primitive", { a: tok(1) })];

  it("lists deletions in their own group and holds Pull until acknowledged", () => {
    const { onConfirm } = setup(diffOf("pull", synced, remote, synced));
    expect(
      screen.getByRole("region", { name: "Will be removed from Figma" })
    ).toHaveTextContent("b");
    const pull = screen.getByText("Pull from GitHub");
    expect(pull).toBeDisabled();
    fireEvent.click(pull);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByLabelText(
        /I understand 1 variable will be deleted from Figma/
      )
    );
    expect(pull).toBeEnabled();
    fireEvent.click(pull);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("needs no acknowledgement when nothing is deleted", () => {
    const changed = [col("primitive", { a: tok(1), b: tok(7) })];
    setup(diffOf("pull", synced, changed, synced));
    expect(screen.queryByLabelText(/I understand/)).not.toBeInTheDocument();
    expect(screen.getByText("Pull from GitHub")).toBeEnabled();
  });

  it("offers per-token choice and, when Figma edits would be lost, Push first", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    const { onAdvanced, onPushFirst } = setup(diffOf("pull", local, synced));
    expect(screen.getByRole("note")).toHaveTextContent(
      "1 change made in Figma since the last sync will be overwritten"
    );
    fireEvent.click(screen.getByText("Choose per token…"));
    fireEvent.click(screen.getByText("Push first"));
    expect(onAdvanced).toHaveBeenCalled();
    expect(onPushFirst).toHaveBeenCalled();
  });

  it("hides Push first when no Figma edit would be lost", () => {
    const changed = [col("primitive", { a: tok(1), b: tok(7) })];
    setup(diffOf("pull", synced, changed, synced));
    expect(screen.queryByText("Push first")).not.toBeInTheDocument();
  });
});

describe("DiffReview: no baseline, keyboard and aria", () => {
  it("says the direction is unknown without a baseline", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    setup(diffOf("pull", local, synced, null));
    expect(screen.getByRole("note")).toHaveTextContent(
      "no record of the last sync"
    );
    expect(screen.queryByText(/to push|to pull/)).not.toBeInTheDocument();
  });

  it("closes on Escape and starts focus on the safe button", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    const { onClose } = setup(diffOf("push", local, synced));
    expect(screen.getByText("Cancel")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps Tab inside the dialog", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    setup(diffOf("push", local, synced), { branch: "main" });
    const last = screen.getByText("Push to main");
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    // Wraps to the first control in the dialog.
    expect(screen.getByText("Choose per token…")).toHaveFocus();
  });

  it("is a labelled modal dialog", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    setup(diffOf("push", local, synced));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName(/Push will change/);
  });
});
