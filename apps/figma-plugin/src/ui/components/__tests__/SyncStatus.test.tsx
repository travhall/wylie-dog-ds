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
      expect(getSyncStatus).toHaveBeenCalledWith(localTokens, baseline);
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
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalledWith([], null));
    });

    it("falls back to an empty list when the plugin reports an export error", async () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-error" });
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalledWith([], null));
    });

    it("falls back to an empty list when the export has no tokens field", async () => {
      const { client, getSyncStatus } = makeClient(async () => upToDate);
      render(<SyncStatus githubClient={client} githubConfigured />);
      fireEvent.click(screen.getByLabelText("Refresh sync status"));
      pluginMessage({ type: "local-tokens-exported" });
      await waitFor(() => expect(getSyncStatus).toHaveBeenCalledWith([], null));
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
      expect(getSyncStatus).toHaveBeenCalledWith([], null);
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
