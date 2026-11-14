import { h } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/preact";
import { SyncTab } from "../SyncTab";
import { UIProvider } from "../../../state";
import { EMPTY_TEXT_STYLE_DIFF } from "../../../../plugin/variables/text-style-links";
import { useUIContext } from "../../../state/UIContext";
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
        onDisconnect={vi.fn()}
        onForgetToken={vi.fn()}
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

describe("SyncTab Disconnect and Forget token", () => {
  const renderConnected = () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    const onDisconnect = vi.fn();
    const onForgetToken = vi.fn();
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
          onDisconnect={onDisconnect}
          onForgetToken={onForgetToken}
        />
      </UIProvider>
    );
    return { onDisconnect, onForgetToken };
  };

  it("Disconnect acts on this file straight away and never touches the token", () => {
    const { onDisconnect, onForgetToken } = renderConnected();
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledOnce();
    expect(onForgetToken).not.toHaveBeenCalled();
  });

  it("Forget token warns about every file first and only acts on confirm", () => {
    const { onDisconnect, onForgetToken } = renderConnected();
    fireEvent.click(screen.getByRole("button", { name: "Forget token" }));
    expect(onForgetToken).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      /every Figma file/
    );
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Forget token",
      })
    );
    expect(onForgetToken).toHaveBeenCalledOnce();
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it("Cancel leaves the token alone", () => {
    const { onForgetToken } = renderConnected();
    fireEvent.click(screen.getByRole("button", { name: "Forget token" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onForgetToken).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
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
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
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
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
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
      conventions: () => "wylie-dog",
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
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
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
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
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

describe("SyncTab opens the setup when an error asks for it", () => {
  function Trigger() {
    const { dispatch } = useUIContext();
    return (
      <button onClick={() => dispatch({ type: "REQUEST_EDIT_SETUP" })}>
        ask for setup
      </button>
    );
  }

  it("shows Edit GitHub Configuration after a REQUEST_EDIT_SETUP", () => {
    render(
      <UIProvider>
        <Trigger />
        <SyncTab
          githubClient={
            {
              conventions: () => "none",
            } as unknown as ConflictAwareGitHubClient
          }
          githubConfig={
            {
              ...repoOnly,
              accessToken: "t",
              syncMode: "direct",
            } as unknown as GitHubConfig
          }
          githubConfigured
          collections={[]}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
        />
      </UIProvider>
    );
    expect(
      screen.queryByText("Edit GitHub Configuration")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("ask for setup"));
    expect(screen.getByText("Edit GitHub Configuration")).toBeInTheDocument();
  });
});

describe("SyncTab starts the status over for a different repository", () => {
  it("reads the last sync time again when the repository changes", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    const tab = (config: Partial<GitHubConfig>) => (
      <UIProvider>
        <SyncTab
          githubClient={
            {
              conventions: () => "none",
            } as unknown as ConflictAwareGitHubClient
          }
          githubConfig={
            {
              ...repoOnly,
              accessToken: "t",
              syncMode: "direct",
              ...config,
            } as unknown as GitHubConfig
          }
          githubConfigured
          collections={[]}
          loading
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
        />
      </UIProvider>
    );
    const askedForLastSync = () =>
      postMessage.mock.calls.filter(
        ([data]) =>
          (data as { pluginMessage?: { type?: string } })?.pluginMessage
            ?.type === "get-last-sync"
      ).length;

    const view = render(tab({ repo: "first" }));
    expect(askedForLastSync()).toBe(1);

    // Same repository, nothing to redo
    view.rerender(tab({ repo: "first" }));
    expect(askedForLastSync()).toBe(1);

    view.rerender(tab({ repo: "second" }));
    expect(askedForLastSync()).toBe(2);
    postMessage.mockRestore();
  });
});

describe("SyncTab ticks what changed in Figma and says why Push is off", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const collections = [
    { id: "c1", name: "palette", variableIds: ["a", "b"] },
    { id: "c2", name: "theme", variableIds: ["c"] },
  ];

  async function refreshed(rows: Array<{ collection: string; side: string }>) {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    const client = {
      conventions: () => "none",
      getSyncStatus: vi.fn(async () => ({
        upToDate: rows.length === 0,
        hasBaseline: true,
        differences: rows.length,
        diff: {
          direction: "overview",
          rows,
          settings: [],
          textStyles: EMPTY_TEXT_STYLE_DIFF,
        },
      })),
      fetchTextStyleDefinitions: vi.fn(async () => ({ status: "absent" })),
    } as unknown as ConflictAwareGitHubClient;
    render(
      <UIProvider>
        <SyncTab
          githubClient={client}
          githubConfig={
            {
              ...repoOnly,
              accessToken: "t",
              syncMode: "direct",
            } as unknown as GitHubConfig
          }
          githubConfigured
          collections={collections as never}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
        />
      </UIProvider>
    );
    // Nothing is ticked before the first check, and Push says why
    expect(
      screen.getByText("Tick the collections to push.")
    ).toBeInTheDocument();
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
    await waitFor(() => expect(client.getSyncStatus).toHaveBeenCalled());
  }

  it("ticks the collections that changed in Figma and tags them", async () => {
    await refreshed([
      { collection: "theme", side: "local" },
      { collection: "palette", side: "remote" },
    ]);
    await screen.findByRole("button", { name: "Push 1" });
    expect(screen.getAllByText("changed in Figma")).toHaveLength(1);
    expect(screen.queryByText("Tick the collections to push.")).toBeNull();
  });

  it("says nothing changed, and leaves Push off, when Figma matches GitHub", async () => {
    await refreshed([]);
    await screen.findByText(/Nothing changed in Figma since the last sync/);
    expect(screen.getByRole("button", { name: "Push" })).toBeDisabled();
  });

  it("does not replace a selection the person already made", async () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    const client = {
      conventions: () => "none",
      getSyncStatus: vi.fn(async () => ({
        upToDate: false,
        hasBaseline: true,
        differences: 1,
        diff: {
          direction: "overview",
          rows: [{ collection: "theme", side: "local" }],
          settings: [],
          textStyles: EMPTY_TEXT_STYLE_DIFF,
        },
      })),
      fetchTextStyleDefinitions: vi.fn(async () => ({ status: "absent" })),
    } as unknown as ConflictAwareGitHubClient;
    render(
      <UIProvider>
        <SyncTab
          githubClient={client}
          githubConfig={
            {
              ...repoOnly,
              accessToken: "t",
              syncMode: "direct",
            } as unknown as GitHubConfig
          }
          githubConfigured
          collections={collections as never}
          loading={false}
          onPushToGitHub={vi.fn()}
          onPullFromGitHub={vi.fn()}
          onImportFile={vi.fn()}
          onGitHubConfigComplete={vi.fn()}
          onDisconnect={vi.fn()}
          onForgetToken={vi.fn()}
        />
      </UIProvider>
    );
    fireEvent.click(screen.getByText("palette"));
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
    await waitFor(() => expect(client.getSyncStatus).toHaveBeenCalled());
    // palette stays the only ticked collection; theme is only tagged
    await screen.findByText("changed in Figma");
    expect(screen.getByRole("button", { name: "Push 1" })).toBeEnabled();
  });
});
