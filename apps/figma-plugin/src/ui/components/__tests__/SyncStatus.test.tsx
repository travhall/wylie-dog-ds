import type { ExportData } from "../../../plugin/variables/processor";
import { h } from "preact";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/preact";
import { SyncStatus } from "../SyncStatus";
import { buildSyncDiff } from "../../../plugin/sync/sync-diff";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";

type SyncResult = {
  upToDate: boolean;
  hasBaseline?: boolean;
  toPush?: number;
  toPull?: number;
  conflicts?: number;
  renamedLocal?: number;
  renamedRemote?: number;
  differences?: number;
};

function makeClient(impl: () => Promise<SyncResult>) {
  const getSyncStatus = vi.fn(impl);
  return {
    getSyncStatus,
    client: { getSyncStatus } as unknown as ConflictAwareGitHubClient,
  };
}

function pluginMessage(message: Record<string, unknown>) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data: { pluginMessage: message } })
    );
  });
}

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("SyncStatus", () => {
  let postMessage: MockInstance;

  beforeEach(() => {
    postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const posted = (type: string) =>
    postMessage.mock.calls.some(
      ([data]) =>
        (data as { pluginMessage?: { type?: string } })?.pluginMessage?.type ===
        type
    );

  describe("without a repository", () => {
    it("explains that a repository is needed and sends nothing", () => {
      const { client } = makeClient(async () => {
        throw new Error("unused");
      });
      render(<SyncStatus githubClient={client} githubConfigured={false} />);
      expect(
        screen.getByText(/Connect a repository to see sync status/)
      ).toBeInTheDocument();
      expect(postMessage).not.toHaveBeenCalled();
    });
  });

  describe("with a repository", () => {
    const upToDate = { upToDate: true, hasBaseline: true };

    it("asks the plugin for the last sync time and starts as up to date", () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      expect(posted("get-last-sync")).toBe(true);
      expect(screen.getByText("Up to date")).toBeInTheDocument();
      expect(screen.getByText("Last sync: Never")).toBeInTheDocument();
      // Opening the tab must not start a GitHub diff.
      expect(getSyncStatus).not.toHaveBeenCalled();
    });

    it.each([
      ["a few seconds ago", 5 * 1000, "Just now"],
      ["minutes ago", 5 * MIN + 1000, "5m ago"],
      ["hours ago", 3 * HOUR + MIN, "3h ago"],
      ["days ago", 2 * DAY + HOUR, "2d ago"],
    ])("formats a last sync %s", (_label, offset, expected) => {
      const { client } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      pluginMessage({ type: "last-sync-loaded", timestamp: ago(offset) });
      expect(screen.getByText(`Last sync: ${expected}`)).toBeInTheDocument();
    });

    it("shows a calendar date once the last sync is a week old or more", () => {
      const { client } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      const old = ago(10 * DAY);
      pluginMessage({ type: "last-sync-loaded", timestamp: old });
      expect(
        screen.getByText(`Last sync: ${new Date(old).toLocaleDateString()}`)
      ).toBeInTheDocument();
    });

    it("goes back to Never when the plugin has no last sync", () => {
      const { client } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      pluginMessage({ type: "last-sync-loaded", timestamp: ago(5 * MIN) });
      pluginMessage({ type: "last-sync-loaded", timestamp: null });
      expect(screen.getByText("Last sync: Never")).toBeInTheDocument();
    });

    it("ignores unrelated plugin messages", () => {
      const { client } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      pluginMessage({ type: "something-else", timestamp: ago(5 * MIN) });
      expect(screen.getByText("Last sync: Never")).toBeInTheDocument();
    });

    it("diffs local tokens against the remote when Refresh is clicked", async () => {
      const onRefresh = vi.fn();
      const { client, getSyncStatus } = makeClient(async () => ({
        upToDate: false,
        hasBaseline: true,
        toPush: 2,
        toPull: 3,
        conflicts: 1,
      }));
      render(
        <SyncStatus
          githubClient={client}
          githubConfigured
          onRefresh={onRefresh}
        />
      );
      pluginMessage({ type: "last-sync-loaded", timestamp: ago(5 * MIN) });

      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      expect(onRefresh).toHaveBeenCalledTimes(1);
      expect(posted("get-local-tokens")).toBe(true);

      const localTokens = [{ collection: "primitive" }];
      const baseline = {
        schema: 1,
        recordedAt: ago(5 * MIN),
        collections: {},
      };
      pluginMessage({ type: "local-tokens-exported", localTokens, baseline });

      await waitFor(() =>
        expect(screen.getByText("Changes detected")).toBeInTheDocument()
      );
      // The baseline that came with the Figma export is handed to the client.
      expect(getSyncStatus).toHaveBeenCalledWith(
        localTokens,
        baseline,
        undefined,
        undefined,
        undefined
      );
      expect(screen.getByText(/2 to push/)).toBeInTheDocument();
      expect(screen.getByText(/3 to pull/)).toBeInTheDocument();
      expect(screen.getByText(/1 conflict$/)).toBeInTheDocument();
      expect(screen.getAllByText("•")).toHaveLength(2);
      // The old wording is gone: nothing here says "local" or "remote".
      expect(
        screen.queryByText(/\blocal\b|\bremote\b/)
      ).not.toBeInTheDocument();
      // The last sync time survives the refresh.
      expect(screen.getByText("Last sync: 5m ago")).toBeInTheDocument();
    });

    it.each([
      ["push", { toPush: 4, toPull: 0 }, /4 to push/, /to pull/],
      ["pull", { toPush: 0, toPull: 1 }, /1 to pull/, /to push/],
    ])(
      "shows only the %s count when that is the only change",
      async (_label, counts, present, absent) => {
        const { client } = makeClient(async () => ({
          upToDate: false,
          hasBaseline: true,
          conflicts: 0,
          ...counts,
        }));
        render(<SyncStatus githubClient={client} githubConfigured />);
        fireEvent.click(screen.getByLabelText("Refresh sync status"));
        pluginMessage({ type: "local-tokens-exported", localTokens: [] });
        await waitFor(() =>
          expect(screen.getByText("Changes detected")).toBeInTheDocument()
        );
        expect(screen.getByText(present)).toBeInTheDocument();
        expect(screen.queryByText(absent)).not.toBeInTheDocument();
        expect(screen.queryByText("•")).not.toBeInTheDocument();
      }
    );

    it("never claims a direction when there is no baseline", async () => {
      const { client } = makeClient(async () => ({
        upToDate: false,
        hasBaseline: false,
        differences: 3,
      }));
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() =>
        expect(screen.getByText("Differences found")).toBeInTheDocument()
      );
      expect(
        screen.getByText("3 differences, direction unknown")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Pull once to set a baseline.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/to push|to pull|conflict/)
      ).not.toBeInTheDocument();
    });

    it("singularises one difference", async () => {
      const { client } = makeClient(async () => ({
        upToDate: false,
        hasBaseline: false,
        differences: 1,
      }));
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() =>
        expect(
          screen.getByText("1 difference, direction unknown")
        ).toBeInTheDocument()
      );
    });

    it("mentions renames, which are already counted in the totals", async () => {
      const { client } = makeClient(async () => ({
        upToDate: false,
        hasBaseline: true,
        toPush: 2,
        toPull: 0,
        conflicts: 0,
        renamedLocal: 1,
        renamedRemote: 0,
      }));
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() =>
        expect(screen.getByText("Includes 1 renamed")).toBeInTheDocument()
      );
    });

    it("treats a baseline sent in a malformed shape as no baseline", async () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({
        type: "local-tokens-exported",
        localTokens: [],
        baseline: { nonsense: true },
      });
      await waitFor(() =>
        expect(getSyncStatus).toHaveBeenCalledWith(
          [],
          null,
          undefined,
          undefined,
          undefined
        )
      );
    });

    it("falls back to an empty list when the plugin reports an export error", async () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-error" });
      await waitFor(() =>
        expect(getSyncStatus).toHaveBeenCalledWith(
          [],
          null,
          undefined,
          undefined,
          undefined
        )
      );
    });

    it("falls back to an empty list when the export has no tokens field", async () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported" });
      await waitFor(() =>
        expect(getSyncStatus).toHaveBeenCalledWith(
          [],
          null,
          undefined,
          undefined,
          undefined
        )
      );
    });

    it("stops waiting for the plugin after ten seconds", async () => {
      vi.useFakeTimers();
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      expect(getSyncStatus).not.toHaveBeenCalled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });
      expect(getSyncStatus).toHaveBeenCalledWith(
        [],
        null,
        undefined,
        undefined,
        undefined
      );
    });

    it("shows a checking state and disables Refresh while the diff runs", async () => {
      let finish: (value: SyncResult) => void = () => {};
      const { client, getSyncStatus } = makeClient(
        () => new Promise<SyncResult>((resolve) => (finish = resolve))
      );
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      expect(screen.getByText("Checking sync status…")).toBeInTheDocument();
      expect(screen.getByLabelText("Refresh sync status")).toBeDisabled();
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalled());
      await act(async () => finish(upToDate));
      await waitFor(() =>
        expect(screen.getByText("Up to date")).toBeInTheDocument()
      );
      expect(screen.getByLabelText("Refresh sync status")).not.toBeDisabled();
    });

    it("shows the error message when the diff fails", async () => {
      const { client } = makeClient(async () => {
        throw new Error("rate limited");
      });
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() =>
        expect(screen.getByText("Error checking status")).toBeInTheDocument()
      );
      expect(screen.getByText("rate limited")).toBeInTheDocument();
      expect(screen.queryByText(/Last sync/)).not.toBeInTheDocument();
    });

    it("uses a generic message when the failure is not an Error", async () => {
      const { client } = makeClient(() => Promise.reject("nope"));
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported", localTokens: [] });
      await waitFor(() =>
        expect(
          screen.getByText("Failed to check sync status")
        ).toBeInTheDocument()
      );
    });
  });
});

describe("SyncStatus review", () => {
  it("opens a read-only overview of the differences from Review changes", async () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const diff = buildSyncDiff({
      direction: "overview",
      baseline: null,
      localTokens: [
        { primitive: { variables: { a: { $type: "number", $value: 9 } } } },
      ],
      remoteTokens: [
        { primitive: { variables: { a: { $type: "number", $value: 1 } } } },
      ],
    });
    const getSyncStatus = vi.fn(async () => ({
      upToDate: false,
      hasBaseline: false,
      differences: 1,
      diff,
    }));
    const client = { getSyncStatus } as unknown as ConflictAwareGitHubClient;
    render(<SyncStatus githubClient={client} githubConfigured />);

    // Not offered before there is something to review.
    expect(screen.queryByLabelText("Review changes")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Refresh sync status"));
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            pluginMessage: { type: "local-tokens-exported", localTokens: [] },
          },
        })
      );
    });
    fireEvent.click(await screen.findByLabelText("Review changes"));

    expect(
      screen.getByRole("dialog", {
        name: /1 difference between Figma and GitHub/,
      })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("SyncStatus scopes (plan 202)", () => {
  const tokens = [
    {
      primitive: {
        variables: { "font-size.sm": { $type: "number", $value: 14 } },
      },
    },
  ];
  const run = async (current: string[]) => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const localScopes = { primitive: { "font-size.sm": current } };
    const diff = buildSyncDiff({
      direction: "overview",
      baseline: null,
      localTokens: tokens,
      remoteTokens: tokens,
      localScopes,
    });
    const getSyncStatus = vi.fn(async () => ({
      upToDate: true,
      hasBaseline: false,
      differences: 0,
      diff,
    }));
    const client = { getSyncStatus } as unknown as ConflictAwareGitHubClient;
    render(<SyncStatus githubClient={client} githubConfigured />);
    fireEvent.click(screen.getByLabelText("Refresh sync status"));
    pluginMessage({
      type: "local-tokens-exported",
      localTokens: tokens,
      localScopes,
    });
    await waitFor(() => expect(getSyncStatus).toHaveBeenCalled());
    await screen.findByLabelText("Review changes").catch(() => null);
    return { getSyncStatus, localScopes };
  };

  it("hands the scopes to the client, keeps tokens Up to date and adds a second line", async () => {
    const { getSyncStatus, localScopes } = await run(["ALL_SCOPES"]);
    expect(getSyncStatus).toHaveBeenCalledWith(
      tokens,
      null,
      localScopes,
      undefined,
      undefined
    );
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(
      await screen.findByText("1 variable's picker scopes will change on Pull")
    ).toBeInTheDocument();
  });

  it("opens an overview that says the scopes differ rather than 'in sync'", async () => {
    await run(["ALL_SCOPES"]);
    fireEvent.click(await screen.findByLabelText("Review changes"));
    expect(
      screen.getByRole("dialog", {
        name: "Tokens match, but 1 variable's picker scopes differ",
      })
    ).toBeInTheDocument();
  });

  it("adds no second line when the scopes already match the rules", async () => {
    await run(["FONT_SIZE"]);
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(screen.queryByText(/picker scopes will change/)).toBeNull();
  });
});

describe("SyncStatus text styles (plan 205)", () => {
  const tokens: ExportData[] = [
    {
      primitive: {
        variables: { "line-height.tight": { $type: "number", $value: 125 } },
      },
    },
    {
      components: {
        variables: {
          "button.line-height": {
            $type: "number",
            $value: "{line-height.tight}",
          },
        },
      },
    },
  ];
  const textStyles = [
    {
      id: "S:1",
      name: "button/label/sm",
      lineHeight: { unit: "PERCENT" as const, value: 100 },
      letterSpacing: { unit: "PERCENT" as const, value: 0 },
      lineHeightToken: "button.line-height",
    },
  ];
  const run = async (styles: typeof textStyles) => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const diff = buildSyncDiff({
      direction: "overview",
      baseline: null,
      localTokens: tokens,
      remoteTokens: tokens,
      localTextStyles: styles,
    });
    const getSyncStatus = vi.fn(async () => ({
      upToDate: true,
      hasBaseline: false,
      differences: 0,
      diff,
    }));
    const client = { getSyncStatus } as unknown as ConflictAwareGitHubClient;
    render(<SyncStatus githubClient={client} githubConfigured />);
    fireEvent.click(screen.getByLabelText("Refresh sync status"));
    pluginMessage({
      type: "local-tokens-exported",
      localTokens: tokens,
      textStyles: styles,
    });
    await waitFor(() => expect(getSyncStatus).toHaveBeenCalled());
    return { getSyncStatus };
  };

  it("hands the text styles to the client, keeps tokens Up to date and adds a second line", async () => {
    const { getSyncStatus } = await run(textStyles);
    expect(getSyncStatus).toHaveBeenCalledWith(
      tokens,
      null,
      undefined,
      textStyles,
      undefined
    );
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "1 text style's line height or letter spacing will change on Pull"
      )
    ).toBeInTheDocument();
  });

  it("adds no second line when the styles already match their tokens", async () => {
    await run([
      { ...textStyles[0], lineHeight: { unit: "PERCENT", value: 125 } },
    ]);
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(screen.queryByText(/text style.*will change on Pull/)).toBeNull();
  });
});

describe("SyncStatus text styles from definitions (plan 206)", () => {
  const tokens = [
    {
      primitive: {
        variables: {
          "typography.font-family.sans": {
            $type: "fontFamily",
            $value: "Manrope",
          },
          "typography.font-size.sm": { $type: "number", $value: 14 },
        },
      },
    },
  ] as unknown as ExportData[];
  const definitions = [
    {
      name: "tooltip",
      fontFamily: "typography.font-family.sans",
      fontSize: "typography.font-size.sm",
    },
  ];

  const run = async (
    includeTextStyles: boolean,
    fetchTextStyleDefinitions: ReturnType<typeof vi.fn>,
    options: {
      localTextStyles?: unknown[];
      onTextStylesAvailability?: (a: unknown) => void;
    } = {}
  ) => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const getSyncStatus = vi.fn(
      async (
        _tokens: unknown,
        _baseline: unknown,
        _scopes: unknown,
        localTextStyles: never,
        textStyleDefinitions: never
      ) => ({
        upToDate: true,
        hasBaseline: false,
        differences: 0,
        diff: buildSyncDiff({
          direction: "overview",
          baseline: null,
          localTokens: tokens,
          remoteTokens: tokens,
          localTextStyles,
          textStyleDefinitions,
        }),
      })
    );
    const client = {
      getSyncStatus,
      fetchTextStyleDefinitions,
    } as unknown as ConflictAwareGitHubClient;
    render(
      <SyncStatus
        githubClient={client}
        githubConfigured
        includeTextStyles={includeTextStyles}
        onTextStylesAvailability={options.onTextStylesAvailability}
      />
    );
    fireEvent.click(screen.getByLabelText("Refresh sync status"));
    pluginMessage({
      type: "local-tokens-exported",
      localTokens: tokens,
      textStyles: options.localTextStyles ?? [],
    });
    await waitFor(() => expect(getSyncStatus).toHaveBeenCalled());
    return { getSyncStatus };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("while Text styles is off, looks at the definitions but hands none to the client (plan 207)", async () => {
    const fetchDefs = vi
      .fn()
      .mockResolvedValue({ status: "found", definitions });
    const { getSyncStatus } = await run(false, fetchDefs);
    expect(fetchDefs).toHaveBeenCalledTimes(1);
    expect(getSyncStatus.mock.calls[0][4]).toBeUndefined();
    expect(screen.queryByText(/will be created on Pull/)).toBeNull();
  });

  describe("availability while Text styles is off (plan 207)", () => {
    it("names the unticked option and the count, and stops saying Up to date", async () => {
      const onAvailability = vi.fn();
      await run(
        false,
        vi.fn().mockResolvedValue({ status: "found", definitions }),
        { onTextStylesAvailability: onAvailability }
      );
      expect(
        await screen.findByText(
          "1 text style is available from GitHub. Tick Text styles to review it."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Tokens up to date")).toBeInTheDocument();
      expect(screen.queryByText("Up to date")).toBeNull();
      expect(onAvailability).toHaveBeenCalledWith({
        available: 1,
        managedExisting: 0,
      });
    });

    it("uses the plural form", async () => {
      await run(
        false,
        vi.fn().mockResolvedValue({
          status: "found",
          definitions: [definitions[0], { ...definitions[0], name: "badge" }],
        })
      );
      expect(
        await screen.findByText(
          "2 text styles are available from GitHub. Tick Text styles to review them."
        )
      ).toBeInTheDocument();
    });

    it("counts the styles the file already manages", async () => {
      const onAvailability = vi.fn();
      await run(
        false,
        vi.fn().mockResolvedValue({ status: "found", definitions }),
        {
          localTextStyles: [
            { id: "1", name: "a", managed: true },
            { id: "2", name: "b" },
          ],
          onTextStylesAvailability: onAvailability,
        }
      );
      await waitFor(() =>
        expect(onAvailability).toHaveBeenCalledWith({
          available: 1,
          managedExisting: 1,
        })
      );
    });

    it("shows nothing new when the branch has no definitions file", async () => {
      const onAvailability = vi.fn();
      await run(false, vi.fn().mockResolvedValue({ status: "absent" }), {
        onTextStylesAvailability: onAvailability,
      });
      expect(await screen.findByText("Up to date")).toBeInTheDocument();
      expect(screen.queryByText(/available from GitHub/)).toBeNull();
      expect(onAvailability).toHaveBeenCalledWith(null);
    });

    it("never blocks on a read error or a client that cannot read definitions", async () => {
      const onAvailability = vi.fn();
      await run(
        false,
        vi.fn().mockResolvedValue({ status: "error", error: "rate limited" }),
        { onTextStylesAvailability: onAvailability }
      );
      expect(await screen.findByText("Up to date")).toBeInTheDocument();
      expect(screen.queryByText(/available from GitHub/)).toBeNull();
      expect(onAvailability).toHaveBeenCalledWith(null);
    });

    it("reads again when Text styles is ticked after a Refresh, so Review changes lists the styles", async () => {
      const fetchDefs = vi
        .fn()
        .mockResolvedValue({ status: "found", definitions });
      const getSyncStatus = vi.fn(async (..._args: unknown[]) => ({
        upToDate: true,
        hasBaseline: false,
        differences: 0,
      }));
      const client = {
        getSyncStatus,
        fetchTextStyleDefinitions: fetchDefs,
      } as unknown as ConflictAwareGitHubClient;
      const view = render(
        <SyncStatus
          githubClient={client}
          githubConfigured
          includeTextStyles={false}
        />
      );
      const exported = () =>
        pluginMessage({
          type: "local-tokens-exported",
          localTokens: tokens,
          textStyles: [],
        });
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      exported();
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalledTimes(1));
      await screen.findByText("Tokens up to date");

      view.rerender(
        <SyncStatus
          githubClient={client}
          githubConfigured
          includeTextStyles={true}
        />
      );
      exported();
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalledTimes(2));
      expect(getSyncStatus.mock.calls[1][4]).toEqual(definitions);
      expect(await screen.findByText("Up to date")).toBeInTheDocument();
    });

    it("does not read before the first Refresh when the box changes", async () => {
      const getSyncStatus = vi.fn();
      const client = {
        getSyncStatus,
        fetchTextStyleDefinitions: vi.fn(),
      } as unknown as ConflictAwareGitHubClient;
      const view = render(
        <SyncStatus
          githubClient={client}
          githubConfigured
          includeTextStyles={false}
        />
      );
      view.rerender(
        <SyncStatus
          githubClient={client}
          githubConfigured
          includeTextStyles={true}
        />
      );
      await Promise.resolve();
      expect(getSyncStatus).not.toHaveBeenCalled();
    });

    it("leaves the hint out once Text styles is ticked", async () => {
      await run(
        true,
        vi.fn().mockResolvedValue({ status: "found", definitions })
      );
      expect(await screen.findByText("Up to date")).toBeInTheDocument();
      expect(screen.queryByText(/available from GitHub/)).toBeNull();
    });
  });

  it("with Text styles on, hands the definitions over and says how many styles Pull would create", async () => {
    const fetchDefs = vi
      .fn()
      .mockResolvedValue({ status: "found", definitions });
    const { getSyncStatus } = await run(true, fetchDefs);
    expect(fetchDefs).toHaveBeenCalledTimes(1);
    expect(getSyncStatus.mock.calls[0][4]).toEqual(definitions);
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(
      await screen.findByText("1 text style will be created on Pull")
    ).toBeInTheDocument();
  });

  it("with no definitions file, says so quietly and stays Up to date", async () => {
    const { getSyncStatus } = await run(
      true,
      vi.fn().mockResolvedValue({ status: "absent" })
    );
    expect(getSyncStatus.mock.calls[0][4]).toBeNull();
    expect(await screen.findByText("Up to date")).toBeInTheDocument();
    expect(
      await screen.findByText(/No text style definitions found on this branch/)
    ).toBeInTheDocument();
  });
});
