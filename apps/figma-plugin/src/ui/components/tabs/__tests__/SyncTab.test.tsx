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
import type { UIState } from "../../../state/types";
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

describe("SyncTab Pull", () => {
  it("starts the Pull flow straight away: the review is the confirmation", () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    const onPullFromGitHub = vi.fn();
    render(
      <UIProvider>
        <SyncTab
          githubClient={{} as ConflictAwareGitHubClient}
          githubConfig={{ ...repoOnly, accessToken: "test-token" }}
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={onPullFromGitHub}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
        />
      </UIProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Pull" }));
    expect(onPullFromGitHub).toHaveBeenCalledTimes(1);
    // No second, inline confirm step any more.
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });
});

describe("SyncTab Styles section (plan 206)", () => {
  const renderConfigured = (onPullFromGitHub = vi.fn()) => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    render(
      <UIProvider>
        <SyncTab
          githubClient={{} as ConflictAwareGitHubClient}
          githubConfig={{ ...repoOnly, accessToken: "test-token" }}
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={onPullFromGitHub}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
        />
      </UIProvider>
    );
  };

  it("offers a Text styles checkbox, off by default, with a Pull-only note", () => {
    renderConfigured();
    const box = screen.getByRole("checkbox", { name: /Text styles/ });
    expect(box).not.toBeChecked();
    expect(screen.getByText("Styles")).toBeInTheDocument();
    expect(screen.getByText(/Push never touches styles/)).toBeInTheDocument();
  });

  it("toggles on and off without starting a Pull", () => {
    const onPull = vi.fn();
    renderConfigured(onPull);
    const box = screen.getByRole("checkbox", { name: /Text styles/ });
    fireEvent.click(box);
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(box).not.toBeChecked();
    expect(onPull).not.toHaveBeenCalled();
  });

  it("is not shown before GitHub is connected", () => {
    renderTab(null, false);
    expect(screen.queryByRole("checkbox", { name: /Text styles/ })).toBeNull();
  });
});

describe("SyncTab Text styles remembered and announced (plan 207)", () => {
  const definitions = [
    { name: "a", fontFamily: "f", fontSize: "s" },
    { name: "b", fontFamily: "f", fontSize: "s" },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderRefreshed = async (
    fetched: unknown,
    localTextStyles: unknown[] = [],
    initialState?: Partial<UIState>
  ) => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    const client = {
      getSyncStatus: vi.fn(async () => ({
        upToDate: true,
        hasBaseline: false,
        differences: 0,
      })),
      fetchTextStyleDefinitions: vi.fn(async () => fetched),
    } as unknown as ConflictAwareGitHubClient;
    render(
      <UIProvider initialState={initialState}>
        <SyncTab
          githubClient={client}
          githubConfig={{ ...repoOnly, accessToken: "test-token" }}
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
        />
      </UIProvider>
    );
    fireEvent.click(screen.getByLabelText("Refresh sync status"));
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            pluginMessage: {
              type: "local-tokens-exported",
              localTokens: [],
              textStyles: localTextStyles,
            },
          },
        })
      );
    });
    await waitFor(() => expect(client.getSyncStatus).toHaveBeenCalled());
    const saves = () =>
      postMessage.mock.calls
        .map(
          ([data]) =>
            (data as { pluginMessage?: Record<string, unknown> }).pluginMessage
        )
        .filter((m) => m?.type === "save-text-styles-choice");
    return { saves };
  };

  const box = () => screen.getByRole("checkbox", { name: /Text styles/ });

  it("ticks the box on a file's first Refresh when styles are on offer and none are managed, and remembers it", async () => {
    const { saves } = await renderRefreshed({ status: "found", definitions });
    await waitFor(() => expect(box()).toBeChecked());
    expect(saves()).toEqual([
      { type: "save-text-styles-choice", includeTextStyles: true },
    ]);
  });

  it("stays off when the file already has managed styles, and announces the offer", async () => {
    const { saves } = await renderRefreshed({ status: "found", definitions }, [
      { id: "1", name: "x", managed: true },
    ]);
    expect(
      await screen.findByText("2 styles available from GitHub.")
    ).toBeInTheDocument();
    expect(box()).not.toBeChecked();
    expect(saves()).toEqual([]);
  });

  it("never overrides a stored choice", async () => {
    const { saves } = await renderRefreshed(
      { status: "found", definitions },
      [],
      { includeTextStyles: false, textStylesChosen: true }
    );
    expect(
      await screen.findByText("2 styles available from GitHub.")
    ).toBeInTheDocument();
    expect(box()).not.toBeChecked();
    expect(saves()).toEqual([]);
  });

  it("leaves the box off, quietly, when the branch has no definitions", async () => {
    const { saves } = await renderRefreshed({ status: "absent" });
    await screen.findByText("Up to date");
    expect(box()).not.toBeChecked();
    expect(screen.queryByText(/available from GitHub/)).toBeNull();
    expect(saves()).toEqual([]);
  });

  it("saves a click so a reload keeps it", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    render(
      <UIProvider>
        <SyncTab
          githubClient={{} as ConflictAwareGitHubClient}
          githubConfig={{ ...repoOnly, accessToken: "test-token" }}
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
        />
      </UIProvider>
    );
    fireEvent.click(box());
    fireEvent.click(box());
    expect(
      postMessage.mock.calls
        .map(
          ([data]) =>
            (data as { pluginMessage?: Record<string, unknown> }).pluginMessage
        )
        .filter((m) => m?.type === "save-text-styles-choice")
    ).toEqual([
      { type: "save-text-styles-choice", includeTextStyles: true },
      { type: "save-text-styles-choice", includeTextStyles: false },
    ]);
  });
});
