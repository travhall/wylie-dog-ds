import { h } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/preact";
import { SyncTab } from "../SyncTab";
import { UIProvider } from "../../../state";
import type { GitHubConfig } from "../../../../shared/types";
import type { ConflictAwareGitHubClient } from "../../../../plugin/sync/conflict-aware-github-client";

const repoOnly = {
  owner: "acme",
  repo: "design-tokens",
  branch: "main",
  tokenPath: "tokens",
} as unknown as GitHubConfig;

function renderTab(
  githubConfig: GitHubConfig | null,
  githubConfigured: boolean
) {
  return render(
    <UIProvider>
      <SyncTab
        githubClient={{} as ConflictAwareGitHubClient}
        githubConfig={githubConfig}
        githubConfigured={githubConfigured}
        collections={[]}
        loading={false}
        onPushToGitHub={vi.fn()}
        onPullFromGitHub={vi.fn()}
        onImportFile={vi.fn()}
        onGitHubConfigComplete={vi.fn()}
      />
    </UIProvider>
  );
}

describe("SyncTab token prompt", () => {
  it("asks for the user's token when the file has a repo but this user has no token", () => {
    renderTab(repoOnly, false);
    expect(screen.getByText("Add your GitHub token")).toBeInTheDocument();
    expect(screen.getByText(/acme\/design-tokens/)).toBeInTheDocument();
    expect(screen.queryByText("Connect GitHub")).not.toBeInTheDocument();
  });

  it("shows the normal connect view when nothing is configured", () => {
    renderTab(null, false);
    expect(screen.getByText("Connect GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Add your GitHub token")).not.toBeInTheDocument();
  });
});

describe("SyncTab Pull warning", () => {
  const configured = {
    ...repoOnly,
    accessToken: "test-token",
  } as unknown as GitHubConfig;

  afterEach(() => vi.restoreAllMocks());

  function renderConfigured(status: Record<string, unknown> | Error) {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const getSyncStatus = vi.fn(async () => {
      if (status instanceof Error) throw status;
      return status;
    });
    const onPullFromGitHub = vi.fn();
    const onPushToGitHub = vi.fn();
    render(
      <UIProvider>
        <SyncTab
          githubClient={
            { getSyncStatus } as unknown as ConflictAwareGitHubClient
          }
          githubConfig={configured}
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={onPushToGitHub}
          onPullFromGitHub={onPullFromGitHub}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
        />
      </UIProvider>
    );
    return { getSyncStatus, onPullFromGitHub, onPushToGitHub };
  }

  const answerPlugin = () =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            pluginMessage: { type: "local-tokens-exported", localTokens: [] },
          },
        })
      );
    });

  it("lists Figma changes a Pull would overwrite and can Push first", async () => {
    const { onPullFromGitHub, onPushToGitHub } = renderConfigured({
      upToDate: false,
      hasBaseline: true,
      toPush: 1,
      toPull: 0,
      conflicts: 0,
      differences: 1,
      entries: [
        {
          collection: "primitive",
          token: "a",
          side: "local",
          kind: "modified",
        },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "Pull" }));
    answerPlugin();

    expect(await screen.findByText("primitive / a")).toBeInTheDocument();
    expect(onPullFromGitHub).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Push first"));
    expect(onPushToGitHub).toHaveBeenCalledTimes(1);
    expect(onPullFromGitHub).not.toHaveBeenCalled();
  });

  it("only pulls after the warning is confirmed", async () => {
    const { onPullFromGitHub } = renderConfigured({
      upToDate: false,
      hasBaseline: true,
      toPush: 1,
      toPull: 0,
      conflicts: 0,
      differences: 1,
      entries: [
        {
          collection: "primitive",
          token: "a",
          side: "local",
          kind: "modified",
        },
      ],
    });
    fireEvent.click(screen.getByRole("button", { name: "Pull" }));
    answerPlugin();
    fireEvent.click(await screen.findByText("Pull anyway"));
    expect(onPullFromGitHub).toHaveBeenCalledTimes(1);
  });

  it("still lets the user pull when the check itself fails", async () => {
    const { onPullFromGitHub } = renderConfigured(new Error("rate limited"));
    fireEvent.click(screen.getByRole("button", { name: "Pull" }));
    answerPlugin();
    const confirm = await screen.findByText("Confirm");
    await waitFor(() => expect(confirm).toBeEnabled());
    fireEvent.click(confirm);
    expect(onPullFromGitHub).toHaveBeenCalledTimes(1);
  });
});
