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

describe("DiffReview: overview and Mark as synced", () => {
  it("names each side instead of implying a direction", () => {
    const local = [col("primitive", { a: tok(9), c: tok(3) })];
    // The real overview (opened from the status card) passes no callbacks.
    setup(diffOf("overview", local, synced), {
      onConfirm: undefined,
      onAdvanced: undefined,
      onPushFirst: undefined,
    });
    expect(
      screen.getByRole("dialog", {
        name: "3 differences between Figma and GitHub",
      })
    ).toBeInTheDocument();
    const different = screen.getByRole("region", { name: "Different values" });
    expect(within(different).getByText("Figma")).toBeInTheDocument();
    expect(within(different).getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Only in Figma (1)")).toBeInTheDocument();
    expect(screen.getByText("Only on GitHub (1)")).toBeInTheDocument();
    // Read-only: nothing to confirm.
    expect(screen.queryByText(/^Push to|^Pull from/)).not.toBeInTheDocument();
  });

  it("offers Mark as synced only for an empty review", () => {
    const onMarkSynced = vi.fn();
    setup(diffOf("pull", synced, synced, null), { onMarkSynced });
    expect(screen.getByRole("status")).toHaveTextContent(
      "no record of a sync yet"
    );
    fireEvent.click(screen.getByText("Mark as synced"));
    expect(onMarkSynced).toHaveBeenCalledTimes(1);
  });

  it("does not offer Mark as synced when there are differences", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    setup(diffOf("pull", local, synced), { onMarkSynced: vi.fn() });
    expect(screen.queryByText("Mark as synced")).not.toBeInTheDocument();
  });
});

describe("DiffReview: picker scopes (plan 202)", () => {
  const tokens = [
    col("primitive", {
      "font-size.sm": { $type: "number", $value: 14 },
      "font-size.md": { $type: "number", $value: 16 },
      "font-weight.bold": { $type: "number", $value: 700 },
    }),
  ];
  const ALL = ["ALL_SCOPES"];
  const stale = {
    primitive: {
      "font-size.sm": ALL,
      "font-size.md": ALL,
      "font-weight.bold": ALL,
    },
  };
  const scoped = (direction: SyncDirection, localScopes = stale) =>
    buildSyncDiff({
      direction,
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
      localScopes,
    });

  it("lists the groups for a scope-only Pull, with the variables behind each, and confirms", () => {
    const { onConfirm } = setup(scoped("pull"));
    expect(
      screen.getByRole("dialog", {
        name: "Pull will update the picker scopes of 3 variables",
      })
    ).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Picker scopes" });
    expect(
      within(section).getByText(/2 variables: all pickers/)
    ).toBeInTheDocument();
    expect(section).toHaveTextContent("1 variable: all pickers → font weight");
    expect(
      within(section).getByText("primitive / font-size.sm")
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing to pull")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Pull from GitHub"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("still says nothing to pull when no scope differs", () => {
    setup(
      scoped("pull", {
        primitive: {
          "font-size.sm": ["FONT_SIZE"],
          "font-size.md": ["FONT_SIZE"],
          "font-weight.bold": ["FONT_WEIGHT"],
        },
      })
    );
    expect(
      screen.getByRole("dialog", { name: "Nothing to pull" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Pull from GitHub")).not.toBeInTheDocument();
  });

  it("shows scopes beside token rows in one Pull", () => {
    const changed = [
      col("primitive", {
        "font-size.sm": { $type: "number", $value: 15 },
        "font-size.md": { $type: "number", $value: 16 },
        "font-weight.bold": { $type: "number", $value: 700 },
      }),
    ];
    const diff = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: changed,
      localScopes: stale,
    });
    setup(diff);
    expect(
      screen.getByRole("dialog", {
        name: "Pull will change 1 token and the picker scopes of 2 variables in Figma",
      })
    ).toBeInTheDocument();
    expect(screen.queryByText(/No tokens match/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Picker scopes" })
    ).toBeInTheDocument();
  });

  it("makes the overview say tokens match but scopes differ, not 'in sync'", () => {
    setup(scoped("overview"), { onConfirm: undefined });
    expect(
      screen.getByRole("dialog", {
        name: "Tokens match, but 3 variables' picker scopes differ",
      })
    ).toBeInTheDocument();
    expect(screen.queryByText(/in sync/)).not.toBeInTheDocument();
  });

  it("never lists scopes in a Push", () => {
    setup(scoped("push"));
    expect(
      screen.getByRole("dialog", { name: "Nothing to push" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Picker scopes" })).toBeNull();
  });
});

describe("DiffReview: text styles (plan 205)", () => {
  const tokens = [
    col("primitive", { "typography.line-height.none": tok(125) }),
    col("components", {
      "button.line-height": tok("{typography.line-height.none}"),
    }),
  ];
  const style = (id: string, name: string, linked: boolean) => ({
    id,
    name,
    lineHeight: { unit: "PERCENT" as const, value: 100 },
    letterSpacing: { unit: "PERCENT" as const, value: 0 },
    ...(linked ? { lineHeightToken: "button.line-height" } : {}),
  });
  const styled = (
    direction: SyncDirection,
    localTextStyles = [
      style("S:1", "button/label/sm", true),
      style("S:2", "button/label/md", true),
      style("S:3", "designer/hero", false),
    ]
  ) =>
    buildSyncDiff({
      direction,
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
      localTextStyles,
    });

  it("lists the styles with from and to for a style-only Pull, and confirms", () => {
    const { onConfirm } = setup(styled("pull"));
    expect(
      screen.getByRole("dialog", {
        name: "Pull will update the line height and letter spacing of 2 text styles",
      })
    ).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Text styles" });
    expect(section).toHaveTextContent("Text styles will change (2)");
    expect(section).toHaveTextContent(
      "button/label/sm: line height 100% → 125%"
    );
    expect(screen.queryByText("Nothing to pull")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Pull from GitHub"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("shows styles with no link as a read-only report", () => {
    setup(styled("pull"));
    const section = screen.getByRole("region", { name: "Text styles" });
    expect(section).toHaveTextContent(
      "1 text style with no token link (not changed)"
    );
    expect(within(section).getByText("designer/hero")).toBeInTheDocument();
  });

  it("keeps 'Nothing to pull' when only unlinked styles exist, but still lists them", () => {
    setup(styled("pull", [style("S:3", "designer/hero", false)]));
    expect(
      screen.getByRole("dialog", { name: "Nothing to pull" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Pull from GitHub")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Text styles" })
    ).toHaveTextContent("designer/hero");
  });

  it("reports a linked style whose token is gone, without a change", () => {
    const gone = {
      ...style("S:1", "button/label/sm", false),
      lineHeightToken: "gone.line-height",
    };
    setup(styled("pull", [gone]));
    const section = screen.getByRole("region", { name: "Text styles" });
    expect(section).toHaveTextContent("no longer exists");
    expect(section).toHaveTextContent("button/label/sm (gone.line-height)");
    expect(section).not.toHaveTextContent("Text styles will change");
  });

  it("shows text styles beside scopes and tokens in the headline", () => {
    const changed = [
      col("primitive", { "typography.line-height.none": tok(130) }),
      tokens[1],
    ];
    const diff = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: changed,
      localTextStyles: [style("S:1", "button/label/sm", true)],
    });
    setup(diff);
    expect(
      screen.getByRole("dialog", {
        name: "Pull will change 1 token and the line height and letter spacing of 1 text style in Figma",
      })
    ).toBeInTheDocument();
  });

  it("makes the overview say tokens match but text styles differ", () => {
    setup(styled("overview"), { onConfirm: undefined });
    expect(
      screen.getByRole("dialog", {
        name: "Tokens match, but 2 text styles' line height or letter spacing differ",
      })
    ).toBeInTheDocument();
  });

  it("never lists text styles in a Push", () => {
    setup(styled("push"));
    expect(
      screen.getByRole("dialog", { name: "Nothing to push" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Text styles" })).toBeNull();
  });
});
